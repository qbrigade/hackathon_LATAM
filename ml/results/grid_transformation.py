import os
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import rasterio
from torch.utils.data import Dataset, DataLoader
import networkx as nx
import matplotlib.pyplot as plt
from scipy.sparse import coo_matrix, save_npz

class ConvLSTMCell(nn.Module):
    def __init__(self, input_dim, hidden_dim, kernel_size, bias=True):
        super().__init__()
        self.hidden_dim = hidden_dim
        padding = kernel_size // 2
        # in_channels = input_dim + hidden_dim  (input + h_t-1)
        self.conv = nn.Conv2d(input_dim + hidden_dim, 4 * hidden_dim,
                              kernel_size=kernel_size, padding=padding, bias=bias)

    def forward(self, x, state):
        h, c = state
        z = torch.cat([x, h], dim=1)
        i, f, g, o = torch.chunk(self.conv(z), 4, dim=1)
        i, f, o = torch.sigmoid(i), torch.sigmoid(f), torch.sigmoid(o)
        g = torch.tanh(g)
        c_next = f * c + i * g
        h_next = o * torch.tanh(c_next)
        return h_next, c_next

    def init_hidden(self, b, hw, device):
        H, W = hw
        h = torch.zeros(b, self.hidden_dim, H, W, device=device)
        c = torch.zeros(b, self.hidden_dim, H, W, device=device)
        return h, c


class ConvLSTM(nn.Module):
    def __init__(self, input_dim=3, hidden_dims=[32, 64, 32], kernel_size=3,
                 output_len=1, output_activation='sigmoid'):
        super().__init__()
        self.layers = nn.ModuleList()
        ch_in = input_dim
        for hd in hidden_dims:
            self.layers.append(ConvLSTMCell(ch_in, hd, kernel_size))
            ch_in = hd

        self.head = nn.Conv2d(hidden_dims[-1], input_dim * output_len, kernel_size=1)
        if output_activation == 'sigmoid':
            self.act = nn.Sigmoid()
        elif output_activation == 'tanh':
            self.act = nn.Tanh()
        else:
            self.act = nn.Identity()
        self.input_dim = input_dim
        self.output_len = output_len

    def forward(self, x):  # x: (B, T, C, H, W)
        B, T, C, H, W = x.shape
        device = x.device
        states = [cell.init_hidden(B, (H, W), device) for cell in self.layers]

        y = None
        for t in range(T):
            z = x[:, t]
            for i, cell in enumerate(self.layers):
                h, c = states[i]
                h, c = cell(z, (h, c))
                states[i] = (h, c)
                z = h
            y = z

        out = self.head(y)  # (B, C*L, H, W)
        if self.output_len > 1:
            out = out.view(B, self.output_len, self.input_dim, H, W)
            out = self.act(out)
        else:
            out = out.view(B, self.input_dim, H, W)
            out = self.act(out).unsqueeze(1)  # (B,1,C,H,W)
        return out


class FireSpreadPredictor(nn.Module):
    def __init__(self, input_channels=3, hidden_dims=[32, 64, 32], pred_steps=1):
        super().__init__()
        self.convlstm = ConvLSTM(
            input_dim=input_channels,
            hidden_dims=hidden_dims,
            kernel_size=3,
            output_len=pred_steps,
            output_activation='sigmoid'  # keep if your checkpoint was trained this way
        )

    def forward(self, x):
        return self.convlstm(x)


# =========================
# Dataset (single folder, resize, select bands)
# =========================

