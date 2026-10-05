import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockData } from '../mock';

const MobileFloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 200px
      setIsVisible(window.scrollY > 200);
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
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 lg:hidden px-3 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
        {/* Book Cab - Primary Action */}
        <Link to="/book" className="w-full">
          <button
            type="button"
            className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-[12px] sm:text-xs rounded-xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Car className="w-4 h-4 shrink-0" />
            <span className="tracking-wide">Book Cab</span>
          </button>
        </Link>

        {/* Call Now */}
        <button
          type="button"
          onClick={handleCall}
          className="w-full h-11 bg-white hover:bg-orange-50/60 border-2 border-orange-500 text-orange-600 font-extrabold text-[12px] sm:text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Phone className="w-4 h-4 shrink-0 fill-orange-50" />
          <span className="tracking-wide">Call Now</span>
        </button>

        {/* WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="w-full h-11 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-[12px] sm:text-xs rounded-xl shadow-md shadow-green-600/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <MessageCircle className="w-4 h-4 shrink-0 fill-white/20" />
          <span className="tracking-wide">WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

export default MobileFloatingCTA;
