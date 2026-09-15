# 🌾 AGRIVISION MEGA SUITE — PROJECT STRUCTURE & ARCHITECTURE GUIDE

This document provides a comprehensive overview of the **AgriVision Mega Suite** directory hierarchy, system architecture, data flow, and component organization to easily navigate and present the project to judges and evaluators.

---

## 🏛️ System Architecture Overview

AgriVision is organized into **4 Core Integrated Pillars** served by a unified React + Vite frontend and high-performance Python FastAPI microservices:

```
                      ┌───────────────────────────────────────────────┐
                      │    AGRIVISION UNIFIED REACT FRONTEND (5173)   │
                      └───────┬───────────────────────────────┬───────┘
                              │                               │
                              ▼                               ▼
       ┌───────────────────────────────┐             ┌───────────────────────────────┐
       │   FASTAPI AI & WAREHOUSE      │             │  CVRP LOGISTICS ROUTE         │
       │   BACKEND ENGINE (PORT 8001)   │             │  SOLVER ENGINE (PORT 8000)    │
       ├───────────────────────────────┤             ├───────────────────────────────┤
       │ • Kisan AI Chatbot            │             │ • OSRM Live Road Routing      │
       │ • Smart Warehouse Vault (W001)│             │ • OR-Tools CVRP Route Solver  │
       │ • Multi-Farmer Isolated DB    │             │ • Driver Delivery Portal      │
       │ • 9-Day Crop Price Forecasts  │             │ • Buyer Track & Trace Map     │
       └───────────────────────────────┘             └───────────────────────────────┘
```

---

## 📁 Directory & File Hierarchy

