import os
import torch
import rasterio
import numpy as np
import torch.nn.functional as F
from torch.utils.data import Dataset

class FireSpreadDataset(Dataset):
    def __init__(self, data_folder, seq_len=4, channels=None, normalization=True,
                 resize_to=(256, 256)):
        """
        data_folder: single folder containing .tif files
        seq_len: temporal window length
        channels: list of band indices to use (e.g., [23])
        normalization: per-image min-max if True
        resize_to: (H, W) to enforce equal sizes across samples
        """
        self.data_folder = data_folder
        self.seq_len = seq_len
        self.channels = channels
        self.normalization = normalization
        self.resize_to = resize_to

        self.files = sorted([os.path.join(data_folder, f)
                             for f in os.listdir(data_folder) if f.endswith('.tif')])

        self.windows = [self.files[i:i+self.seq_len]
                        for i in range(len(self.files) - self.seq_len + 1)]

    def __len__(self):
        return len(self.windows)

    def _soft_normalize(self, img):
        if not self.normalization:
            return img
        mx, mn = img.max(), img.min()
        if mx > mn:
            return (img - mn) / (mx - mn)
        return img

    def _resize_numpy(self, arr, size_hw):
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
                img = src.read().astype(np.float32) 

            img = np.nan_to_num(img, nan=0.0)

            if self.channels is not None:
                img = img[self.channels, :, :]      

            img = self._resize_numpy(img, self.resize_to)  
            img = self._soft_normalize(img)

            seq.append(img)

        return torch.tensor(np.stack(seq), dtype=torch.float32)  
