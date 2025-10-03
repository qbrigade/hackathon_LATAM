import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from ml.data.split_data import FireSpreadDataset

class ConvLSTMCell(nn.Module):
    """
    Initialization of a single ConvLSTM cell.
    input_dim: Number of channels of input tensor.
    hidden_dim: Number of channels of hidden state.
    kernel_size: Size of the convolutional kernel.
    bias: Whether or not to add the bias.
    """
    def __init__(self, input_dim, hidden_dim, kernel_size, bias=True):
        super(ConvLSTMCell, self).__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.kernel_size = kernel_size
        self.padding = kernel_size // 2
        self.bias = bias

        self.conv = nn.Conv2d(
            in_channels=input_dim + hidden_dim,
            out_channels=4 * hidden_dim,
            kernel_size=kernel_size,
            padding=self.padding,
            bias=bias
        )

    def forward(self, input_tensor, cur_state):
        """
        Forward pass of the ConvLSTM cell.
        Uses convolutional operations instead of linear ones.
        """
        h_cur, c_cur = cur_state
        
        # Input and hidden state
        combined = torch.cat([input_tensor, h_cur], dim=1)
        
        # Conv operation
        combined_conv = self.conv(combined)
        
        # Input, forget, cell, output gates
        cc_i, cc_f, cc_c, cc_o = torch.split(combined_conv, self.hidden_dim, dim=1)
        
        i = torch.sigmoid(cc_i)
        f = torch.sigmoid(cc_f)
        c_next = f * c_cur + i * torch.tanh(cc_c)
        o = torch.sigmoid(cc_o)
        h_next = o * torch.tanh(c_next)

        return h_next, c_next

    def init_hidden(self, batch_size, image_size):
        height, width = image_size
        return (torch.zeros(batch_size, self.hidden_dim, height, width),
                torch.zeros(batch_size, self.hidden_dim, height, width))

class ConvLSTM(nn.Module):
    """
    Multi-layer ConvLSTM network.
    input_dim: Number of channels of input tensor.
    hidden_dims: List of hidden dimensions for each layer.
    kernel_size: Size of the convolutional kernel.
    num_layers: Number of ConvLSTM layers.
    output_len: Number of time steps to predict.
    output_activation: Activation function for the output.
    """
    def __init__(self, input_dim=3, hidden_dims=[64, 64, 32], kernel_size=3, 
                 num_layers=3, output_len=1, output_activation='sigmoid'):
        super(ConvLSTM, self).__init__()
        
        self.input_dim = input_dim
        self.hidden_dims = hidden_dims
        self.kernel_size = kernel_size
        self.num_layers = num_layers
        self.output_len = output_len
        self.output_activation = output_activation

        cell_list = []
        for i in range(num_layers):
            cur_input_dim = input_dim if i == 0 else hidden_dims[i-1]
            cell_list.append(ConvLSTMCell(
                input_dim=cur_input_dim,
                hidden_dim=hidden_dims[i],
                kernel_size=kernel_size
            ))
        self.cell_list = nn.ModuleList(cell_list)

        # Output convolution
        self.conv_out = nn.Conv2d(
            hidden_dims[-1], 
            input_dim * output_len, # Depends on the time steps to predict
            kernel_size=1,
            padding=0
        )
        
        # Final activation
        if output_activation == 'sigmoid':
            self.activation = nn.Sigmoid()
        elif output_activation == 'tanh':
            self.activation = nn.Tanh()
        else:
            self.activation = nn.Identity()

    def forward(self, input_tensor, hidden_state=None):
        """
        Forward pass of the ConvLSTM network.
        input_tensor: (batch, seq_len, channels, height, width)
        hidden_state: Initial hidden states for each layer.
        """
        batch_size, seq_len, _, height, width = input_tensor.size()
        
        # Initialize hidden states if not provided
        if hidden_state is None:
            hidden_state = self._init_hidden(batch_size, (height, width))

        # Process each time step
        layer_output_list = []
        for t in range(seq_len):
            x = input_tensor[:, t, :, :, :]  
            
            for layer_idx in range(self.num_layers):
                h, c = hidden_state[layer_idx]
                h, c = self.cell_list[layer_idx](x, (h, c))
                hidden_state[layer_idx] = (h, c)
                x = h  
            
            layer_output_list.append(h)

        # Use last output for prediction
        last_output = layer_output_list[-1]  # (batch, hidden_dim, height, width)
        
        # Generate predictions
        output = self.conv_out(last_output)  # (batch, input_dim * output_len, height, width)
        
        if self.output_len > 1:
            output = output.view(batch_size, self.output_len, self.input_dim, height, width)
            output = self.activation(output)
        else:
            output = output.view(batch_size, self.input_dim, height, width)
            output = self.activation(output).unsqueeze(1)  # Add time dimension

        return output

    def _init_hidden(self, batch_size, image_size):
        init_states = []
        for i in range(self.num_layers):
            init_states.append(self.cell_list[i].init_hidden(batch_size, image_size))
        return init_states

