import torch
import numpy as np
import networkx as nx
import matplotlib.pyplot as plt
from torch.utils.data import DataLoader

from ml.model.model import FireSpreadPredictor
from ml.data.split_data import FireSpreadDataset

def load_model(model_path, device="cpu"):
    """
    Loads the pretrained model from the given path.
    """
    ckpt = torch.load(model_path, map_location=device)
    model = FireSpreadPredictor(input_channels=3, hidden_dims=[32, 64, 32]).to(device)
    state_dict = ckpt["state_dict"] if isinstance(ckpt, dict) and "state_dict" in ckpt else ckpt
    model.load_state_dict(state_dict, strict=False)
    model.eval()
    return model


def to_prob_map(pred):
    """
    Normalize model output to a 2D numpy array (H, W) of probabilities in [0,1].
    Handles outputs:
      - Tensor (B, 1, H, W)
    """
    if isinstance(pred, (tuple, list)):
        pred = pred[0]  

    if not isinstance(pred, torch.Tensor):
        raise TypeError(f"Expected torch.Tensor, got {type(pred)}")

    if pred.ndim == 4 and pred.size(1) == 1:
        probs = pred[0, 0]  
    elif pred.ndim == 3:
        probs = pred[0]     
    else:
        probs = pred.squeeze()[0]  

    probs = probs.detach().cpu().numpy()
    
    probs = np.clip(probs, 0.0, 1.0)
    return probs


def predict(model, input_sequence, device="cpu"):
    """
    input_sequence: Tensor (B, T, C, H, W)
    Returns model prediction.
    """
    with torch.no_grad():
        input_sequence = input_sequence.to(device)
        out = model(input_sequence)
    return out


def create_pixel_graph(prob_2d, bidirectional=False):
    """
    prob_2d: numpy array (H, W) with probabilities in [0,1].
    """
    H, W = prob_2d.shape
    G = nx.DiGraph()
    idx = np.arange(H * W).reshape(H, W)

    for y in range(H):
        for x in range(W):
            G.add_node(
                int(idx[y, x]),
                x=int(x),
                y=int(y),
                probability=float(prob_2d[y, x])
            )

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
    """
    Visualizes the probability heatmap, sampled pixel graph, and histogram of probabilities.
    """
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
    # nodes
    for n, data in G.nodes(data=True):
        G_simple.add_node(n, **{k: v for k, v in data.items() if isinstance(v, (int, float, str))})
    # edges
    for u, v, data in G.edges(data=True):
        G_simple.add_edge(u, v, **{k: v for k, v in data.items() if isinstance(v, (int, float, str))})
    nx.write_graphml(G_simple, filename)
    print(f"Graph saved: {filename}")

def main():
    device = "cpu"  

    model = load_model("ml/model/models/fire_spread_model.pth", device=device)

    dataset = FireSpreadDataset(
        data_folder="ml/data/sample_data",
        seq_len=5,
        channels=[0, 1, 2],
        normalization=True
    )
    loader = DataLoader(dataset, batch_size=1, shuffle=False)

    for batch_idx, sequence in enumerate(loader):
        print(f"\nProcessing sequence {batch_idx+1}")

        input_seq = sequence[:, :4] 
        pred = predict(model, input_seq, device=device)  

        prob_2d = to_prob_map(pred)

        G = create_pixel_graph(prob_2d, bidirectional=False)

        analyze_graph(G)
        visualize_pixel_graph(prob_2d, G, sample_every=20)

        save_graph_compatible(G, f"pixel_graph_sequence_{batch_idx+1}.graphml")

        break  

if __name__ == "__main__":
    main()
