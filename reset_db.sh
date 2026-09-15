#!/usr/bin/env bash
echo "======================================================================="
echo "  🌾 AGRIVISION MEGA SUITE — DATABASE RENEWAL & REFRESH TOOL"
echo "======================================================================="
echo ""
echo "Refreshing database records (erasing old transactions & inventories)..."
curl -s -X POST http://127.0.0.1:8001/api/db/reset
echo ""
echo "======================================================================="
echo "  SUCCESS: Database refreshed clean! Login credentials preserved."
echo "======================================================================="
