import React from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { mockData } from '../mock';

const Tours = () => {
  const handleTourInquiry = (tourTitle) => {
    const message = `Hi, I'm interested in ${tourTitle}. Please share more details.`;
    window.open(`https://wa.me/${mockData.company.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="tours" className="py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Popular Tours
          </h2>
          <div className="w-24 h-1 bg-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore Maharashtra's spiritual and scenic destinations
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockData.tours.map((tour) => (
            <div
              key={tour.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Tour Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              {/* Tour Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {tour.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {tour.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-orange-600 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tour.destinations}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{tour.duration}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleTourInquiry(tour.title)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white group-hover:shadow-lg transition-all"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tours;
