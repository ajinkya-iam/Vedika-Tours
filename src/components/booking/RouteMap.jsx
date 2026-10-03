import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom modern SVG marker icons for Pickup (Green) and Drop (Orange/Red)
const createMarkerIcon = (color, text) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 13px;
          font-family: sans-serif;
        ">${text}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const pickupIcon = createMarkerIcon('#16a34a', 'P');
const dropIcon = createMarkerIcon('#ea580c', 'D');

// Component to dynamically fit map bounds to show both markers and route
function MapBoundsUpdater({ pickup, drop, routeCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (pickup && drop) {
      const bounds = L.latLngBounds([
        [pickup.lat, pickup.lng],
        [drop.lat, drop.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 13);
    }
  }, [pickup, drop, routeCoordinates, map]);

  return null;
}

export default function RouteMap({ pickup, drop, routeCoordinates, distanceKm, durationMin }) {
  // Default center: Panvel, Maharashtra
  const defaultCenter = [18.9894, 73.1175];

  return (
    <div className="relative w-full h-[380px] lg:h-[440px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
      <MapContainer
        center={pickup ? [pickup.lat, pickup.lng] : defaultCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <div className="text-xs font-semibold text-gray-800">
                <span className="text-green-600 font-bold uppercase tracking-wider block">Pickup</span>
                {pickup.name}
              </div>
            </Popup>
          </Marker>
        )}

        {drop && (
          <Marker position={[drop.lat, drop.lng]} icon={dropIcon}>
            <Popup>
              <div className="text-xs font-semibold text-gray-800">
                <span className="text-orange-600 font-bold uppercase tracking-wider block">Drop</span>
                {drop.name}
              </div>
            </Popup>
          </Marker>
        )}

        {routeCoordinates && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#ea580c',
              weight: 5,
              opacity: 0.85,
              lineJoin: 'round',
              lineCap: 'round'
            }}
          />
        )}

        <MapBoundsUpdater pickup={pickup} drop={drop} routeCoordinates={routeCoordinates} />
      </MapContainer>

      {/* Floating Route Distance & Duration Pill */}
      {distanceKm > 0 && (
        <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Road Distance</div>
            <div className="text-base font-extrabold text-gray-900">{distanceKm} km</div>
          </div>
          <div className="h-7 w-px bg-gray-200"></div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Approx Time</div>
            <div className="text-base font-extrabold text-orange-600">
              {Math.floor(durationMin / 60) > 0 ? `${Math.floor(durationMin / 60)}h ` : ''}
              {durationMin % 60}m
            </div>
          </div>
        </div>
      )}

      {/* Map Helper hint */}
      {!drop && (
        <div className="absolute bottom-3 left-3 z-[400] bg-black/75 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm pointer-events-none">
          {pickup ? 'Now select your Drop location to see the route' : 'Select Pickup & Drop locations to view route'}
        </div>
      )}
    </div>
  );
}
