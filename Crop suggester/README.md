# 🌾 Crop Suggester — Organic Soil Telemetry & Crop Recommender

An agronomic machine learning application designed with a unique organic visual design system—moving away from generic AI gradients towards an architectural, raw linen and matcha green aesthetic.

![App Header](templates/index.html)

## 🎨 Design Principles

- **Organic Color Scheme**: Extracted from physical agricultural references (raw linen `#F4F1EA`, sand `#EAE4D7`, matcha green `#E2EAD9`, forest sage `#3D5240`, deep pine ink `#2C3A2E`).
- **Asymmetric Grid Layout**: 12-column non-symmetrical CSS Grid separating soil telemetry inputs from output predictions.
- **Strict Border Radius Hierarchy**: Completely shadowless (`box-shadow: none`) design using 1px/2px solid ink borders with 4px/8px/16px radius hierarchy.
- **Typography Pairing**: Google Fonts pairing of **Instrument Serif** (display headers & crop titles), **Space Mono** (telemetry markers, units, values), and **Plus Jakarta Sans** (body descriptions).

---

## 🚀 Quick Start

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/RaunakRaj567/Crop_predictor_soil_profile.git
cd Crop_predictor_soil_profile
pip install -r requirements.txt
```

### 2. Run the Application
Run using Python directly:
```bash
python app.py
```
Or launch using Windows Batch / PowerShell scripts:
- **Windows Batch**: Double-click `start.bat`
- **PowerShell**: Run `.\start.ps1`

Open your web browser at `http://127.0.0.1:5000`.

---

## 📊 Quick Preset Profiles

- 🌾 **Rice**: Paddy cereal profile (`N=90`, `P=42`, `K=43`, `Rainfall=202.9mm`)
- 🌾 **Wheat**: Rabi cereal profile (`N=60`, `P=55`, `K=45`, `Rainfall=80mm`)
- 🌽 **Maize**: Corn grain profile (`N=80`, `P=40`, `K=20`, `Rainfall=85mm`)
- 🧅 **Onion**: Allium bulb profile (`N=40`, `P=50`, `K=50`, `Rainfall=65mm`)

---

## 🛠️ Project Structure

```text
├── app.py                   # Flask server & REST API
├── crop_model.pkl           # Trained Decision Tree classifier
├── scaler.pkl               # StandardScaler model
├── label_encoder.pkl        # LabelEncoder model
├── model_training.ipynb     # Model training notebook
├── start.bat                # Windows batch launcher
├── start.ps1                # PowerShell launcher
├── requirements.txt         # Dependencies
├── README.md                # Documentation
└── templates/
    └── index.html           # Single-page web application UI
```
