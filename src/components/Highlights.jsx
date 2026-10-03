import React from 'react';
import { Star, Car, MapPin, Clock } from 'lucide-react';
import { mockData } from '../mock';

const iconMap = {
  star: Star,
  car: Car,
  'map-pin': MapPin,
  clock: Clock
};

const Highlights = () => {
  return (
    <section className="py-12 bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {mockData.highlights.map((highlight) => {
            const IconComponent = iconMap[highlight.icon];
            return (
              <div
                key={highlight.id}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-orange-100"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {highlight.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {highlight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
