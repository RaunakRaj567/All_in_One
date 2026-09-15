"""
===============================================================================
FASTAPI SCHEMAS — SMART WAREHOUSE MODULE
===============================================================================
File Path: schemas/warehouse.py
===============================================================================
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SurplusAnalysisRequest(BaseModel):
    farmer_id: str = Field(default="F001", description="Unique farmer identifier")
    crop: str = Field(..., description="Crop name (e.g. Onion, Wheat, Rice, Maize)")
    supply_kg: float = Field(..., gt=0, description="Available harvest supply in kg")
    market_demand_kg: float = Field(..., ge=0, description="Predicted market demand in kg")
    latitude: Optional[float] = Field(default=28.61, description="Farmer latitude")
    longitude: Optional[float] = Field(default=77.20, description="Farmer longitude")


class StoreProduceRequest(BaseModel):
    farmer_id: str = Field(default="F001", description="Unique farmer identifier")
    warehouse_id: str = Field(..., description="Target warehouse ID")
    crop: str = Field(..., description="Crop name")
    quantity_kg: float = Field(..., gt=0, description="Surplus quantity to store in kg")
    planned_sell_date: Optional[str] = Field(default=None, description="Target selling date YYYY-MM-DD")


class SellProduceRequest(BaseModel):
    sell_quantity_kg: float = Field(..., gt=0, description="Quantity to sell in kg")


class WithdrawProduceRequest(BaseModel):
    withdraw_quantity_kg: float = Field(..., gt=0, description="Quantity to withdraw in kg")


class UpdateSpRequest(BaseModel):
    farmer_id: str = Field(default="F001", description="Farmer ID")
    crop: str = Field(..., description="Crop name")
    markup_percent: float = Field(..., ge=0.0, le=5.0, description="Price increase percentage (max 5.0%)")
    custom_sp_per_kg: float = Field(..., gt=0.0, description="Altered Selling Price per kg")


class BuyerPurchaseRequest(BaseModel):
    buyer_id: str = Field(default="B001", description="Buyer ID")
    inventory_id: str = Field(..., description="Target inventory lot ID")
    purchase_quantity_kg: float = Field(..., gt=0.0, description="Quantity to purchase in kg")
    drop_latitude: float = Field(..., description="Delivery drop-off latitude")
    drop_longitude: float = Field(..., description="Delivery drop-off longitude")
    drop_location_name: Optional[str] = Field(default="Buyer Location", description="Drop-off location name")

