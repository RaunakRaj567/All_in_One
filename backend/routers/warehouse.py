"""
===============================================================================
FASTAPI ROUTER — SMART WAREHOUSE & FARMER INVENTORY API
===============================================================================
File Path: routers/warehouse.py
===============================================================================
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from schemas.warehouse import (
    SurplusAnalysisRequest,
    StoreProduceRequest,
    SellProduceRequest,
    WithdrawProduceRequest,
    UpdateSpRequest,
    BuyerPurchaseRequest
)
try:
    from services.warehouse_service import (
        analyze_surplus_and_storage,
        get_nearby_warehouses,
        store_surplus_produce,
        get_farmer_inventory,
        get_farmer_notifications,
        get_all_warehouse_marketplace_items,
        buy_warehouse_produce,
        sell_inventory_produce,
        withdraw_inventory_produce,
        update_sp_in_db,
        get_farmer_storage_cost_summary,
        reset_database,
        WAREHOUSES_DB
    )
except ImportError:
    from backend.services.warehouse_service import (
        analyze_surplus_and_storage,
        get_nearby_warehouses,
        store_surplus_produce,
        get_farmer_inventory,
        get_farmer_notifications,
        get_all_warehouse_marketplace_items,
        buy_warehouse_produce,
        sell_inventory_produce,
        withdraw_inventory_produce,
        update_sp_in_db,
        get_farmer_storage_cost_summary,
        reset_database,
        WAREHOUSES_DB
    )

router = APIRouter(tags=["Smart Warehouse & Inventory"])


@router.post("/api/warehouse/analyze-surplus")
def analyze_surplus(req: SurplusAnalysisRequest):
    """
    Analyzes produce supply vs demand surplus, computes 9-day price trends, 
    storage costs (₹/ton/day), and financial recommendation (SELL NOW vs STORE).
    """
    try:
        res = analyze_surplus_and_storage(
            farmer_id=req.farmer_id,
            crop=req.crop,
            supply_kg=req.supply_kg,
            market_demand_kg=req.market_demand_kg,
            latitude=req.latitude or 28.61,
            longitude=req.longitude or 77.20
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Surplus analysis error: {str(e)}")


@router.get("/api/warehouses/nearby")
def list_nearby_warehouses(
    crop: str = Query(..., description="Crop name"),
    surplus_kg: float = Query(..., gt=0, description="Surplus quantity in kg"),
    latitude: float = Query(28.61, description="Farmer latitude"),
    longitude: float = Query(77.20, description="Farmer longitude")
):
    """
    Finds and ranks eligible warehouses by distance, fixed storage cost per ton, and available capacity.
    """
    try:
        res = get_nearby_warehouses(crop=crop, surplus_kg=surplus_kg, latitude=latitude, longitude=longitude)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Warehouse lookup error: {str(e)}")


@router.post("/api/warehouse/store")
def store_produce(req: StoreProduceRequest):
    """
    Deposits surplus produce into a warehouse, updates available capacity, and registers farmer inventory.
    """
    try:
        res = store_surplus_produce(
            farmer_id=req.farmer_id,
            warehouse_id=req.warehouse_id,
            crop=req.crop,
            quantity_kg=req.quantity_kg,
            planned_sell_date=req.planned_sell_date
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage deposit error: {str(e)}")


@router.post("/api/warehouse/update-sp")
def update_selling_price(req: UpdateSpRequest):
    """
    Saves altered Selling Price (SP) and price markup (max 5%) to DB for farmer's stored crop.
    """
    try:
        res = update_sp_in_db(
            farmer_id=req.farmer_id,
            crop=req.crop,
            markup_percent=req.markup_percent,
            custom_sp_per_kg=req.custom_sp_per_kg
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Selling price update error: {str(e)}")


@router.get("/api/farmer/{farmer_id}/storage-cost")
def get_farmer_storage_cost(farmer_id: str):
    """
    Computes storage rate per ton per day and actual payable storage costs for a specific farmer.
    """
    try:
        res = get_farmer_storage_cost_summary(farmer_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage cost error: {str(e)}")


@router.get("/api/farmer/{farmer_id}/inventory")
def list_farmer_inventory(farmer_id: str):
    """
    Returns stored produce inventory for a farmer with live valuations and transaction logs.
    """
    try:
        items = get_farmer_inventory(farmer_id)
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inventory error: {str(e)}")


@router.post("/api/warehouse/inventory/{inventory_id}/sell")
def sell_stored_produce(inventory_id: str, req: SellProduceRequest):
    """
    Executes partial or full sell of stored produce, restores warehouse capacity, and logs transaction.
    """
    try:
        res = sell_inventory_produce(inventory_id=inventory_id, sell_quantity_kg=req.sell_quantity_kg)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sale execution error: {str(e)}")


@router.post("/api/warehouse/inventory/{inventory_id}/withdraw")
def withdraw_stored_produce(inventory_id: str, req: WithdrawProduceRequest):
    """
    Withdraws stored produce back to farmer, restores warehouse capacity, and logs transaction.
    """
    try:
        res = withdraw_inventory_produce(inventory_id=inventory_id, withdraw_quantity_kg=req.withdraw_quantity_kg)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Withdrawal error: {str(e)}")


@router.get("/api/warehouses/{warehouse_id}")
def get_warehouse_details(warehouse_id: str):
    """
    Returns details for a specific warehouse ID.
    """
    wh = next((w for w in WAREHOUSES_DB if w["warehouse_id"] == warehouse_id), None)
    if not wh:
        raise HTTPException(status_code=404, detail=f"Warehouse '{warehouse_id}' not found.")
    return wh


@router.get("/api/warehouse/all-inventory")
def list_all_warehouse_inventory():
    """
    Returns stored produce inventory across all farmers for the Buyer Marketplace.
    """
    try:
        return get_all_warehouse_marketplace_items()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Marketplace inventory fetch error: {str(e)}")


@router.post("/api/warehouse/buy")
def execute_buyer_purchase(req: BuyerPurchaseRequest):
    """
    Executes buyer purchase of stored crop and calculates logistics delivery based on drop-off lat/lon.
    """
    try:
        res = buy_warehouse_produce(
            buyer_id=req.buyer_id,
            inventory_id=req.inventory_id,
            purchase_quantity_kg=req.purchase_quantity_kg,
            drop_latitude=req.drop_latitude,
            drop_longitude=req.drop_longitude,
            drop_location_name=req.drop_location_name
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Buyer purchase execution error: {str(e)}")


@router.get("/api/farmer/{farmer_id}/notifications")
def list_farmer_notifications(farmer_id: str):
    """
    Returns real-time notifications for a farmer (e.g. crop purchase alerts, stock updates).
    """
    try:
        return get_farmer_notifications(farmer_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Notifications error: {str(e)}")


@router.post("/api/db/reset")
@router.get("/api/db/reset")
def reset_db():
    """
    Renews all database records (inventories, transactions, notifications, warehouse stock levels)
    while preserving login credentials and user accounts.
    """
    try:
        return reset_database()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB reset error: {str(e)}")



