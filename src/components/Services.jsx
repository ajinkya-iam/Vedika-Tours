import React from 'react';
import { Car, Map, Plane, Briefcase } from 'lucide-react';
import { mockData } from '../mock';

const iconMap = {
  car: Car,
  map: Map,
  plane: Plane,
  briefcase: Briefcase
};

const Services = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <div className="w-24 h-1 bg-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive travel solutions tailored to your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockData.services.map((service) => {
            const IconComponent = iconMap[service.icon];
            return (
              <div
                key={service.id}
                className="group bg-gradient-to-br from-white to-orange-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-orange-100"
              >
                <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
