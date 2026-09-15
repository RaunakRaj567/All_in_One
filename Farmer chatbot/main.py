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

# Add Routees - iNTEGRATED to Python sys.path
ROUTEES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Routees - iNTEGRATED"))
if ROUTEES_DIR not in sys.path:
    sys.path.insert(0, ROUTEES_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.chat import router as chat_router
from routers.recommend import router as recommend_router
from routers.warehouse import router as warehouse_router

from backend.api.locations import router as locations_router
from backend.api.forecast import router as forecast_router
from backend.api.allocation import router as allocation_router
from backend.api.routes import router as routes_router


app = FastAPI(
    title="AgriVision Mega FastAPI Backend",
    description="Unified Backend API for Chatbot, ML Crop Recommender, Demand Forecasting, Smart Warehouse & CVRP Route Solver",
    version="1.0.0"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include All API Routers
app.include_router(chat_router)
app.include_router(recommend_router)
app.include_router(warehouse_router)
app.include_router(locations_router)
app.include_router(forecast_router)
app.include_router(allocation_router)
app.include_router(routes_router)


@app.get("/")
async def home():
    return {
        "message": "AgriVision Mega FastAPI Backend is running 🚀"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AgriVision Unified Backend"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)