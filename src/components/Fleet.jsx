import React, { useState, useEffect } from 'react';
import { Users, Car } from 'lucide-react';
import { Button } from './ui/button';
import { mockData } from '../mock';
import { supabase, isSupabaseConfigured, getCarImageUrl } from '../lib/supabaseClient';

const Fleet = () => {
  const [fleetList, setFleetList] = useState([]);

  useEffect(() => {
    async function loadActiveFleet() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('cars')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true });

          if (!error && data && data.length > 0) {
            setFleetList(data);
            return;
          }
        } catch (e) {
          console.warn('Could not load fleet from Supabase:', e);
        }
      }

      // Fallback: check if any cars were marked disabled locally
      const disabledCars = JSON.parse(localStorage.getItem('vt_disabled_cars') || '[]');
      const filtered = mockData.fleet.filter(
        (v) => !disabledCars.some((d) => d.toLowerCase().includes(v.name.toLowerCase()))
      );
      setFleetList(filtered);
    }

    loadActiveFleet();
  }, []);

  const handleFleetInquiry = (vehicleName) => {
    const message = `Hi, I'm interested in booking ${vehicleName}. Please share availability and pricing.`;
    window.open(`https://wa.me/${mockData.company.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="fleet" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Fleet
          </h2>
          <div className="w-24 h-1 bg-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Well-maintained vehicles for every travel need
          </p>
        </div>

        {/* Fleet Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {fleetList.map((vehicle) => {
            const vehicleImage = getCarImageUrl(vehicle.image_url || vehicle.image, vehicle.name);
            const vehicleType = vehicle.category || vehicle.type || 'Standard';
            const seatingText = vehicle.seating || (vehicle.seating_capacity ? `${vehicle.seating_capacity} Seater` : '4 Seater');

            return (
              <div
                key={vehicle.id || vehicle.name}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200"
              >
                {/* Vehicle Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center p-2">
                  <img
                    src={vehicleImage}
                    alt={vehicle.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getCarImageUrl(null, vehicle.name);
                    }}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Vehicle Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {vehicle.name}
                    </h3>
                    <Car className="w-6 h-6 text-orange-600" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold text-gray-900">{vehicleType}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Seating:</span>
                      <span className="font-semibold text-gray-900 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {seatingText}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {vehicle.description}
                  </p>

                  <Button
                    onClick={() => handleFleetInquiry(vehicle.name)}
                    variant="outline"
                    className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 group-hover:bg-orange-600 group-hover:text-white transition-all"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Fleet;