class FireSpreadDataset(Dataset):
    """
    Reads .tif from a single folder (no recursion), builds sliding windows,
    selects bands, resizes to a fixed size, returns (T,C,H,W).
    """
    def __init__(self, data_folder, seq_len=5, channels=None,
                 normalization=True, resize_to=(256, 256)):
        self.data_folder = data_folder
        self.seq_len = seq_len
        self.channels = channels
        self.normalization = normalization
        self.resize_to = resize_to

        self.files = sorted([
            os.path.join(data_folder, f)
            for f in os.listdir(data_folder) if f.endswith('.tif')
        ])
        self.windows = [self.files[i:i + seq_len]
                        for i in range(len(self.files) - seq_len + 1)]

    def __len__(self):
        return len(self.windows)

    def _soft_normalize(self, img):  # (C,H,W) np.float32
        if not self.normalization:
            return img
        mx, mn = img.max(), img.min()
        if mx > mn:
            return (img - mn) / (mx - mn)
        return img

    def _resize_numpy(self, arr, size_hw):  # (C,H,W) -> (C,H',W')
        if size_hw is None:
            return arr
        Ht, Wt = size_hw
        t = torch.from_numpy(arr).unsqueeze(0)  # (1,C,H,W)
        t = F.interpolate(t, size=(Ht, Wt), mode='bilinear', align_corners=False)
        return t.squeeze(0).numpy()

    def __getitem__(self, idx):
        seq_paths = self.windows[idx]
        seq = []
        for p in seq_paths:
            with rasterio.open(p) as src:
                img = src.read().astype(np.float32)  # (C,H,W)
            img = np.nan_to_num(img, nan=0.0)
            if self.channels is not None:
                img = img[self.channels, :, :]
            img = self._resize_numpy(img, self.resize_to)
            img = self._soft_normalize(img)
            seq.append(img)
        return torch.tensor(np.stack(seq), dtype=torch.float32)


# =========================
# Inference utilities
# =========================

def load_model(model_path, device="cpu", input_channels=3):
    """
    Build model with the SAME input_channels the checkpoint was trained with
    (here: 3), then load weights.
    """
    ckpt = torch.load(model_path, map_location=device)
    model = FireSpreadPredictor(input_channels=input_channels,
                                hidden_dims=[32, 64, 32],
                                pred_steps=1).to(device)
    state_dict = ckpt["state_dict"] if isinstance(ckpt, dict) and "state_dict" in ckpt else ckpt
    model.load_state_dict(state_dict, strict=False)
    model.eval()
    return model


@torch.no_grad()
def predict(model, input_sequence, device="cpu"):
    input_sequence = input_sequence.to(device)
    out = model(input_sequence)
    return out


def to_prob_map(pred, out_channel_index=0):
    """
    Turn model output into a (H,W) probability map in [0,1].
    For pred_steps=1, the model returns (B, 1, C, H, W).
    """
    if isinstance(pred, (tuple, list)):
        pred = pred[0]
    if not isinstance(pred, torch.Tensor):
        raise TypeError(f"Expected torch.Tensor, got {type(pred)}")

    if pred.ndim == 5 and pred.size(1) == 1:
        probs = pred[0, 0, out_channel_index]   # (H, W)
    elif pred.ndim == 4:
        probs = pred[0, out_channel_index]
    else:
        t = pred.squeeze()
        probs = t if t.ndim == 2 else t[out_channel_index]

    probs = torch.clamp(probs, 0.0, 1.0).detach().cpu().numpy()
    return probs


def create_pixel_graph(prob_2d, bidirectional=False):
    H, W = prob_2d.shape
    G = nx.DiGraph()
    idx = np.arange(H * W).reshape(H, W)

    for y in range(H):
        for x in range(W):
            G.add_node(int(idx[y, x]), x=int(x), y=int(y),
                       probability=float(prob_2d[y, x]))

    nbrs = [(0, 1), (1, 0), (1, 1), (1, -1)]
    for y in range(H):
        for x in range(W):
            u = int(idx[y, x])
            for dy, dx in nbrs:
                ny, nx_ = y + dy, x + dx
                if 0 <= ny < H and 0 <= nx_ < W:
                    v = int(idx[ny, nx_])
                    w = float((prob_2d[y, x] + prob_2d[ny, nx_]) / 2.0)
                    G.add_edge(u, v, weight=w)
                    if bidirectional:
                        G.add_edge(v, u, weight=w)
    return G


