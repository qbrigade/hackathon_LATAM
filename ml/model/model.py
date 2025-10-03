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

def train_model(model, train_loader, epochs=100, learning_rate=0.0001):
    """
    Train the ConvLSTM model.
    model: The ConvLSTM model.
    train_loader: DataLoader for training data.
    epochs: Number of training epochs.
    learning_rate: Learning rate for the optimizer.
    """
    
    criterion = nn.MSELoss()  # Mean Squared Error for regression
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    model.train()
    losses = []
    
    for epoch in range(epochs):
        epoch_loss = 0
        for batch_idx, sequences in enumerate(train_loader):
            inputs = sequences[:, :-1, :, :, :]
            targets = sequences[:, -1, :, :, :]  
            
            optimizer.zero_grad()
            
            # Predict next frame
            outputs = model(inputs)
            outputs = outputs.squeeze(1) 
            
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
        
        avg_loss = epoch_loss / len(train_loader)
        losses.append(avg_loss)
        
        if epoch % 10 == 0:
            print(f'Epoch {epoch}/{epochs}, Loss: {avg_loss:.6f}')
    
    return losses

if __name__ == "__main__":
    from ml.data.split_data import FireSpreadDataset  
    
    # Load  data
    dataset = FireSpreadDataset(
        data_folder="ml/data/sample_data",
        seq_len=5,
        channels=[0, 1, 2],
        normalization=True
    )
    
    # Create data loader
    dataloader = DataLoader(dataset, batch_size=2, shuffle=True)
    
    # Initialize model
    model = FireSpreadPredictor(
        input_channels=3,     
        hidden_dims=[32, 64, 32],
        pred_steps=1           # 1 frame ahead prediction
    )
    
    print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
    print(f"Input shape example: {next(iter(dataloader)).shape}")
    
    # Train the model
    losses = train_model(model, dataloader, epochs=5, learning_rate=0.001)
    
    # Save the trained model
    torch.save(model.state_dict(), 'fire_spread_model.pth')
    print("Model saved!")