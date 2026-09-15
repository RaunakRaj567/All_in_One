// frontend/src/components/OrderRouteTrackingModal.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X,
  MapPin,
  Truck,
  Warehouse,
  Clock,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Package,
  Calendar,
  DollarSign,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Sparkles,
  Check
} from 'lucide-react';

// Central Warehouse Coordinates (Nyaya Marg, Near USA Embassy, Chanakyapuri, New Delhi)
const WAREHOUSE_COORDS = [28.596333, 77.186472];
const WAREHOUSE_NAME = 'Nyaya Marg Central Vault (Near USA Embassy, New Delhi 110021)';
const WAREHOUSE_GPS_STR = '28°35\'46.8"N 77°11\'11.3"E';

// Custom Marker Icons using Leaflet divIcon
const warehouseIcon = L.divIcon({
  className: 'custom-warehouse-pin',
  html: `
    <div style="background-color: #dc2626; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.45); cursor: pointer;">
      🏬
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20]
});

const dropDestinationIcon = L.divIcon({
  className: 'custom-drop-pin',
  html: `
    <div style="background-color: #16a34a; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.45); cursor: pointer;">
      📍
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20]
});

const inTransitTruckIcon = L.divIcon({
  className: 'custom-truck-pin',
  html: `
    <div style="background-color: #f59e0b; color: #78350f; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 3px solid white; box-shadow: 0 4px 16px rgba(245,158,11,0.7); animation: pulse 1.5s infinite;">
      🚚
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22]
});

const deliveredTruckIcon = L.divIcon({
  className: 'custom-truck-delivered-pin',
  html: `
    <div style="background-color: #16a34a; color: white; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 3px solid white; box-shadow: 0 4px 16px rgba(22,163,74,0.7);">
      🚚
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22]
});

// Auto-fit bounds component inside MapContainer
function MapBoundsUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
}

