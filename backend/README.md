# 🌾 AgriVision Unified Deployable Backend Microservice

This directory contains the **complete self-contained Python FastAPI backend microservice** for the AgriVision Mega Suite.

---

## 🏛️ Included Microservice Modules

1. **🤖 Kisan AI Agronomist Chatbot**: LLM-powered multi-turn voice & text agricultural advisor (`/api/chat`).
2. **🌱 ML Crop & Soil Suggester**: Machine learning crop suitability classifier using soil NPK & climate data (`/api/recommend-crop`).
3. **🏭 Smart Warehouse Storage Vault (W001)**: Multi-farmer isolated vault storage, 9-day price trend forecasting, selling price markup adjustments, and itemized billing (`/api/warehouse/*`, `/api/db/reset`).
4. **🚚 CVRP Logistics Route Solver**: Google OR-Tools capacitated vehicle routing problem solver with OSRM highway geometry (`/api/routes/*`, `/api/locations/*`, `/api/forecast/*`).

---

## 📁 Directory Hierarchy

```
backend/
├── main.py                    <-- Unified FastAPI Production Entrypoint (Port 8001 / $PORT)
├── requirements.txt           <-- Consolidated dependencies
├── Dockerfile                 <-- Docker container deployment configuration
├── Procfile                   <-- Railway / Heroku deployment launcher
├── start_backend.bat          <-- 1-Click Windows Batch Launcher
├── start_backend.ps1          <-- 1-Click PowerShell Launcher
├── routers/                   <-- FastAPI Router modules
├── services/                  <-- Core business logic & in-memory databases
├── optimizer/                 <-- Google OR-Tools CVRP routing solvers
├── schemas/                   <-- Pydantic data validation schemas
├── data/                      <-- Warehouse definitions & location coordinates
└── ml_models/                 <-- Pre-trained ML models (.pkl & .joblib)
```

---

## 🚀 How to Run Locally

```bash
cd backend
python main.py
```
*Server will start listening on `http://127.0.0.1:8001` with Swagger docs at `http://127.0.0.1:8001/docs`.*

---

## ☁️ How to Deploy to Cloud

### 1. Render.com / Railway.app
- Connect your GitHub repository.
- Set Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `python main.py`

### 2. Docker Container Deployment
```bash
docker build -t agrivision-backend .
docker run -p 8001:8001 agrivision-backend
```
