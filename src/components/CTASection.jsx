import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { mockData } from '../mock';

const CTASection = () => {
  const handleCall = () => {
    window.location.href = `tel:${mockData.company.phone}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${mockData.company.whatsappNumber}`, '_blank');
  };

  return (
    <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Plan Your Trip Today!
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-10">
            Book your comfortable and safe journey with Vedika Tours & Travels
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleCall}
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-10 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <Phone className="w-6 h-6 mr-2" />
              Call Now
            </Button>
            <Button
              onClick={handleWhatsApp}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-10 py-7 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              WhatsApp Booking
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
