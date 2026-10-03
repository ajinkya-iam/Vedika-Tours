import React from 'react';
import { CheckCircle } from 'lucide-react';
import { mockData } from '../mock';

const About = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {mockData.about.title}
            </h2>
            <div className="w-24 h-1 bg-orange-600 mx-auto mb-6"></div>
          </div>

          {/* About Content */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <p className="text-gray-700 text-lg leading-relaxed mb-8 text-center">
              {mockData.about.description}
            </p>

            {/* Highlights */}
            <div className="space-y-4">
              {mockData.about.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-lg">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