def visualize_pixel_graph(prob_2d, G, sample_every=20):
    H, W = prob_2d.shape
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 5))

    im1 = ax1.imshow(prob_2d, cmap="hot", origin="upper")
    ax1.set_title("Fire Probability Heatmap")
    plt.colorbar(im1, ax=ax1, fraction=0.046, pad=0.04)

    ax2.imshow(prob_2d, cmap="hot", alpha=0.8, origin="upper")
    sample_nodes = [n for n in G.nodes() if n % sample_every == 0]
    pos = {n: (G.nodes[n]["x"], G.nodes[n]["y"]) for n in sample_nodes}
    colors = [G.nodes[n]["probability"] for n in sample_nodes]
    nx.draw_networkx_nodes(G, pos, nodelist=sample_nodes, node_color=colors,
                           cmap="hot", node_size=15, ax=ax2)
    ax2.set_title(f"Pixel Graph (sample 1/{sample_every})")

    all_probs = [d["probability"] for _, d in G.nodes(data=True)]
    ax3.hist(all_probs, bins=50, alpha=0.8)
    ax3.set_title("Pixel Probability Distribution")
    ax3.set_xlabel("Probability")
    ax3.set_ylabel("Pixels")

    plt.tight_layout()
    plt.show()


def analyze_graph(G):
    probs = np.array([d["probability"] for _, d in G.nodes(data=True)])
    print("Graph Analysis:")
    print(f"  - Nodes: {G.number_of_nodes():,}")
    print(f"  - Edges: {G.number_of_edges():,}")
    print(f"  - Mean prob: {probs.mean():.3f}")
    print(f"  - Max prob: {probs.max():.3f}")
    print(f"  - > 0.5: {(probs > 0.5).sum():,}")
    print(f"  - > 0.8: {(probs > 0.8).sum():,}")


def save_graph_compatible(G, filename):
    G_simple = nx.DiGraph()
    for n, data in G.nodes(data=True):
        G_simple.add_node(n, **{k: v for k, v in data.items() if isinstance(v, (int, float, str))})
    for u, v, data in G.edges(data=True):
        G_simple.add_edge(u, v, **{k: v for k, v in data.items() if isinstance(v, (int, float, str))})
    nx.write_graphml(G_simple, filename)
    print(f"Graph saved: {filename}")


def build_adjacency_coo(prob_2d, bidirectional=False):
    """
    Build sparse adjacency (COO) for a pixel grid using the same 4-neighbor pattern.
    Weight(u->v) = (prob[u] + prob[v]) / 2.
    Returns (rows, cols, data, shape) for a COO sparse matrix.
    """
    H, W = prob_2d.shape
    N = H * W

    # neighbors: right, down, diag down-right, diag down-left (same as your graph)
    nbrs = [(0, 1), (1, 0), (1, 1), (1, -1)]

    rows = []
    cols = []
    data = []

    # flat index helper
    def idx(y, x): return y * W + x

    for y in range(H):
        for x in range(W):
            u = idx(y, x)
            pu = prob_2d[y, x]
            for dy, dx in nbrs:
                ny, nx_ = y + dy, x + dx
                if 0 <= ny < H and 0 <= nx_ < W:
                    v = idx(ny, nx_)
                    pv = prob_2d[ny, nx_]
                    w = float((pu + pv) / 2.0)

                    rows.append(u); cols.append(v); data.append(w)
                    if bidirectional:
                        rows.append(v); cols.append(u); data.append(w)

    shape = (N, N)
    return np.array(rows, dtype=np.int64), np.array(cols, dtype=np.int64), np.array(data, dtype=np.float32), shape


