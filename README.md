![Moving clouds](./web/public/readme_banner.png)

<h1 align="center">🔥 Quantum Wildfire Brigade (QWB)</h1>
<h3 align="center">Quantum-Enhanced Wildfire Prediction and Resource Optimization System</h3>

<p align="center">
  <a target="_blank" href="https://qbrigade.pages.dev/"><img src="https://img.shields.io/badge/🌐-Live_Demo-00d4ff?style=for-the-badge" /></a>
</p>

<p align="center">
  <a target="_blank" href="https://github.com/qbrigade/hackathon_LATAM"><img src="https://img.shields.io/badge/quantum-computing-purple?logo=quantum&color=%23448b9e" /></a>
  <a target="_blank" href="https://github.com/qbrigade/hackathon_LATAM"><img src="https://img.shields.io/badge/status-superposed-blue?logo=atom&color=%23e7982c" /></a>
  <a target="_blank" href="https://github.com/qbrigade/hackathon_LATAM"><img src="https://img.shields.io/badge/optimization-QUBO-green?logo=chart-line&color=%23467e4a" /></a>
  <a target="_blank" href="https://github.com/qbrigade/hackathon_LATAM"><img src="https://img.shields.io/badge/AI-ConvLSTM-orange?logo=brain&color=%23ff6b6b" /></a>
</p>

<p align="center">
  <em>A cutting-edge hybrid quantum-classical system for real-time wildfire spread prediction and optimal resource allocation.</em>
</p>

<p align="center">
  <strong>🚀 <a href="https://qbrigade.pages.dev/" target="_blank">Try the Live Demo</a></strong> | 
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
- [Installation / Setup](#installation-setup)
- [Data Sources](#data-sources)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Usage Examples](#usage-examples)
- [Results & Benchmarks](#results--benchmarks)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

---

## Overview

**Quantum Wildfire Brigade (QWB)** is an innovative solution developed to address wildfire containment and management using quantum computing principles combined with deep learning. This project contributes to the **United Nations Sustainable Development Goals (SDGs)** 13 (Climate Action) and 15 (Life on Land).

Wildfires pose an escalating global challenge with devastating impacts on ecosystems, biodiversity, infrastructure, and human life. QWB leverages quantum algorithms and neural networks to provide **real-time decision-making solutions** for wildfire prediction and containment.

---

## The Problem

Wildfires are increasing in frequency and intensity due to climate change, causing:

- **Environmental devastation** to forests, wildlife, and ecosystems
- **Infrastructure damage** costing billions annually  
- **Loss of human life** and displacement of communities
- **Air quality crises** affecting millions of people

Traditional wildfire detection and response systems face critical limitations:

- ⏰ **Slow response times**
- 📊 **Limited data processing** capacity
- 🚒 **Inefficient resource allocation**
- 🎯 **Lack of predictive capabilities**

**Requirements for an Effective Solution:**

- **Real-time algorithm**
- **Optimal resource allocation**
- **Containment focus**
- **Environmental adaptation**

---

## Our Solution

### Hybrid Quantum-Classical Architecture

QWB implements a **closed-loop system** that combines **AI prediction** with **quantum optimization** for wildfire management.

#### AI-Powered Fire Spread Prediction (ConvLSTM)

- **CNNs** → Extract spatial features from satellite imagery  
- **LSTMs** → Capture temporal dynamics

**Result**: Predicts *where* and *how fast* fires will spread.

<p align="center">
  <img src="./images/convlstmDiagram.png" width="800" alt="ConvLSTM wildfire prediction model"/>
</p>

#### Quantum-Optimized Resource Allocation (QUBO + QAA)

- **QUBO Formulation** → Encodes resource allocation problem  
- **Quantum Adiabatic Algorithm** → Efficiently finds global optimum  
- **Deployment Strategy** → Optimizes firefighters, aircraft, and equipment

**Result**: Resources deployed efficiently for maximum containment.

---

## Algorithm Workflow

```mermaid
graph LR
    F[Fire State St] -->|Current State| ML[ConvLSTM Model]
    ML -->|Predicted Spread St+1| Classical[QUBO Formulation]
    F -->|Current State St| Classical
    Classical -->|QUBO Matrix| QO[Quantum Optimizer QAA]
    QO -->|Minimized Bitstring Zm| PP[Post-Processing]
    PP -->|Optimal Strategy Σt+1| W[Firefighting Teams]
    W -->|Apply Resources| F
````

---

## Repository Structure

```
hackathon_LATAM/
├── docs/
├── data/
├── code/
├── test/
├── results/
├── web/
├── images/
├── README.md
└── LICENSE
```

---

## Installation / Setup

### Using Poetry

```bash
git clone https://github.com/qbrigade/hackathon_LATAM.git
cd hackathon_LATAM
poetry install
poetry shell
pre-commit install
```

### Using pip

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Data Sources

* **WildfireSpreadTS**: Multi-modal satellite dataset
* **NASA MODIS**, **ESA Sentinel-2**, **NOAA VIIRS**, **FIRMS**

---

## Features

* **Real-Time Fire Prediction**
* **Quantum-Enhanced Optimization**
* **Intelligent Resource Deployment**
* **Environmental Adaptability**
* **Interactive Dashboard**
* **Scalable Architecture**

---

## Technologies Used

* **PyTorch, NumPy, Pandas, Scikit-learn**
* **QUBO, QAA, D-Wave, AWS Braket, Qiskit**
* **Next.js, Tailwind, Mapbox, Recharts**
* **Docker, PostgreSQL/PostGIS, Redis**

---

## Usage Examples

1. Train ConvLSTM
2. Predict Fire Spread
3. Optimize Resources (Classical QUBO)
4. Quantum Optimization (QAA)
5. Launch Dashboard

Live demo: [qbrigade.pages.dev](https://qbrigade.pages.dev/)

---

## Results & Benchmarks

| Metric           | Classical | Quantum | Improvement  |
| ---------------- | --------- | ------- | ------------ |
| Solution Time    | 45s       | 3.8s    | 91.6% faster |
| Solution Quality | 94.3%     | 96.7%   | +2.4%        |

---

## Contributing

See guidelines above. Fork, branch, commit, PR.

---

## Acknowledgments

* NASA, ESA, NOAA, Google Earth Engine
* D-Wave, IBM, AWS Braket
* Open-source ML & Quantum communities

---

## Contact

* GitHub: [@qbrigade](https://github.com/qbrigade)
* Repository: [hackathon_LATAM](https://github.com/qbrigade/hackathon_LATAM)
* Issues & Discussions: [GitHub Issues](https://github.com/qbrigade/hackathon_LATAM/issues)

```
