// frontend/src/components/routes/MapView.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Distinct color palette for up to 10+ vehicle routes
export const ROUTE_COLORS = {
  1: '#2563eb', // Truck 1: Royal Blue
  2: '#7c3aed', // Truck 2: Purple / Violet
  3: '#059669', // Truck 3: Emerald Green
  4: '#ea580c', // Truck 4: Bright Orange
  5: '#e11d48', // Truck 5: Crimson Red
  6: '#0891b2', // Truck 6: Cyan
  7: '#d97706', // Truck 7: Amber Gold
  8: '#4f46e5', // Truck 8: Indigo
  9: '#db2777', // Truck 9: Pink Magenta
  10: '#0d9488',// Truck 10: Dark Teal
};

export function getVehicleColor(vehicleId) {
  return ROUTE_COLORS[vehicleId] || ROUTE_COLORS[((vehicleId - 1) % 10) + 1] || '#2563eb';
}

/**
 * Extracts waypoint coordinates [[lat, lon], ...] matching route_names or route_nodes in exact stop order
 */
function getWaypointsForRoute(route, locations) {
  if (!route || !locations || locations.length === 0) return [];

  // Priority 1: Match by route_names in exact stop sequence
  if (route.route_names && route.route_names.length > 0) {
    const coords = route.route_names
      .map((name) => {
        const found = locations.find((l) => l.name.toLowerCase().trim() === name.toLowerCase().trim());
        return found ? [found.latitude, found.longitude] : null;
      })
      .filter(Boolean);
    if (coords.length >= 2) return coords;
  }

  // Priority 2: Match by route_nodes (location ID or index)
  if (route.route_nodes && route.route_nodes.length > 0) {
    const coords = route.route_nodes
      .map((nodeId) => {
        const found = locations.find((l) => l.id === nodeId) || locations[nodeId];
        return found ? [found.latitude, found.longitude] : null;
      })
      .filter(Boolean);
    if (coords.length >= 2) return coords;
  }

  return [];
}

/**
 * Fetches turn-by-turn real road geometry from OSRM for a list of waypoints [[lat, lon], ...]
 */
