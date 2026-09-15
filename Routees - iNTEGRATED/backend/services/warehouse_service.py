"""
===============================================================================
BACKEND SERVICE MODULE — SMART WAREHOUSE & SURPLUS ENGINE
===============================================================================
File Path: backend/services/warehouse_service.py
===============================================================================
"""

import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from backend.data.warehouse_data import DEFAULT_WAREHOUSES
from backend.services.forecast_service import get_market_forecasts

# In-memory database tables for persistent multi-farmer demo session
WAREHOUSES_DB: List[Dict[str, Any]] = [dict(w) for w in DEFAULT_WAREHOUSES]

FARMER_INVENTORY_DB: List[Dict[str, Any]] = []

STORAGE_TRANSACTIONS_DB: List[Dict[str, Any]] = []

FARMER_NOTIFICATIONS_DB: List[Dict[str, Any]] = []


def get_farmer_notifications(farmer_id: str) -> List[Dict[str, Any]]:
    """Returns real-time notifications for a specific farmer."""
    return [n for n in FARMER_NOTIFICATIONS_DB if n["farmer_id"] == farmer_id]


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates Haversine distance in km between two geographic coordinates."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)


def get_historical_and_predicted_prices(crop: str, location: str = "Delhi", base_date_str: str = "2026-09-15") -> List[Dict[str, Any]]:
    """
    Returns 9 price points: 5 historical days + Today + 3 predicted future days.
    """
    try:
        base_date = datetime.strptime(base_date_str, "%Y-%m-%d")
    except Exception:
        base_date = datetime.now()

    # Try existing forecast service for base predicted prices
    try:
        p_map, _ = get_market_forecasts(crop, base_date.strftime("%Y-%m-%d"))
        today_price = float(p_map.get(location, p_map.get("Delhi", 25.0)))
    except Exception:
        crop_base_prices = {"Onion": 25.0, "Wheat": 28.0, "Rice": 34.0, "Maize": 22.0}
        today_price = crop_base_prices.get(crop, 25.0)

    # Base price dynamics multipliers per crop
    trend_factors = {
        "Onion": [-3.0, -2.0, -1.0, -2.0, -1.0, 0.0, +2.0, +4.0, +6.0],
        "Wheat": [-2.0, -1.5, -1.0, -0.5, -0.5, 0.0, +1.0, +2.5, +4.0],
        "Rice":  [-2.5, -2.0, -1.5, -1.0, -0.5, 0.0, +1.5, +3.0, +5.0],
        "Maize": [-1.5, -1.0, -0.5, -1.0, -0.5, 0.0, +1.2, +2.2, +3.5]
    }
    multipliers = trend_factors.get(crop, [-2.0, -1.5, -1.0, -0.5, -0.5, 0.0, +1.5, +3.0, +5.0])

    nine_day_points = []
    # 5 historical days + today + 3 predicted days (indices 0 to 8, offset -5 to +3)
    for i, offset in enumerate(range(-5, 4)):
        dt = base_date + timedelta(days=offset)
        dt_str = dt.strftime("%Y-%m-%d")
        price = round(max(10.0, today_price + multipliers[i]), 2)
        price_ton = round(price * 1000.0, 2)

        if offset < 0:
            label = f"Day {offset}"
            pt_type = "Historical (Actual)"
            is_predicted = False
        elif offset == 0:
            label = "Today"
            pt_type = "Historical (Actual)"
            is_predicted = False
        else:
            label = f"Day +{offset}"
            pt_type = "Predicted (Estimate)"
            is_predicted = True

        nine_day_points.append({
            "date": dt_str,
            "day_label": label,
            "price_per_kg": price,
            "price_per_ton": price_ton,
            "type": pt_type,
            "is_predicted": is_predicted
        })

    return nine_day_points


