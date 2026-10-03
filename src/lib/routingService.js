/**
 * Routing & Geocoding Service using OpenStreetMap (Nominatim) and OSRM.
 * 100% Free, no API keys required.
 */

// Debounced Nominatim Geocoder for searching locations in India
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&countrycodes=in&limit=6&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch locations');

    const data = await response.json();
    return data.map((item) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.name || item.display_name.split(',')[0]
    }));
  } catch (error) {
    console.warn('Geocoding search warning:', error);
    return [];
  }
}

// Popular quick locations for Vedika Tours (Panvel / Maharashtra)
export const POPULAR_LOCATIONS = [
  { name: 'Panvel, Navi Mumbai', lat: 18.9894, lng: 73.1175 },
  { name: 'Mumbai Airport (BOM) T2', lat: 19.0896, lng: 72.8656 },
  { name: 'Pune Station', lat: 18.5284, lng: 73.8744 },
  { name: 'Shirdi Sai Baba Temple', lat: 19.7667, lng: 74.4764 },
  { name: 'Mahabaleshwar Main Market', lat: 17.9237, lng: 73.6586 },
  { name: 'Lonavala Market', lat: 18.7557, lng: 73.4091 },
  { name: 'Alibaug Beach', lat: 18.6414, lng: 72.8722 },
  { name: 'Nashik CBS', lat: 19.9975, lng: 73.7898 }
];

// OSRM Driving Distance and Road Polyline Calculation
export async function calculateRoadRoute(pickup, drop) {
  if (!pickup || !drop) return null;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM routing request failed');

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMin = Math.round(route.duration / 60);

      // Coordinates in Leaflet format [lat, lng]
      const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      return {
        distanceKm,
        durationMin,
        coordinates,
        isEstimatedRoad: true
      };
    }
  } catch (error) {
    console.warn('OSRM routing fallback to Haversine with road curvature factor:', error);
  }

  // Fallback: Haversine distance with 1.3x road tortuosity factor
  const directKm = calculateHaversineKm(pickup.lat, pickup.lng, drop.lat, drop.lng);
  const roadKm = Math.round(directKm * 1.3 * 10) / 10;
  return {
    distanceKm: roadKm,
    durationMin: Math.round(roadKm * 1.5), // approx 40 km/h average
    coordinates: [
      [pickup.lat, pickup.lng],
      [drop.lat, drop.lng]
    ],
    isEstimatedRoad: false
  };
}

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate Price Breakdown given trip parameters, car, and pricing settings
export function calculateFare({
  distanceKm,
  tripType, // 'one-way' | 'round-trip'
  car,
  pricingSettings,
  pickupTime // 'HH:MM'
}) {
  const totalTripKm = tripType === 'round-trip' ? distanceKm * 2 : distanceKm;
  const minKm = car.min_km_per_day || 250;
  const billableKm = Math.max(totalTripKm, minKm);
  const kmRate = car.price_per_km || 14;
  const baseFare = car.base_fare || 0;

  const kmCharge = Math.round(billableKm * kmRate);

  // Check night charge
  let isNightChargeApplicable = false;
  const nightAmount = pricingSettings?.night_charge_amount || 300;
  const nightStart = pricingSettings?.night_start_time || '22:00';
  const nightEnd = pricingSettings?.night_end_time || '06:00';

  if (pickupTime) {
    if (nightStart > nightEnd) {
      // Overnight (e.g. 22:00 to 06:00)
      if (pickupTime >= nightStart || pickupTime <= nightEnd) {
        isNightChargeApplicable = true;
      }
    } else {
      if (pickupTime >= nightStart && pickupTime <= nightEnd) {
        isNightChargeApplicable = true;
      }
    }
  }

  const nightCharge = isNightChargeApplicable ? nightAmount : 0;
  const driverAllowance = pricingSettings?.driver_allowance_per_day || 300;

  const estimatedTotal = kmCharge + nightCharge + driverAllowance;

  return {
    totalTripKm,
    billableKm,
    kmRate,
    baseFare,
    kmCharge,
    isNightChargeApplicable,
    nightCharge,
    driverAllowance,
    estimatedTotal
  };
}
