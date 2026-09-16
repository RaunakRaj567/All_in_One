// frontend/src/components/DeliveryPartnerPortalLanding.jsx
import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  LogOut,
  CheckCircle2,
  ShieldCheck,
  Search,
  Navigation,
  DollarSign,
  UserCheck,
  Package,
  Sparkles,
  Clock,
  ArrowRight,
  X,
  AlertCircle,
  Bell,
  CheckCheck
} from 'lucide-react';
import { useAgriContext, DELIVERY_PARTNER_ACCOUNTS } from '../context/AgriContext';
import OrderRouteTrackingModal from './OrderRouteTrackingModal';

const INITIAL_DISPATCH_ORDERS = [];

export default function DeliveryPartnerPortalLanding() {
  const { currentDeliveryPartner, loginAsDeliveryPartner, logoutUser } = useAgriContext();

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRouteModal, setActiveRouteModal] = useState(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  // Portal View Tab Mode: 'orders' (Shipment Cards) | 'map' (Optimized Route Map Tab)
  const [portalViewTab, setPortalViewTab] = useState('orders');
  const [selectedMapOrderId, setSelectedMapOrderId] = useState(null);

  // Driver Notifications State
  const [driverNotifs, setDriverNotifs] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const activePartnerObj = currentDeliveryPartner || DELIVERY_PARTNER_ACCOUNTS[0];

  const fetchDriverNotifications = () => {
    try {
      const saved = localStorage.getItem('agrimitra_driver_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setDriverNotifs(parsed);
        }
      }
    } catch (e) {
      console.error('Error fetching driver notifications:', e);
    }
  };

  // Load real-time buyer dispatch orders & driver notifications from localStorage
  React.useEffect(() => {
    const loadDispatches = () => {
      try {
        const saved = localStorage.getItem('agrimitra_dispatch_orders');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter out pre-seeded mock dispatch orders (ORD-5001 to ORD-5005)
            const realOnly = parsed.filter((o) => o && o.order_id && !o.order_id.startsWith('ORD-500'));
            setOrders(realOnly);
            if (realOnly.length !== parsed.length) {
              localStorage.setItem('agrimitra_dispatch_orders', JSON.stringify(realOnly));
            }
          }
        } else {
          setOrders([]);
        }
      } catch (e) {
        console.error('Error loading saved dispatch orders:', e);
      }
    };

    loadDispatches();
    fetchDriverNotifications();

    const interval = setInterval(() => {
      loadDispatches();
      fetchDriverNotifications();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const activeDriverNotifs = driverNotifs.filter((n) => n.partner_id === activePartnerObj.id);
  const unreadCount = activeDriverNotifs.filter((n) => !n.is_read).length;

  const markAllDriverNotifsRead = () => {
    const updated = driverNotifs.map((n) => (n.partner_id === activePartnerObj.id ? { ...n, is_read: true } : n));
    setDriverNotifs(updated);
    try {
      localStorage.setItem('agrimitra_driver_notifications', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving driver notifications:', e);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.order_id === orderId) {
          return {
            ...ord,
            status: newStatus,
            delivered_at: newStatus === 'DELIVERED' ? new Date().toISOString() : ord.delivered_at
          };
        }
        return ord;
      });

      try {
        localStorage.setItem('agrimitra_dispatch_orders', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving updated dispatch status:', e);
      }
      return updated;
    });

    const targetOrd = orders.find((o) => o.order_id === orderId);
    setActionSuccessMessage({
      type: 'success',
      text: `✅ Order #${orderId} (${targetOrd?.crop || 'Produce'}) status updated to ${newStatus}!`
    });

    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  };

  // Filter orders to ONLY those assigned to the active logged-in driver (Strict Privacy Filter)
  const driverAssignedOrders = orders.filter((ord) => {
    if (!ord) return false;
    const isMyId = ord.assigned_partner_id === activePartnerObj.id || ord.assigned_driver?.id === activePartnerObj.id;
    const isMyName = ord.assigned_driver_name === activePartnerObj.name || ord.assigned_driver?.name === activePartnerObj.name;
    return isMyId || isMyName;
  });

  const filteredOrders = driverAssignedOrders.filter((ord) => {
    const matchesStatus = statusFilter === 'All' || ord.status === statusFilter;
    const matchesSearch =
      ord.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.drop_location_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalEarnings = driverAssignedOrders
    .filter((o) => o.status === 'DELIVERED' || o.status === 'IN_TRANSIT')
    .reduce((sum, o) => sum + (o.freight_fee || 0), 0);

  return (
    <div className="space-y-6 font-mono text-loam animate-in fade-in duration-300">
      
      {/* 🚨 Driver Alert Banner for New Orders */}
      {unreadCount > 0 && (
        <div className="bg-red-600 text-white p-3.5 rounded-sm border-2 border-red-800 shadow-sharp flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-bounce" />
            <div>
              <h4 className="font-serif font-extrabold text-sm text-yellow-200">
                🚨 NEW FREIGHT ORDER ASSIGNED TO YOU ({unreadCount} UNREAD)
              </h4>
              <p className="text-xs text-white/90">
                You have been randomly appointed for a new dispatch from Nyaya Marg Central Vault! Check your order list below.
              </p>
            </div>
          </div>
          <button
            onClick={markAllDriverNotifsRead}
            className="px-3 py-1 bg-yellow-400 text-red-950 hover:bg-yellow-300 rounded font-bold text-xs whitespace-nowrap shadow-sm transition"
          >
            Acknowledge & Mark Read ✅
          </button>
        </div>
      )}

      {/* ── TOP HERO BRAND BANNER & LOGISTICS IDENTITY ── */}
      <div className="bg-field-surface border-2 border-loam rounded-sm p-4 sm:p-6 shadow-sharp space-y-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-loam pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-sprout border-2 border-loam rounded-sm flex items-center justify-center text-field-bg font-extrabold text-3xl shadow-sharp-sm">
              {activePartnerObj.avatar || '🚛'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl lg:text-3xl font-extrabold text-loam">
                  Agri-Mitra Delivery Partner Portal
                </h1>
                <span className="bg-sprout-tint text-sprout border border-sprout/40 text-xs font-mono px-2.5 py-0.5 rounded-sm uppercase tracking-wider font-extrabold">
                  Fleet Dispatch Suite
                </span>
              </div>
              <p className="text-xs text-loam-muted mt-0.5">
                Authenticated Partner: <strong className="text-loam">{activePartnerObj.name}</strong> ({activePartnerObj.id}) • {activePartnerObj.company} • Vehicle: <code className="bg-field-bg px-1.5 py-0.5 rounded border border-loam/30 font-bold">{activePartnerObj.vehicle_number}</code> ({activePartnerObj.vehicle_capacity_ton}T Max)
              </p>
            </div>
          </div>

          {/* Account Switcher, Notification Bell & Logout */}
          <div className="flex items-center gap-2 relative">
            
            {/* Red Bell Notification Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border-2 font-mono text-xs font-bold transition-all shadow-sharp-sm relative ${
                  unreadCount > 0
                    ? 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100 animate-pulse'
                    : 'border-loam bg-field-bg hover:bg-field-card text-loam'
                }`}
                title={unreadCount > 0 ? `${unreadCount} new order assignment alerts!` : 'Driver Alerts Bar'}
              >
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-red-600 fill-red-100' : 'text-loam'}`} />
                <span className="hidden sm:inline">Dispatch Alerts</span>
                {unreadCount > 0 && (
                  <span className="bg-red-600 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full border border-red-700 shadow-sm animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifDropdown && (
                <div className="absolute right-0 top-11 w-80 sm:w-96 bg-field-surface border-2 border-loam shadow-sharp-lg z-50 rounded-sm overflow-hidden font-mono text-xs">
                  <div className="bg-loam text-field-bg px-3 py-2.5 flex items-center justify-between font-bold border-b border-loam">
                    <div className="flex items-center gap-2">
                      <span>🔔 Driver Dispatch Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                          {unreadCount} NEW
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllDriverNotifsRead}
                        className="flex items-center gap-1 text-[11px] bg-sprout text-field-bg px-2 py-0.5 rounded hover:bg-sprout/90 font-bold transition-all"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark Read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-loam/10">
                    {activeDriverNotifs.length === 0 ? (
                      <div className="p-4 text-center text-loam-muted italic">
                        No dispatch alerts yet for {activePartnerObj.name}.
                      </div>
                    ) : (
                      activeDriverNotifs.map((n, idx) => (
                        <div
                          key={n.id || idx}
                          className={`p-3 transition-colors ${
                            !n.is_read ? 'bg-red-50/70 border-l-4 border-red-600 font-semibold' : 'hover:bg-field-bg/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-base leading-none">🚛</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-loam text-xs">{n.title}</h4>
                                <span className="text-[10px] text-loam-muted font-mono">{n.timestamp}</span>
                              </div>
                              <p className="text-xs text-loam-muted mt-1 leading-snug">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="bg-field-bg p-2 text-center text-[10px] text-loam-muted border-t border-loam/20 font-bold">
                    Active Driver: {activePartnerObj.name} ({activePartnerObj.id})
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 bg-field-bg border border-loam/40 p-1 rounded-sm text-xs">
              <span className="text-[10px] font-bold text-loam-muted uppercase px-1">Partner Account:</span>
              <select
                value={activePartnerObj.id}
                onChange={(e) => loginAsDeliveryPartner(e.target.value)}
                className="bg-field-surface border border-loam rounded px-2 py-1 text-xs font-bold text-loam focus:outline-none"
              >
                {DELIVERY_PARTNER_ACCOUNTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.company})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={logoutUser}
              className="py-2 px-3.5 bg-amber-700 hover:bg-amber-800 text-amber-50 rounded-sm text-xs font-mono font-extrabold border-2 border-loam shadow-sharp-sm flex items-center gap-1.5 transition active:translate-y-0.5"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-50" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Central Warehouse Shipping Origin Badge */}
        <div className="p-3 bg-sprout-tint/60 border-2 border-loam rounded-sm text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sharp-sm">
          <div className="flex items-center gap-2 font-bold text-loam">
            <Truck className="w-4 h-4 text-sprout shrink-0" />
            <span>Central Dispatch Origin: <strong>Nyaya Marg Central Vault (Near USA Embassy, Chanakyapuri, New Delhi 110021)</strong></span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-loam text-field-bg text-[10px] font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wider font-mono">
              🛡️ B2B Warehouse-to-Buyer Drivers (Separate from Mandi Transport)
            </span>
            <span className="bg-sprout text-field-bg text-[11px] font-extrabold px-2.5 py-0.5 rounded-sm font-mono whitespace-nowrap">
              📍 28°35'46.8"N 77°11'11.3"E
            </span>
          </div>
        </div>

        {/* Top Earnings & Freight KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-field-bg border-2 border-loam/40 rounded-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-loam-muted block">Assigned Logistics Vehicle</span>
            <p className="text-base font-extrabold text-loam flex items-center gap-1.5">
              <span>{activePartnerObj.avatar}</span>
              <span>{activePartnerObj.vehicle_number}</span>
            </p>
            <span className="text-[10px] text-sprout font-bold block">{activePartnerObj.vehicle_capacity_ton} Tons Payload Capacity</span>
          </div>

          <div className="p-3 bg-field-bg border-2 border-loam/40 rounded-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-loam-muted block">Assigned Fleet Orders</span>
            <p className="text-base font-extrabold text-sprout">{driverAssignedOrders.length} Shipments Allocated</p>
            <span className="text-[10px] text-loam-muted block">
              {driverAssignedOrders.filter((o) => o.status === 'IN_TRANSIT').length} In Transit • {driverAssignedOrders.filter((o) => o.status === 'DISPATCHED').length} Ready for Pickup
            </span>
          </div>

          <div className="p-3 bg-emerald-100 border-2 border-emerald-400 rounded-sm space-y-1">
            <span className="text-[10px] font-bold uppercase text-emerald-950 block">Logistics Freight Revenue</span>
            <p className="text-lg font-extrabold text-emerald-950">₹{totalEarnings.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-800 font-bold block">Calculated @ ₹60/km Haversine Freight Rate</span>
          </div>
        </div>

      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-100 border-2 border-emerald-400 text-emerald-950 rounded-sm text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionSuccessMessage.text}</span>
        </div>
      )}

      {/* ── FILTER & SEARCH CONTROLS ── */}
      <div className="bg-field-surface border-2 border-loam rounded-sm p-4 shadow-sharp flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-loam-muted uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sprout" />
            Status Filter:
          </span>
          {[
            { key: 'All', label: 'All Shipments' },
            { key: 'DISPATCHED', label: '🟡 Dispatched' },
            { key: 'IN_TRANSIT', label: '🚛 In Transit' },
            { key: 'DELIVERED', label: '🟢 Delivered' }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold border-2 transition-all ${
                statusFilter === tab.key
                  ? 'bg-sprout text-field-bg border-loam shadow-sharp-sm'
                  : 'bg-field-bg text-loam border-loam/30 hover:border-loam'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-loam-muted absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order, crop or drop location..."
            className="w-full pl-8 pr-3 py-2 bg-field-bg border-2 border-loam rounded-sm text-xs font-mono font-bold text-loam focus:outline-none focus:ring-1 focus:ring-sprout"
          />
        </div>

      </div>

      {/* ── PORTAL VIEW MODE TABS: ORDERS GRID VS LIVE ROUTE MAP TAB ── */}
      <div className="flex items-center gap-2 border-b-2 border-loam pb-2">
        <button
          type="button"
          onClick={() => setPortalViewTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs font-extrabold border-2 transition-all ${
            portalViewTab === 'orders'
              ? 'bg-sprout text-field-bg border-loam shadow-sharp-sm'
              : 'bg-field-surface text-loam border-loam/30 hover:border-loam'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>📦 Active Orders List ({filteredOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPortalViewTab('map');
            if (!selectedMapOrderId) {
              setSelectedMapOrderId((driverAssignedOrders[0])?.order_id);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs font-extrabold border-2 transition-all ${
            portalViewTab === 'map'
              ? 'bg-sprout text-field-bg border-loam shadow-sharp-sm'
              : 'bg-field-surface text-loam border-loam/30 hover:border-loam'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>🗺️ Live Route Map (Same as Buyer View)</span>
        </button>
      </div>

      {/* ── TAB 1: INLINE OPTIMIZED HIGHWAY ROUTE MAP (IDENTICAL TO BUYER MAP) ── */}
      {portalViewTab === 'map' && (() => {
        const mapList = driverAssignedOrders;
        const currentMapOrder =
          mapList.find((o) => o.order_id === selectedMapOrderId) || mapList[0];

        return (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Shipment Selector Bar */}
            <div className="bg-field-surface border-2 border-loam rounded-sm p-3.5 shadow-sharp flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold text-loam-muted uppercase block">
                  Select Shipment Route:
                </span>
                {mapList.slice(0, 6).map((ord) => (
                  <button
                    key={ord.order_id}
                    type="button"
                    onClick={() => setSelectedMapOrderId(ord.order_id)}
                    className={`px-3 py-1 rounded text-xs font-bold font-mono border transition-all ${
                      currentMapOrder?.order_id === ord.order_id
                        ? 'bg-loam text-field-bg border-loam shadow-sm'
                        : 'bg-field-bg text-loam border-loam/30 hover:border-loam'
                    }`}
                  >
                    #{ord.order_id} • {ord.crop} ({ord.drop_location_name?.slice(0, 16)}...)
                  </button>
                ))}
              </div>

              <span className="bg-emerald-100 text-emerald-950 border border-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase whitespace-nowrap shadow-sm">
                🟢 Live Synced with Buyer Track Map
              </span>
            </div>

            {/* Render Synchronized Leaflet Route Optimization Map */}
            {currentMapOrder ? (
              <OrderRouteTrackingModal
                order={currentMapOrder}
                viewerRole="driver"
                isInline={true}
                onUpdateStatus={handleUpdateOrderStatus}
              />
            ) : (
              <div className="p-8 bg-field-surface border-2 border-loam rounded-sm text-center text-loam-muted">
                No active shipments available to display on route map.
              </div>
            )}
          </div>
        );
      })()}

      {/* ── TAB 2: DISPATCHED ORDERS LIST GRID ── */}
      {portalViewTab === 'orders' && (
        <div className="space-y-4">
        
        <div className="flex items-center justify-between border-b-2 border-loam pb-2">
          <h2 className="font-serif text-xl font-extrabold text-loam flex items-center gap-2">
            <Truck className="w-5 h-5 text-sprout" />
            Dispatched Warehouse Orders ({filteredOrders.length} Shipments)
          </h2>

          <span className="text-xs font-mono text-sprout bg-sprout-tint border border-sprout/40 px-2.5 py-1 rounded-sm font-bold">
            Nyaya Marg Central Vault Origin
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8 bg-field-surface border-2 border-loam rounded-sm text-center space-y-3 shadow-sharp">
            <div className="w-12 h-12 bg-amber-100 border-2 border-amber-400 rounded-full flex items-center justify-center text-amber-800 text-2xl mx-auto shadow-sharp-sm">
              🔒
            </div>
            <h3 className="font-serif text-lg font-extrabold text-loam">No Shipments Assigned To Driver {activePartnerObj.name}</h3>
            <p className="text-xs text-loam-muted max-w-md mx-auto font-mono">
              Strict privacy is enforced. You are currently viewing as <strong>{activePartnerObj.name} ({activePartnerObj.id})</strong>. Drivers can only view and manage delivery orders allocated directly to them.
            </p>
            <span className="inline-block text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded font-mono">
              🛡️ Other drivers' parcel details, locations, and revenue are strictly protected.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((ord) => {
              const isDelivered = ord.status === 'DELIVERED';
              const isInTransit = ord.status === 'IN_TRANSIT';
              const isDispatched = ord.status === 'DISPATCHED';

              return (
                <div
                  key={ord.order_id}
                  className="bg-field-surface border-2 border-loam rounded-sm p-4 shadow-sharp flex flex-col justify-between space-y-4 transition-all hover:border-sprout hover:shadow-sharp-md"
                >
                  {/* Order Top Card Header */}
                  <div className="space-y-2.5 border-b border-loam/20 pb-3">
                    
                    <div className="flex items-center justify-between">
                      <span className="bg-loam text-field-bg font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-sm">
                        {ord.order_id}
                      </span>

                      <span className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-400'
                          : isInTransit
                          ? 'bg-amber-100 text-amber-950 border-amber-400'
                          : 'bg-blue-100 text-blue-950 border-blue-400'
                      }`}>
                        {isDelivered ? '🟢 DELIVERED' : isInTransit ? '🚛 IN TRANSIT' : '🟡 DISPATCHED'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-extrabold text-loam leading-tight">
                        {ord.crop} Cargo Lot ({ord.quantity_ton.toFixed(2)} tons / {ord.quantity_kg.toLocaleString()} kg)
                      </h3>
                      <p className="text-xs text-loam-muted mt-0.5">
                        Customer Buyer: <strong className="text-loam">{ord.buyer_name}</strong>
                      </p>
                    </div>

                  </div>

                  {/* Route & Delivery Location Info */}
                  <div className="p-3 bg-field-bg border border-loam/30 rounded-sm text-xs space-y-2">
                    
                    <div>
                      <span className="text-[10px] text-loam-muted font-bold block uppercase">Dispatch Origin:</span>
                      <p className="font-extrabold text-[11px] text-loam truncate">{ord.origin_location}</p>
                      <span className="text-[10px] text-sprout font-bold font-mono">📍 {ord.origin_coords}</span>
                    </div>

                    <div className="pt-1 border-t border-loam/15">
                      <span className="text-[10px] text-amber-900 font-bold block uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-700" />
                        Drop Destination:
                      </span>
                      <p className="font-extrabold text-xs text-amber-950 truncate">{ord.drop_location_name}</p>
                      <span className="text-[10px] text-amber-900 font-mono font-bold">
                        📍 Lat: {ord.drop_lat}° N &nbsp;|&nbsp; Lon: {ord.drop_lon}° E
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-loam/15 text-[11px]">
                      <div>
                        <span className="text-[10px] text-loam-muted font-bold block">Distance:</span>
                        <strong className="text-loam font-extrabold">{ord.distance_km} km</strong>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-loam-muted font-bold block">Freight Revenue:</span>
                        <strong className="text-sprout font-extrabold">₹{ord.freight_fee.toLocaleString()}</strong>
                      </div>
                    </div>

                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    
                    <button
                      type="button"
                      onClick={() => setActiveRouteModal(ord)}
                      className="w-full py-2 px-3 bg-field-bg hover:bg-sprout-tint border-2 border-loam rounded-sm text-xs font-mono font-extrabold text-loam flex items-center justify-center gap-1.5 transition shadow-sharp-sm active:translate-y-0.5"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sprout" />
                      <span>🗺️ Drop Location & Road Path Map</span>
                    </button>

                    {isDispatched && (
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateOrderStatus(ord.order_id, 'IN_TRANSIT');
                          setActiveRouteModal(ord);
                        }}
                        className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-amber-50 border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp flex items-center justify-center gap-2 transition active:translate-y-0.5"
                      >
                        <Truck className="w-4 h-4 text-amber-50" />
                        <span>Start Live Transit & View Map 🚚</span>
                      </button>
                    )}

                    {isInTransit && (
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(ord.order_id, 'DELIVERED')}
                        className="w-full py-2.5 px-3 bg-sprout hover:bg-sprout-hover text-field-bg border-2 border-loam rounded-sm text-xs font-mono font-extrabold shadow-sharp flex items-center justify-center gap-2 transition active:translate-y-0.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-field-bg" />
                        <span>Confirm Delivered ✅</span>
                      </button>
                    )}

                    {isDelivered && (
                      <div className="p-2 bg-emerald-50 border border-emerald-400 rounded text-center text-xs font-bold text-emerald-900 font-mono">
                        ✓ Delivery Complete & Freight Settled
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
      )}

      {/* ── LEAFLET OPTIMIZED ROAD ROUTE & DROP LOCATION MODAL (FOR DRIVER) ── */}
      {activeRouteModal && (
        <OrderRouteTrackingModal
          order={activeRouteModal}
          viewerRole="driver"
          onClose={() => setActiveRouteModal(null)}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}

    </div>
  );
}
