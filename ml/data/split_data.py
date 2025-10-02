import os
import torch
import rasterio
import numpy as np
from torch.utils.data import Dataset, DataLoader

class FireSpreadDataset(Dataset):
    def __init__(self, data_folder, seq_len=4, channels=None, normalization=True):
        self.data_folder = data_folder
        self.seq_len = seq_len
        self.channels = channels
        self.normalization = normalization
        
        self.files = sorted([f for f in os.listdir(data_folder) if f.endswith('.tif')])
        self.windows = self._make_windows()
        
    def _make_windows(self):
        #Create time windows
        return [self.files[i:i+self.seq_len] for i in range(len(self.files)-self.seq_len+1)]
    
    def _soft_normalize(self, img):
        # Normalize for probabilities
        if self.normalization:
            if img.max() > img.min():
                return (img - img.min()) / (img.max() - img.min())
            return img
        else:
            return img
    
    def __len__(self):
        return len(self.windows)
    
    def __getitem__(self, idx):
        window_files = self.windows[idx]
        sequence = []
        
        for file in window_files:
            path = os.path.join(self.data_folder, file)
            with rasterio.open(path) as src:
                img = src.read().astype(np.float32)
                
            img = np.nan_to_num(img, nan=0.0)
            
            if self.channels is not None:
                img = img[self.channels, :, :]
            
            img = self._soft_normalize(img)
            
            sequence.append(img)
        
        return torch.tensor(np.stack(sequence), dtype=torch.float32)


if __name__ == "__main__":
    # Create dataset 
    dataset = FireSpreadDataset(
        data_folder="ml/data/sample_data",
        seq_len=5,
        channels=[0, 1, 2]   
    )
    
    dataloader = DataLoader(dataset, batch_size=2, shuffle=True)
    
    print(f"Total sequences: {len(dataset)}")
    
    for batch in dataloader:
        print(f"Shape: {batch.shape}")  # (batch, time, channels, height, width)
        print(f"Range: {batch.min():.3f} to {batch.max():.3f}")
        break