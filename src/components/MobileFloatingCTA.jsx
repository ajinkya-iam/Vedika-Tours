import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { mockData } from '../mock';

const MobileFloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 250px
      setIsVisible(window.scrollY > 250);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCall = () => {
    window.location.href = `tel:${mockData.company.phone}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${mockData.company.whatsappNumber}`, '_blank');
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-orange-200 shadow-2xl transition-transform duration-300 lg:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="container mx-auto px-3 py-2.5">
        <div className="grid grid-cols-3 gap-2">
          <Link to="/book" className="w-full">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 px-1 rounded-xl shadow-md text-xs font-bold flex flex-col items-center justify-center">
              <Car className="w-4 h-4 mb-0.5" />
              <span>Book Cab</span>
            </Button>
          </Link>
          <Button
            onClick={handleCall}
            variant="outline"
            className="border-gray-300 text-gray-800 hover:bg-gray-100 py-5 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center"
          >
            <Phone className="w-4 h-4 mb-0.5 text-orange-600" />
            <span>Call Now</span>
          </Button>
          <Button
            onClick={handleWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white py-5 px-1 rounded-xl shadow-md text-xs font-bold flex flex-col items-center justify-center"
          >
            <MessageCircle className="w-4 h-4 mb-0.5" />
            <span>WhatsApp</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileFloatingCTA;