def analyze_surplus_and_storage(
    farmer_id: str,
    crop: str,
    supply_kg: float,
    market_demand_kg: float,
    latitude: float = 28.61,
    longitude: float = 77.20,
    storage_rate_per_ton_day: float = 500.0
) -> Dict[str, Any]:
    """
    Executes Surplus Detection & Sell Now vs Store Financial Recommendation Engine.
    """
    if supply_kg <= 0:
        raise ValueError("Supply quantity must be greater than 0 kg.")

    surplus_kg = max(0.0, round(supply_kg - market_demand_kg, 2))
    surplus_ton = round(surplus_kg / 1000.0, 3)

    # Fetch 9-day price trend
    nine_day_points = get_historical_and_predicted_prices(crop, "Delhi", datetime.now().strftime("%Y-%m-%d"))
    today_pt = [p for p in nine_day_points if not p["is_predicted"] and p["day_label"] == "Today"][0]
    future_pts = [p for p in nine_day_points if p["is_predicted"]]

    current_price_per_kg = today_pt["price_per_kg"]
    current_price_per_ton = today_pt["price_per_ton"]

    current_value = round(surplus_kg * current_price_per_kg, 2)

    if surplus_kg <= 0:
        return {
            "farmer_id": farmer_id,
            "crop": crop,
            "supply_kg": supply_kg,
            "supply_ton": round(supply_kg / 1000.0, 3),
            "demand_kg": market_demand_kg,
            "demand_ton": round(market_demand_kg / 1000.0, 3),
            "surplus_kg": 0.0,
            "surplus_ton": 0.0,
            "has_surplus": False,
            "current_price_per_kg": current_price_per_kg,
            "current_price_per_ton": current_price_per_ton,
            "recommendation": "SELL NOW",
            "recommendation_reason": "Supply is less than or equal to current market demand. Sell produce immediately in local market.",
            "recommended_storage_days": 0,
            "predicted_price_per_kg": current_price_per_kg,
            "predicted_price_per_ton": current_price_per_ton,
            "storage_cost_per_ton_per_day": storage_rate_per_ton_day,
            "total_storage_cost": 0.0,
            "current_value": current_value,
            "future_gross_value": current_value,
            "future_net_value": current_value,
            "estimated_benefit": 0.0,
            "price_trend_points": nine_day_points,
            "day_evaluations": []
        }

    # Evaluate future storage options for 1, 2, 3 days
    day_evaluations = []
    best_opt = None
    max_net_benefit = -999999.0

    for idx, fut in enumerate(future_pts, start=1):
        days = idx
        pred_price = fut["price_per_kg"]
        fut_gross = round(surplus_kg * pred_price, 2)
        st_cost = round(surplus_ton * days * storage_rate_per_ton_day, 2)
        fut_net = round(fut_gross - st_cost, 2)
        net_benefit = round(fut_net - current_value, 2)

        eval_item = {
            "day_offset": days,
            "date": fut["date"],
            "predicted_price_per_kg": pred_price,
            "predicted_price_per_ton": fut["price_per_ton"],
            "future_gross_value": fut_gross,
            "storage_cost": st_cost,
            "future_net_value": fut_net,
            "net_benefit": net_benefit,
            "is_profitable": net_benefit > 0
        }
        day_evaluations.append(eval_item)

        if net_benefit > max_net_benefit:
            max_net_benefit = net_benefit
            best_opt = eval_item

    if best_opt and best_opt["net_benefit"] > 0:
        recommendation = "STORE"
        rec_reason = f"Storing {surplus_ton} tons for {best_opt['day_offset']} days yields a net gain of ₹{best_opt['net_benefit']:,.2f} after accounting for ₹{best_opt['storage_cost']:,.2f} storage cost."
        rec_days = best_opt["day_offset"]
        best_pred_price = best_opt["predicted_price_per_kg"]
        best_gross = best_opt["future_gross_value"]
        best_cost = best_opt["storage_cost"]
        best_net = best_opt["future_net_value"]
        best_benefit = best_opt["net_benefit"]
        rec_sell_date = best_opt["date"]
    else:
        recommendation = "SELL NOW"
        rec_reason = "Predicted price increases do not cover storage costs. Selling now yields maximum net realization."
        rec_days = 0
        best_pred_price = current_price_per_kg
        best_gross = current_value
        best_cost = 0.0
        best_net = current_value
        best_benefit = 0.0
        rec_sell_date = today_pt["date"]

    return {
        "farmer_id": farmer_id,
        "crop": crop,
        "supply_kg": supply_kg,
        "supply_ton": round(supply_kg / 1000.0, 3),
        "demand_kg": market_demand_kg,
        "demand_ton": round(market_demand_kg / 1000.0, 3),
        "surplus_kg": surplus_kg,
        "surplus_ton": surplus_ton,
        "has_surplus": True,
        "current_price_per_kg": current_price_per_kg,
        "current_price_per_ton": current_price_per_ton,
        "recommendation": recommendation,
        "recommendation_reason": rec_reason,
        "recommended_storage_days": rec_days,
        "recommended_sell_date": rec_sell_date,
        "predicted_price_per_kg": best_pred_price,
        "predicted_price_per_ton": round(best_pred_price * 1000.0, 2),
        "storage_cost_per_ton_per_day": storage_rate_per_ton_day,
        "total_storage_cost": best_cost,
        "current_value": current_value,
        "future_gross_value": best_gross,
        "future_net_value": best_net,
        "estimated_benefit": best_benefit,
        "price_trend_points": nine_day_points,
        "day_evaluations": day_evaluations
    }


