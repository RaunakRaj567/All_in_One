# 🌾 AgriVision Mega Suite — Next-Gen Agritech & Supply Chain Platform

> **Unified AI Agronomist, Smart Warehouse Storage Vault, Machine Learning Crop Advisor, and Capacitated Vehicle Routing (CVRP) Logistics Engine.**

---

## 🌟 Overview & Key Modules

AgriVision is an end-to-end agritech solution bridging farmers, warehouse storage, buyers, and delivery partners into a seamless ecosystem.

1. **🔬 AI Crop Disease Diagnostic Camera**: Real-time leaf lesion scanning and disease diagnosis with instant remedies.
2. **🌱 ML Crop & Soil Recommendation Engine**: Machine learning model predicting optimal crop suitability using soil N-P-K ratios, pH, temperature, humidity, and rainfall parameters.
3. **🤖 Kisan AI Agronomist Chatbot**: Multilingual voice & text agricultural advisor powered by FastAPI backend on port 8001.
4. **🏭 Smart Warehouse Storage & Billing (W001)**: Multi-farmer isolated vault storage with 9-day price trend forecasting, custom selling price markup adjustments (up to +5%), and itemized storage cost billing (₹15/ton/day).
5. **🛒 B2B Buyer E-Commerce Portal**: Direct purchasing of verified farmer warehouse crop lots with automated route tracking.
6. **🚚 CVRP Logistics & Fleet Route Optimization**: Google OR-Tools capacitated vehicle routing with live OSRM road geometry, animated truck delivery tracking, and cross-driver synchronization.

---

## 📂 Project Architecture & Directory Structure

For a full breakdown of all folders, components, API endpoints, and architectural maps, refer to:
👉 **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**

```
All in one/
├── 📄 PROJECT_STRUCTURE.md            <-- Detailed Architecture & File Map for Presentation
├── 📄 README.md                       <-- Main Project Documentation
├── 🚀 start.bat                       <-- 1-Click Batch Service Launcher
├── 🚀 start.ps1                       <-- 1-Click PowerShell Service Launcher
│
├── 🎨 Crop Disease detector/          [React 18 + Vite + Leaflet Frontend Application]
├── 🤖 Farmer chatbot/                 [FastAPI AI & Warehouse Backend Service - Port 8001]
├── 🚚 Routees - iNTEGRATED/           [FastAPI Logistics & CVRP Solver Backend - Port 8000]
└── 🌾 Crop suggester/                 [ML Crop Selection Model & Dataset]
```

---

## 🚀 1-Click Quickstart (How to Run for Demo)

### Option A: 1-Click Launcher (Windows / CMD)
Simply double click `start.bat` in the root folder.

### Option B: PowerShell Single Command
Run the following script in PowerShell:
```powershell
.\start.ps1
```

### Active Ports:
- 🎨 **Unified Web Portal**: [http://localhost:5173](http://localhost:5173)
- 🤖 **FastAPI AI & Warehouse Backend**: [http://127.0.0.1:8001](http://127.0.0.1:8001)
- 🚚 **FastAPI Route Solver Backend**: [http://127.0.0.1:8000](http://127.0.0.1:8000)

---

## 🧪 Database & State Management Commands

To renew/reset all database records (vault inventories, transaction logs, notifications, and warehouse capacities) while preserving login credentials and farmer user accounts:

```bash
curl.exe -X POST http://127.0.0.1:8001/api/db/reset
```
