"""
===============================================================================
BACKEND DATA MODULE — WAREHOUSE DATABASE RECORDS & COMPATIBILITY
===============================================================================
File Path: backend/data/warehouse_data.py
===============================================================================
"""

from typing import List, Dict, Any

DEFAULT_WAREHOUSES: List[Dict[str, Any]] = [
    {
        "warehouse_id": "W001",
        "name": "Agri-Mitra Central Warehouse & Cold Vault",
        "address": "Nyaya Marg, Near USA Embassy, Chanakyapuri, New Delhi 110021",
        "latitude": 28.596333,
        "longitude": 77.186472,
        "dms_coordinates": "28°35'46.8\"N 77°11'11.3\"E",
        "total_capacity_kg": 500000.0,      # 500 tons
        "available_capacity_kg": 500000.0,  # 500 tons (100% available for real deposits)
        "storage_type": "Cold Storage & Grain Vault",
        "storage_cost_per_ton_per_day": 15.0, # ₹15.00 / ton / day
        "handling_fee": 100.0,
        "loading_fee": 50.0,
        "unloading_fee": 50.0,
        "supported_crops": ["Onion", "Wheat", "Rice", "Maize"],
        "max_storage_days": {"Onion": 90, "Wheat": 180, "Rice": 180, "Maize": 120},
        "status": "OPERATIONAL"
    },
    {
        "warehouse_id": "W002",
        "name": "Noida Agro Silo & Dry Depot",
        "address": "Sector 80 Industrial Area, Noida, UP 201305",
        "latitude": 28.5355,
        "longitude": 77.3910,
        "total_capacity_kg": 400000.0,      # 400 tons
        "available_capacity_kg": 280000.0,  # 280 tons
        "storage_type": "Silo",
        "storage_cost_per_ton_per_day": 400.0, # ₹400 / ton / day
        "handling_fee": 80.0,
        "loading_fee": 40.0,
        "unloading_fee": 40.0,
        "supported_crops": ["Wheat", "Rice", "Maize", "Onion"],
        "max_storage_days": {"Onion": 60, "Wheat": 210, "Rice": 210, "Maize": 150},
        "status": "OPERATIONAL"
    },
    {
        "warehouse_id": "W003",
        "name": "Ghaziabad Controlled Atmosphere Hub",
        "address": "Loni Industrial Zone, Ghaziabad, UP 201102",
        "latitude": 28.6692,
        "longitude": 77.4538,
        "total_capacity_kg": 600000.0,      # 600 tons
        "available_capacity_kg": 420000.0,  # 420 tons
        "storage_type": "Controlled Atmosphere",
        "storage_cost_per_ton_per_day": 650.0, # ₹650 / ton / day
        "handling_fee": 120.0,
        "loading_fee": 60.0,
        "unloading_fee": 60.0,
        "supported_crops": ["Onion", "Wheat", "Rice", "Maize"],
        "max_storage_days": {"Onion": 120, "Wheat": 240, "Rice": 240, "Maize": 180},
        "status": "OPERATIONAL"
    },
    {
        "warehouse_id": "W004",
        "name": "Gurugram Smart Granary & Logistics Park",
        "address": "Kadipur Industrial Area, Gurugram, HR 122001",
        "latitude": 28.4595,
        "longitude": 77.0266,
        "total_capacity_kg": 350000.0,      # 350 tons
        "available_capacity_kg": 210000.0,  # 210 tons
        "storage_type": "Dry Granary",
        "storage_cost_per_ton_per_day": 450.0, # ₹450 / ton / day
        "handling_fee": 90.0,
        "loading_fee": 45.0,
        "unloading_fee": 45.0,
        "supported_crops": ["Wheat", "Rice", "Maize"],
        "max_storage_days": {"Wheat": 180, "Rice": 180, "Maize": 120},
        "status": "OPERATIONAL"
    },
    {
        "warehouse_id": "W005",
        "name": "Sonipat Farmers Warehouse Hub",
        "address": "Murthal Road Agri Logistics Zone, Sonipat, HR 131001",
        "latitude": 28.9931,
        "longitude": 77.0151,
        "total_capacity_kg": 450000.0,      # 450 tons
        "available_capacity_kg": 310000.0,  # 310 tons
        "storage_type": "Cold Storage",
        "storage_cost_per_ton_per_day": 550.0, # ₹550 / ton / day
        "handling_fee": 110.0,
        "loading_fee": 50.0,
        "unloading_fee": 50.0,
        "supported_crops": ["Onion", "Wheat", "Rice", "Maize"],
        "max_storage_days": {"Onion": 90, "Wheat": 180, "Rice": 180, "Maize": 150},
        "status": "OPERATIONAL"
    }
]
