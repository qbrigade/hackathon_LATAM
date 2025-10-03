![Moving clouds](./web/public/readme_banner.png)

<p align="center">
<a target="_blank" href="https://github.com"><img src="https://img.shields.io/badge/quantum-computing-purple?logo=quantum&color=%23448b9e" /></a>
<a target="_blank" href="https://paoloose.site"><img src="https://img.shields.io/badge/status-superposed-blue?logo=atom&color=%23e7982c" /></a>
<a target="_blank" href="https://github.com"><img src="https://img.shields.io/badge/optimization-QUBO-green?logo=chart-line&color=%23467e4a" /></a>
</p>

## The problem

<img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop" align="left" style="margin-right: 20px; margin-bottom: 20px; border-radius: 8px;">

Wildfires are a major environmental threat that can cause significant damage to ecosystems, infrastructure, and human life. The traditional methods of wildfire detection and management are often slow and ineffective, leading to increased costs and potential loss of life.

<br clear="left">

## The solution

<img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop" align="left" style="margin-right: 20px; margin-bottom: 20px; border-radius: 8px;">

Quantum computing can be used to detect and manage wildfires more efficiently. Quantum computers can be used to analyze large amounts of data quickly and identify patterns that are not visible to traditional computers. This can help to improve the accuracy of wildfire detection and management.

<br clear="left">

The solution integrates a **ConvLSTM neural network** to **predict the spatial–temporal spread of wildfires**.  
This architecture combines:
- 🖼 **Convolutions (CNNs)** → to capture spatial features from satellite images.  
- ⏱ **LSTMs (Recurrent nets)** → to capture temporal dynamics of the fire evolving over time.  

This allows us to model **"where and how fast" the fire will spread** over the landscape.

---

### ConvLSTM Model Diagram

<p align="center">
  <img src="./images/convlstmDiagram.png" width="800" alt="ConvLSTM wildfire model"/>
</p>

