import React from 'react';
import { Star, Phone, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { mockData } from '../mock';

const HeroSection = () => {
  const handleCall = () => {
    window.location.href = `tel:${mockData.company.phone}`;
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1633609618706-c5f662afc360')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Tagline */}
          <p className="text-orange-400 text-lg md:text-xl font-medium mb-4 animate-fade-in">
            {mockData.company.tagline}
          </p>

          {/* Company Name */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3 animate-slide-up">
            {mockData.company.name}
          </h1>
          
          {/* Marathi Name */}
          <h2 className="text-2xl md:text-4xl font-semibold text-white/90 mb-8 animate-slide-up">
            {mockData.company.nameMarathi}
          </h2>

          {/* Rating */}
          <div className="flex items-center justify-center space-x-3 mb-8 animate-fade-in">
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-2" />
              <span className="text-white font-semibold text-lg">
                {mockData.company.rating} Rating
              </span>
              <span className="text-white/70 ml-2">|</span>
              <span className="text-white/90 ml-2">
                {mockData.company.totalReviews} Reviews
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to="/book">
              <Button 
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Car className="w-5 h-5 mr-1" />
                <span>Book Now & Check Fare</span>
              </Button>
            </Link>
            <Button 
              onClick={handleCall}
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
