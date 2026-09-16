// frontend/src/components/BuyerPortalLanding.jsx
import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Truck,
  MapPin,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  Search,
  Tag,
  Warehouse,
  ArrowRight,
  X,
  Sparkles,
  Package,
  Navigation,
  DollarSign,
  UserCheck,
  Filter,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { useAgriContext, BUYER_ACCOUNTS, DELIVERY_PARTNER_ACCOUNTS } from '../context/AgriContext';
import { getAllWarehouseInventory, buyWarehouseProduce } from '../services/warehouseApi';
import OrderRouteTrackingModal from './OrderRouteTrackingModal';

const CROP_META = {
  Wheat: {
    emoji: '🌾',
    category: 'Food Grain',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    image: '/crops/wheat.jpg'
  },
  Rice: {
    emoji: '🍚',
    category: 'Food Grain',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    image: '/crops/rice.jpg'
  },
  Onion: {
    emoji: '🧅',
    category: 'Vegetable',
    color: 'bg-rose-100 text-rose-900 border-rose-300',
    image: '/crops/onion.jpg'
  },
  Maize: {
    emoji: '🌽',
    category: 'Coarse Grain',
    color: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    image: '/crops/maize.jpg'
  }
};

const DEFAULT_CATALOG = [];

const GEO_PRESETS = [
  { name: 'Noida Buyer Logistics Hub, UP', shortName: 'Noida Logistics Hub', lat: 28.5355, lon: 77.3910 },
  { name: 'Ghaziabad Wholesale Center, UP', shortName: 'Ghaziabad Wholesale', lat: 28.6692, lon: 77.4538 },
  { name: 'Gurugram Processing Park, HR', shortName: 'Gurugram Processing', lat: 28.4595, lon: 77.0266 },
  { name: 'Faridabad Delivery Center, HR', shortName: 'Faridabad Delivery', lat: 28.4089, lon: 77.3178 },
  { name: 'Sonipat Buyer Terminal, HR', shortName: 'Sonipat Terminal', lat: 28.9931, lon: 77.0151 },
  { name: 'Panipat Logistics Facility, HR', shortName: 'Panipat Logistics', lat: 29.3909, lon: 76.9635 },
  { name: 'Meerut Commercial Dock, UP', shortName: 'Meerut Commercial', lat: 28.9845, lon: 77.7064 },
  { name: 'Rohtak Buyer Warehouse, HR', shortName: 'Rohtak Warehouse', lat: 28.8955, lon: 76.6066 }
];

