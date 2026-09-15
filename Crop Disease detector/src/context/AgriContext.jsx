import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredSettings } from '../services/geminiService';
import { getFarmerNotifications } from '../services/warehouseApi';

export const FARMER_ACCOUNTS = [
  {
    id: 'F001',
    name: 'Ramesh Kumar',
    email: 'ramesh@agrimitra.in',
    password: 'farmer123',
    role: 'Farmer 1 (Wheat & Onion)',
    location: 'Azadpur, Delhi',
    avatar: '👨‍🌾'
  },
  {
    id: 'F002',
    name: 'Suresh Patel',
    email: 'suresh@agrimitra.in',
    password: 'farmer123',
    role: 'Farmer 2 (Rice & Maize)',
    location: 'Sahibabad, UP',
    avatar: '🌾'
  },
  {
    id: 'F003',
    name: 'Anita Singh',
    email: 'anita@agrimitra.in',
    password: 'farmer123',
    role: 'Farmer 3 (Maize & Pulses)',
    location: 'Gurugram, HR',
    avatar: '👩‍🌾'
  }
];

export const BUYER_ACCOUNTS = [
  {
    id: 'B001',
    name: 'Rajesh Sharma',
    email: 'rajesh@agrimitra.in',
    password: 'buyer123',
    role: 'Buyer 1 (Wholesaler)',
    location: 'Azadpur, Delhi',
    avatar: '🏬'
  },
  {
    id: 'B002',
    name: 'Priya Verma',
    email: 'priya@agrimitra.in',
    password: 'buyer123',
    role: 'Buyer 2 (Retailer)',
    location: 'Sahibabad, UP',
    avatar: '🏪'
  },
  {
    id: 'B003',
    name: 'Vikram Singh',
    email: 'vikram@agrimitra.in',
    password: 'buyer123',
    role: 'Buyer 3 (Distributor)',
    location: 'Gurugram, HR',
    avatar: '🏢'
  }
];

export const DELIVERY_PARTNER_ACCOUNTS = [
  {
    id: 'D001',
    name: 'Harpreet Saini',
    company: 'Express Freight Logistics',
    email: 'harpreet.delivery@agrimitra.in',
    password: 'partner123',
    role: 'Warehouse B2B Driver 1 (Heavy Haulage)',
    location: 'Nyaya Marg Central Vault (Near USA Embassy, New Delhi 110021)',
    latitude: 28.5963,
    longitude: 77.1865,
    avatar: '🚛',
    vehicle_number: 'DL-01-AX-9921',
    vehicle_capacity_ton: 25.0
  },
  {
    id: 'D002',
    name: 'Manoj Tiwari',
    company: 'Capital Agri Cargo Fleet',
    email: 'manoj.delivery@agrimitra.in',
    password: 'partner123',
    role: 'Warehouse B2B Driver 2 (Refrigerated Van)',
    location: 'Nyaya Marg Central Vault (Near USA Embassy, New Delhi 110021)',
    latitude: 28.5963,
    longitude: 77.1865,
    avatar: '🚚',
    vehicle_number: 'UP-16-BZ-4412',
    vehicle_capacity_ton: 20.0
  },
  {
    id: 'D003',
    name: 'Sanjay Rawat',
    company: 'Speedy NCR Transports',
    email: 'sanjay.delivery@agrimitra.in',
    password: 'partner123',
    role: 'Warehouse B2B Driver 3 (Medium Cargo)',
    location: 'Nyaya Marg Central Vault (Near USA Embassy, New Delhi 110021)',
    latitude: 28.5963,
    longitude: 77.1865,
    avatar: '🚛',
    vehicle_number: 'UP-14-CX-8833',
    vehicle_capacity_ton: 22.0
  },
  {
    id: 'D004',
    name: 'Alok Mishra',
    company: 'Northern Dispatch Lines',
    email: 'alok.delivery@agrimitra.in',
    password: 'partner123',
    role: 'Warehouse B2B Driver 4 (Express Logistics)',
    location: 'Nyaya Marg Central Vault (Near USA Embassy, New Delhi 110021)',
    latitude: 28.5963,
    longitude: 77.1865,
    avatar: '🚚',
    vehicle_number: 'HR-26-DY-5567',
    vehicle_capacity_ton: 28.0
  },
  {
    id: 'D005',
    name: 'Karan Deshmukh',
    company: 'Green Field Logistics',
    email: 'karan.delivery@agrimitra.in',
    password: 'partner123',
    role: 'Warehouse B2B Driver 5 (Heavy Multi-Axle)',
    location: 'Nyaya Marg Central Vault (Near USA Embassy, New Delhi 110021)',
    latitude: 28.5963,
    longitude: 77.1865,
    avatar: '🚛',
    vehicle_number: 'HR-10-EZ-1190',
    vehicle_capacity_ton: 30.0
  }
];