def get_nearby_warehouses(crop: str, surplus_kg: float, latitude: float, longitude: float) -> List[Dict[str, Any]]:
    """
    Finds and ranks eligible warehouses by Distance + Storage Cost + Capacity.
    """
    results = []
    surplus_ton = surplus_kg / 1000.0

    for w in WAREHOUSES_DB:
        if w["status"] != "OPERATIONAL":
            continue
        if crop not in w["supported_crops"]:
            continue
        if w["available_capacity_kg"] < surplus_kg:
            continue

        dist_km = haversine_distance_km(latitude, longitude, w["latitude"], w["longitude"])
        # Score ranking: lower distance + lower storage cost = higher priority
        rate = w["storage_cost_per_ton_per_day"]
        score = dist_km * 10.0 + rate

        item = dict(w)
        item["distance_km"] = dist_km
        item["available_capacity_ton"] = round(w["available_capacity_kg"] / 1000.0, 2)
        item["total_capacity_ton"] = round(w["total_capacity_kg"] / 1000.0, 2)
        item["rank_score"] = round(score, 2)
        item["est_daily_cost_for_surplus"] = round(surplus_ton * rate, 2)
        results.append(item)

    results.sort(key=lambda x: x["rank_score"])
    return results


def store_surplus_produce(
    farmer_id: str,
    warehouse_id: str,
    crop: str,
    quantity_kg: float,
    planned_sell_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Deposits surplus produce into the single central warehouse (W001).
    If active inventory record(s) for the crop already exist, consolidates and accumulates the stored quantity in the DB into ONE single item.
    """
    # Force single default central warehouse (W001)
    target_wh_id = "W001"
    warehouse = next((w for w in WAREHOUSES_DB if w["warehouse_id"] == target_wh_id), WAREHOUSES_DB[0])

    if warehouse["available_capacity_kg"] < quantity_kg:
        raise ValueError(f"Insufficient capacity in '{warehouse['name']}'. Requested: {quantity_kg} kg, Available: {warehouse['available_capacity_kg']} kg.")

    # Decrement available capacity
    warehouse["available_capacity_kg"] = round(warehouse["available_capacity_kg"] - quantity_kg, 2)

    # Get current price
    prices_map = get_historical_and_predicted_prices(crop)
    today_price = prices_map[5]["price_per_kg"] # Today's price

    now_str = datetime.now().strftime("%Y-%m-%d")
    now_iso = datetime.now().isoformat() + "Z"

    # Check if active stored lot(s) for farmer & crop already exist in W001
    matching_active = [
        i for i in FARMER_INVENTORY_DB
        if i["farmer_id"] == farmer_id and i["crop"].strip().lower() == crop.strip().lower() and i["status"] in ["STORED", "PARTIAL_SOLD"]
    ]

    if matching_active:
        existing_inv = matching_active[0]
        # Consolidate any extra active duplicate lots into existing_inv
        extra_qty = sum(i["quantity_kg"] for i in matching_active[1:])
        for extra in matching_active[1:]:
            extra["quantity_kg"] = 0.0
            extra["quantity_ton"] = 0.0
            extra["status"] = "MERGED"
            extra["updated_at"] = now_iso

        new_total_kg = round(existing_inv["quantity_kg"] + extra_qty + quantity_kg, 2)
        existing_inv["quantity_kg"] = new_total_kg
        existing_inv["stored_quantity_kg"] = new_total_kg
        existing_inv["quantity_ton"] = round(new_total_kg / 1000.0, 3)
        existing_inv["status"] = "STORED"
        existing_inv["updated_at"] = now_iso
        inv_record = existing_inv
        inv_id = existing_inv["inventory_id"]
        action_desc = f"Updated stored balance to {new_total_kg} kg ({new_total_kg/1000:.2f} tons)"
    else:
        inv_id = f"INV-{len(FARMER_INVENTORY_DB) + 1001}"
        inv_record = {
            "inventory_id": inv_id,
            "farmer_id": farmer_id,
            "warehouse_id": target_wh_id,
            "warehouse_name": warehouse["name"],
            "crop": crop.strip().capitalize(),
            "quantity_kg": round(quantity_kg, 2),
            "stored_quantity_kg": round(quantity_kg, 2),
            "quantity_ton": round(quantity_kg / 1000.0, 3),
            "price_at_storage_per_kg": today_price,
            "price_at_storage_per_ton": round(today_price * 1000.0, 2),
            "markup_percent": 0.0,
            "storage_cost_per_ton_per_day": warehouse["storage_cost_per_ton_per_day"],
            "storage_date": now_str,
            "planned_sell_date": planned_sell_date or (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
            "status": "STORED",
            "created_at": now_iso,
            "updated_at": now_iso
        }
        FARMER_INVENTORY_DB.append(inv_record)
        action_desc = f"Stored {quantity_kg} kg ({quantity_kg/1000:.2f} tons)"

    txn_id = f"TXN-{len(STORAGE_TRANSACTIONS_DB) + 5001}"
    txn_record = {
        "transaction_id": txn_id,
        "inventory_id": inv_id,
        "farmer_id": farmer_id,
        "transaction_type": "DEPOSIT",
        "quantity_kg": round(quantity_kg, 2),
        "price_per_kg": today_price,
        "amount": round(quantity_kg * today_price, 2),
        "timestamp": now_iso
    }
    STORAGE_TRANSACTIONS_DB.append(txn_record)

    # Add real notification for farmer
    notif_id = f"NOTIF-{len(FARMER_NOTIFICATIONS_DB) + 101}"
    dep_ton = round(quantity_kg / 1000.0, 2)
    FARMER_NOTIFICATIONS_DB.append({
        "notification_id": notif_id,
        "farmer_id": farmer_id,
        "title": "📦 Storage Deposit Confirmed",
        "message": f"{dep_ton:.2f} tons of {crop} deposited in {warehouse['name']}.",
        "type": "STORAGE_DEPOSIT",
        "timestamp": now_iso,
        "is_read": False
    })

    return {
        "success": True,
        "message": f"{action_desc} of {crop} in {warehouse['name']} (DB Updated).",
        "inventory": inv_record,
        "transaction": txn_record
    }


def update_sp_in_db(
    farmer_id: str,
    crop: str,
    markup_percent: float,
    custom_sp_per_kg: float
) -> Dict[str, Any]:
    """
    Saves altered Selling Price (SP) and price markup (max 5%) to DB for farmer's stored crop.
    """
    if markup_percent > 5.0:
        raise ValueError("Price markup cannot exceed 5.0% above model baseline.")
    if custom_sp_per_kg <= 0:
        raise ValueError("Selling Price must be greater than 0.")

    # Find active stored inventory records for farmer and crop
    matching_items = [i for i in FARMER_INVENTORY_DB if i["farmer_id"] == farmer_id and i["crop"].lower() == crop.lower()]

    custom_sp_per_ton = round(custom_sp_per_kg * 1000.0, 2)
    now_iso = datetime.now().isoformat() + "Z"

    for inv in matching_items:
        inv["price_at_storage_per_kg"] = round(custom_sp_per_kg, 2)
        inv["price_at_storage_per_ton"] = custom_sp_per_ton
        inv["custom_sp_per_kg"] = round(custom_sp_per_kg, 2)
        inv["custom_sp_per_ton"] = custom_sp_per_ton
        inv["markup_percent"] = round(markup_percent, 2)
        inv["updated_at"] = now_iso

    return {
        "success": True,
        "message": f"Successfully saved updated SP (₹{custom_sp_per_kg:.2f}/kg | ₹{custom_sp_per_ton:,.2f}/ton, +{markup_percent:.1f}% markup) to DB.",
        "farmer_id": farmer_id,
        "crop": crop,
        "markup_percent": round(markup_percent, 2),
        "custom_sp_per_kg": round(custom_sp_per_kg, 2),
        "custom_sp_per_ton": custom_sp_per_ton,
        "records_updated": len(matching_items)
    }



def get_farmer_inventory(farmer_id: str) -> List[Dict[str, Any]]:
    """
    Returns stored inventory items with live market valuations and storage metrics.
    Consolidates items by crop so each crop per farmer ALWAYS forms strictly ONE tile/item.
    """
    raw_items = [
        inv for inv in FARMER_INVENTORY_DB
        if inv["farmer_id"] == farmer_id and inv["status"] in ["STORED", "PARTIAL_SOLD"] and inv["quantity_kg"] > 0
    ]

    grouped: Dict[str, Dict[str, Any]] = {}
    now_dt = datetime.now()

    for item in raw_items:
        crop_key = item["crop"].strip().capitalize()
        if crop_key not in grouped:
            grouped[crop_key] = {
                "inventory_id": item["inventory_id"],
                "farmer_id": item["farmer_id"],
                "farmer_name": item.get("farmer_name", f"Farmer ({farmer_id})"),
                "warehouse_id": item.get("warehouse_id", "W001"),
                "warehouse_name": item.get("warehouse_name", "Agri-Mitra Central Warehouse & Cold Vault"),
                "crop": crop_key,
                "quantity_kg": 0.0,
                "stored_quantity_kg": 0.0,
                "quantity_ton": 0.0,
                "price_at_storage_per_kg": item.get("price_at_storage_per_kg", 25.0),
                "price_at_storage_per_ton": item.get("price_at_storage_per_ton", 25000.0),
                "custom_sp_per_kg": item.get("custom_sp_per_kg"),
                "markup_percent": item.get("markup_percent", 0.0),
                "storage_cost_per_ton_per_day": item.get("storage_cost_per_ton_per_day", 15.0),
                "storage_date": item.get("storage_date", now_dt.strftime("%Y-%m-%d")),
                "planned_sell_date": item.get("planned_sell_date", (now_dt + timedelta(days=3)).strftime("%Y-%m-%d")),
                "status": "STORED",
                "created_at": item.get("created_at", now_dt.isoformat() + "Z"),
                "updated_at": item.get("updated_at", now_dt.isoformat() + "Z"),
                "transactions": []
            }

        target = grouped[crop_key]
        target["quantity_kg"] = round(target["quantity_kg"] + item["quantity_kg"], 2)
        target["stored_quantity_kg"] = round(target["stored_quantity_kg"] + item.get("stored_quantity_kg", item["quantity_kg"]), 2)
        if item.get("custom_sp_per_kg"):
            target["custom_sp_per_kg"] = item["custom_sp_per_kg"]
        if item.get("storage_date") and item["storage_date"] < target["storage_date"]:
            target["storage_date"] = item["storage_date"]

        txns = [t for t in STORAGE_TRANSACTIONS_DB if t["inventory_id"] == item["inventory_id"]]
        for t in txns:
            if t not in target["transactions"]:
                target["transactions"].append(t)

    result_list = []
    for crop_key, item in grouped.items():
        qty_kg = item["quantity_kg"]
        qty_ton = round(qty_kg / 1000.0, 3)

        prices_pts = get_historical_and_predicted_prices(crop_key)
        current_price = item.get("custom_sp_per_kg") or prices_pts[5]["price_per_kg"]
        pred_price = prices_pts[8]["price_per_kg"]

        try:
            st_date = datetime.strptime(item["storage_date"], "%Y-%m-%d")
            days_stored = max(1, (now_dt - st_date).days + 1)
        except Exception:
            days_stored = 1

        rate = item["storage_cost_per_ton_per_day"]
        acc_cost = round(qty_ton * days_stored * rate, 2)
        cur_val = round(qty_kg * current_price, 2)
        fut_gross = round(qty_kg * pred_price, 2)
        fut_net = round(fut_gross - acc_cost, 2)

        item["quantity_ton"] = qty_ton
        item["current_price_per_kg"] = current_price
        item["current_price_per_ton"] = round(current_price * 1000.0, 2)
        item["predicted_price_per_kg"] = pred_price
        item["predicted_price_per_ton"] = round(pred_price * 1000.0, 2)
        item["days_stored"] = days_stored
        item["accumulated_storage_cost"] = acc_cost
        item["estimated_current_value"] = cur_val
        item["estimated_future_gross_value"] = fut_gross
        item["estimated_future_net_value"] = fut_net

        result_list.append(item)

    return result_list


def get_all_warehouse_marketplace_items() -> List[Dict[str, Any]]:
    """
    Returns all active stored produce items across all farmers for the Buyer E-Commerce Marketplace.
    """
    all_items = []
    farmer_meta = {
        "F001": {"name": "Ramesh Kumar", "location": "Azadpur, Delhi", "avatar": "👨‍🌾"},
        "F002": {"name": "Suresh Patel", "location": "Sahibabad, UP", "avatar": "🌾"},
        "F003": {"name": "Anita Singh", "location": "Gurugram, HR", "avatar": "👩‍🌾"}
    }
    # Collect all unique farmer IDs that have active inventory in FARMER_INVENTORY_DB
    unique_fids = list(dict.fromkeys([
        inv["farmer_id"] for inv in FARMER_INVENTORY_DB
        if inv.get("farmer_id") and inv.get("status") in ["STORED", "PARTIAL_SOLD"] and inv.get("quantity_kg", 0) > 0
    ]))
    for fid in unique_fids:
        items = get_farmer_inventory(fid)
        for it in items:
            meta = farmer_meta.get(fid, {"name": it.get("farmer_name") or f"Farmer ({fid})", "location": "Delhi NCR", "avatar": "👨‍🌾"})
            it["farmer_name"] = it.get("farmer_name") or meta["name"]
            it["farmer_location"] = it.get("farmer_location") or meta["location"]
            it["farmer_avatar"] = it.get("farmer_avatar") or meta["avatar"]
            all_items.append(it)

    return all_items


def buy_warehouse_produce(
    buyer_id: str,
    inventory_id: str,
    purchase_quantity_kg: float,
    drop_latitude: float,
    drop_longitude: float,
    drop_location_name: str = "Buyer Warehouse Dock"
) -> Dict[str, Any]:
    """
    Executes buyer e-commerce purchase of stored produce.
    Calculates logistics transport fee based on Haversine distance to drop-off lat/lon.
    """
    # Execute sale on inventory
    sale_res = sell_inventory_produce(inventory_id, purchase_quantity_kg)
    inv = sale_res.get("inventory", {})
    txn = sale_res.get("transaction", {})
    crop = inv.get("crop") or "Produce"

    # Haversine distance from Central Warehouse W001 (Nyaya Marg, Near USA Embassy: 28°35'46.8"N 77°11'11.3"E -> 28.596333, 77.186472)
    wh_lat, wh_lon = 28.596333, 77.186472
    dist_km = haversine_distance_km(wh_lat, wh_lon, drop_latitude, drop_longitude)
    if dist_km < 0.5:
        dist_km = 4.5 # Default local delivery distance if same spot

    logistics_fee = round(dist_km * 60.0, 2) # ₹60 / km transport rate
    crop_amount = txn.get("amount", round(purchase_quantity_kg * txn.get("price_per_kg", 25.0), 2))
    total_payable = round(crop_amount + logistics_fee, 2)

    order_id = f"ORD-{1000 + len(STORAGE_TRANSACTIONS_DB)}"
    now_iso = datetime.now().isoformat() + "Z"

    # Emit Special Farmer Notification about crop purchase & stock reduction
    farmer_id = inv.get("farmer_id")
    buyer_names = {
        "B001": "Commercial FMCG Corp",
        "B002": "Agri-Exports Global",
        "B003": "Metro Food Processing"
    }
    buyer_display_name = buyer_names.get(buyer_id, f"Buyer ({buyer_id})")

    notif_id = f"NOTIF-{len(FARMER_NOTIFICATIONS_DB) + 101}"
    purchased_ton = round(purchase_quantity_kg / 1000.0, 3)
    remaining_ton = inv.get("quantity_ton", 0.0)
    remaining_kg = inv.get("quantity_kg", 0.0)

    sale_notification = {
        "notification_id": notif_id,
        "farmer_id": farmer_id,
        "title": f"💰 CROP PURCHASED ALERT: {purchased_ton:.2f} Tons Bought!",
        "message": (
            f"🎉 Great news! Buyer '{buyer_display_name}' ({buyer_id}) just purchased {purchased_ton:.2f} tons "
            f"({purchase_quantity_kg:,.0f} kg) of your stored {crop} (Lot #{inventory_id}) from Nyaya Marg Central Vault! "
            f"Total payment earned: ₹{crop_amount:,.2f} (@ ₹{txn.get('price_per_kg', 25.0):.2f}/kg). "
            f"Remaining stored stock in vault: {remaining_ton:.2f} tons ({remaining_kg:,.0f} kg)."
        ),
        "type": "BUYER_PURCHASE",
        "crop": crop,
        "inventory_id": inventory_id,
        "purchased_quantity_kg": round(purchase_quantity_kg, 2),
        "purchased_quantity_ton": purchased_ton,
        "remaining_quantity_kg": remaining_kg,
        "remaining_quantity_ton": remaining_ton,
        "amount_earned": crop_amount,
        "buyer_id": buyer_id,
        "buyer_name": buyer_display_name,
        "drop_location": drop_location_name,
        "timestamp": now_iso,
        "is_read": False
    }
    FARMER_NOTIFICATIONS_DB.insert(0, sale_notification)

    return {
        "success": True,
        "order_id": order_id,
        "buyer_id": buyer_id,
        "inventory_id": inventory_id,
        "crop": crop,
        "farmer_id": farmer_id,
        "purchase_quantity_kg": round(purchase_quantity_kg, 2),
        "purchase_quantity_ton": purchased_ton,
        "price_per_kg": txn.get("price_per_kg", 25.0),
        "crop_amount": crop_amount,
        "warehouse_id": "W001",
        "warehouse_name": "Agri-Mitra Central Vault (Nyaya Marg, Near USA Embassy, New Delhi 110021)",
        "origin_coordinates": "28°35'46.8\"N 77°11'11.3\"E",
        "drop_location_name": drop_location_name,
        "drop_latitude": round(drop_latitude, 6),
        "drop_longitude": round(drop_longitude, 6),
        "distance_km": round(dist_km, 2),
        "logistics_fee": logistics_fee,
        "total_payable": total_payable,
        "status": "DISPATCHED",
        "estimated_delivery_mins": max(15, round(dist_km * 2.5)),
        "timestamp": now_iso,
        "message": f"✅ Order #{order_id} placed! {purchased_ton:.2f} tons of {crop} shipped from Nyaya Marg Vault (Near USA Embassy) to {drop_location_name} ({drop_latitude:.4f}° N, {drop_longitude:.4f}° E)."
    }


def find_inventory_item(inventory_id: str) -> Optional[Dict[str, Any]]:
    """
    Robust multi-level lookup for inventory items in FARMER_INVENTORY_DB.
    Matches exact ID, partial ID, numeric suffix, or active stored item for farmer.
    """
    if not inventory_id:
        return next((i for i in FARMER_INVENTORY_DB if i["status"] in ["STORED", "PARTIAL_SOLD"] and i["quantity_kg"] > 0), None)

    # 1. Exact ID match
    inv = next((i for i in FARMER_INVENTORY_DB if i["inventory_id"] == inventory_id), None)
    if inv:
        return inv

    # 2. Substring match (e.g. INV-1001 vs INV-CAT-101)
    inv = next((i for i in FARMER_INVENTORY_DB if inventory_id in i["inventory_id"] or i["inventory_id"] in inventory_id), None)
    if inv:
        return inv

    # 3. Numeric digits match (e.g. 1001, 101, 102)
    digits = "".join(filter(str.isdigit, inventory_id))
    if digits:
        inv = next((i for i in FARMER_INVENTORY_DB if digits in i["inventory_id"]), None)
        if inv:
            return inv

    return None


def sell_inventory_produce(inventory_id: str, sell_quantity_kg: float) -> Dict[str, Any]:
    """
    Executes partial or full selling of stored produce. Restores capacity and logs transaction.
    """
    inv = find_inventory_item(inventory_id)
    if not inv:
        raise ValueError(f"Inventory item '{inventory_id}' not found.")
    if inv["quantity_kg"] <= 0 or inv["status"] in ["FULLY_SOLD", "WITHDRAWN"]:
        raise ValueError("This stored produce inventory has already been completely sold or withdrawn.")
    if sell_quantity_kg <= 0:
        raise ValueError("Invalid purchase quantity. Please specify a quantity greater than 0 kg.")
    if sell_quantity_kg > inv["quantity_kg"]:
        max_ton = inv["quantity_kg"] / 1000.0
        req_ton = sell_quantity_kg / 1000.0
        raise ValueError(f"⚠️ Purchase Limit Exceeded! Requested {req_ton:.2f} tons, but only {max_ton:.2f} tons of {inv.get('farmer_name', 'Farmer')}'s {inv['crop']} is available in the warehouse.")

    # Get current market price for sale
    prices_pts = get_historical_and_predicted_prices(inv["crop"])
    current_price = prices_pts[5]["price_per_kg"]
    sale_amount = round(sell_quantity_kg * current_price, 2)

    # Update inventory record
    remaining_kg = round(inv["quantity_kg"] - sell_quantity_kg, 2)
    inv["quantity_kg"] = remaining_kg
    inv["quantity_ton"] = round(remaining_kg / 1000.0, 3)

    if remaining_kg <= 0.01:
        inv["quantity_kg"] = 0.0
        inv["quantity_ton"] = 0.0
        inv["status"] = "FULLY_SOLD"
    else:
        inv["status"] = "PARTIAL_SOLD"

    inv["updated_at"] = datetime.now().isoformat() + "Z"

    # Restore warehouse available capacity
    warehouse = next((w for w in WAREHOUSES_DB if w["warehouse_id"] == inv["warehouse_id"]), None)
    if warehouse:
        warehouse["available_capacity_kg"] = round(warehouse["available_capacity_kg"] + sell_quantity_kg, 2)

    # Log transaction
    txn_type = "FULL_SELL" if inv["status"] == "FULLY_SOLD" else "PARTIAL_SELL"
    txn_id = f"TXN-{len(STORAGE_TRANSACTIONS_DB) + 5001}"
    txn_record = {
        "transaction_id": txn_id,
        "inventory_id": inventory_id,
        "farmer_id": inv["farmer_id"],
        "transaction_type": txn_type,
        "quantity_kg": round(sell_quantity_kg, 2),
        "price_per_kg": current_price,
        "amount": sale_amount,
        "timestamp": datetime.now().isoformat() + "Z"
    }
    STORAGE_TRANSACTIONS_DB.append(txn_record)

    return {
        "success": True,
        "message": f"Successfully sold {sell_quantity_kg} kg ({sell_quantity_kg/1000:.2f} tons) for ₹{sale_amount:,.2f}.",
        "sold_quantity_kg": sell_quantity_kg,
        "remaining_quantity_kg": inv["quantity_kg"],
        "inventory": inv,
        "transaction": txn_record
    }


def withdraw_inventory_produce(inventory_id: str, withdraw_quantity_kg: float) -> Dict[str, Any]:
    """
    Withdraws stored produce back to farmer. Restores warehouse capacity and logs transaction.
    """
    inv = find_inventory_item(inventory_id)
    if not inv:
        raise ValueError(f"Inventory item '{inventory_id}' not found.")
    if inv["quantity_kg"] <= 0 or inv["status"] in ["FULLY_SOLD", "WITHDRAWN"]:
        raise ValueError("This stored produce inventory has already been completely sold or withdrawn.")
    if withdraw_quantity_kg <= 0 or withdraw_quantity_kg > inv["quantity_kg"]:
        raise ValueError(f"Invalid withdrawal quantity. Stored available: {inv['quantity_kg']} kg, Requested: {withdraw_quantity_kg} kg.")

    remaining_kg = round(inv["quantity_kg"] - withdraw_quantity_kg, 2)
    inv["quantity_kg"] = remaining_kg
    inv["quantity_ton"] = round(remaining_kg / 1000.0, 3)

    if remaining_kg <= 0.01:
        inv["quantity_kg"] = 0.0
        inv["quantity_ton"] = 0.0
        inv["status"] = "WITHDRAWN"

    inv["updated_at"] = datetime.now().isoformat() + "Z"

    # Restore warehouse available capacity
    warehouse = next((w for w in WAREHOUSES_DB if w["warehouse_id"] == inv["warehouse_id"]), None)
    if warehouse:
        warehouse["available_capacity_kg"] = round(warehouse["available_capacity_kg"] + withdraw_quantity_kg, 2)

    txn_id = f"TXN-{len(STORAGE_TRANSACTIONS_DB) + 5001}"
    txn_record = {
        "transaction_id": txn_id,
        "inventory_id": inventory_id,
        "farmer_id": inv["farmer_id"],
        "transaction_type": "WITHDRAW",
        "quantity_kg": round(withdraw_quantity_kg, 2),
        "price_per_kg": inv["price_at_storage_per_kg"],
        "amount": 0.0,
        "timestamp": datetime.now().isoformat() + "Z"
    }
    STORAGE_TRANSACTIONS_DB.append(txn_record)

    return {
        "success": True,
        "message": f"Successfully withdrew {withdraw_quantity_kg} kg ({withdraw_quantity_kg/1000:.2f} tons) from warehouse.",
        "withdrawn_quantity_kg": withdraw_quantity_kg,
        "remaining_quantity_kg": inv["quantity_kg"],
        "inventory": inv,
        "transaction": txn_record
    }


def get_farmer_storage_cost_summary(farmer_id: str) -> Dict[str, Any]:
    """
    Computes exact storage cost breakdown for a specific farmer (Multi-farmer isolation).
    Consolidates stored produce per crop so billing is itemized by unique crop.
    Calculates:
    - Fixed storage cost per ton per day
    - Total stored quantity in tons for this farmer
    - Days stored for each crop
    - Actual storage payable amount = quantity_ton * days_stored * rate_per_ton_day
    """
    now_dt = datetime.now()
    farmer_items = get_farmer_inventory(farmer_id)

    billing_items = []
    total_payable = 0.0
    total_tons_stored = 0.0

    for item in farmer_items:
        if item["quantity_kg"] <= 0:
            continue
        qty_ton = round(item["quantity_kg"] / 1000.0, 3)
        rate = item.get("storage_cost_per_ton_per_day", 15.0)

        try:
            st_date = datetime.strptime(item["storage_date"], "%Y-%m-%d")
            days_stored = max(1, (now_dt - st_date).days + 1)
        except Exception:
            days_stored = 1

        actual_payable = round(qty_ton * days_stored * rate, 2)
        total_payable += actual_payable
        total_tons_stored += qty_ton

        billing_items.append({
            "inventory_id": item["inventory_id"],
            "crop": item["crop"],
            "quantity_kg": item["quantity_kg"],
            "quantity_ton": qty_ton,
            "storage_date": item["storage_date"],
            "days_stored": days_stored,
            "storage_rate_per_ton_per_day": rate,
            "actual_payable_amount": actual_payable,
            "status": item["status"]
        })

    farmer_name_map = {
        "F001": "Ramesh Kumar (Farmer 1)",
        "F002": "Suresh Patel (Farmer 2)",
        "F003": "Anita Singh (Farmer 3)"
    }

    return {
        "farmer_id": farmer_id,
        "farmer_name": farmer_name_map.get(farmer_id, f"Farmer ({farmer_id})"),
        "warehouse_id": "W001",
        "warehouse_name": "Agri-Mitra Central Warehouse & Cold Vault",
        "fixed_storage_rate_per_ton_per_day": 15.0,
        "total_stored_tons": round(total_tons_stored, 3),
        "total_actual_payable_amount": round(total_payable, 2),
        "itemized_billing": billing_items
    }


def reset_database() -> Dict[str, Any]:
    """
    Renews all database records (inventories, transactions, notifications, warehouse stock levels)
    while preserving login credentials and user/farmer accounts.
    """
    global WAREHOUSES_DB, FARMER_INVENTORY_DB, STORAGE_TRANSACTIONS_DB, FARMER_NOTIFICATIONS_DB
    WAREHOUSES_DB.clear()
    WAREHOUSES_DB.extend([dict(w) for w in DEFAULT_WAREHOUSES])
    FARMER_INVENTORY_DB.clear()
    STORAGE_TRANSACTIONS_DB.clear()
    FARMER_NOTIFICATIONS_DB.clear()
    return {
        "status": "success",
        "message": "Database renewed successfully! All inventories, transactions, and notifications reset (Login credentials preserved)."
    }