export default function BuyerPortalLanding() {
  const { currentBuyer, logoutUser } = useAgriContext();

  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropTab, setSelectedCropTab] = useState('All');
  const [selectedFarmerFilter, setSelectedFarmerFilter] = useState('All');

  // Checkout Modal State
  const [activeCheckoutItem, setActiveCheckoutItem] = useState(null);
  const [buyQtyTons, setBuyQtyTons] = useState(1.0);
  const [dropLocationName, setDropLocationName] = useState('Noida Buyer Logistics Hub, UP');
  const [dropLat, setDropLat] = useState(28.5355);
  const [dropLon, setDropLon] = useState(77.3910);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Order Confirmation Receipt Modal State
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Live Leaflet Route Tracking Modal State (For Buyer)
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [showMyOrdersModal, setShowMyOrdersModal] = useState(false);
  const [myOrdersList, setMyOrdersList] = useState([]);

  const loadMyOrders = () => {
    try {
      const saved = localStorage.getItem('agrimitra_dispatch_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const buyerFiltered = parsed.filter(
            (o) =>
              (o.buyer_name || '').includes(currentBuyer?.id) ||
              (o.buyer_name || '').toLowerCase().includes(currentBuyer?.name?.toLowerCase() || '') ||
              parsed.length <= 5
          );
          setMyOrdersList(buyerFiltered.length > 0 ? buyerFiltered : parsed);
        }
      }
    } catch (e) {
      console.error('Error loading my orders:', e);
    }
  };

  const fetchCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const items = await getAllWarehouseInventory();
      if (Array.isArray(items)) {
        setCatalog(items);
      }
    } catch (err) {
      console.warn('Marketplace fetch fallback mode:', err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleOpenCheckout = (item) => {
    setActiveCheckoutItem(item);
    const maxTons = item.quantity_ton || (item.quantity_kg / 1000) || 1.0;
    setBuyQtyTons(Math.min(1.0, maxTons));
    setDropLocationName(`${currentBuyer?.name || 'Buyer'} Processing Dock`);
    setDropLat(currentBuyer?.id === 'B002' ? 28.6692 : currentBuyer?.id === 'B003' ? 28.4595 : 28.5355);
    setDropLon(currentBuyer?.id === 'B002' ? 77.4538 : currentBuyer?.id === 'B003' ? 77.0266 : 77.3910);
  };

  const handleSelectPreset = (preset) => {
    setDropLocationName(preset.name);
    setDropLat(preset.lat);
    setDropLon(preset.lon);
  };

  // Haversine distance from Nyaya Marg Vault (28.596333, 77.186472)
  const calcDistance = (lat1, lon1, lat2, lon2) => {
    const origLat = 28.596333;
    const origLon = 77.186472;
    const R = 6371;
    const dLat = ((lat2 - origLat) * Math.PI) / 180;
    const dLon = ((lon2 - origLon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origLat * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 0.5 ? 4.5 : Math.round(d * 10) / 10;
  };

  const currentDistKm = calcDistance(28.596333, 77.186472, dropLat, dropLon);
  const currentTransportFee = Math.round(currentDistKm * 60); // ₹60/km

  const handleExecutePurchase = async () => {
    if (!activeCheckoutItem) return;
    setSubmittingOrder(true);
    try {
      const qtyKg = Math.round(buyQtyTons * 1000);
      const payload = {
        buyer_id: currentBuyer?.id || 'B001',
        inventory_id: activeCheckoutItem.inventory_id,
        purchase_quantity_kg: qtyKg,
        drop_latitude: Number(dropLat),
        drop_longitude: Number(dropLon),
        drop_location_name: dropLocationName
      };

      // 🎲 Randomly appoint 1 driver out of 5 Delivery Partners
      const randomDriver = DELIVERY_PARTNER_ACCOUNTS[Math.floor(Math.random() * DELIVERY_PARTNER_ACCOUNTS.length)];

      const res = await buyWarehouseProduce(payload);

      // Create Dispatch Order record for Delivery Partner Portal
      const newDispatchOrder = {
        order_id: res.order_id || `ORD-${Math.floor(5000 + Math.random() * 4000)}`,
        buyer_name: `${currentBuyer?.name || 'Buyer'} (${currentBuyer?.id || 'B001'})`,
        crop: activeCheckoutItem.crop,
        quantity_ton: buyQtyTons,
        quantity_kg: qtyKg,
        origin_location: 'Nyaya Marg Central Vault (Near USA Embassy, New Delhi 110021)',
        origin_coords: '28°35\'46.8"N 77°11\'11.3"E',
        drop_location_name: dropLocationName,
        drop_lat: Number(dropLat),
        drop_lon: Number(dropLon),
        distance_km: res.distance_km || currentDistKm,
        freight_fee: res.transport_cost || currentTransportFee,
        status: 'DISPATCHED',
        assigned_partner_id: randomDriver.id,
        assigned_driver_name: randomDriver.name,
        assigned_driver_company: randomDriver.company,
        assigned_driver_vehicle: randomDriver.vehicle_number,
        dispatch_time: new Date().toISOString(),
        est_mins: res.estimated_delivery_mins || Math.round(currentDistKm * 1.5) + 10
      };

      try {
        const existingDispatches = JSON.parse(localStorage.getItem('agrimitra_dispatch_orders') || '[]');
        localStorage.setItem('agrimitra_dispatch_orders', JSON.stringify([newDispatchOrder, ...existingDispatches]));

        // 🔔 Create & Store Driver Notification Alert
        const driverNotif = {
          id: `NOTIF-DRV-${Math.floor(1000 + Math.random() * 9000)}`,
          partner_id: randomDriver.id,
          order_id: newDispatchOrder.order_id,
          title: `🚨 New Freight Dispatch Assigned!`,
          message: `Order #${newDispatchOrder.order_id} (${activeCheckoutItem.crop}, ${buyQtyTons} Tons) assigned to driver ${randomDriver.name}. Drop: ${dropLocationName}. Freight Fee Earned: ₹${newDispatchOrder.freight_fee}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_read: false
        };
        const existingDriverNotifs = JSON.parse(localStorage.getItem('agrimitra_driver_notifications') || '[]');
        localStorage.setItem('agrimitra_driver_notifications', JSON.stringify([driverNotif, ...existingDriverNotifs]));
      } catch (e) {
        console.error('Failed saving dispatch order or driver notification:', e);
      }

      setActiveCheckoutItem(null);
      setOrderReceipt({
        ...res,
        assigned_driver: randomDriver
      });

      // Update local catalog state immediately with reduced stock
      setCatalog((prevCatalog) =>
        prevCatalog
          .map((item) => {
            if (item.inventory_id === activeCheckoutItem.inventory_id) {
              const newKg = Math.max(0, Math.round(item.quantity_kg - qtyKg));
              const newTon = Math.max(0, Math.round((newKg / 1000) * 100) / 100);
              return {
                ...item,
                quantity_kg: newKg,
                quantity_ton: newTon
              };
            }
            return item;
          })
          .filter((item) => item.quantity_kg > 0)
      );

      fetchCatalog(); // refresh catalog stock live from backend
    } catch (err) {
      alert(`Order Error: ${err.message}`);
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Filter Catalog by Crop Tab, Farmer Filter & Search
  const filteredCatalog = catalog.filter((item) => {
    const matchesCrop =
      selectedCropTab === 'All' || item.crop.toLowerCase() === selectedCropTab.toLowerCase();
    const matchesFarmer =
      selectedFarmerFilter === 'All' || item.farmer_id === selectedFarmerFilter;
    const matchesSearch =
      item.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.farmer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesFarmer && matchesSearch;
  });

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    try {
      const saved = JSON.parse(localStorage.getItem('agrimitra_dispatch_orders') || '[]');
      const updated = saved.map((o) => {
        if (o.order_id === orderId) {
          return { ...o, status: newStatus, delivered_at: newStatus === 'DELIVERED' ? new Date().toISOString() : o.delivered_at };
        }
        return o;
      });
      localStorage.setItem('agrimitra_dispatch_orders', JSON.stringify(updated));
      loadMyOrders();
    } catch (e) {
      console.error('Error updating order status in buyer view:', e);
    }
  };

  return (
    <div className="space-y-6 font-mono text-loam animate-in fade-in duration-300">
      
      {/* ── TOP HERO BANNER & BUYER IDENTITY BAR ── */}
      {/* (Rest of JSX unchanged) */}

      <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-6 shadow-sharp space-y-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-loam pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-sprout border-2 border-loam rounded-sm flex items-center justify-center text-field-bg font-extrabold text-3xl shadow-sharp-sm">
              {currentBuyer?.avatar || '🏬'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl lg:text-3xl font-extrabold text-loam">
                  Agri-Mitra Warehouse E-Commerce
                </h1>
                <span className="bg-sprout-tint text-sprout border border-sprout/40 text-xs font-mono px-2.5 py-0.5 rounded-sm uppercase tracking-wider font-extrabold">
                  Farmer-Direct Lots
                </span>
              </div>
              <p className="text-xs text-loam-muted mt-0.5">
                Authenticated Buyer: <strong className="text-loam">{currentBuyer?.name}</strong> ({currentBuyer?.id}) • {currentBuyer?.location}
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadMyOrders();
                setShowMyOrdersModal(true);
              }}
              className="py-2 px-3 bg-sprout hover:bg-sprout-hover border-2 border-loam text-field-bg rounded-sm text-xs font-mono font-extrabold flex items-center gap-1.5 transition shadow-sharp-sm active:translate-y-0.5"
              title="View my placed orders and live route on Leaflet map"
            >
              <Navigation className="w-3.5 h-3.5 text-field-bg" />
              <span>Track Orders 🗺️</span>
            </button>

            <button
              onClick={fetchCatalog}
              disabled={loadingCatalog}
              className="py-2 px-3 bg-field-bg hover:bg-sprout-tint border-2 border-loam text-loam rounded-sm text-xs font-mono font-bold flex items-center gap-1.5 transition"
            >
              <Sparkles className={`w-3.5 h-3.5 text-sprout ${loadingCatalog ? 'animate-spin' : ''}`} />
              <span>Refresh Stock</span>
            </button>

            <button
              onClick={logoutUser}
              className="py-2 px-3.5 bg-amber-700 hover:bg-amber-800 text-amber-50 rounded-sm text-xs font-mono font-extrabold border-2 border-loam shadow-sharp-sm flex items-center gap-1.5 transition active:translate-y-0.5"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-50" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Origin Shipping Address Badge */}
        <div className="p-3 bg-sprout-tint/60 border-2 border-loam rounded-sm text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sharp-sm">
          <div className="flex items-center gap-2 font-bold text-loam">
            <Warehouse className="w-4 h-4 text-sprout shrink-0" />
            <span>Central Warehouse Origin: <strong>Nyaya Marg, Near USA Embassy, Chanakyapuri, New Delhi 110021</strong></span>
          </div>
          <span className="bg-sprout text-field-bg text-[11px] font-extrabold px-2.5 py-0.5 rounded-sm font-mono whitespace-nowrap">
            📍 28°35'46.8"N 77°11'11.3"E
          </span>
        </div>

      </div>

      {/* ── CROP TABS & FARMER FILTER SYSTEM ── */}
      <div className="bg-field-surface border-2 border-loam rounded-sm p-4 shadow-sharp space-y-4">
        
        {/* 1. Crop Tabs Row */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-loam-muted uppercase tracking-wider block flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-sprout" />
            Select Crop Category Tab:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { key: 'All', label: 'All Crops', emoji: '🌾' },
              { key: 'Wheat', label: 'Wheat Lots', emoji: '🌾' },
              { key: 'Rice', label: 'Rice Lots', emoji: '🍚' },
              { key: 'Onion', label: 'Onion Lots', emoji: '🧅' },
              { key: 'Maize', label: 'Maize Lots', emoji: '🌽' }
            ].map((tab) => {
              const active = selectedCropTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCropTab(tab.key)}
                  className={`py-2.5 px-3 rounded-sm font-serif text-xs font-extrabold flex items-center justify-center gap-1.5 border-2 transition-all ${
                    active
                      ? 'bg-sprout text-field-bg border-loam shadow-sharp-sm'
                      : 'bg-field-bg text-loam border-loam/30 hover:border-loam'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Farmer Filter Buttons & Search Input */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-loam/20">
          
          {/* Farmer Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-loam-muted uppercase flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-sprout" />
              Farmer:
            </span>
            {[
              { id: 'All', label: 'All Farmers' },
              { id: 'F001', label: '👨‍🌾 Ramesh Kumar (F001)' },
              { id: 'F002', label: '🌾 Suresh Patel (F002)' },
              { id: 'F003', label: '👩‍🌾 Anita Singh (F003)' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFarmerFilter(f.id)}
                className={`px-3 py-1 rounded-sm text-xs font-mono font-bold border-2 transition-all ${
                  selectedFarmerFilter === f.id
                    ? 'bg-loam text-field-bg border-loam shadow-sharp-sm'
                    : 'bg-field-bg text-loam border-loam/30 hover:border-loam'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-loam-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lot or farmer..."
              className="w-full pl-8 pr-3 py-1.5 bg-field-bg border-2 border-loam rounded-sm text-xs font-mono font-bold text-loam focus:outline-none focus:ring-1 focus:ring-sprout"
            />
          </div>

        </div>

      </div>

      {/* ── E-COMMERCE PRODUCTS CATALOG GRID ── */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between border-b-2 border-loam pb-2">
          <h2 className="font-serif text-xl font-extrabold text-loam flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sprout" />
            Individual Farmer Crop Lots ({filteredCatalog.length} Distinct Lots Available)
          </h2>

          <span className="text-xs font-mono text-sprout bg-sprout-tint border border-sprout/40 px-2.5 py-1 rounded-sm font-bold">
            Live Central Inventory
          </span>
        </div>

        {filteredCatalog.length === 0 ? (
          <div className="p-10 bg-field-surface border-2 border-loam rounded-sm text-center space-y-3 shadow-sharp">
            <Package className="w-12 h-12 text-loam-muted mx-auto" />
            <h3 className="font-serif text-xl font-extrabold text-loam">No Crop Lots in Warehouse</h3>
            <p className="text-xs text-loam-muted max-w-md mx-auto">
              There are currently no produce lots stored in the central warehouse vault. When farmers deposit their harvested crops in the Smart Warehouse, verified real lots will appear here ready for direct purchasing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map((item) => {
              const meta = CROP_META[item.crop] || CROP_META['Wheat'];
              const pricePerKg = item.current_price_per_kg || 25.0;
              const pricePerTon = Math.round(pricePerKg * 1000);
              const availTons = item.quantity_ton || (item.quantity_kg / 1000) || 1.0;
              const farmerDisplayName = item.farmer_name || `Farmer (${item.farmer_id})`;

              // Farmer-Specific Crop Lot Title
              const cropTitle = `${farmerDisplayName}'s ${item.crop}`;

              return (
                <div
                  key={item.inventory_id}
                  className="bg-field-surface border-2 border-loam rounded-sm overflow-hidden shadow-sharp flex flex-col justify-between transition-all hover:border-sprout hover:shadow-sharp-md"
                >
                  {/* GENERATED HIGH-QUALITY CROP IMAGE COVER HEADER */}
                  <div className="relative h-48 w-full bg-field-bg border-b-2 border-loam overflow-hidden">
                    <img
                      src={meta.image}
                      alt={cropTitle}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Top Floating Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                      <span className="bg-loam/90 text-field-bg font-extrabold text-[11px] px-2.5 py-1 rounded-sm border border-loam shadow-sharp-sm flex items-center gap-1 font-mono">
                        <span>{item.farmer_avatar || '👨‍🌾'}</span>
                        <span>{farmerDisplayName}</span>
                      </span>

                      <span className="bg-amber-100 text-amber-950 font-extrabold text-[10px] px-2 py-0.5 rounded border border-amber-400 font-mono shadow-sharp-sm">
                        {item.inventory_id}
                      </span>
                    </div>

                    {/* Bottom Floating Tonnage Badge */}
                    <div className="absolute bottom-2 left-2 bg-sprout/95 text-field-bg font-mono font-extrabold text-xs px-2.5 py-1 rounded-sm border border-loam shadow-sharp-sm">
                      {availTons.toFixed(2)} tons available
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                    
                    <div className="space-y-2">
                      
                      {/* Crop Title Starting with Farmer's Name */}
                      <div className="border-b border-loam/20 pb-2">
                        <h3 className="font-serif text-lg font-extrabold text-loam leading-tight">
                          {cropTitle}
                        </h3>
                        <p className="text-[11px] text-loam-muted mt-0.5">
                          Category: <span className="font-bold text-loam">{meta.category}</span> • Quality: <span className="font-bold text-sprout">{item.quality || 'Grade A Cold Vault'}</span>
                        </p>
                      </div>

                      {/* Farmer Details & Shipping Location */}
                      <div className="p-2.5 bg-field-bg border border-loam/30 rounded-sm text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-loam-muted font-bold">Stored By:</span>
                          <span className="font-extrabold text-loam">{farmerDisplayName} ({item.farmer_id})</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-loam-muted font-bold">Farmer Origin:</span>
                          <span className="font-bold text-loam">{item.farmer_location || 'Delhi NCR'}</span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-sprout font-bold pt-1 border-t border-loam/10">
                          <span>Vault Origin:</span>
                          <span>Nyaya Marg Vault (Near USA Embassy)</span>
                        </div>
                      </div>

                      {/* Tonnage & Wholesale Price */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2 bg-sprout-tint/50 border border-sprout/40 rounded-sm text-center">
                          <span className="text-[10px] font-bold uppercase text-sprout block">Individual Lot Size</span>
                          <p className="text-sm font-extrabold text-loam">
                            {availTons.toFixed(2)} <span className="text-xs font-normal">tons</span>
                          </p>
                          <span className="text-[10px] text-loam-muted">({item.quantity_kg?.toLocaleString()} kg)</span>
                        </div>

                        <div className="p-2 bg-amber-50 border border-amber-300 rounded-sm text-center">
                          <span className="text-[10px] font-bold uppercase text-amber-900 block">Wholesale Price</span>
                          <p className="text-sm font-extrabold text-amber-950">
                            ₹{pricePerKg.toFixed(2)} <span className="text-xs font-normal">/ kg</span>
                          </p>
                          <span className="text-[10px] text-amber-800">₹{pricePerTon.toLocaleString()} / ton</span>
                        </div>
                      </div>

                    </div>

                    {/* Buy Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenCheckout(item)}
                      className="w-full py-3 px-4 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp flex items-center justify-center gap-2 transition active:translate-y-0.5 mt-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-field-bg" />
                      <span>Buy {farmerDisplayName.split(' ')[0]}'s {item.crop}</span>
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ── CHECKOUT MODAL (BUY & SET DROP-OFF LATITUDE/LONGITUDE) ── */}
      {activeCheckoutItem && (() => {
        const maxTons = activeCheckoutItem.quantity_ton || (activeCheckoutItem.quantity_kg / 1000) || 1.0;
        const isExceeding = buyQtyTons > maxTons;
        const isInvalidQty = isNaN(buyQtyTons) || buyQtyTons <= 0;
        const isValidQty = !isExceeding && !isInvalidQty;
        const displayQty = isNaN(buyQtyTons) || buyQtyTons < 0 ? 0 : buyQtyTons;

        return (
          <div className="fixed inset-0 z-50 bg-loam/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-loam/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 text-loam font-sans animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-loam/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sprout/15 border border-sprout/30 rounded-xl flex items-center justify-center text-xl shadow-xs">
                    🛒
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-loam">
                      Purchase {activeCheckoutItem.farmer_name}'s {activeCheckoutItem.crop}
                    </h3>
                    <p className="text-xs text-loam-muted font-medium mt-0.5">
                      Lot #{activeCheckoutItem.inventory_id} • Shipped from Nyaya Marg Vault (Near USA Embassy)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCheckoutItem(null)}
                  className="p-1.5 hover:bg-loam/10 rounded-lg text-loam-muted hover:text-loam transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product & Quantity Selection */}
              <div className="space-y-4">
                
                {/* Selected Lot Header Info */}
                <div className="p-3.5 bg-field-bg border border-loam/15 rounded-xl grid grid-cols-2 gap-4 text-xs shadow-xs">
                  <div>
                    <span className="text-loam-muted text-[10px] uppercase font-bold tracking-wider block mb-1">Selected Lot Title</span>
                    <p className="font-bold text-sm text-loam flex items-center gap-2">
                      <span className="text-base">{CROP_META[activeCheckoutItem.crop]?.emoji || '🌾'}</span>
                      <span>{activeCheckoutItem.farmer_name}'s {activeCheckoutItem.crop}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-loam-muted text-[10px] uppercase font-bold tracking-wider block mb-1">Wholesale Price</span>
                    <p className="font-extrabold text-sm text-emerald-700">
                      ₹{(activeCheckoutItem.current_price_per_kg || 25).toFixed(2)} <span className="text-xs font-normal text-loam-muted">/ kg</span>
                    </p>
                  </div>
                </div>

                {/* Purchase Tonnage Quantity Input & Stock Validation */}
                <div className="border border-loam/20 p-4 rounded-xl bg-white space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-loam">
                      Purchase Quantity (Tons)
                    </label>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Available Stock: {maxTons.toFixed(2)} tons
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max={maxTons}
                      value={buyQtyTons}
                      onChange={(e) => setBuyQtyTons(parseFloat(e.target.value))}
                      className={`w-full p-2.5 bg-white border rounded-lg text-base font-bold text-loam focus:outline-none transition shadow-xs ${
                        isExceeding
                          ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-500/20'
                          : isInvalidQty
                          ? 'border-amber-500 bg-amber-50/50 focus:ring-2 focus:ring-amber-500/20'
                          : 'border-loam/30 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20'
                      }`}
                    />
                    <span className="text-xs font-semibold text-loam-muted shrink-0 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200">
                      = {(displayQty * 1000).toLocaleString()} kg
                    </span>
                  </div>

                  {/* 1-Click Quick Percentage Selectors */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] font-semibold text-loam-muted uppercase tracking-wider shrink-0">Quick Stock:</span>
                    {[
                      { label: '25%', ratio: 0.25 },
                      { label: '50%', ratio: 0.50 },
                      { label: '75%', ratio: 0.75 },
                      { label: '100% Max', ratio: 1.0 }
                    ].map((btn) => {
                      const targetVal = Math.round(maxTons * btn.ratio * 100) / 100;
                      return (
                        <button
                          key={btn.label}
                          type="button"
                          onClick={() => setBuyQtyTons(targetVal)}
                          className="px-2.5 py-1 bg-field-bg hover:bg-emerald-600 hover:text-white border border-loam/20 rounded-md text-xs font-semibold text-loam transition shadow-xs"
                        >
                          {btn.label} ({targetVal} T)
                        </button>
                      );
                    })}
                  </div>

                  {/* Real-time Warning Banners */}
                  {isExceeding && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs font-medium space-y-1">
                      <div className="flex items-center gap-2 font-bold text-red-700">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Purchase Limit Exceeded!</span>
                      </div>
                      <p className="text-xs text-red-800">
                        You requested <strong>{buyQtyTons} tons</strong>, but {activeCheckoutItem.farmer_name} only has <strong>{maxTons.toFixed(2)} tons</strong> available in this lot.
                      </p>
                    </div>
                  )}

                  {isInvalidQty && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-medium space-y-1">
                      <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Invalid Purchase Quantity</span>
                      </div>
                      <p className="text-xs text-amber-800">
                        Please enter a valid purchase quantity greater than 0 tons.
                      </p>
                    </div>
                  )}

                  {isValidQty && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Quantity Approved: Within available stock limit ({maxTons.toFixed(2)} tons max).</span>
                    </div>
                  )}
                </div>

                {/* ── LOCATION & LATITUDE / LONGITUDE FORM ── */}
                <div className="p-4 bg-gradient-to-b from-amber-50/90 to-amber-50/40 border border-amber-300/80 rounded-xl space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-2 tracking-wide">
                      <Navigation className="w-4 h-4 text-amber-700" />
                      Set Drop-Off Destination & Geo-Coordinates
                    </span>
                    <span className="text-[10px] font-semibold text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-full border border-amber-300">
                      From: Nyaya Marg Vault
                    </span>
                  </div>

                  {/* Preset Location Buttons - Clean non-clipped grid */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                      1-Click Quick Location Presets (NCR Regional Buyer Hubs):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {GEO_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => handleSelectPreset(p)}
                          className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col justify-between ${
                            dropLocationName === p.name
                              ? 'bg-amber-800 text-white border-amber-900 font-bold shadow-sm ring-2 ring-amber-500/50'
                              : 'bg-white text-loam border-amber-200/80 hover:border-amber-400 hover:bg-amber-100/50 shadow-xs'
                          }`}
                        >
                          <div className="font-semibold text-[11px] leading-tight mb-1 text-balance">
                            {p.shortName || p.name}
                          </div>
                          <div className="text-[10px] opacity-75 font-mono leading-none">
                            {p.lat}, {p.lon}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Drop Location Name Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                      Drop-Off Location Name / Dock:
                    </label>
                    <input
                      type="text"
                      value={dropLocationName}
                      onChange={(e) => setDropLocationName(e.target.value)}
                      placeholder="e.g. Azadpur Mandi Gate 4, Delhi"
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-loam focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs"
                      required
                    />
                  </div>

                  {/* LATITUDE & LONGITUDE INPUTS */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                        Drop Latitude (°N):
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={dropLat}
                        onChange={(e) => setDropLat(parseFloat(e.target.value) || 28.6139)}
                        placeholder="28.6139"
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold font-mono text-loam focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                        Drop Longitude (°E):
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={dropLon}
                        onChange={(e) => setDropLon(parseFloat(e.target.value) || 77.2090)}
                        placeholder="77.2090"
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold font-mono text-loam focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Computed Logistics Summary */}
                  <div className="p-3 bg-white/90 border border-amber-200/90 rounded-lg text-xs flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-amber-900/80 block font-semibold uppercase tracking-wider">Distance from Nyaya Marg Vault</span>
                      <strong className="text-amber-950 text-sm font-extrabold">{currentDistKm} km</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-900/80 block font-semibold uppercase tracking-wider">Logistics Freight (@ ₹60/km)</span>
                      <strong className="text-amber-950 text-sm font-extrabold">₹{currentTransportFee.toLocaleString()}</strong>
                    </div>
                  </div>

                </div>

                {/* Order Total Breakdown */}
                <div className="p-4 bg-field-bg border border-loam/20 rounded-xl space-y-2 text-xs shadow-xs">
                  <div className="flex items-center justify-between text-loam-muted font-medium">
                    <span>Crop Cost ({(displayQty * 1000).toLocaleString()} kg × ₹{(activeCheckoutItem.current_price_per_kg || 25).toFixed(2)}):</span>
                    <span className="font-bold text-loam text-sm">₹{(displayQty * 1000 * (activeCheckoutItem.current_price_per_kg || 25)).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between text-loam-muted font-medium">
                    <span>Logistics Freight ({currentDistKm} km):</span>
                    <span className="font-bold text-loam text-sm">₹{currentTransportFee.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-loam/15 text-sm font-bold text-loam">
                    <span>Total Payable Amount:</span>
                    <span className="text-emerald-700 text-lg font-extrabold">
                      ₹{(displayQty * 1000 * (activeCheckoutItem.current_price_per_kg || 25) + currentTransportFee).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* Submit & Cancel Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCheckoutItem(null)}
                  className="py-3 px-4 bg-white hover:bg-gray-100 text-loam border border-loam/30 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleExecutePurchase}
                  disabled={submittingOrder || !isValidQty}
                  className={`py-3 px-4 border rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                    !isValidQty
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300 shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>
                    {submittingOrder
                      ? 'Dispatching...'
                      : isExceeding
                      ? `⚠️ Max ${maxTons.toFixed(2)} Tons`
                      : isInvalidQty
                      ? '⚠️ Enter Valid Quantity'
                      : 'Confirm Order & Dispatch Truck'}
                  </span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── ORDER CONFIRMATION RECEIPT MODAL ── */}
      {orderReceipt && (
        <div className="fixed inset-0 z-50 bg-loam/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-loam/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8 text-loam font-sans animate-in zoom-in-95 duration-200">
            
            {/* Success Header */}
            <div className="text-center space-y-2 border-b border-loam/15 pb-4">
              <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center text-emerald-800 text-3xl mx-auto shadow-xs">
                🚚
              </div>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                PURCHASE ORDER CONFIRMED
              </span>
              <h3 className="font-serif text-2xl font-bold text-loam">
                Order #{orderReceipt.order_id} Dispatched!
              </h3>
              <p className="text-xs text-loam-muted font-medium">
                Freight truck dispatched from Nyaya Marg Vault (Near USA Embassy) to your drop-off coordinates.
              </p>
            </div>

            {/* Receipt Summary Table */}
            <div className="p-4 bg-field-bg border border-loam/15 rounded-xl space-y-3 text-xs shadow-xs">
              
              <div className="flex items-center justify-between border-b border-loam/15 pb-2">
                <span className="text-loam-muted font-semibold">Purchased Crop:</span>
                <span className="font-bold text-loam text-sm">{orderReceipt.crop}</span>
              </div>

              <div className="flex items-center justify-between border-b border-loam/15 pb-2">
                <span className="text-loam-muted font-semibold">Quantity Ordered:</span>
                <span className="font-extrabold text-emerald-700">{orderReceipt.purchase_quantity_ton} tons ({orderReceipt.purchase_quantity_kg?.toLocaleString()} kg)</span>
              </div>

              <div className="flex items-center justify-between border-b border-loam/15 pb-2">
                <span className="text-loam-muted font-semibold">Shipped From:</span>
                <span className="font-semibold text-loam text-xs text-right max-w-[260px]">Nyaya Marg Vault (Near USA Embassy, New Delhi)</span>
              </div>

              <div className="flex items-center justify-between border-b border-loam/15 pb-2">
                <span className="text-loam-muted font-semibold">Drop Location:</span>
                <span className="font-bold text-loam">{orderReceipt.drop_location_name}</span>
              </div>

              {/* Appointed Delivery Driver Card */}
              {orderReceipt.assigned_driver && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      Appointed Delivery Driver:
                    </span>
                    <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                      AUTO-ASSIGNED
                    </span>
                  </div>
                  <div className="font-bold text-loam text-sm flex items-center justify-between pt-0.5">
                    <span>{orderReceipt.assigned_driver.avatar || '🚛'} {orderReceipt.assigned_driver.name} ({orderReceipt.assigned_driver.id})</span>
                    <span className="text-[11px] bg-white px-2 py-0.5 rounded border border-loam/20 font-mono font-bold text-loam">
                      {orderReceipt.assigned_driver.vehicle_number}
                    </span>
                  </div>
                  <div className="text-[11px] text-loam-muted font-medium">
                    {orderReceipt.assigned_driver.company} • Base: Nyaya Marg Central Vault
                  </div>
                </div>
              )}

              {/* Exact Geo-Coordinates */}
              <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-lg text-xs space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  Exact Drop Geo-Coordinates:
                </span>
                <div className="font-mono font-bold text-amber-950 text-xs">
                  Latitude: {orderReceipt.drop_latitude}° N &nbsp;|&nbsp; Longitude: {orderReceipt.drop_longitude}° E
                </div>
                <div className="text-[11px] text-amber-800 font-medium">
                  Haversine Route: {orderReceipt.distance_km} km • Est. Transit: {orderReceipt.estimated_delivery_mins} mins
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 font-bold text-sm">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-700 text-base font-extrabold">₹{orderReceipt.total_payable?.toLocaleString()}</span>
              </div>

            </div>

            {/* Action Buttons: Live Route Tracking & Close */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTrackingOrder({
                    ...orderReceipt,
                    drop_lat: orderReceipt.drop_latitude,
                    drop_lon: orderReceipt.drop_longitude,
                    assigned_driver_name: orderReceipt.assigned_driver?.name,
                    assigned_driver_vehicle: orderReceipt.assigned_driver?.vehicle_number,
                    assigned_driver_company: orderReceipt.assigned_driver?.company,
                    assigned_partner_id: orderReceipt.assigned_driver?.id
                  });
                }}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <Navigation className="w-4 h-4 text-white" />
                <span>Track Live Route Map</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderReceipt(null)}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Done & Continue Shopping</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MY PLACED ORDERS & TRACKING DRAWER MODAL ── */}
      {showMyOrdersModal && (
        <div className="fixed inset-0 z-50 bg-loam/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-mono">
          <div className="bg-field-surface border-2 border-loam rounded-sm max-w-2xl w-full p-6 shadow-sharp space-y-4 my-8 text-loam animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b-2 border-loam pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-sprout border-2 border-loam rounded-sm flex items-center justify-center text-field-bg font-extrabold text-xl shadow-sharp-sm">
                  📦
                </div>
                <div>
                  <h3 className="font-serif text-xl font-extrabold text-loam">
                    My Orders & Live Dispatch Tracking
                  </h3>
                  <p className="text-xs text-loam-muted">
                    Buyer: {currentBuyer?.name} ({currentBuyer?.id}) • Shipped from Nyaya Marg Central Vault
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMyOrdersModal(false)}
                className="p-1 hover:bg-loam/10 rounded border border-loam/40"
              >
                <X className="w-5 h-5 text-loam" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 divide-y divide-loam/15">
              {myOrdersList.length === 0 ? (
                <div className="p-8 text-center text-loam-muted italic">
                  No orders placed yet. Select crop lots from the catalog and confirm order to track live dispatches!
                </div>
              ) : (
                myOrdersList.map((ord, idx) => (
                  <div key={ord.order_id || idx} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-loam text-xs bg-field-bg px-2 py-0.5 rounded border border-loam/30">
                          #{ord.order_id}
                        </span>
                        <strong className="font-serif text-sm text-loam">{ord.crop} ({ord.quantity_ton || (ord.quantity_kg ? (ord.quantity_kg / 1000).toFixed(1) : 1)} Tons)</strong>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                          : ord.status === 'IN_TRANSIT'
                          ? 'bg-amber-100 text-amber-950 border-amber-400'
                          : 'bg-blue-100 text-blue-950 border-blue-400'
                      }`}>
                        {ord.status === 'DELIVERED' ? '🟢 DELIVERED' : ord.status === 'IN_TRANSIT' ? '🚛 IN TRANSIT' : '🟡 DISPATCHED'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-loam-muted gap-1">
                      <span>Destination: <strong>{ord.drop_location_name}</strong></span>
                      <span>Carrier: <strong>{ord.assigned_driver_name || ord.assigned_partner_id || 'Assigned Driver'}</strong></span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-extrabold text-sprout">
                        Freight: ₹{(ord.freight_fee || 1200).toLocaleString()} • {ord.distance_km || 18} km
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTrackingOrder(ord);
                        }}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow-sm transition"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>🗺️ Track Route Map</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMyOrdersModal(false)}
              className="w-full py-2.5 px-4 bg-field-bg hover:bg-loam/10 text-loam border-2 border-loam rounded-sm text-xs font-mono font-bold transition"
            >
              Close Orders List
            </button>

          </div>
        </div>
      )}

      {/* ── LIVE LEAFLET ROUTE OPTIMIZATION MAP MODAL (FOR BUYER) ── */}
      {activeTrackingOrder && (
        <OrderRouteTrackingModal
          order={activeTrackingOrder}
          viewerRole="buyer"
          onClose={() => setActiveTrackingOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}

    </div>
  );
}