const HISTORY_KEY = 'agrivision_scan_history';

const AgriContext = createContext(null);

export function AgriProvider({ children }) {
  const [activeScan, setActiveScan] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [pendingChatQuery, setPendingChatQuery] = useState('');

  // 3 Farmer, 3 Buyer & 5 Delivery Partner Accounts Authentication State
  const [userRole, setUserRole] = useState('farmer'); // 'farmer' | 'buyer' | 'delivery'
  const [currentFarmer, setCurrentFarmer] = useState(FARMER_ACCOUNTS[0]);
  const [currentBuyer, setCurrentBuyer] = useState(BUYER_ACCOUNTS[0]);
  const [currentDeliveryPartner, setCurrentDeliveryPartner] = useState(DELIVERY_PARTNER_ACCOUNTS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Initial restart opens login interface first
  const [authStatusMessage, setAuthStatusMessage] = useState(null);

  // Farmer Real-Time Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const fetchFarmerNotifications = async (farmerId = currentFarmer?.id) => {
    if (!farmerId) return;
    try {
      const data = await getFarmerNotifications(farmerId);
      let list = Array.isArray(data) ? data : [];

      // Merge local notifications from localStorage
      try {
        const localSaved = JSON.parse(localStorage.getItem('agrimitra_farmer_notifications') || '[]');
        if (Array.isArray(localSaved) && localSaved.length > 0) {
          const listIds = new Set(list.map((n) => n.notification_id || n.id));
          const localFiltered = localSaved.filter((n) => !listIds.has(n.notification_id || n.id));
          list = [...localFiltered, ...list];
        }
      } catch (e) {
        console.error('Error merging local farmer notifications:', e);
      }

      // Read persistent read IDs from localStorage
      let readSet = new Set();
      try {
        readSet = new Set(JSON.parse(localStorage.getItem('agrimitra_read_notif_ids') || '[]'));
      } catch (e) {
        console.error('Error loading read notification IDs:', e);
      }

      // Strictly limit farmer notifications to Storage Deposits & Buyer Purchases (No Delivery Alerts)
      // and apply persistent read status
      const processedList = list
        .filter((n) => {
          const nType = (n.type || '').toUpperCase();
          const nTitle = (n.title || '').toLowerCase();
          if (nType === 'ORDER_DELIVERED' || nTitle.includes('delivered')) return false;
          return (
            nType === 'STORAGE_DEPOSIT' ||
            nType === 'BUYER_PURCHASE' ||
            nTitle.includes('deposit') ||
            nTitle.includes('bought') ||
            nTitle.includes('purchased')
          );
        })
        .map((n) => {
          const id = n.notification_id || n.id;
          if (id && readSet.has(id)) {
            return { ...n, is_read: true };
          }
          return n;
        });

      setNotifications(processedList);
      const unread = processedList.filter((n) => !n.is_read).length;
      setUnreadNotifCount(unread);
    } catch (err) {
      console.warn('Could not fetch farmer notifications:', err);
    }
  };

  const markNotificationsRead = () => {
    try {
      const readSet = new Set(JSON.parse(localStorage.getItem('agrimitra_read_notif_ids') || '[]'));
      notifications.forEach((n) => {
        const id = n.notification_id || n.id;
        if (id) readSet.add(id);
      });
      localStorage.setItem('agrimitra_read_notif_ids', JSON.stringify(Array.from(readSet)));
    } catch (e) {
      console.error('Error saving read notification IDs:', e);
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadNotifCount(0);
  };

  useEffect(() => {
    const settings = getStoredSettings();
    setHasApiKey(!!(settings.apiKey && settings.apiKey.trim() !== ''));

    try {
      const savedHist = localStorage.getItem(HISTORY_KEY);
      if (savedHist) setHistory(JSON.parse(savedHist));
    } catch (e) {
      console.error('Failed loading history', e);
    }
  }, []);

  // Poll farmer notifications when farmer is active
  useEffect(() => {
    if (userRole === 'farmer' && currentFarmer?.id) {
      fetchFarmerNotifications(currentFarmer.id);
      const interval = setInterval(() => {
        fetchFarmerNotifications(currentFarmer.id);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [userRole, currentFarmer?.id]);

  const refreshSettings = () => {
    const settings = getStoredSettings();
    setHasApiKey(!!(settings.apiKey && settings.apiKey.trim() !== ''));
  };

  const loginAsFarmer = (farmerId) => {
    const found = FARMER_ACCOUNTS.find((f) => f.id === farmerId);
    if (found) {
      setUserRole('farmer');
      setCurrentFarmer(found);
      setIsAuthenticated(true);
      setAuthStatusMessage({ type: 'success', text: `✅ Authenticated as Farmer ${found.name} (${found.id})` });
      return true;
    }
    return false;
  };

  const loginAsBuyer = (buyerId) => {
    const found = BUYER_ACCOUNTS.find((b) => b.id === buyerId);
    if (found) {
      setUserRole('buyer');
      setCurrentBuyer(found);
      setIsAuthenticated(true);
      setAuthStatusMessage({ type: 'success', text: `✅ Authenticated as Buyer ${found.name} (${found.id})` });
      return true;
    }
    return false;
  };

  const loginAsDeliveryPartner = (partnerId) => {
    const found = DELIVERY_PARTNER_ACCOUNTS.find((d) => d.id === partnerId);
    if (found) {
      setUserRole('delivery');
      setCurrentDeliveryPartner(found);
      setIsAuthenticated(true);
      setAuthStatusMessage({ type: 'success', text: `✅ Authenticated as Delivery Partner ${found.name} (${found.company})` });
      return true;
    }
    return false;
  };

  const authenticateFarmer = (emailOrId, password) => {
    const found = FARMER_ACCOUNTS.find(
      (f) =>
        (f.email.toLowerCase() === emailOrId.toLowerCase() || f.id.toLowerCase() === emailOrId.toLowerCase()) &&
        f.password === password
    );
    if (found) {
      setUserRole('farmer');
      setCurrentFarmer(found);
      setIsAuthenticated(true);
      setAuthStatusMessage({ type: 'success', text: `✅ Successfully logged in as ${found.name}!` });
      return { success: true, farmer: found };
    }
    setAuthStatusMessage({ type: 'error', text: '❌ Invalid farmer credentials. Default password is farmer123' });
    return { success: false, message: 'Invalid farmer credentials. Default password is farmer123' };
  };

  const authenticateBuyer = (emailOrId, password) => {
    const found = BUYER_ACCOUNTS.find(
      (b) =>
        (b.email.toLowerCase() === emailOrId.toLowerCase() || b.id.toLowerCase() === emailOrId.toLowerCase()) &&
        b.password === password
    );
    if (found) {
      setUserRole('buyer');
      setCurrentBuyer(found);
      setIsAuthenticated(true);
      setAuthStatusMessage({ type: 'success', text: `✅ Successfully logged in as Buyer ${found.name}!` });
      return { success: true, buyer: found };
    }
    setAuthStatusMessage({ type: 'error', text: '❌ Invalid buyer credentials. Default password is buyer123' });
    return { success: false, message: 'Invalid buyer credentials. Default password is buyer123' };
  };

  const authenticateDeliveryPartner = (emailOrId, password) => {
    const found = DELIVERY_PARTNER_ACCOUNTS.find(
      (d) =>
        (d.email.toLowerCase() === emailOrId.toLowerCase() || d.id.toLowerCase() === emailOrId.toLowerCase()) &&
        d.password === password
    );
    if (found) {
      setUserRole('delivery');
      setCurrentDeliveryPartner(found);
      setIsAuthenticated(true);
      setAuthStatusMessage({ type: 'success', text: `✅ Successfully logged in as Delivery Partner ${found.name}!` });
      return { success: true, partner: found };
    }
    setAuthStatusMessage({ type: 'error', text: '❌ Invalid delivery partner credentials. Default password is partner123' });
    return { success: false, message: 'Invalid delivery partner credentials. Default password is partner123' };
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setAuthStatusMessage(null);
  };

  const logoutFarmer = () => {
    logoutUser();
  };

  const addScanToHistory = (scanObj) => {
    setActiveScan(scanObj);
    const updatedHistory = [scanObj, ...history.slice(0, 19)];
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const resetScan = () => {
    setActiveScan(null);
    setActiveImage(null);
  };

  return (
    <AgriContext.Provider
      value={{
        activeScan,
        setActiveScan,
        activeImage,
        setActiveImage,
        history,
        addScanToHistory,
        clearHistory,
        resetScan,
        hasApiKey,
        refreshSettings,
        pendingChatQuery,
        setPendingChatQuery,
        userRole,
        setUserRole,
        currentFarmer,
        currentBuyer,
        currentDeliveryPartner,
        isAuthenticated,
        loginAsFarmer,
        loginAsBuyer,
        loginAsDeliveryPartner,
        authenticateFarmer,
        authenticateBuyer,
        authenticateDeliveryPartner,
        logoutUser,
        logoutFarmer,
        authStatusMessage,
        setAuthStatusMessage,
        notifications,
        unreadNotifCount,
        fetchFarmerNotifications,
        markNotificationsRead,
        FARMER_ACCOUNTS,
        BUYER_ACCOUNTS,
        DELIVERY_PARTNER_ACCOUNTS
      }}
    >
      {children}
    </AgriContext.Provider>
  );
}

export function useAgriContext() {
  const context = useContext(AgriContext);
  if (!context) {
    throw new Error('useAgriContext must be used within an AgriProvider');
  }
  return context;
}
