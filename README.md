
[![Moving clouds](./web/public/readme_banner.png)](https://qbrigade.pages.dev/)

<h1 align="center">🔥 Quantum Wildfire Brigade (QWB)</h1>
<h3 align="center">Quantum-Enhanced Wildfire Prediction and Resource Optimization System</h3>

<p align="center">
  <a target="_blank" href="https://qbrigade.pages.dev/"><img src="https://img.shields.io/badge/🔗-Explore_Our_Official_Website-00d4ff?style=for-the-badge" /></a>
</p>

<p align="center">
  <a target="_blank" href="https://github.com/qbrigade/hackathon_LATAM"><img src="https://img.shields.io/badge/quantum-computing-purple?logo=quantum&color=%23448b9e" /></a>
  <a target="_blank" href="https://github.com/qbrigade/hackathon_LATAM"><img src="https://img.shields.io/badge/status-superposed-blue?logo=atom&color=%23e7982c" /></a>
  <a target="_blank" href="https://github.com/qbrigade/hackathon_LATAM"><img src="https://img.shields.io/badge/optimization-QUBO-green?logo=chart-line&color=%23467e4a" /></a>
  <a target="_blank" href="https://github.com/qbrigade/hackathon_LATAM"><img src="https://img.shields.io/badge/AI-ConvLSTM-orange?logo=brain&color=%23ff6b6b" /></a>
</p>

<p align="center">
  <em>A cutting-edge hybrid quantum-classical system for wildfire spread prediction and optimal resource allocation.</em>
</p>

<p align="center">
  <strong>🔗 <a href="https://qbrigade.pages.dev/" target="_blank">Explore Our Official Website</a></strong> | 
  <a href="#overview">Overview</a> | 
  <a href="#installation-setup">Installation</a> | 
  <a href="#usage-examples">Usage</a> | 
  <a href="#contributing">Contributing</a>
</p>

---

## 📑 Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Algorithm Workflow](#algorithm-workflow)
- [Repository Structure](#repository-structure)
- [Installation Setup](#installation-setup)
- [Data Sources](#data-sources)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Usage Examples](#usage-examples)
- [Results & Benchmarks](#results--benchmarks)
- [Contributing](#contributing)
- [Team](#team)
- [Acknowledgments](#acknowledgments)
- [License](#license)

---

## 🌟 Overview

**Quantum Wildfire Brigade (QWB)** is an innovative hybrid quantum-classical platform that combines advanced AI prediction models with quantum computing optimization to revolutionize wildfire management. Our system provides fire spread forecasting and optimal resource allocation, helping emergency responders make critical decisions faster and more effectively.

### 🎯 Key Highlights

- **Quantum-Powered Optimization**: Leverages GAS (Grover Adaptative Search) for QUBO formulations for optimal firefighting strategy
- **AI-Driven Predictions**: Uses ConvLSTM neural network for accurate wildfire spread forecasting
- **Real-Time Analysis**: Processes live satellite data and weather conditions for up-to-date predictions
- **Interactive Visualization**: Intuitive web interface for monitoring fire progression and resource deployment
- **Scalable Architecture**: Modular design supporting multiple regions and fire scenarios simultaneously

---

## 🔥 The Problem

Wildfires represent one of the most devastating natural disasters globally, with increasing frequency and intensity due to climate change. Key challenges include:

- **Rapid Spread**: Fires can propagate unpredictably based on weather, terrain, and vegetation
- **Resource Constraints**: Limited firefighting resources must be allocated efficiently across multiple fronts
- **Time-Critical Decisions**: Every minute counts in preventing catastrophic damage and loss of life
- **Complex Variables**: Multiple interacting factors (wind, humidity, topography) make prediction difficult
- **Coordination Challenges**: Multiple agencies and resources need real-time synchronization

Traditional approaches struggle with the computational complexity of optimizing resource allocation while simultaneously predicting fire behavior in real-time.

---

## 💡 Our Solution

QWB addresses these challenges through a **two-pronged hybrid approach**:

### 1. 🧠 AI-Powered Fire Spread Prediction

- **ConvLSTM Neural Network**: Captures spatial-temporal patterns in fire progression
- **Multi-Modal Data Integration**: Combines satellite imagery, weather data, terrain maps, and vegetation indices
- **Probabilistic Forecasting**: Generates confidence intervals and multiple scenarios
- **Adaptive Learning**: Continuously improves predictions based on observed fire behavior

### 2. ⚛️ Quantum Resource Optimization

- **QUBO Formulation**: Transforms firefight problem into quantum-solvable optimization problems
- **GAS optimization**: Explores solution space exponentially faster than classical methods
- **Constraint Satisfaction**: Balances multiple objectives (coverage, response time, resource capacity)
- **Dynamic Reallocation**: Updates optimal strategies as fire conditions evolve

### 🔄 Hybrid Advantage

By combining quantum optimization with classical AI, QWB achieves:
- **Speed**: Quantum algorithms find optimal solutions faster than the best known classical approaches
- **Accuracy**: Deep learning models provide precise fire behavior predictions
- **Adaptability**: System responds to changing conditions
- **Scalability**: Handles complex scenarios with hundreds of variables

---

## 🔬 Algorithm Workflow

```mermaid
graph TB
    A[📡 Data Collection] --> B[🧹 Preprocessing]
    B --> C[🧠 ConvLSTM Prediction]
    B --> D[⚛️ Quantum Optimization]
    
    C --> E[🔥 Fire Spread Forecast]
    D --> F[🚁 Firefighting Plan]
    
    E --> G[📊 Decision Dashboard]
    F --> G
    
    G --> H{🔄 Real-Time Update?}
    H -->|Yes| A
    H -->|No| I[📋 Final Report]
    
    style A fill:#4a90e2
    style C fill:#e74c3c
    style D fill:#9b59b6
    style G fill:#2ecc71
    style I fill:#f39c12
```

### Detailed Pipeline

1. **Data Ingestion**
   - Satellite imagery (Sentinel-2, MODIS)
   - Weather data (temperature, wind, humidity)
   - Terrain models (elevation, slope, aspect)
   - Vegetation indices (NDVI, fuel moisture)

2. **Prediction Module**
   - Spatiotemporal feature extraction
   - ConvLSTM forward propagation

3. **Optimization Module**
   - QUBO matrix construction
   - GAS solver
   - Solution decoding and validation
   - Constraint verification

4. **Visualization & Reporting**
   - Interactive fire progression maps
   - Resource deployment overlays
   - Performance metrics dashboard
   - Automated alerts and notifications

---
## QUBO problem formulation

We are given a 2D grid $G$ of dimension $a \times b$. Where each node is labeled as $(i, j) \in [1, a]\times [1, b]$. First we define some notation an therminology:


- $S_0$ is a set of nodes that are burning at time $t = 0$.
- $M$ is an $a \times b \times a \times b$ tensor. $M_{(i, j), (k, l)}$ is the probability that a node $(i, j)$ ignites $(k, l)$ given that node the $(i, j)$ is burning. We set $M_{(i, j), (i, j)} = 1$.
- $P_{i, j}$ is an integer between $0$ and $R_m$ indicating the **risk** of burning for each node $(i, j)$, where $P_{i, j} = R_m$ indicates that the node is already burning. the probabiliyi $Pr_{i, j}$ that node $(i, j)$ burns can be computed using $M$ and $S_0$, and then we discretize the values to get integer risks.

$$Pr_{(i, j)} = 1 - \\prod_{(k, l)}\\left( 1 - M_{(k, l), (i, j)} \\mathbb{I}_{(k, l) \\in S_0}\\right)$$

- $W$ is the maximum nodes that can be defendend in a given time window.

The expected amount of burning nodes are,
    
$$\mathbb{E}_t = \sum_{(i, j)}{P_{(i, j)}}$$

We define a set $S$ as

$$S = \{ \lceil \mathbb{E}_t \rceil + 1 \text{ nodes with highest probability of burning }\} \subset \text{ grid } G$$


The variables are $d_{(i, j)}$ wich is 1 if we defend node $(i, j)$. We want to minimize the cost function:


$$C = \sum_{(k, l)}\sum_{(i, j)} M_{(i, j), (k, l)} \mathbb{I}_{\{ (i, k) \in S \}} \mathbb{I}_{\{(k, l) \not\in S\}} (1 - d_{i, j})(1 - d_{k, l})$$


Subject to

$$\sum_{i, j} d_{i, j} \leq W$$
$$d_{i, j}P_{i, j} \\leq R_p - 1$$

This problem is easily translated to QUBO:
    
$$Q = \\sum_{(k, l)}\\sum_{(i, j)} M_{(i, j), (k, l)} \\mathbb{I}_{\\{ (i, k) \\in S \\}} \\mathbb{I}_{\\{(k, l) \\not\\in S\\}} (1 - d_{i, j})(1 - d_{k, l})$$
$$P_1 = \\alpha \\left( \\sum_{i, j} d_{i, j} - \\left(W - 2^{\\lfloor \\log _2(W) \\rfloor} \\right)A_{i, j}^{\\lfloor \\log _2(W) \\rfloor + 1} - \\sum_{k = 0}^{\\lfloor \\log _2(W) \\rfloor} 2^{k}A_{i, j}^{k} \\right)$$
$$P_2 = \\beta \\left( \\sum_{i, j} P_{i, j}d_{i, j} - \\left(R_m - 1 - 2^{\\lfloor \\log _2(R_m - 1) \\rfloor} \\right)A_{i, j}^{\\lfloor \\log _2(R_m - 1) \\rfloor + 1} - \\sum_{k = 0}^{\\lfloor \\log _2(R_m - 1) \\rfloor} 2^{k}A_{i, j}^{k} \\right)$$

  


## 📂 Repository Structure

```
hackathon_LATAM/
├── 📁 data/                      # Dataset storage
│   ├── raw/                      # Original satellite and weather data
│   ├── processed/                # Cleaned and formatted data
│   └── samples/                  # Example datasets for testing
│
├── 📁 notebooks/                 # Jupyter notebooks for experimentation
│   ├── 01_data_exploration.ipynb
│   ├── 02_model_training.ipynb
│   ├── 03_quantum_optimization.ipynb
│   └── 04_results_analysis.ipynb
│
├── 📁 src/                       # Source code
│   ├── 📁 data/                  # Data processing modules
│   │   ├── loader.py
│   │   ├── preprocessor.py
│   │   └── augmentation.py
│   │
│   ├── 📁 models/                # ML/DL models
│   │   ├── convlstm.py          # ConvLSTM implementation
│   │   ├── trainer.py           # Training pipeline
│   │   └── evaluator.py         # Model evaluation
│   │
│   ├── 📁 quantum/               # Quantum computing modules
│   │   ├── qubo_formulation.py  # QUBO problem setup
│   │   ├── dwave_solver.py      # D-Wave integration
│   │   └── optimizer.py         # Resource allocation logic
│   │
│   ├── 📁 utils/                 # Utility functions
│   │   ├── config.py            # Configuration management
│   │   ├── logger.py            # Logging utilities
│   │   └── metrics.py           # Performance metrics
│   │
│   └── 📁 visualization/         # Visualization tools
│       ├── fire_map.py          # Fire spread visualization
│       ├── resource_plot.py     # Resource allocation plots
│       └── dashboard.py         # Interactive dashboard
│
├── 📁 web/                       # Web application
│   ├── 📁 public/               # Static assets
│   │   ├── readme_banner.png
│   │   └── favicon.ico
│   │
│   ├── 📁 src/                  # Frontend source
│   │   ├── 📁 components/       # React components
│   │   ├── 📁 pages/            # Page components
│   │   ├── 📁 styles/           # CSS/styling
│   │   └── 📁 utils/            # Frontend utilities
│   │
│   ├── package.json
│   └── README.md
│
├── 📁 api/                       # Backend API
│   ├── 📁 routes/               # API endpoints
│   ├── 📁 controllers/          # Business logic
│   ├── 📁 middleware/           # Middleware functions
│   ├── app.py                   # Main application
│   └── requirements.txt
│
├── 📁 tests/                     # Unit and integration tests
│   ├── test_data_processing.py
│   ├── test_models.py
│   ├── test_quantum.py
│   └── test_api.py
│
├── 📁 docs/                      # Documentation
│   ├── architecture.md
│   ├── api_reference.md
│   ├── deployment.md
│   └── user_guide.md
│
├── 📁 scripts/                   # Utility scripts
│   ├── download_data.sh
│   ├── train_model.sh
│   └── deploy.sh
│
├── 📁 configs/                   # Configuration files
│   ├── model_config.yaml
│   ├── quantum_config.yaml
│   └── deployment_config.yaml
│
├── .gitignore
├── requirements.txt              # Python dependencies
├── environment.yml               # Conda environment
├── docker-compose.yml            # Docker configuration
├── Dockerfile
├── LICENSE
└── README.md                     # This file
```

---

## 🛠️ Installation Setup

### Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher (for web application)
- **CUDA**: 11.0+ (optional, for GPU acceleration)
- **D-Wave Account**: Free access via [D-Wave Leap](https://cloud.dwavesys.com/leap/)

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/qbrigade/hackathon_LATAM.git
cd hackathon_LATAM
```

#### 2. Set Up Python Environment

**Using Conda (Recommended):**

```bash
conda env create -f environment.yml
conda activate qwb
```

**Using pip:**

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Configure D-Wave Access

```bash
# Set your D-Wave API token
export DWAVE_API_TOKEN='your-api-token-here'

# Or create a .env file
echo "DWAVE_API_TOKEN=your-api-token-here" > .env
```

#### 4. Download Sample Data

```bash
# Run data download script
bash scripts/download_data.sh

# Or manually download from specified sources
python src/data/loader.py --download
```

#### 5. Set Up Web Application

```bash
cd web
npm install
npm run dev
```

The web interface will be available at `http://localhost:3000`

#### 6. Start API Server

```bash
cd api
python app.py
```

The API will be available at `http://localhost:8000`

### Docker Deployment

For containerized deployment:

```bash
# Build and run all services
docker-compose up -d

# Access services:
# - Web UI: http://localhost:3000
# - API: http://localhost:8000
```

---

## 📊 Data Sources

Our system integrates multiple data sources for comprehensive wildfire analysis:

### 🛰️ Satellite Imagery

- **Sentinel-2**: 10m resolution multispectral imagery (European Space Agency)
- **MODIS**: Thermal anomalies and fire detection (NASA)
- **VIIRS**: Active fire detection (NOAA)
- **Landsat 8/9**: Historical vegetation and land cover data (USGS)

### 🌤️ Weather Data

- **NOAA**: Temperature, humidity, wind speed/direction
- **OpenWeatherMap API**: Real-time weather conditions
- **ERA5**: Historical climate reanalysis (ECMWF)
- **Local Weather Stations**: Ground-truth measurements

### 🗺️ Geospatial Data

- **SRTM**: Digital elevation models (NASA)
- **NLCD**: Land cover classification (USGS)
- **FuelModel**: Vegetation fuel types (LANDFIRE)
- **OpenStreetMap**: Road networks and infrastructure

### 🔥 Fire History

- **FIRMS**: Historical fire perimeters (NASA)
- **GWIS**: Global wildfire information system (Copernicus)
- **Local Fire Departments**: Incident reports and outcomes

### Data Access

```python
from src.data.loader import DataLoader

# Initialize loader
loader = DataLoader(config_path='configs/data_config.yaml')

# Load satellite imagery
imagery = loader.load_satellite_data(
    region='california',
    start_date='2024-01-01',
    end_date='2024-12-31'
)

# Load weather data
weather = loader.load_weather_data(
    coordinates=(34.0522, -118.2437),
    timeframe='24h'
)
```

---

## ✨ Features

### 🔮 Predictive Capabilities

- **Short-term forecasting**: 1-24 hour predictions with high accuracy
- **Medium-term projections**: 1-7 day scenarios for planning
- **Probabilistic modeling**: Multiple outcomes with confidence levels
- **Ensemble predictions**: Aggregated forecasts from multiple models

### ⚡ Quantum Optimization

- **Multi-objective optimization**: Balances coverage, cost, and response time
- **Dynamic reallocation**: Adapts to changing fire conditions
- **Constraint handling**: Respects resource availability and logistics
- **Scalable solutions**: Handles 100+ variables efficiently

### 📱 User Interface

- **Interactive maps**: Real-time fire progression visualization
- **Resource tracking**: Monitor deployment status of all assets
- **Alert system**: Automated notifications for critical events
- **Mobile responsive**: Access from any device
- **Multi-language support**: English, Spanish, Portuguese

### 🔌 API Integration

- **RESTful API**: Easy integration with existing systems
- **WebSocket support**: Real-time data streaming
- **Authentication**: Secure access control
- **Rate limiting**: Fair usage policies
- **Comprehensive documentation**: OpenAPI/Swagger specs

### 📈 Analytics & Reporting

- **Performance metrics**: Accuracy, response time, resource utilization
- **Historical analysis**: Learn from past incidents
- **Comparative studies**: Benchmark different strategies
- **Export capabilities**: PDF, CSV, GeoJSON formats

---

## 🧰 Technologies Used

### Quantum Computing

- **GAS**: Qiskit Implementation for Grover Adaptative Search 

### Backend

- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Relational database
- **Redis**: Caching and message broker
- **Celery**: Distributed task queue
- **SQLAlchemy**: ORM

### Frontend

- **React**: UI framework
- **Next.js**: React framework with SSR
- **Leaflet**: Interactive mapping
- **D3.js**: Data visualization
- **Tailwind CSS**: Utility-first CSS
---

## 🚀 Usage Examples

### Example 1: Fire Spread Prediction

```python
from src.models.convlstm import WildfirePredictor
from src.data.preprocessor import DataPreprocessor

# Initialize predictor
predictor = WildfirePredictor.load_pretrained('models/convlstm_best.pth')

# Load and preprocess data
preprocessor = DataPreprocessor()
input_data = preprocessor.prepare_sequence(
    satellite_images=['data/sentinel2_t1.tif', 'data/sentinel2_t2.tif'],
    weather_data='data/weather.csv',
    terrain='data/dem.tif'
)

# Generate predictions
predictions = predictor.predict(
    input_data,
    forecast_hours=24,
    confidence_level=0.95
)

# Visualize results
predictions.plot_progression(output='fire_forecast.html')
predictions.export_geojson('fire_forecast.geojson')
```

### Example 2: End-to-End Pipeline

```python
from src.pipeline import WildfireManagementPipeline

# Initialize complete pipeline
pipeline = WildfireManagementPipeline(
    config_path='configs/model_config.yaml'
)

# Run full analysis
results = pipeline.run(
    region='california_south',
    current_fire_perimeter='data/active_fire.geojson',
    forecast_duration=48,
    optimize_resources=True
)

# Access results
print(f"Predicted fire area in 48h: {results.predicted_area} hectares")
print(f"Optimal resource allocation: {results.allocation_plan}")
print(f"Estimated containment time: {results.containment_estimate} hours")

# Generate comprehensive report
report = results.generate_report(format='pdf')
report.save('wildfire_analysis_report.pdf')
```

### Example 3: API Usage

```bash
# Start prediction job
curl -X POST http://localhost:8000/api/v1/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "region": "california",
    "fire_id": "CA-2024-001",
    "forecast_hours": 24
  }'

# Get prediction results
curl http://localhost:8000/api/v1/predictions/job-123

# Request resource optimization
curl -X POST http://localhost:8000/api/v1/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "fire_zones": [...],
    "available_resources": {...},
    "constraints": {...}
  }'
```

---

### Real-World Impact

- **Response time reduction**: Faster optimal firefighting strategy $O(\sqrt(N))$ vs $O(N)$
---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features or improvements
- 📖 Improve documentation
- 🧪 Add tests and increase coverage
- 🎨 Enhance visualizations
- 🔬 Conduct experiments and share results

### Development Workflow

1. **Fork the repository**

```bash
git clone https://github.com/YOUR_USERNAME/hackathon_LATAM.git
cd hackathon_LATAM
git remote add upstream https://github.com/qbrigade/hackathon_LATAM.git
```

2. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**

- Write clean, documented code
- Follow PEP 8 style guidelines
- Add tests for new functionality
- Update documentation as needed

4. **Run tests**

```bash
pytest tests/ --cov=src
black src/ tests/
flake8 src/ tests/
```

5. **Commit and push**

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

6. **Create a Pull Request**

- Provide a clear description of changes
- Reference related issues
- Ensure CI/CD checks pass
- Request review from maintainers

### Code Standards

- **Python**: Follow PEP 8, use type hints
- **JavaScript**: Follow Airbnb style guide
- **Commits**: Use conventional commits (feat, fix, docs, etc.)
- **Documentation**: Update README and docstrings

---

### Get in Touch

- 📧 Email: contact@qbrigade.dev
- 🐙 GitHub: [@qbrigade](https://github.com/qbrigade)
- 🌐 Website: [qbrigade.pages.dev](https://qbrigade.pages.dev/)
- 💬 Discord: Join our community server

---

## 🙏 Acknowledgments

We extend our gratitude to:

- **NASA** and **ESA** for satellite data access
- **NOAA** for weather data and fire detection systems
- **Hackathon LATAM** organizers for the opportunity
- **Open-source community** for invaluable tools and libraries
- **Fire departments** and emergency responders for domain expertise
- **Academic institutions** for research collaboration

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Quantum Wildfire Brigade

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📚 Additional Resources

- 📖 [Full Documentation](docs/)
- 🎓 [Tutorials and Guides](docs/user_guide.md)
- 🔬 [Research Papers](docs/research/)
- 🎥 [Video Demos](https://qbrigade.pages.dev/demos)
- 📊 [Case Studies](docs/case_studies/)

---

<p align="center">
  <strong>Built with ❤️ by Quantum Wildfire Brigade</strong><br>
  <em>Protecting lives and property through quantum-enhanced intelligence</em>
</p>

<p align="center">
  <a href="#top">⬆️ Back to Top</a>
</p>
```