export default function OrderRouteTrackingModal({
  order,
  viewerRole = 'buyer', // 'buyer' | 'driver'
  isInline = false,
  onClose = () => {},
  onUpdateStatus
}) {
  if (!order) return null;

  const dropLat = Number(order.drop_lat || order.drop_latitude || 28.6139);
  const dropLon = Number(order.drop_lon || order.drop_longitude || 77.2090);
  const destinationCoords = [dropLat, dropLon];

  const [roadGeometry, setRoadGeometry] = useState([]);
  const [loadingRoad, setLoadingRoad] = useState(true);
  const [roadDistanceKm, setRoadDistanceKm] = useState(order.distance_km || 15.0);
  const [estimatedMins, setEstimatedMins] = useState(order.est_mins || order.estimated_delivery_mins || 30);

  // Animated truck state
  const [truckStep, setTruckStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animSpeedMs, setAnimSpeedMs] = useState(120); // ms per coordinate step
  const [deliveredAlertShow, setDeliveredAlertShow] = useState(order.status === 'DELIVERED');

  const isDelivered = order.status === 'DELIVERED';
  const isInTransit = order.status === 'IN_TRANSIT';

  // Fetch optimal turn-by-turn road geometry from OSRM driving API
  useEffect(() => {
    let isMounted = true;
    setLoadingRoad(true);

    async function fetchOptimalRoadRoute() {
      const origLon = 77.186472;
      const origLat = 28.596333;
      const destLon = dropLon;
      const destLat = dropLat;

      const url = `https://router.project-osrm.org/route/v1/driving/${origLon},${origLat};${destLon},${destLat}?overview=full&geometries=geojson`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
        const data = await res.json();

        if (data.code === 'Ok' && data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
          const distKm = Number((data.routes[0].distance / 1000).toFixed(1));
          const durationM = Math.max(12, Math.round(data.routes[0].duration / 60));

          if (isMounted) {
            setRoadGeometry(coords);
            setRoadDistanceKm(distKm);
            setEstimatedMins(durationM);
            setLoadingRoad(false);

            if (order.status === 'DELIVERED') {
              setTruckStep(coords.length - 1);
            }
          }
          return;
        }
      } catch (err) {
        console.warn('OSRM live routing fallback to direct corridor:', err);
      }

      // Fallback if network or OSRM unavailable
      if (isMounted) {
        const directPath = [
          WAREHOUSE_COORDS,
          [(WAREHOUSE_COORDS[0] + destLat) / 2, (WAREHOUSE_COORDS[1] + destLon) / 2],
          destinationCoords
        ];
        setRoadGeometry(directPath);
        setLoadingRoad(false);
        if (order.status === 'DELIVERED') {
          setTruckStep(directPath.length - 1);
        }
      }
    }

    fetchOptimalRoadRoute();

    return () => {
      isMounted = false;
    };
  }, [dropLat, dropLon, order.status]);

  // Execute delivery completion triggers across Buyer, Driver and Farmer
  const triggerDeliveryCompletion = () => {
    const orderId = order.order_id;
    setDeliveredAlertShow(true);

    // 1. Call status handler callback if provided
    if (onUpdateStatus) {
      onUpdateStatus(orderId, 'DELIVERED');
    }

    // 2. Persist updated status in localStorage for buyer & driver sync
    try {
      const saved = JSON.parse(localStorage.getItem('agrimitra_dispatch_orders') || '[]');
      const updated = saved.map((o) => {
        if (o.order_id === orderId) {
          return { ...o, status: 'DELIVERED', delivered_at: new Date().toISOString() };
        }
        return o;
      });
      localStorage.setItem('agrimitra_dispatch_orders', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving delivered dispatch status:', e);
    }
  };

  // Load saved truck animation step from localStorage for cross-driver synchronization
  useEffect(() => {
    if (!order?.order_id) return;
    try {
      const savedStep = localStorage.getItem(`agrimitra_truck_step_${order.order_id}`);
      if (savedStep !== null) {
        const stepNum = parseInt(savedStep, 10);
        if (!isNaN(stepNum) && stepNum >= 0) {
          setTruckStep(stepNum);
        }
      }
    } catch (e) {
      console.error('Error loading saved truck step:', e);
    }
  }, [order?.order_id]);

  // Save truck animation step to localStorage on each step tick so all drivers see identical movement
  useEffect(() => {
    if (!order?.order_id) return;
    try {
      localStorage.setItem(`agrimitra_truck_step_${order.order_id}`, truckStep.toString());
    } catch (e) {
      console.error('Error saving truck step:', e);
    }
  }, [truckStep, order?.order_id]);

  // Auto-start animation for EVERY driver when map is viewed or status is IN_TRANSIT/DISPATCHED
  useEffect(() => {
    if (order?.status !== 'DELIVERED') {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [order?.status, order?.order_id]);

  // Live animation timer loop
  useEffect(() => {
    if (!isAnimating || roadGeometry.length < 2) return;

    const timer = setInterval(() => {
      setTruckStep((prev) => {
        if (prev >= roadGeometry.length - 1) {
          setIsAnimating(false);
          triggerDeliveryCompletion();
          return roadGeometry.length - 1;
        }
        return prev + 1;
      });
    }, animSpeedMs);

    return () => clearInterval(timer);
  }, [isAnimating, roadGeometry, animSpeedMs]);

  const handleStartAnimation = () => {
    if (order.status !== 'IN_TRANSIT' && onUpdateStatus) {
      onUpdateStatus(order.order_id, 'IN_TRANSIT');
    }
    if (truckStep >= roadGeometry.length - 1) {
      setTruckStep(0);
    }
    setIsAnimating(true);
  };

  const handlePauseAnimation = () => {
    setIsAnimating(false);
  };

  const handleResetAnimation = () => {
    setIsAnimating(false);
    setTruckStep(0);
  };

  const handleForceDelivered = () => {
    setIsAnimating(false);
    if (roadGeometry.length > 0) {
      setTruckStep(roadGeometry.length - 1);
    }
    triggerDeliveryCompletion();
  };

  const mapBounds = roadGeometry.length > 0 ? roadGeometry : [WAREHOUSE_COORDS, destinationCoords];

  const currentTruckCoords =
    isDelivered || truckStep >= roadGeometry.length - 1
      ? destinationCoords
      : roadGeometry[truckStep] || WAREHOUSE_COORDS;

  const transitProgress =
    roadGeometry.length > 1
      ? Math.min(100, Math.round((truckStep / (roadGeometry.length - 1)) * 100))
      : isDelivered
      ? 100
      : 0;

  const content = (
    <div className={`bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-6 shadow-sharp space-y-4 font-mono text-loam ${isInline ? 'w-full' : 'max-w-5xl w-full my-auto relative'}`}>
      
      {/* ── MODAL / INLINE HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-loam pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-sprout border-2 border-loam rounded-sm flex items-center justify-center text-field-bg font-extrabold text-2xl shadow-sharp-sm">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-loam">
                {viewerRole === 'buyer' ? 'Live Order Route Tracking' : 'Delivery Drop Location & Highway Route'}
              </h3>
              <span className="bg-loam text-field-bg text-xs px-2.5 py-0.5 rounded-sm font-extrabold">
                #{order.order_id}
              </span>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase font-mono">
                🟢 Live Synced (Buyer + Driver + Farmer)
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                isDelivered || transitProgress === 100
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                  : isAnimating || isInTransit
                  ? 'bg-amber-100 text-amber-950 border-amber-400 animate-pulse'
                  : 'bg-blue-100 text-blue-950 border-blue-400'
              }`}>
                {isDelivered || transitProgress === 100 ? '🟢 DELIVERED' : isAnimating || isInTransit ? '🚛 IN TRANSIT ON ROAD' : '🟡 DISPATCH READY'}
              </span>
            </div>
            <p className="text-xs text-loam-muted mt-0.5">
              {order.crop} Cargo ({order.quantity_ton || (order.quantity_kg ? (order.quantity_kg / 1000).toFixed(1) : 1)} Tons) • Buyer: <strong>{order.buyer_name}</strong>
            </p>
          </div>
        </div>

        {!isInline && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-loam/10 rounded border-2 border-loam/40 transition active:translate-y-0.5"
            title="Close Route Map"
          >
            <X className="w-5 h-5 text-loam" />
          </button>
        )}
      </div>

      {/* ── DELIVERED CELEBRATION BANNER ── */}
      {(isDelivered || deliveredAlertShow || transitProgress === 100) && (
        <div className="p-3 bg-emerald-100 border-2 border-emerald-500 rounded-sm text-xs font-bold text-emerald-950 flex items-center justify-between gap-2 shadow-sharp-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>
              <strong>🎉 ORDER DELIVERED & SETTLED!</strong> Freight truck reached destination drop dock ({order.drop_location_name}). Marked as DELIVERED across Buyer, Driver, and Farmer portals!
            </span>
          </div>
          <span className="bg-emerald-700 text-white font-mono text-[10px] px-2 py-0.5 rounded uppercase font-black shrink-0">
            SYNCED ALL ENDS
          </span>
        </div>
      )}

      {/* ── KEY METRICS STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        
        <div className="p-2.5 bg-field-bg border-2 border-loam/30 rounded-sm space-y-0.5">
          <span className="text-[10px] text-loam-muted font-bold uppercase block flex items-center gap-1">
            <Navigation className="w-3 h-3 text-sprout" />
            Optimal Road Distance:
          </span>
          <p className="text-base font-extrabold text-loam">
            {roadDistanceKm} <span className="text-xs font-bold text-loam-muted">km</span>
          </p>
          <span className="text-[10px] text-sprout font-bold block">Via OSRM Road Router</span>
        </div>

        <div className="p-2.5 bg-field-bg border-2 border-loam/30 rounded-sm space-y-0.5">
          <span className="text-[10px] text-loam-muted font-bold uppercase block flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" />
            Estimated Driving Time:
          </span>
          <p className="text-base font-extrabold text-amber-800">
            ~{estimatedMins} <span className="text-xs font-bold text-loam-muted">mins</span>
          </p>
          <span className="text-[10px] text-amber-900 font-bold block">Real Highway Transit</span>
        </div>

        <div className="p-2.5 bg-field-bg border-2 border-loam/30 rounded-sm space-y-0.5">
          <span className="text-[10px] text-loam-muted font-bold uppercase block flex items-center gap-1">
            <Truck className="w-3 h-3 text-sprout" />
            Appointed Carrier:
          </span>
          <p className="text-xs font-extrabold text-loam truncate">
            {order.assigned_driver_name || order.assigned_partner_id || 'Harpreet Saini'}
          </p>
          <span className="text-[10px] text-sprout font-bold font-mono truncate block">
            {order.assigned_driver_vehicle || 'DL-01-AX-9921'} ({order.assigned_partner_id || 'D001'})
          </span>
        </div>

        <div className="p-2.5 bg-emerald-50 border-2 border-emerald-400 rounded-sm space-y-0.5">
          <span className="text-[10px] text-emerald-900 font-bold uppercase block">Freight Cost (@ ₹60/km):</span>
          <p className="text-base font-extrabold text-emerald-950">
            ₹{(order.freight_fee || Math.round(roadDistanceKm * 60)).toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-800 font-bold block">Direct Warehouse Dispatch</span>
        </div>

      </div>

      {/* ── LIVE TRUCK ROUTE MOVEMENT ANIMATION CONTROLS ── */}
      <div className="bg-field-bg border-2 border-loam p-3 rounded-sm space-y-2.5 shadow-sharp-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-loam uppercase flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-sprout" />
              Live Route Movement:
            </span>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
              {transitProgress}% Completed
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {!isAnimating ? (
              <button
                type="button"
                onClick={handleStartAnimation}
                disabled={isDelivered && transitProgress === 100}
                className="py-1.5 px-3 bg-sprout hover:bg-sprout-hover text-field-bg disabled:opacity-50 rounded text-xs font-mono font-extrabold border border-loam flex items-center gap-1.5 transition active:translate-y-0.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{transitProgress > 0 && transitProgress < 100 ? 'Resume Movement 🚚' : 'Start Truck Movement 🚚'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseAnimation}
                className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-mono font-extrabold border border-loam flex items-center gap-1.5 transition active:translate-y-0.5 shadow-sm"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Movement</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetAnimation}
              className="py-1.5 px-2.5 bg-field-surface hover:bg-loam/10 text-loam rounded text-xs font-mono font-bold border border-loam/40 flex items-center gap-1 transition"
              title="Reset truck to Nyaya Marg Central Vault"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setAnimSpeedMs(animSpeedMs === 120 ? 50 : 120)}
              className="py-1.5 px-2 bg-field-surface hover:bg-loam/10 text-loam rounded text-xs font-mono font-bold border border-loam/40 flex items-center gap-1 transition"
              title="Toggle speed"
            >
              <Zap className={`w-3.5 h-3.5 ${animSpeedMs === 50 ? 'text-amber-600 fill-amber-600' : 'text-loam-muted'}`} />
              <span>{animSpeedMs === 50 ? '2x Fast' : '1x Speed'}</span>
            </button>

            {!isDelivered && (
              <button
                type="button"
                onClick={handleForceDelivered}
                className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-mono font-extrabold border border-emerald-900 flex items-center gap-1 transition active:translate-y-0.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Delivered Now ✅</span>
              </button>
            )}
          </div>

        </div>

        {/* Transit Dynamic Progress Bar */}
        <div className="w-full bg-field-surface border border-loam/40 rounded-full h-2.5 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              isDelivered || transitProgress === 100
                ? 'bg-emerald-600'
                : 'bg-gradient-to-r from-amber-500 to-sprout'
            }`}
            style={{ width: `${transitProgress}%` }}
          />
        </div>
      </div>

      {/* ── LEAFLET MAP VIEW WITH ROAD PATH HIGHLIGHTING & MOVING TRUCK ── */}
      <div className="relative border-2 border-loam rounded-sm overflow-hidden shadow-inner bg-field-bg" style={{ height: '420px' }}>
        
        {loadingRoad && (
          <div className="absolute top-3 right-3 z-[400] bg-field-surface/90 border border-loam px-3 py-1 rounded text-xs font-bold text-loam flex items-center gap-2 shadow-md">
            <span className="w-2 h-2 rounded-full bg-sprout animate-ping" />
            <span>Calculating Optimal Highway Geometry...</span>
          </div>
        )}

        {/* Floating Map Legend */}
        <div className="absolute top-3 left-3 z-[400] bg-field-surface/95 border-2 border-loam p-2 rounded-sm text-[11px] font-bold text-loam space-y-1 shadow-sharp-sm hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span>🏬</span>
            <span>Warehouse Origin (Nyaya Marg Vault)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>📍</span>
            <span>Drop Location ({order.drop_location_name?.slice(0, 24)}...)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1.5 bg-blue-600 rounded inline-block" />
            <span>Optimized Highway Path</span>
          </div>
        </div>

        <MapContainer
          center={WAREHOUSE_COORDS}
          zoom={10}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBoundsUpdater bounds={mapBounds} />

          {/* Road Polyline Casing (Dark Blue Outer Halo) */}
          {roadGeometry.length >= 2 && (
            <Polyline
              positions={roadGeometry}
              pathOptions={{
                color: '#1e3a8a',
                weight: 8,
                opacity: 0.5,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          )}

          {/* Road Polyline Foreground (Vibrant Royal Blue Highlighted Road) */}
          {roadGeometry.length >= 2 && (
            <Polyline
              positions={roadGeometry}
              pathOptions={{
                color: '#2563eb',
                weight: 5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            >
              <Tooltip sticky>
                <div className="font-mono text-xs">
                  <strong>Optimal Highway Route</strong>
                  <br />
                  Distance: {roadDistanceKm} km • Driving Time: ~{estimatedMins} mins
                </div>
              </Tooltip>
            </Polyline>
          )}

          {/* 🏬 Origin Marker: Nyaya Marg Central Vault */}
          <Marker position={WAREHOUSE_COORDS} icon={warehouseIcon}>
            <Popup>
              <div className="font-mono text-xs space-y-1">
                <div className="font-serif font-extrabold text-sm text-red-700 flex items-center gap-1">
                  <span>🏬</span> Warehouse Dispatch Origin
                </div>
                <strong className="text-loam">{WAREHOUSE_NAME}</strong>
                <div className="text-[10px] text-loam-muted">GPS: {WAREHOUSE_GPS_STR}</div>
                <div className="text-[10px] text-sprout font-bold">Central produce vault where cargo was loaded</div>
              </div>
            </Popup>
          </Marker>

          {/* 📍 Destination Marker: Buyer Drop Location */}
          <Marker position={destinationCoords} icon={dropDestinationIcon}>
            <Popup>
              <div className="font-mono text-xs space-y-1">
                <div className="font-serif font-extrabold text-sm text-emerald-700 flex items-center gap-1">
                  <span>📍</span> Buyer Drop Destination
                </div>
                <strong className="text-loam">{order.drop_location_name}</strong>
                <div className="text-[10px] text-loam-muted">
                  Lat: {dropLat}° N &nbsp;|&nbsp; Lon: {dropLon}° E
                </div>
                <div className="text-[10px] text-emerald-800 font-bold">
                  Est. Arrival: ~{estimatedMins} mins from dispatch
                </div>
              </div>
            </Popup>
          </Marker>

          {/* 🚚 LIVE ANIMATED TRUCK MARKER MOVING STEP-BY-STEP ALONG ROUTE */}
          {currentTruckCoords && (
            <Marker
              position={currentTruckCoords}
              icon={isDelivered || transitProgress === 100 ? deliveredTruckIcon : inTransitTruckIcon}
            >
              <Popup>
                <div className="font-mono text-xs space-y-1">
                  <div className="font-serif font-extrabold text-sm text-amber-800 flex items-center gap-1">
                    <span>🚚</span> {isDelivered || transitProgress === 100 ? 'Freight Carrier Arrived & Delivered' : 'Freight Carrier Live En Route'}
                  </div>
                  <div>Carrier: <strong>{order.assigned_driver_name || 'Fleet Driver'}</strong></div>
                  <div>Vehicle: <code>{order.assigned_driver_vehicle || 'DL-01-AX-9921'}</code></div>
                  <div className="text-[10px] text-amber-900 font-bold">
                    Transit Progress: {transitProgress}% Completed
                  </div>
                  <div className="text-[10px] text-loam-muted font-mono">
                    Current GPS: {currentTruckCoords[0].toFixed(4)}° N, {currentTruckCoords[1].toFixed(4)}° E
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

        </MapContainer>
      </div>

      {/* ── ORIGIN & DESTINATION WAYPOINTS EXPEDITION CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        
        {/* Origin Card */}
        <div className="p-3 bg-red-50 border-2 border-red-200 rounded-sm space-y-1">
          <span className="text-[10px] font-extrabold text-red-900 uppercase block flex items-center gap-1">
            <Warehouse className="w-3.5 h-3.5 text-red-700" />
            Warehouse Origin Dispatch (Fixed Vault):
          </span>
          <p className="font-extrabold text-loam text-xs leading-snug">
            {WAREHOUSE_NAME}
          </p>
          <div className="text-[11px] font-mono text-red-950 font-bold">
            GPS Coordinates: {WAREHOUSE_GPS_STR}
          </div>
        </div>

        {/* Drop Location Card */}
        <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-sm space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-900 uppercase block flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            Buyer Drop Location Destination:
          </span>
          <p className="font-extrabold text-emerald-950 text-xs leading-snug">
            {order.drop_location_name}
          </p>
          <div className="text-[11px] font-mono text-emerald-950 font-bold">
            GPS Coordinates: {dropLat}° N, {dropLon}° E
          </div>
        </div>

      </div>

      {/* ── ACTION FOOTER CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t-2 border-loam/20">
        
        <div className="text-xs text-loam-muted font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sprout" />
          <span>Official Agri-Mitra Smart Freight Dispatch Corridor</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {viewerRole === 'driver' && onUpdateStatus && !isDelivered && (
            <button
              type="button"
              onClick={handleForceDelivered}
              className="py-2.5 px-4 bg-sprout hover:bg-sprout-hover text-field-bg rounded-sm text-xs font-mono font-extrabold border-2 border-loam shadow-sharp flex items-center gap-2 transition active:translate-y-0.5"
            >
              <CheckCircle2 className="w-4 h-4 text-field-bg" />
              <span>Confirm Delivered at Dock ✅</span>
            </button>
          )}

          {!isInline && (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-field-bg hover:bg-loam/10 text-loam border-2 border-loam rounded-sm text-xs font-mono font-bold transition active:translate-y-0.5"
            >
              Close Map
            </button>
          )}
        </div>

      </div>

    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-loam/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-mono text-loam animate-in fade-in duration-200">
      {content}
    </div>
  );
}
