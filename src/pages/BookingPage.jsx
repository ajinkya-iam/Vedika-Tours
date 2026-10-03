import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Car, Shield, CheckCircle, 
  HelpCircle, Phone, MessageCircle, AlertCircle, Info, Sparkles 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase, isSupabaseConfigured, DEFAULT_CARS, DEFAULT_PRICING } from '../lib/supabaseClient';
import { calculateRoadRoute, calculateFare, POPULAR_LOCATIONS } from '../lib/routingService';
import LocationInput from '../components/booking/LocationInput';
import RouteMap from '../components/booking/RouteMap';
import CarCard from '../components/booking/CarCard';
import { mockData } from '../mock';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // URL query params (e.g., if user clicked "Book Now" on a specific car from home page)
  const queryParams = new URLSearchParams(location.search);
  const preselectedCarName = queryParams.get('car');

  // Booking Flow States
  const [tripType, setTripType] = useState('one-way'); // 'one-way' | 'round-trip'
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnDate, setReturnDate] = useState(() => {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter.toISOString().split('T')[0];
  });

  // Locations & Route State
  const [pickupLocation, setPickupLocation] = useState({
    name: 'Panvel, Maharashtra',
    lat: 18.9894,
    lng: 73.1175
  });
  const [dropLocation, setDropLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Fleet & Pricing Data
  const [cars, setCars] = useState(DEFAULT_CARS);
  const [pricingSettings, setPricingSettings] = useState(DEFAULT_PRICING);
  const [selectedCar, setSelectedCar] = useState(DEFAULT_CARS[0]);

  // Passenger Details State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pickupAddressNote, setPickupAddressNote] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Submission / Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // 1. Fetch Cars & Pricing from Supabase on mount
  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        const { data: carsData, error: carsErr } = await supabase
          .from('cars')
          .select('*')
          .eq('is_active', true);

        if (!carsErr && carsData && carsData.length > 0) {
          setCars(carsData);
          // Match preselected car or default to first
          if (preselectedCarName) {
            const found = carsData.find(c => c.name.toLowerCase().includes(preselectedCarName.toLowerCase()));
            if (found) setSelectedCar(found);
            else setSelectedCar(carsData[0]);
          } else {
            setSelectedCar(carsData[0]);
          }
        }

        const { data: settingsData, error: settingsErr } = await supabase
          .from('pricing_settings')
          .select('*')
          .limit(1)
          .single();

        if (!settingsErr && settingsData) {
          setPricingSettings(settingsData);
        }
      } catch (e) {
        console.warn('Using local fleet data fallback:', e);
      }
    }

    loadData();
  }, [preselectedCarName]);

  // 2. Recalculate Road Route when Pickup or Drop changes
  useEffect(() => {
    if (!pickupLocation || !dropLocation) {
      setRouteInfo(null);
      return;
    }

    let isMounted = true;
    async function updateRoute() {
      setIsCalculatingRoute(true);
      const res = await calculateRoadRoute(pickupLocation, dropLocation);
      if (isMounted) {
        setRouteInfo(res);
        setIsCalculatingRoute(false);
      }
    }

    updateRoute();
    return () => {
      isMounted = false;
    };
  }, [pickupLocation, dropLocation]);

  // Calculate Fare for selected car
  const currentFare = selectedCar && routeInfo?.distanceKm
    ? calculateFare({
        distanceKm: routeInfo.distanceKm,
        tripType,
        car: selectedCar,
        pricingSettings,
        pickupTime
      })
    : null;

  // Handle Form Submission
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!pickupLocation || !dropLocation) {
      alert('Please select both Pickup and Drop locations.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your full name and phone number.');
      return;
    }

    if (customerPhone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    const bookingNumber = `VT-${Date.now().toString().slice(-6)}`;

    const bookingPayload = {
      booking_number: bookingNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      trip_type: tripType,
      pickup_location: `${pickupLocation.name} ${pickupAddressNote ? `(${pickupAddressNote})` : ''}`,
      pickup_lat: pickupLocation.lat,
      pickup_lng: pickupLocation.lng,
      drop_location: dropLocation.name,
      drop_lat: dropLocation.lat,
      drop_lng: dropLocation.lng,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      return_date: tripType === 'round-trip' ? returnDate : null,
      car_id: selectedCar.id,
      car_name: selectedCar.name,
      total_km: currentFare?.totalTripKm || routeInfo?.distanceKm || 0,
      billable_km: currentFare?.billableKm || 0,
      km_rate: selectedCar.price_per_km,
      base_fare: selectedCar.base_fare || 0,
      km_charge: currentFare?.kmCharge || 0,
      night_charge: currentFare?.nightCharge || 0,
      driver_allowance: currentFare?.driverAllowance || 0,
      total_estimated_price: currentFare?.estimatedTotal || 0,
      special_requests: specialRequests || null,
      id: `b-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    // Save to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('bookings').insert([bookingPayload]);
        if (error) {
          console.warn('Could not save to Supabase, saving locally:', error);
        }
      } catch (err) {
        console.warn('Supabase insert error, saving locally:', err);
      }
    }

    // Always keep localStorage updated so Admin Dashboard instantly displays it
    try {
      const existing = JSON.parse(localStorage.getItem('vt_demo_bookings') || '[]');
      const updated = [bookingPayload, ...existing.filter(b => b.booking_number !== bookingPayload.booking_number)];
      localStorage.setItem('vt_demo_bookings', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    setIsSubmitting(false);
    setConfirmedBooking(bookingPayload);
  };

  // Prepares WhatsApp text message for instant owner alert
  const getWhatsAppBookingLink = () => {
    if (!confirmedBooking) return '#';
    const text = `*New Booking Request: ${confirmedBooking.booking_number}*
------------------------------
👤 *Customer:* ${confirmedBooking.customer_name}
📞 *Phone:* ${confirmedBooking.customer_phone}
🚗 *Car:* ${confirmedBooking.car_name}
🔄 *Trip Type:* ${confirmedBooking.trip_type === 'round-trip' ? 'Round Trip' : 'One Way'}
📍 *Pickup:* ${confirmedBooking.pickup_location}
🏁 *Drop:* ${confirmedBooking.drop_location}
📅 *Date & Time:* ${confirmedBooking.pickup_date} at ${confirmedBooking.pickup_time}
${confirmedBooking.return_date ? `🔙 *Return Date:* ${confirmedBooking.return_date}\n` : ''}🛣️ *Total Distance:* ~${confirmedBooking.total_km} KM
💰 *Estimated Fare:* ₹${confirmedBooking.total_estimated_price}
${confirmedBooking.special_requests ? `📝 *Notes:* ${confirmedBooking.special_requests}\n` : ''}------------------------------
_Please confirm my cab booking._`;

    return `https://wa.me/${mockData.company.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center space-x-2">
            <img src={mockData.company.logo} alt="Vedika Tours" className="h-10 w-auto" />
            <span className="font-extrabold text-gray-900 hidden sm:inline">
              Vedika Tours & Travels
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`tel:${mockData.company.phone}`}
              className="hidden sm:inline-flex items-center text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
            >
              <Phone className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
              <span>Need Help? Call Us</span>
            </a>
          </div>
        </div>
      </header>

      {/* Confirmation View */}
      {confirmedBooking ? (
        <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Booking Reference: {confirmedBooking.booking_number}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
                Booking Request Received!
              </h1>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Thank you, <strong>{confirmedBooking.customer_name}</strong>! We have registered your booking request. Our team will contact you shortly to confirm driver assignment.
              </p>
            </div>

            {/* Trip Summary Card */}
            <div className="bg-gray-50 rounded-2xl p-5 text-left text-sm space-y-3 border border-gray-100">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="font-semibold text-gray-700">Vehicle:</span>
                <span className="font-bold text-gray-900">{confirmedBooking.car_name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="font-semibold text-gray-700">Trip:</span>
                <span className="capitalize font-medium text-gray-800">
                  {confirmedBooking.trip_type} (~{confirmedBooking.total_km} KM)
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="font-semibold text-gray-700">Pickup Date & Time:</span>
                <span className="font-medium text-gray-800">
                  {confirmedBooking.pickup_date} at {confirmedBooking.pickup_time}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 text-base">
                <span className="font-bold text-gray-900">Total Estimate:</span>
                <span className="font-extrabold text-orange-600 text-lg">
                  ₹{confirmedBooking.total_estimated_price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Instant WhatsApp CTA */}
            <div className="pt-2 space-y-3">
              <a
                href={getWhatsAppBookingLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-green-600/20 transition-all text-base"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Confirm Instantly via WhatsApp</span>
              </a>

              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Return to Homepage
              </Button>
            </div>
          </div>
        </main>
      ) : (
        /* Main Booking View */
        <main className="flex-1 container mx-auto px-4 py-8 lg:py-10 max-w-7xl">
          {/* Header Title */}
          <div className="mb-8">
            <span className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Easy 3-Step Booking</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Book Your Cab with Transparent KM Pricing
            </h1>
            <p className="text-gray-600 text-sm mt-1 max-w-2xl">
              Select your pickup & drop points on the live map, calculate exact road distance, compare car rates, and reserve with zero upfront charges.
            </p>
          </div>

          <form onSubmit={handleSubmitBooking}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Route, Map & Car Selection */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Trip Type & Schedule */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black">1</span>
                      <span>Trip & Schedule</span>
                    </span>

                    {/* Trip Type Toggle */}
                    <div className="flex items-center p-1 bg-gray-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setTripType('one-way')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          tripType === 'one-way'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        One Way
                      </button>
                      <button
                        type="button"
                        onClick={() => setTripType('round-trip')}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          tripType === 'round-trip'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Round Trip
                      </button>
                    </div>
                  </div>

                  {/* Date & Time Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Pickup Date</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Pickup Time</span>
                      </label>
                      <input
                        type="time"
                        required
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    {tripType === 'round-trip' && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" />
                          <span>Return Date</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Pickup & Drop Locations + Interactive Map */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
                  <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black">2</span>
                      <span>Route & Map Distance</span>
                    </span>

                    {routeInfo && (
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                        {routeInfo.distanceKm} km Road Route
                      </span>
                    )}
                  </div>

                  {/* Location Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LocationInput
                      label="Pickup Location"
                      placeholder="Enter pickup city, landmark..."
                      value={pickupLocation}
                      onSelectLocation={setPickupLocation}
                      dotColor="bg-green-500"
                      quickLocations={POPULAR_LOCATIONS.slice(0, 4)}
                    />

                    <LocationInput
                      label="Drop Location"
                      placeholder="Enter destination city, temple..."
                      value={dropLocation}
                      onSelectLocation={setDropLocation}
                      dotColor="bg-orange-500"
                      quickLocations={POPULAR_LOCATIONS.slice(2, 6)}
                    />
                  </div>

                  {/* Live Interactive Leaflet Map */}
                  <div className="pt-2">
                    <RouteMap
                      pickup={pickupLocation}
                      drop={dropLocation}
                      routeCoordinates={routeInfo?.coordinates}
                      distanceKm={routeInfo?.distanceKm}
                      durationMin={routeInfo?.durationMin}
                    />
                  </div>
                </div>

                {/* 3. Car Options */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black">3</span>
                      <span>Select Vehicle</span>
                    </span>
                    <span className="text-xs text-gray-400">
                      {cars.length} Fleet Options
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cars.map((car) => {
                      const fare = routeInfo?.distanceKm
                        ? calculateFare({
                            distanceKm: routeInfo.distanceKm,
                            tripType,
                            car,
                            pricingSettings,
                            pickupTime
                          })
                        : null;

                      return (
                        <CarCard
                          key={car.id}
                          car={car}
                          fare={fare}
                          distanceKm={routeInfo?.distanceKm}
                          isSelected={selectedCar?.id === car.id}
                          onSelect={setSelectedCar}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Passenger Info & Fare Summary Sticky Sidebar */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                {/* Fare Breakdown Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Fare Summary</h3>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                      {selectedCar?.name}
                    </span>
                  </div>

                  {routeInfo?.distanceKm ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Trip Type</span>
                        <span className="font-semibold text-gray-900 capitalize">
                          {tripType === 'round-trip' ? 'Round Trip (2x KM)' : 'One Way'}
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>Est. Driving Distance</span>
                        <span className="font-semibold text-gray-900">
                          {currentFare?.totalTripKm} KM
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>Vehicle Rate ({selectedCar?.name})</span>
                        <span className="font-semibold text-gray-900">
                          ₹{selectedCar?.price_per_km}/km
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>
                          Distance Charges
                          {currentFare?.billableKm > currentFare?.totalTripKm && (
                            <span className="block text-[10px] text-gray-400">
                              (Min {currentFare?.billableKm} KM daily billing applied)
                            </span>
                          )}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ₹{currentFare?.kmCharge.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>Driver Allowance (Bata)</span>
                        <span className="font-semibold text-gray-900">
                          ₹{currentFare?.driverAllowance}
                        </span>
                      </div>

                      {currentFare?.isNightChargeApplicable && (
                        <div className="flex justify-between text-orange-700 bg-orange-50 p-2 rounded-lg">
                          <span className="text-xs font-semibold">
                            Night Charge ({pricingSettings.night_start_time} - {pricingSettings.night_end_time})
                          </span>
                          <span className="font-bold">
                            +₹{currentFare?.nightCharge}
                          </span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                        <div>
                          <div className="text-xs font-bold uppercase text-gray-500">Estimated Total</div>
                          <div className="text-[11px] text-gray-400">Excl. tolls & parking (actuals)</div>
                        </div>
                        <div className="text-2xl font-black text-orange-600">
                          ₹{currentFare?.estimatedTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-gray-400 text-sm space-y-2">
                      <MapPin className="w-8 h-8 mx-auto text-gray-300" />
                      <p>Enter your Drop Location on the left to calculate real road distance and price breakdown.</p>
                    </div>
                  )}

                  {/* Toll / Note Disclaimer */}
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>{pricingSettings.toll_parking_note}</span>
                  </div>
                </div>

                {/* Passenger Information Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
                    Passenger Details
                  </h3>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kadam"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Mobile Number (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98200XXXXX"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. ramesh@gmail.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Exact Pickup Address / Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Flat 402, Sai Heights, Sector 12"
                        value={pickupAddressNote}
                        onChange={(e) => setPickupAddressNote(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Special Notes (Optional)
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Luggage count, baby seat, senior citizen assistance..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !routeInfo?.distanceKm}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-orange-600/20 text-base transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Confirming Booking...' : 'Request Cab Reservation'}
                  </Button>

                  <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-500 pt-1">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    <span>Pay after your ride. No advance deposit required.</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </main>
      )}

      {/* Footer minimal */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 mt-auto">
        <p>© 2026 Vedika Tours & Travels, Panvel. All rights reserved.</p>
      </footer>
    </div>
  );
}
