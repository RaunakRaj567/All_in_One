/**
 * Centralized Smart Warehouse & Inventory API Service.
 * Connects to FastAPI backend running on port 8001 or fallback ports.
 */

const BASE_URL_8001 = 'http://127.0.0.1:8001';
const BASE_URL_8000 = 'http://127.0.0.1:8000';
const BASE_URL_LOCAL = 'http://localhost:8001';

let activeBaseUrl = import.meta.env.VITE_API_URL || BASE_URL_8001;

async function safeApiFetch(endpointPath, options = {}) {
  const primaryUrl = `${activeBaseUrl}${endpointPath}`;
  try {
    const response = await fetch(primaryUrl, options);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || `Server error: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    const fallbackPorts = [BASE_URL_8000, BASE_URL_LOCAL, BASE_URL_8001];
    for (const altBase of fallbackPorts) {
      if (altBase === activeBaseUrl) continue;
      try {
        const fallbackUrl = `${altBase}${endpointPath}`;
        const fallbackResponse = await fetch(fallbackUrl, options);
        if (fallbackResponse.ok) {
          activeBaseUrl = altBase;
          return await fallbackResponse.json();
        }
      } catch (fErr) {
        // continue
      }
    }
    throw err;
  }
}

export async function analyzeSurplus(payload) {
  return await safeApiFetch('/api/warehouse/analyze-surplus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getNearbyWarehouses(crop, surplusKg, lat = 28.61, lon = 77.20) {
  const params = new URLSearchParams({
    crop,
    surplus_kg: surplusKg,
    latitude: lat,
    longitude: lon,
  });
  return await safeApiFetch(`/api/warehouses/nearby?${params.toString()}`);
}

export async function storeProduce(payload) {
  return await safeApiFetch('/api/warehouse/store', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getFarmerInventory(farmerId = 'F001') {
  return await safeApiFetch(`/api/farmer/${farmerId}/inventory`);
}

export async function sellStoredProduce(inventoryId, sellQuantityKg) {
  return await safeApiFetch(`/api/warehouse/inventory/${inventoryId}/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sell_quantity_kg: sellQuantityKg }),
  });
}

export async function withdrawStoredProduce(inventoryId, withdrawQuantityKg) {
  return await safeApiFetch(`/api/warehouse/inventory/${inventoryId}/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ withdraw_quantity_kg: withdrawQuantityKg }),
  });
}

export async function updateSellingPriceInDb(payload) {
  return await safeApiFetch('/api/warehouse/update-sp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getFarmerStorageCost(farmerId = 'F001') {
  return await safeApiFetch(`/api/farmer/${farmerId}/storage-cost`);
}

export async function getAllWarehouseInventory() {
  return await safeApiFetch('/api/warehouse/all-inventory');
}

export async function buyWarehouseProduce(payload) {
  return await safeApiFetch('/api/warehouse/buy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getFarmerNotifications(farmerId = 'F001') {
  return await safeApiFetch(`/api/farmer/${farmerId}/notifications`);
}



