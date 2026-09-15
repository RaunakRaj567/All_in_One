/**
 * Centralized Route & Supply Chain API Service.
 * Connects to FastAPI backend running on port 8001 or 8000.
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
    // Try fallback ports (8001 -> 8000 -> localhost)
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
        // continue trying
      }
    }
    throw err;
  }
}

export async function fetchHealth() {
  return await safeApiFetch('/health');
}

export async function getLocations() {
  return await safeApiFetch('/api/locations');
}

export async function getForecast(crop, date) {
  return await safeApiFetch('/api/forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crop, date }),
  });
}

export async function allocateCrop(payload) {
  return await safeApiFetch('/api/allocate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function optimizeRoutes(crop, allocations, vehicleCapacities = null) {
  const payload = { crop, allocations };
  if (vehicleCapacities) payload.vehicle_capacities = vehicleCapacities;

  return await safeApiFetch('/api/optimize-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function masterOptimize(payload) {
  return await safeApiFetch('/api/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
