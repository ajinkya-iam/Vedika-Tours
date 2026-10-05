import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Car, CalendarCheck, Settings, LogOut, Plus, Trash2, Edit2, CheckCircle2, 
  Clock, Phone, MessageCircle, AlertCircle, Save, ExternalLink, RefreshCw,
  Search, Eye, Database, Copy, Check, ShieldCheck, X, ChevronRight, TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { supabase, isSupabaseConfigured, DEFAULT_CARS, DEFAULT_PRICING, getCarImageUrl } from '../../lib/supabaseClient';
import { mockData } from '../../mock';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'cars' | 'pricing'
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({ checked: false, tablesReady: false, error: null });
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Data States
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState(DEFAULT_CARS);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);

  // Search & Filter state for bookings
  const [bookingFilter, setBookingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Booking Details Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Modal / Form state for Add/Edit Car
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [carFormData, setCarFormData] = useState({
    name: '',
    category: 'Sedan',
    seating_capacity: 4,
    luggage_capacity: 2,
    image_url: '',
    price_per_km: 14,
    base_fare: 1500,
    min_km_per_day: 250,
    has_ac: true,
    is_active: true
  });

  // Check Auth on mount
  useEffect(() => {
    const isAuth = localStorage.getItem('vt_admin_authenticated');
    if (!isAuth) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Check Supabase connection and tables readiness
  const checkSupabaseHealth = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setDbStatus({ checked: true, tablesReady: false, error: 'Supabase credentials not configured.' });
      return;
    }

    try {
      const { data, error } = await supabase.from('cars').select('id').limit(1);
      if (error) {
        setDbStatus({ checked: true, tablesReady: false, error: error.message });
      } else {
        setDbStatus({ checked: true, tablesReady: true, error: null });
      }
    } catch (e) {
      setDbStatus({ checked: true, tablesReady: false, error: e.message });
    }
  };

  // Load Dashboard Data
  const loadDashboardData = async () => {
    setIsLoading(true);
    await checkSupabaseHealth();

    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Fetch Bookings
        const { data: bookingsData, error: bErr } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (!bErr && bookingsData && bookingsData.length > 0) {
          const stored = JSON.parse(localStorage.getItem('vt_demo_bookings') || '[]').filter(
            (b) => !b.id?.startsWith('b-demo-') && !['VT-834921', 'VT-834922', 'VT-834923'].includes(b.booking_number)
          );
          const combined = [...bookingsData];
          stored.forEach((s) => {
            if (!combined.some((c) => c.booking_number === s.booking_number)) {
              combined.push(s);
            }
          });
          setBookings(combined);
        } else {
          // Fallback to local demo bookings if table not ready or returned empty
          loadLocalDemoBookings();
        }

        // 2. Fetch Cars
        const { data: carsData, error: cErr } = await supabase
          .from('cars')
          .select('*')
          .order('created_at', { ascending: true });

        if (!cErr && carsData && carsData.length > 0) {
          const normalizedCars = carsData.map(c => ({
            ...c,
            image_url: getCarImageUrl(c.image_url, c.name)
          }));
          setCars(normalizedCars);
          const disabledNames = normalizedCars.filter(c => !c.is_active).map(c => c.name);
          localStorage.setItem('vt_disabled_cars', JSON.stringify(disabledNames));
        }

        // 3. Fetch Pricing
        const { data: pricingData, error: pErr } = await supabase
          .from('pricing_settings')
          .select('*')
          .limit(1)
          .single();

        if (!pErr && pricingData) {
          setPricing(pricingData);
        }
      } catch (err) {
        console.warn('Error querying Supabase:', err);
        loadLocalDemoBookings();
      }
    } else {
      loadLocalDemoBookings();
    }

    setIsLoading(false);
  };

  const loadLocalDemoBookings = () => {
    try {
      const stored = localStorage.getItem('vt_demo_bookings');
      if (stored) {
        // Strip any legacy sample bookings
        const realBookings = JSON.parse(stored).filter(
          (b) => !b.id?.startsWith('b-demo-') && !['VT-834921', 'VT-834922', 'VT-834923'].includes(b.booking_number)
        );
        setBookings(realBookings);
        localStorage.setItem('vt_demo_bookings', JSON.stringify(realBookings));
      } else {
        setBookings([]);
      }
    } catch (e) {
      setBookings([]);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    if (isSupabaseConfigured && supabase && dbStatus.tablesReady) {
      try {
        await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
      } catch (err) {
        console.warn('Error updating status in Supabase:', err);
      }
    }

    setBookings((prev) => {
      const updated = prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b));
      localStorage.setItem('vt_demo_bookings', JSON.stringify(updated));
      return updated;
    });

    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Delete / Cancel Booking
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to remove this booking?')) return;

    if (isSupabaseConfigured && supabase && dbStatus.tablesReady) {
      try {
        await supabase.from('bookings').delete().eq('id', bookingId);
      } catch (err) {
        console.warn('Error deleting from Supabase:', err);
      }
    }

    setBookings((prev) => {
      const updated = prev.filter((b) => b.id !== bookingId);
      localStorage.setItem('vt_demo_bookings', JSON.stringify(updated));
      return updated;
    });

    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking(null);
    }
  };

  // Car Management: Save (Create / Update)
  const handleSaveCar = async (e) => {
    e.preventDefault();

    if (isSupabaseConfigured && supabase && dbStatus.tablesReady) {
      try {
        if (editingCar) {
          await supabase.from('cars').update(carFormData).eq('id', editingCar.id);
        } else {
          await supabase.from('cars').insert([carFormData]);
        }
      } catch (err) {
        console.warn('Error saving car to Supabase:', err);
      }
    }

    if (editingCar) {
      setCars(cars.map((c) => (c.id === editingCar.id ? { ...c, ...carFormData } : c)));
    } else {
      const newCar = {
        ...carFormData,
        id: `c-${Date.now()}`
      };
      setCars([...cars, newCar]);
    }

    setIsCarModalOpen(false);
    setEditingCar(null);
  };

  const handleToggleCarActive = async (car) => {
    const updatedStatus = !car.is_active;
    if (isSupabaseConfigured && supabase && dbStatus.tablesReady) {
      try {
        const { error } = await supabase.from('cars').update({ is_active: updatedStatus }).eq('id', car.id);
        if (error) console.error('Error toggling active status in Supabase:', error);
      } catch (err) {
        console.warn('Error toggling active status:', err);
      }
    }

    const updatedCars = cars.map((c) => (c.id === car.id ? { ...c, is_active: updatedStatus } : c));
    setCars(updatedCars);

    const disabledNames = updatedCars.filter((c) => !c.is_active).map((c) => c.name);
    localStorage.setItem('vt_disabled_cars', JSON.stringify(disabledNames));
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to remove this car from the fleet?')) return;

    if (isSupabaseConfigured && supabase && dbStatus.tablesReady) {
      try {
        await supabase.from('cars').delete().eq('id', carId);
      } catch (err) {
        console.warn('Error deleting car from Supabase:', err);
      }
    }

    setCars(cars.filter((c) => c.id !== carId));
  };

  // Pricing: Save
  const handleSavePricing = async (e) => {
    e.preventDefault();

    if (isSupabaseConfigured && supabase && dbStatus.tablesReady) {
      try {
        const { data: existing } = await supabase.from('pricing_settings').select('id').limit(1);
        if (existing && existing.length > 0) {
          await supabase.from('pricing_settings').update(pricing).eq('id', existing[0].id);
        } else {
          await supabase.from('pricing_settings').insert([pricing]);
        }
      } catch (err) {
        console.warn('Error saving pricing to Supabase:', err);
      }
    }

    alert('Pricing rules updated successfully!');
  };

  // Logout
  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem('vt_admin_authenticated');
    navigate('/admin/login');
  };

  // Filter and search bookings
  const filteredBookings = bookings
    .filter((b) => (bookingFilter === 'all' ? true : b.status === bookingFilter))
    .filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.customer_name?.toLowerCase().includes(q) ||
        b.booking_number?.toLowerCase().includes(q) ||
        b.customer_phone?.includes(q) ||
        b.drop_location?.toLowerCase().includes(q) ||
        b.car_name?.toLowerCase().includes(q)
      );
    });

  // Calculate Metrics
  const totalRevenueEstimate = bookings.reduce((sum, b) => sum + (Number(b.total_estimated_price) || 0), 0);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

  const copySqlToClipboard = () => {
    const sqlText = `-- Copy and run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    seating_capacity INTEGER NOT NULL DEFAULT 4,
    luggage_capacity INTEGER NOT NULL DEFAULT 2,
    image_url TEXT,
    price_per_km NUMERIC(10, 2) NOT NULL DEFAULT 12.00,
    base_fare NUMERIC(10, 2) NOT NULL DEFAULT 1500.00,
    min_km_per_day NUMERIC(10, 2) NOT NULL DEFAULT 250.00,
    has_ac BOOLEAN DEFAULT TRUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pricing_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    night_charge_amount NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    night_start_time TEXT NOT NULL DEFAULT '22:00',
    night_end_time TEXT NOT NULL DEFAULT '06:00',
    driver_allowance_per_day NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    toll_parking_note TEXT DEFAULT 'Toll, parking, and state permits are to be paid directly as per actual receipts.',
    is_gst_enabled BOOLEAN DEFAULT FALSE,
    gst_percentage NUMERIC(5, 2) DEFAULT 5.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    trip_type TEXT NOT NULL DEFAULT 'one-way',
    pickup_location TEXT NOT NULL,
    pickup_lat NUMERIC(10, 6),
    pickup_lng NUMERIC(10, 6),
    drop_location TEXT NOT NULL,
    drop_lat NUMERIC(10, 6),
    drop_lng NUMERIC(10, 6),
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    return_date DATE,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    car_name TEXT,
    total_km NUMERIC(10, 2) NOT NULL,
    billable_km NUMERIC(10, 2) NOT NULL,
    km_rate NUMERIC(10, 2) NOT NULL,
    base_fare NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    km_charge NUMERIC(10, 2) NOT NULL,
    night_charge NUMERIC(10, 2) DEFAULT 0.00,
    driver_allowance NUMERIC(10, 2) DEFAULT 0.00,
    total_estimated_price NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active cars" ON public.cars FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can manage cars" ON public.cars FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can view pricing settings" ON public.pricing_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated admins can manage pricing settings" ON public.pricing_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated admins can manage bookings" ON public.bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={mockData.company.logo} alt="Vedika Tours" className="h-10 w-auto" />
            <div>
              <span className="font-extrabold text-gray-900 text-sm sm:text-base block">
                Vedika Tours Admin
              </span>
              <div className="flex items-center space-x-1.5 text-[11px]">
                {dbStatus.tablesReady ? (
                  <span className="text-green-600 font-semibold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Supabase DB Active</span>
                  </span>
                ) : (
                  <span className="text-amber-600 font-semibold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Demo Mode (Supabase Setup Pending)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {!dbStatus.tablesReady && (
              <button
                onClick={() => setShowSqlModal(true)}
                className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-orange-600" />
                <span>Supabase Setup SQL</span>
              </button>
            )}

            <Link
              to="/"
              target="_blank"
              className="text-xs font-semibold text-gray-600 hover:text-orange-600 flex items-center space-x-1 py-1.5 px-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 py-1.5 px-3 rounded-lg transition-colors flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6 sm:py-8 flex-1 max-w-7xl">
        {/* Supabase Notice Banner if tables aren't run yet */}
        {!dbStatus.tablesReady && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <Database className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="font-bold block text-sm">Supabase Project Connected!</strong>
                <span>Tables (cars, bookings, pricing) need to be created in your Supabase SQL Editor.</span>
              </div>
            </div>
            <button
              onClick={() => setShowSqlModal(true)}
              className="font-bold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-xl transition-colors shadow-sm shrink-0"
            >
              View & Copy SQL Script
            </button>
          </div>
        )}

        {/* Overview Metric Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Total Bookings</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">{bookings.length}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Pending Requests</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Confirmed Trips</span>
              <span className="text-2xl font-black text-green-600 mt-1 block">{confirmedCount}</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Total Booking Value</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                ₹{totalRevenueEstimate.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex space-x-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'bookings'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Bookings ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cars')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'cars'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Fleet Cars ({cars.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'pricing'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pricing & Rules</span>
            </button>
          </div>

          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-orange-600 bg-white px-3.5 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: BOOKINGS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search passenger, phone, ref number, or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilter(st)}
                    className={`text-xs capitalize font-bold px-3 py-1.5 rounded-lg border transition-all ${
                      bookingFilter === st
                        ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List Cards */}
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-200">
                <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-gray-800 text-base">No bookings match your criteria</h4>
                <p className="text-xs mt-1">Try resetting search filters or place a booking from the website.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                          {b.booking_number}
                        </span>
                        <span className="font-bold text-gray-900 text-base">
                          {b.customer_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {b.pickup_date} at {b.pickup_time}
                        </span>
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex items-center space-x-2">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${
                            b.status === 'confirmed'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : b.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : b.status === 'completed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Trip Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400 block mb-0.5">Route & Trip</span>
                        <div className="font-semibold text-gray-800 line-clamp-1">
                          {b.pickup_location} → {b.drop_location}
                        </div>
                        <div className="text-gray-500 capitalize mt-0.5">
                          {b.trip_type} (~{b.total_km} km)
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-0.5">Vehicle Assigned</span>
                        <div className="font-bold text-gray-900">{b.car_name}</div>
                        <div className="text-gray-500 mt-0.5">Rate: ₹{b.km_rate}/km</div>
                      </div>

                      <div>
                        <span className="text-gray-400 block mb-0.5">Estimated Fare</span>
                        <div className="text-base font-extrabold text-orange-600">
                          ₹{b.total_estimated_price?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar: Direct WhatsApp, Call, and Details button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 flex items-center space-x-2">
                        <span>📞 Phone: <strong className="text-gray-900">{b.customer_phone}</strong></span>
                        {b.special_requests && (
                          <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            Has Notes
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>

                        <a
                          href={`tel:${b.customer_phone}`}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-orange-600" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/91${b.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hello ${b.customer_name}, regarding your Vedika Tours booking (${b.booking_number}) for ${b.car_name} on ${b.pickup_date}: Your trip is confirmed! Driver details will follow shortly.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CAR FLEET MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'cars' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manage Fleet & KM Pricing</h3>
                <p className="text-xs text-gray-500">Add, edit, adjust per-KM rates and toggle available vehicles</p>
              </div>

              <Button
                onClick={() => {
                  setEditingCar(null);
                  setCarFormData({
                    name: '',
                    category: 'Sedan',
                    seating_capacity: 4,
                    luggage_capacity: 2,
                    image_url: '',
                    price_per_km: 14,
                    base_fare: 1500,
                    min_km_per_day: 250,
                    has_ac: true,
                    is_active: true
                  });
                  setIsCarModalOpen(true);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center space-x-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Vehicle</span>
              </Button>
            </div>

            {/* Cars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                    car.is_active ? 'border-gray-200' : 'border-gray-200 bg-gray-50/70 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase">
                        {car.category}
                      </span>
                      <button
                        onClick={() => handleToggleCarActive(car)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                          car.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {car.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-gray-900">{car.name}</h4>

                    <img
                      src={getCarImageUrl(car.image_url, car.name)}
                      alt={car.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getCarImageUrl(null, car.name);
                      }}
                      className="w-full h-32 object-contain my-3 rounded-lg bg-gray-50/50 p-2"
                    />

                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rate per KM:</span>
                        <span className="font-bold text-gray-900">₹{car.price_per_km}/km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Min Daily KM:</span>
                        <span className="font-semibold text-gray-800">{car.min_km_per_day} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Capacity:</span>
                        <span className="font-semibold text-gray-800">{car.seating_capacity} Seats ({car.has_ac ? 'AC' : 'Non-AC'})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleCarActive(car)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-800"
                    >
                      {car.is_active ? 'Disable' : 'Enable'}
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingCar(car);
                          setCarFormData(car);
                          setIsCarModalOpen(true);
                        }}
                        className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit vehicle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCar(car.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PRICING & RULES */}
        {/* ========================================================================= */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Global Fare Rules & Surcharges</h3>
            <p className="text-xs text-gray-500 mb-6">
              Configure night charges, driver daily allowance (bata), and toll disclaimers.
            </p>

            <form onSubmit={handleSavePricing} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Night Charge Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={pricing.night_charge_amount}
                    onChange={(e) => setPricing({ ...pricing, night_charge_amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Driver Daily Bata (₹)
                  </label>
                  <input
                    type="number"
                    value={pricing.driver_allowance_per_day}
                    onChange={(e) => setPricing({ ...pricing, driver_allowance_per_day: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Night Window Start
                  </label>
                  <input
                    type="time"
                    value={pricing.night_start_time}
                    onChange={(e) => setPricing({ ...pricing, night_start_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Night Window End
                  </label>
                  <input
                    type="time"
                    value={pricing.night_end_time}
                    onChange={(e) => setPricing({ ...pricing, night_end_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Toll, Taxes & Parking Disclaimer Note
                </label>
                <textarea
                  rows="3"
                  value={pricing.toll_parking_note}
                  onChange={(e) => setPricing({ ...pricing, toll_parking_note: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                ></textarea>
              </div>

              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md flex items-center space-x-2 text-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Pricing Changes</span>
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOOKING DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md">
                  {selectedBooking.booking_number}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">Booking Details</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                <span className="font-bold text-gray-700 uppercase tracking-wider block text-[10px]">Passenger</span>
                <div className="text-sm font-extrabold text-gray-900">{selectedBooking.customer_name}</div>
                <div>📞 Phone: <strong>{selectedBooking.customer_phone}</strong></div>
                {selectedBooking.customer_email && <div>✉️ Email: {selectedBooking.customer_email}</div>}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                <span className="font-bold text-gray-700 uppercase tracking-wider block text-[10px]">Trip Details</span>
                <div><strong>Pickup:</strong> {selectedBooking.pickup_location}</div>
                <div><strong>Drop:</strong> {selectedBooking.drop_location}</div>
                <div><strong>Date & Time:</strong> {selectedBooking.pickup_date} at {selectedBooking.pickup_time}</div>
                <div><strong>Type:</strong> <span className="capitalize">{selectedBooking.trip_type}</span></div>
                <div><strong>Distance:</strong> ~{selectedBooking.total_km} KM</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                <span className="font-bold text-gray-700 uppercase tracking-wider block text-[10px]">Fare Breakdown</span>
                <div className="flex justify-between">
                  <span>Vehicle Rate ({selectedBooking.car_name}):</span>
                  <span>₹{selectedBooking.km_rate}/km</span>
                </div>
                <div className="flex justify-between">
                  <span>KM Charges:</span>
                  <span>₹{selectedBooking.km_charge || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Driver Bata:</span>
                  <span>₹{selectedBooking.driver_allowance || 300}</span>
                </div>
                {selectedBooking.night_charge > 0 && (
                  <div className="flex justify-between text-orange-600 font-semibold">
                    <span>Night Charges:</span>
                    <span>+₹{selectedBooking.night_charge}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Estimated Price:</span>
                  <span className="text-orange-600">₹{selectedBooking.total_estimated_price?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div className="p-3 bg-orange-50 text-orange-900 rounded-xl">
                  <span className="font-bold block text-[10px] uppercase tracking-wider mb-1">Special Notes</span>
                  {selectedBooking.special_requests}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={`https://wa.me/91${selectedBooking.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${selectedBooking.customer_name}, your booking (${selectedBooking.booking_number}) with Vedika Tours is confirmed!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message on WhatsApp</span>
              </a>

              <a
                href={`tel:${selectedBooking.customer_phone}`}
                className="inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 py-2.5 px-4 rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT CAR MODAL */}
      {/* ========================================================================= */}
      {isCarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingCar ? 'Edit Vehicle' : 'Add New Vehicle to Fleet'}
            </h3>

            <form onSubmit={handleSaveCar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Vehicle Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maruti Ertiga"
                  value={carFormData.name}
                  onChange={(e) => setCarFormData({ ...carFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={carFormData.category}
                    onChange={(e) => setCarFormData({ ...carFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="MPV">MPV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Mini Bus">Mini Bus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={carFormData.seating_capacity}
                    onChange={(e) => setCarFormData({ ...carFormData, seating_capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Rate per KM (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={carFormData.price_per_km}
                    onChange={(e) => setCarFormData({ ...carFormData, price_per_km: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Min KM / Day
                  </label>
                  <input
                    type="number"
                    value={carFormData.min_km_per_day}
                    onChange={(e) => setCarFormData({ ...carFormData, min_km_per_day: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={carFormData.image_url}
                  onChange={(e) => setCarFormData({ ...carFormData, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={carFormData.has_ac}
                    onChange={(e) => setCarFormData({ ...carFormData, has_ac: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                  />
                  <span>Air Conditioned (AC)</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={carFormData.is_active}
                    onChange={(e) => setCarFormData({ ...carFormData, is_active: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                  />
                  <span>Active on Website</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCarModalOpen(false)}
                  className="border-gray-200 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  Save Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUPABASE SQL SETUP MODAL */}
      {/* ========================================================================= */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">Supabase Database Setup</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-2">
              <p>
                To enable real-time storage in your Supabase project (<code>lfbghthrwujiieimbkfg.supabase.co</code>), follow these quick steps:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Log in to your <strong>Supabase Dashboard</strong>.</li>
                <li>Go to <strong>SQL Editor</strong> on the left sidebar.</li>
                <li>Click <strong>New query</strong>, paste the script below, and click <strong>Run</strong>.</li>
              </ol>
            </div>

            <div className="relative">
              <button
                onClick={copySqlToClipboard}
                className="absolute top-3 right-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
              <pre className="p-4 bg-gray-900 text-gray-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64 leading-relaxed">
                {`-- Supabase SQL Schema for Vedika Tours
-- See supabase_schema.sql in project root
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.cars ( ... );
CREATE TABLE public.pricing_settings ( ... );
CREATE TABLE public.bookings ( ... );`}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setShowSqlModal(false)}
                className="bg-gray-900 hover:bg-black text-white font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