class FireSpreadPredictor(nn.Module):
    """
    Model to predict fire spread using ConvLSTM.
    """
    def __init__(self, input_channels=3, hidden_dims=[32, 64, 32], pred_steps=1):
        super(FireSpreadPredictor, self).__init__()
        
        self.convlstm = ConvLSTM(
            input_dim=input_channels,
            hidden_dims=hidden_dims,
            kernel_size=3,
            num_layers=len(hidden_dims),
            output_len=pred_steps,
            output_activation='sigmoid'
        )
        
    def forward(self, x):
        return self.convlstm(x)

import time
import math
import sys

def train_model(model, train_loader, epochs=5, learning_rate=0.0001, log_every_batch=False):
    """
    Train the ConvLSTM model with detailed logging.
    - Logs every epoch (and optionally per batch)
    - Shows running average loss and epoch duration
    """
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    model.train()

    losses = []
    num_batches = len(train_loader)
    if num_batches == 0:
        raise RuntimeError("Train loader is empty. Check your data folder / seq_len.")

    print(f"[TRAIN] epochs={epochs} | batches/epoch={num_batches} | lr={learning_rate}")
    for epoch in range(1, epochs + 1):
        t0 = time.time()
        epoch_loss = 0.0

        print(f"\n=== Epoch {epoch}/{epochs} ===")
        for batch_idx, sequences in enumerate(train_loader, start=1):
            inputs  = sequences[:, :-1, :, :, :]
            targets = sequences[:, -1,  :, :, :]  # (B, C, H, W)

            optimizer.zero_grad()
            outputs = model(inputs).squeeze(1)    # (B, C, H, W)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()
            if log_every_batch:
                running_avg = epoch_loss / batch_idx
                # lightweight inline progress
                print(f"\r  batch {batch_idx}/{num_batches} "
                      f"| loss {loss.item():.6f} "
                      f"| avg {running_avg:.6f}", end="")
                sys.stdout.flush()

        avg_loss = epoch_loss / num_batches
        losses.append(avg_loss)
        dt = time.time() - t0
        print()
        print(f"-> Epoch {epoch} done | avg_loss={avg_loss:.6f} | time={dt:.1f}s")

    return losses

if __name__ == "__main__":
    from torch.utils.data import DataLoader
    from ml.data.split_data import FireSpreadDataset

    dataset = FireSpreadDataset(
        data_folder="ml/data/all_data/2019",  
        seq_len=5,
        channels=[22],            
        normalization=True,
        resize_to=(256, 256)    
    )

    dataloader = DataLoader(dataset, batch_size=2, shuffle=True, num_workers=0)

    model = FireSpreadPredictor(
        input_channels=1,        
        hidden_dims=[32, 64, 32],
        pred_steps=1
    )

    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    batch = next(iter(dataloader))
    print(f"Input shape example: {batch.shape}") 

    losses = train_model(model, dataloader, epochs=5, learning_rate=0.001)

    torch.save(model.state_dict(), 'fire_spread_model.pth')
    print("Model saved!")

