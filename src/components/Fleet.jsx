import React from 'react';
import { Users, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { mockData } from '../mock';

const Fleet = () => {
  const navigate = useNavigate();

  const handleFleetBooking = (vehicleName) => {
    navigate(`/book?car=${encodeURIComponent(vehicleName)}`);
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
            Well-maintained vehicles for every travel need with transparent per-KM rates
          </p>
        </div>

        {/* Fleet Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockData.fleet.map((vehicle) => (
            <div
              key={vehicle.id}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 flex flex-col justify-between"
            >
              {/* Vehicle Image */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Vehicle Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {vehicle.name}
                    </h3>
                    <Car className="w-6 h-6 text-orange-600" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-semibold text-gray-900">{vehicle.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Seating:</span>
                      <span className="font-semibold text-gray-900 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {vehicle.seating}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    {vehicle.description}
                  </p>
                </div>

                <Button
                  onClick={() => handleFleetBooking(vehicle.name)}
                  variant="outline"
                  className="w-full border-orange-600 text-orange-600 hover:bg-orange-50 group-hover:bg-orange-600 group-hover:text-white transition-all font-bold"
                >
                  Book & Calculate KM
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Fleet;