def save_adjacency_sparse(rows, cols, data, shape, path_npz="adjacency.npz", path_edges_csv=None):
    """
    Guarda la matriz de adyacencia como SciPy sparse .npz (preferida).
    Si SciPy falla, cae a CSV de aristas (u,v,w).
    """
    try:
        coo = coo_matrix((data, (rows, cols)), shape=shape)
        csr = coo.tocsr()
        save_npz(path_npz, csr)


        print(f"[ADJ] saved sparse CSR to {path_npz}  (shape={shape[0]}x{shape[1]}, nnz={csr.nnz:,})")
    except Exception as e:
        print(f"[ADJ] SciPy not available or failed ({e}). Falling back to CSV edgelist.")
        if path_edges_csv is None:
            path_edges_csv = path_npz.replace('.npz', '_edges.csv')
        with open(path_edges_csv, 'w') as f:
            f.write('u,v,w\n')
            for r, c, w in zip(rows, cols, data):
                f.write(f"{r},{c},{w}\n")
        print(f"[ADJ] saved edgelist CSV to {path_edges_csv} (rows={len(data):,})")

# =========================
# Main
# =========================

def main():
    # ---- CONFIG ----
    DEVICE = torch.device("cpu")  # change to cuda/mps if available
    DATA_FOLDER = "ml/data/sample_data"
    MODEL_PATH = "fire_spread_model.pth"  # adjust if you saved elsewhere
    SEQ_LEN = 5
    DISK_CHANNELS = [22]          # use band 22 (0-based) from disk (your "23rd" band)
    RESIZE_TO = (256, 256)
    # Your checkpoint was trained with 3 input channels and predicts 3 channels.
    # We'll load a 3-ch model and duplicate the single band to 3.
    CHECKPOINT_INPUT_CHANNELS = 3
    OUTPUT_CHANNEL_INDEX = 0      # which of the 3 predicted channels to visualize

    # ---- Model ----
    model = load_model(MODEL_PATH, device=DEVICE, input_channels=CHECKPOINT_INPUT_CHANNELS)
    print("[MODEL] loaded:", MODEL_PATH)

    # ---- Data ----
    dataset = FireSpreadDataset(
        data_folder=DATA_FOLDER,
        seq_len=SEQ_LEN,
        channels=DISK_CHANNELS,     # 1 band from disk
        normalization=True,
        resize_to=RESIZE_TO
    )
    loader = DataLoader(dataset, batch_size=1, shuffle=False, num_workers=0)

    # ---- One sequence ----
    for batch_idx, sequence in enumerate(loader):
        print(f"\nProcessing sequence {batch_idx+1}")
        # sequence: (B, T, C=1, H, W) -> duplicate channels to 3 for the 3-ch model
        sequence = sequence.repeat(1, 1, CHECKPOINT_INPUT_CHANNELS, 1, 1)  # (B,T,3,H,W)

        input_seq = sequence[:, :SEQ_LEN-1]  # first T-1 frames as input
        pred = predict(model, input_seq, device=DEVICE)  # (B,1,C(=3),H,W)

        prob_2d = to_prob_map(pred, out_channel_index=OUTPUT_CHANNEL_INDEX)

        rows, cols, data, shape = build_adjacency_coo(prob_2d, bidirectional=False)

        # choose file names you like
        adj_npz = f"adjacency_seq_{batch_idx+1}.npz"
        edges_csv = f"adjacency_seq_{batch_idx+1}_edges.csv"  # fallback if SciPy missing
        save_adjacency_sparse(rows, cols, data, shape, path_npz=adj_npz, path_edges_csv=edges_csv)

        # (optional) also save node features (probabilities) as a flat vector
        np.save(f"node_probs_seq_{batch_idx+1}.npy", prob_2d.reshape(-1))
        print(f"[NODES] saved node probabilities to node_probs_seq_{batch_idx+1}.npy")


        G = create_pixel_graph(prob_2d, bidirectional=False)
        analyze_graph(G)
        visualize_pixel_graph(prob_2d, G, sample_every=20)
        save_graph_compatible(G, f"pixel_graph_sequence_{batch_idx+1}.graphml")
        break  # process only one sequence for demo


if __name__ == "__main__":
    main()