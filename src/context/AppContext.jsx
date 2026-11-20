import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { addDaysISO, makeBookingId, todayISO } from '../lib/utils';
import { productById } from '../data/products';

const STORAGE_KEY = 'borrowbox:state:v1';

const AppContext = createContext(null);

function seedBookings() {
  const today = todayISO();
  return [
    {
      id: 'BB-4821',
      productId: 'hd-projector',
      startDate: addDaysISO(today, 5),
      endDate: addDaysISO(today, 8),
      days: 4,
      rental: 480,
      deposit: 2000,
      total: 2480,
      createdAt: today,
      renter: 'Aarav Sharma',
      pickup: 'BorrowBox Hub · Gate 2',
    },
    {
      id: 'BB-4712',
      productId: 'sports-kit',
      startDate: addDaysISO(today, -2),
      endDate: addDaysISO(today, 1),
      days: 4,
      rental: 320,
      deposit: 500,
      total: 820,
      createdAt: addDaysISO(today, -4),
      renter: 'Aarav Sharma',
      pickup: 'BorrowBox Hub · Gate 2',
    },
    {
      id: 'BB-4509',
      productId: 'scientific-calculator',
      startDate: addDaysISO(today, -14),
      endDate: addDaysISO(today, -11),
      days: 4,
      rental: 120,
      deposit: 300,
      total: 420,
      createdAt: addDaysISO(today, -16),
      renter: 'Aarav Sharma',
      pickup: 'BorrowBox Hub · Gate 2',
    },
  ];
}

function loadStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.bookings)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const stored = useRef(loadStored()).current;
  const [user, setUser] = useState(stored?.user ?? null);
  const [bookings, setBookings] = useState(stored?.bookings ?? seedBookings());
  const [location, setLocation] = useState(stored?.location ?? 'Koramangala, Bengaluru');
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user, bookings, location })
      );
    } catch {
      /* storage unavailable — the prototype still works in memory */
    }
  }, [user, bookings, location]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  function notify(message) {
    setToast({ message, id: Date.now() });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }

  function signIn({ name, email }) {
    setUser({ name: name.trim(), email: email.trim() });
    notify(`Welcome, ${name.trim().split(' ')[0]}!`);
  }

  function signOut() {
    setUser(null);
    notify('You have been signed out.');
  }

  function addBooking(booking) {
    const product = productById[booking.productId];
    const record = {
      ...booking,
      id: makeBookingId(),
      createdAt: todayISO(),
      renter: booking.renter || user?.name || 'Guest student',
      pickup: booking.pickup || 'BorrowBox Hub · Gate 2',
      productName: product?.name,
    };
    setBookings((current) => [record, ...current]);
    notify('Booking confirmed — pickup details sent.');
    return record;
  }

  function completeBooking(id) {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id
          ? { ...booking, status: 'Completed', endDate: todayISO() }
          : booking
      )
    );
    notify('Item returned. Your deposit refund is on the way.');
  }

  const value = useMemo(
    () => ({
      user,
      bookings,
      location,
      setLocation,
      toast,
      notify,
      signIn,
      signOut,
      addBooking,
      completeBooking,
    }),
    [user, bookings, location, toast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
