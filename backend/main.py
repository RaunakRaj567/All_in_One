"""
===============================================================================
AGRIVISION MEGA SUITE -- UNIFIED PRODUCTION FASTAPI BACKEND SERVER
===============================================================================
This file serves as the main deployable entrypoint for all backend microservices:
1. Kisan AI Agronomist Chatbot (/api/chat)
2. ML Soil & Climate Crop Suggester (/api/recommend-crop)
3. Smart Warehouse Storage Vault & Multi-Farmer DB (/api/warehouse/*, /api/db/reset)
4. Logistics & CVRP Multi-Truck Route Optimizer (/api/routes/*, /api/locations/*)
===============================================================================
"""

import os
import sys
import numpy as np

# Apply NumPy 2.x unpickling compatibility fix for Scikit-Learn pipelines
if not hasattr(np, "_core"):
    import numpy.core as _c
    sys.modules["numpy._core"] = _c
    sys.modules["numpy._core.multiarray"] = _c.multiarray
    sys.modules["numpy._core.numeric"] = _c.numeric
    sys.modules["numpy._core.umath"] = _c.umath
    sys.modules["numpy._core.fromnumeric"] = _c.fromnumeric

# Add current backend directory and workspace root to sys.path for universal module resolution
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.chat import router as chat_router
from routers.recommend import router as recommend_router
from routers.warehouse import router as warehouse_router
from routers.locations import router as locations_router
from routers.forecast import router as forecast_router
from routers.allocation import router as allocation_router
from routers.routes import router as routes_router


app = FastAPI(
    title="AgriVision Unified Deployable Backend API",
    description="Production Deployable FastAPI Backend for AgriVision Suite (AI Agronomist, Smart Warehouse, ML Suggester & CVRP Route Solver)",
    version="1.0.0"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount All Feature API Routers
app.include_router(chat_router)
app.include_router(recommend_router)
app.include_router(warehouse_router)
app.include_router(locations_router)
app.include_router(forecast_router)
app.include_router(allocation_router)
app.include_router(routes_router)


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "AgriVision Deployable Unified Backend API",
        "version": "1.0.0",
        "documentation": "/docs"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AgriVision Production Microservice"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