async function fetchOSRMRealRoadPath(waypoints) {
  if (!waypoints || waypoints.length < 2) return null;
  const coordStr = waypoints.map(([lat, lon]) => `${lon},${lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      return data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    }
  } catch (err) {
    console.warn('OSRM road geometry fetch failed:', err);
  }
  return null;
}

function MapBoundsUpdater({ locations, routes, activeVehicleId, roadGeometries }) {
  const map = useMap();

  useEffect(() => {
    if (!locations || locations.length === 0) return;

    if (activeVehicleId && routes && routes.length > 0) {
      const geom = roadGeometries[activeVehicleId];
      if (geom && geom.length > 0) {
        map.fitBounds(L.latLngBounds(geom), { padding: [50, 50] });
        return;
      }
      const activeRoute = routes.find((r) => r.vehicle_id === activeVehicleId);
      if (activeRoute) {
        const waypoints = getWaypointsForRoute(activeRoute, locations);
        if (waypoints.length > 0) {
          map.fitBounds(L.latLngBounds(waypoints), { padding: [50, 50] });
          return;
        }
      }
    }

    const bounds = L.latLngBounds(locations.map((loc) => [loc.latitude, loc.longitude]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [locations, routes, activeVehicleId, roadGeometries, map]);

  return null;
}

export default function MapView({
  locations = [],
  demands = {},
  routes = [],
  selectedVehicleId = null,
  onSelectVehicle = () => {},
}) {
  const defaultCenter = [28.6139, 77.2090];
  const [roadGeometries, setRoadGeometries] = useState({});
  const [allowScrollZoom, setAllowScrollZoom] = useState(false);

  useEffect(() => {
    if (!routes || routes.length === 0 || !locations || locations.length === 0) {
      setRoadGeometries({});
      return;
    }

    let isMounted = true;

    async function loadAllRoadGeometries() {
      const newGeomMap = {};

      // Step 1: Immediately populate roadGeometries with backend GeoJSON or waypoints
      for (const route of routes) {
        const waypoints = getWaypointsForRoute(route, locations);
        if (waypoints.length < 2) continue;

        const coords = route.geojson?.coordinates;
        if (Array.isArray(coords) && coords.length >= 2) {
          // Normalize coordinates: GeoJSON is [lon, lat], Leaflet Polyline needs [lat, lon]
          newGeomMap[route.vehicle_id] = coords.map(([a, b]) => {
            if (a > 50) return [b, a]; // a is lon (~77), b is lat (~28)
            return [a, b];
          });
        } else {
          newGeomMap[route.vehicle_id] = waypoints;
        }
      }

      if (isMounted) {
        setRoadGeometries(newGeomMap);
      }

      // Step 2: Background fetch for any route missing detailed OSRM road geometry
      for (const route of routes) {
        const coords = route.geojson?.coordinates;
        if (!Array.isArray(coords) || coords.length < 5) {
          const waypoints = getWaypointsForRoute(route, locations);
          if (waypoints.length >= 2) {
            try {
              const realRoadPath = await fetchOSRMRealRoadPath(waypoints);
              if (realRoadPath && realRoadPath.length > 0 && isMounted) {
                setRoadGeometries((prev) => ({
                  ...prev,
                  [route.vehicle_id]: realRoadPath,
                }));
              }
            } catch (e) {
              // Ignore background fetch warning
            }
          }
        }
      }
    }

    loadAllRoadGeometries();

    return () => {
      isMounted = false;
    };
  }, [routes, locations]);

  const createCustomIcon = (isDepot, demandKg) => {
    if (isDepot) {
      return L.divIcon({
        className: 'custom-pin',
        html: `
          <div style="background-color: #dc2626; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4); font-size: 18px;">
            🏬
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
    }

    const hasDemand = demandKg > 0;
    const bgColor = hasDemand ? '#16a34a' : '#94a3b8';
    const text = hasDemand ? `${(demandKg / 1000).toFixed(1)}t` : '0';

    return L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="background-color: ${bgColor}; color: white; padding: 2px 7px; border-radius: 12px; font-weight: 800; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); font-size: 11px; white-space: nowrap;">
          ${text}
        </div>
      `,
      iconSize: [42, 22],
      iconAnchor: [21, 11],
    });
  };

  // Create numbered stop order badges when a route is selected
  const createStopOrderIcon = (stopNumber, color) => {
    return L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="background-color: ${color}; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); font-size: 11px;">
          ${stopNumber}
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  };

  // Sort routes so selected route renders LAST (on top layer)
  const sortedRoutes = [...(routes || [])].sort((a, b) => {
    if (a.vehicle_id === selectedVehicleId) return 1;
    if (b.vehicle_id === selectedVehicleId) return -1;
    return 0;
  });

  const selectedRouteObj = (routes || []).find((r) => r.vehicle_id === selectedVehicleId);
  const selectedStopNames = selectedRouteObj?.route_names || [];

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '450px', position: 'relative', touchAction: 'pan-y', isolation: 'isolate', zIndex: 0 }}>
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={allowScrollZoom}
        style={{ width: '100%', height: '100%', minHeight: '450px', borderRadius: 'var(--radius-md)', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater
          locations={locations}
          routes={routes}
          activeVehicleId={selectedVehicleId}
          roadGeometries={roadGeometries}
        />

        {/* Location Markers */}
        {locations.map((loc) => {
          const demandKg = demands[loc.name] || 0;
          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createCustomIcon(loc.is_depot, demandKg)}
            >
              <Popup>
                <div style={{ padding: '4px 2px', fontFamily: 'sans-serif' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>
                    {loc.name} {loc.is_depot ? '🏬 (Central Depot)' : '🌾'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                    Latitude: {loc.latitude.toFixed(4)} <br />
                    Longitude: {loc.longitude.toFixed(4)} <br />
                    {!loc.is_depot && (
                      <span style={{ fontWeight: 'bold', color: demandKg > 0 ? '#16a34a' : '#64748b' }}>
                        Demand: {demandKg.toLocaleString()} kg ({(demandKg / 1000).toFixed(1)}t)
                      </span>
                    )}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Numbered Stop Sequence Badges when a vehicle is selected */}
        {selectedRouteObj &&
          selectedStopNames.map((stopName, idx) => {
            const loc = locations.find((l) => l.name.toLowerCase().trim() === stopName.toLowerCase().trim());
            if (!loc) return null;
            const color = getVehicleColor(selectedRouteObj.vehicle_id);

            return (
              <Marker
                key={`stop-${idx}-${stopName}`}
                position={[loc.latitude, loc.longitude]}
                icon={createStopOrderIcon(idx + 1, color)}
                zIndexOffset={1000}
              >
                <Tooltip permanent direction="top" offset={[0, -12]}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    Stop {idx + 1}: {stopName}
                  </span>
                </Tooltip>
              </Marker>
            );
          })}

        {/* Real Road Geometry Polylines (OSRM Turn-by-Turn Road Paths) */}
        {sortedRoutes.map((route) => {
          const isSelected = selectedVehicleId === route.vehicle_id;
          const color = getVehicleColor(route.vehicle_id);

          const polylinePositions =
            roadGeometries[route.vehicle_id] || getWaypointsForRoute(route, locations);

          if (!polylinePositions || polylinePositions.length === 0) return null;

          return (
            <Polyline
              key={route.vehicle_id}
              positions={polylinePositions}
              pathOptions={{
                color: color,
                weight: isSelected ? 8 : 4,
                opacity: isSelected ? 1.0 : selectedVehicleId ? 0.25 : 0.8,
              }}
              eventHandlers={{
                click: () => onSelectVehicle(isSelected ? null : route.vehicle_id),
              }}
            >
              <Tooltip sticky>
                <div>
                  <strong>Truck {route.vehicle_id} Schedule</strong> <br />
                  Stops: {route.route_names ? route.route_names.join(' → ') : 'Delhi-NCR'} <br />
                  Distance: {route.distance_km} km <br />
                  Time: {Math.round(route.duration_minutes)} mins <br />
                  Load: {route.load_kg.toLocaleString()} kg ({route.utilization_percent}%)
                </div>
              </Tooltip>
            </Polyline>
          );
        })}
      </MapContainer>

      {/* Floating Route Map Legend & Scroll Protection Control Overlay */}
      <div className="absolute bottom-4 right-4 z-10 bg-field-surface/95 backdrop-blur-sm p-3 rounded-sm border-2 border-loam shadow-sharp font-mono text-xs space-y-2 max-w-[210px] pointer-events-auto">
        <div className="flex items-center justify-between border-b border-loam/30 pb-1 text-[11px] font-serif font-extrabold text-loam">
          <span className="flex items-center gap-1">🗺️ Map Legend</span>
          <button
            type="button"
            onClick={() => setAllowScrollZoom(!allowScrollZoom)}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition ${
              allowScrollZoom
                ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                : 'bg-field-surface border-loam/40 text-loam-muted hover:text-loam'
            }`}
            title={allowScrollZoom ? 'Click to disable map scroll zoom' : 'Click to enable map scroll zoom'}
          >
            {allowScrollZoom ? 'Zoom: ON' : 'Zoom: OFF'}
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shrink-0 flex items-center justify-center text-[8px] text-white font-bold">🏬</span>
          <span className="font-bold text-loam">Delhi Central Depot</span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white shrink-0 flex items-center justify-center text-[8px] text-white font-bold">🌾</span>
          <span className="font-bold text-loam">Delivery Market Hub</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] pt-1 border-t border-loam/20">
          <span className="w-4 h-1 bg-blue-600 rounded shrink-0"></span>
          <span className="text-[10px] text-loam-muted">OSRM Road Geometry</span>
        </div>
      </div>
    </div>
  );
}
