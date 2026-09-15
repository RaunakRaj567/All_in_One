"""
===============================================================================
FASTAPI ROUTER — ROUTE OPTIMIZATION & MASTER ORCHESTRATION API
===============================================================================
File Path: backend/api/routes.py
===============================================================================
"""

from fastapi import APIRouter, HTTPException
from backend.schemas.routing import (
    RouteOptimizeRequest, RoutingResponse,
    MasterOptimizeRequest, MasterOptimizeResponse
)
from backend.services.routing_service import run_routing_service
from backend.services.allocation_service import run_allocation_service

router = APIRouter(tags=["Route Optimization & Orchestration"])


@router.post("/api/optimize-route", response_model=RoutingResponse)
def optimize_vehicle_routes(req: RouteOptimizeRequest):
    """
    Solves CVRP vehicle routing for given market allocations.
    """
    try:
        res = run_routing_service(
            allocations_map=req.allocations,
            vehicle_capacities=req.vehicle_capacities
        )
        return RoutingResponse(**res)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing error: {str(e)}")


@router.post("/api/optimize", response_model=MasterOptimizeResponse)
def master_optimize(req: MasterOptimizeRequest):
    """
    Master end-to-end orchestration endpoint:
    Forecast -> Allocation -> Farmer Overrides -> CVRP -> OSRM Road Geometry -> Response.
    """
    try:
        # 1. Solve Crop Allocation
        alloc_res = run_allocation_service(
            crop=req.crop,
            date=req.date,
            available_quantity_kg=req.available_quantity_kg,
            price_adjustment_percent=req.price_adjustment_percent,
            coverage_mode=req.coverage_mode,
            farmer_minimums=req.farmer_minimums
        )

        # 2. Use LP Solver's optimal allocation map for available supply (Delhi depot = 0.0 delivery demand)
        alloc_map = {m["location"]: (0.0 if m["location"] == "Delhi" else m["allocated_kg"]) for m in alloc_res["markets"]}
        alloc_map["Delhi"] = 0.0
        
        if req.overrides:
            clean_overrides = {loc: max(0.0, float(v)) for loc, v in req.overrides.items() if loc != "Delhi"}
            override_sum = sum(clean_overrides.values())
            if override_sum > 0:
                if req.available_quantity_kg >= override_sum:
                    # Supply >= Market Demand: Cargo delivered = 100% Market Demand (override_sum)
                    for loc, manual_qty in clean_overrides.items():
                        alloc_map[loc] = manual_qty
                else:
                    # Supply < Market Demand: Scale down proportionally to match available supply
                    scale = req.available_quantity_kg / override_sum
                    for loc, manual_qty in clean_overrides.items():
                        alloc_map[loc] = round(manual_qty * scale, 2)

        # 3. Solve CVRP Routing & Geometry using all fleet vehicles as needed
        routing_res = run_routing_service(
            allocations_map=alloc_map,
            vehicle_capacities=req.vehicle_capacities
        )

        # 4. Final Financial Summary Calculation (Standard economic rates: ₹25,000/ton cost & ₹60/km transport rate)
        cost_per_truck_km = 60.0
        cost_per_ton = 25000.0
        total_delivered_kg = routing_res["routing_summary"]["total_load_kg"]
        actual_transport_cost = round(routing_res["routing_summary"]["total_distance_km"] * cost_per_truck_km, 2)
        
        # Calculate revenue for actually delivered cargo across markets
        price_lookup = {m["location"]: m.get("final_price_per_kg", m.get("predicted_price_per_kg", 50.0)) for m in alloc_res["markets"]}
        expected_revenue = round(sum(alloc_map.get(loc, 0.0) * price_lookup.get(loc, 50.0) for loc in alloc_map), 2)
        cost_of_goods = round((total_delivered_kg / 1000.0) * cost_per_ton, 2)
        final_profit = max(0.0, round(expected_revenue - actual_transport_cost - cost_of_goods, 2))
        final_margin = round((final_profit / expected_revenue * 100.0), 2) if expected_revenue > 0 else 0.0

        profit_summary = {
            "expected_revenue": expected_revenue,
            "cost_of_goods": cost_of_goods,
            "estimated_logistics_cost": actual_transport_cost,
            "expected_net_profit": final_profit,
            "expected_margin_percent": final_margin
        }

        return MasterOptimizeResponse(
            crop=req.crop,
            date=req.date,
            supply=alloc_res["supply"],
            markets=alloc_res["markets"],
            profit_summary=profit_summary,
            routing_summary=routing_res["routing_summary"],
            routes=routing_res["routes"],
            explainability_summary=alloc_res["explainability_summary"]
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Master optimization error: {str(e)}")