```
All in one/
├── 📄 PROJECT_STRUCTURE.md            <-- You are here (Judge & Presenter Architecture Guide)
├── 📄 README.md                       <-- Project Quickstart & Feature Documentation
├── 🚀 start.bat                       <-- 1-Click Windows Batch Launcher for all 4 services
├── 🚀 start.ps1                       <-- 1-Click PowerShell Launcher for single terminal
├── 📦 package.json                    <-- Root workspace dependencies & script aliases
│
├── 🎨 Crop Disease detector/          [FRONTEND APPLICATION — REACT 18 + VITE + TAILWIND]
│   ├── public/                        <-- Static crop assets & default images
│   ├── src/
│   │   ├── assets/                    <-- Audio/speech models & styling assets
│   │   ├── components/                <-- Reusable UI components
│   │   │   ├── routes/                <-- Route map components (OSRM & Leaflet)
│   │   │   ├── warehouse/             <-- Smart Warehouse dashboard & inventory cards
│   │   │   │   ├── FarmerInventoryPanel.jsx   <-- Farmer Vault Produce & Withdrawal Panel
│   │   │   │   ├── PriceTrendBarChart.jsx     <-- 9-Day Crop Price Trend Visualizer
│   │   │   │   └── SmartStorageDashboard.jsx  <-- SP Markup & Storage Metrics Manager
│   │   │   ├── AsymmetricScanner.jsx          <-- AI Crop Disease Camera Scanner
│   │   │   ├── BuyerPortalLanding.jsx         <-- Buyer B2B E-Commerce Marketplace
│   │   │   ├── CropSuggester.jsx              <-- ML Soil & Climate Crop Recommender UI
│   │   │   ├── DeliveryPartnerPortalLanding.jsx <-- B2B Driver Delivery Dashboard
│   │   │   ├── FarmerChatbot.jsx              <-- Multilingual Kisan AI Chatbot UI
│   │   │   ├── FarmerLoginGateway.jsx         <-- Farmer Profile Switcher (F001, F002, F003)
│   │   │   ├── Header.jsx                     <-- Navigation Bar & Farmer Notification Bell
│   │   │   └── OrderRouteTrackingModal.jsx    <-- Live OSRM Route Map & Animated Truck Movement
│   │   │
│   │   ├── context/
│   │   │   └── AgriContext.jsx        <-- Global State: Accounts, Notifications & DB Sync
│   │   │
│   │   ├── pages/                     <-- Core Route Views
│   │   │   ├── ChatbotPage.jsx        <-- Kisan AI Agronomist View
│   │   │   ├── DetectorPage.jsx       <-- Crop Disease Scanner View
│   │   │   ├── LogisticsPage.jsx      <-- Mandi & Warehouse CVRP Route Solver View
│   │   │   ├── SmartWarehousePage.jsx <-- Multi-Farmer Smart Storage & Billing View
│   │   │   └── SuggesterPage.jsx      <-- ML Crop Recommendation View
│   │   │
│   │   ├── services/
│   │   │   ├── warehouseApi.js        <-- FastAPI Smart Warehouse Endpoint Integration
│   │   │   ├── chatbotApi.js          <-- Kisan AI Chatbot Endpoint Integration
│   │   │   └── api.js                 <-- Disease Detection API Client
│   │   │
│   │   ├── App.jsx                    <-- Client Router & Route Definitions
│   │   └── main.jsx                   <-- React DOM Application Entrypoint
│   │
│   ├── package.json                   <-- Frontend dependencies (React, Leaflet, Lucide)
│   └── vite.config.js                 <-- Vite build configuration & server dev options
│
├── 🤖 Farmer chatbot/                 [BACKEND AI & WAREHOUSE SERVICE — FASTAPI PORT 8001]
│   ├── main.py                        <-- Unified FastAPI Application Entrypoint
│   ├── routers/
│   │   ├── chat.py                    <-- Kisan AI Agronomist Query Router
│   │   ├── recommend.py               <-- ML Crop Suggester Inference Router
│   │   └── warehouse.py               <-- Smart Warehouse, Inventory & Database Router
│   ├── schemas/
│   │   ├── chat.py                    <-- Pydantic schemas for Chat
│   │   └── warehouse.py               <-- Pydantic schemas for Storage & Purchases
│   └── requirements.txt               <-- Python package dependencies
│
├── 🚚 Routees - iNTEGRATED/           [BACKEND CVRP ROUTE OPTIMIZER — FASTAPI PORT 8000]
│   ├── backend/
│   │   ├── main.py                    <-- Logistics FastAPI Service Entrypoint
│   │   ├── api/
│   │   │   ├── routes.py              <-- CVRP Route Solver API Endpoints
│   │   │   ├── forecast.py            <-- Demand Forecasting Endpoints
│   │   │   └── locations.py           <-- Mandi & Warehouse Geocoordinate Services
│   │   ├── optimizer/
│   │   │   └── cvrp_solver.py         <-- Google OR-Tools CVRP Distance Matrix Solver
│   │   ├── services/
│   │   │   └── warehouse_service.py   <-- In-Memory Vault DB (Inventories, Txns, Notifications)
│   │   └── data/
│   │       └── warehouse_data.py      <-- Default Central Warehouse (W001) Definitions
│   └── requirements.txt               <-- Python Optimization Dependencies (OR-Tools, NumPy)
│
└── 🌾 Crop suggester/                 [ML CROP SELECTION & DATASET MODULE]
    ├── Crop_recommendation.csv        <-- N-P-K, pH & Rainfall Soil Dataset
    ├── crop_recommendation_model.pkl  <-- Pre-trained Scikit-Learn Model
    └── recommend_service.py           <-- ML Model Prediction Engine
```

---

## 🛠️ Key Module Quick Reference for Presentations

| Module / Feature | Main Frontend Component | Main Backend Router / Service |
| :--- | :--- | :--- |
| **1. AI Crop Disease Scanner** | `AsymmetricScanner.jsx` | `api.js` |
| **2. ML Crop Recommender** | `CropSuggester.jsx` | `routers/recommend.py` |
| **3. Kisan AI Agronomist Chatbot** | `FarmerChatbot.jsx` | `routers/chat.py` |
| **4. Smart Warehouse & Vault (W001)** | `SmartWarehousePage.jsx` | `routers/warehouse.py` & `warehouse_service.py` |
| **5. Buyer Marketplace** | `BuyerPortalLanding.jsx` | `routers/warehouse.py` |
| **6. Driver Logistics & CVRP Routes** | `DeliveryPartnerPortalLanding.jsx` | `backend/api/routes.py` & `cvrp_solver.py` |
| **7. Live Track & Trace Route Map** | `OrderRouteTrackingModal.jsx` | OSRM Live Road Routing |

---

## ⚡ How to Run Everything (For Judges & Demo)

To launch all 4 modules concurrently with a single click:

1. **Windows Double-Click**: Double click `start.bat` in the project root.
2. **PowerShell**: Run `./start.ps1` in PowerShell.

This will automatically launch:
- 🤖 **FastAPI AI & Warehouse Backend**: `http://127.0.0.1:8001`
- 🚚 **FastAPI Logistics Backend**: `http://127.0.0.1:8000`
- 🎨 **React Unified Frontend**: `http://localhost:5173`
