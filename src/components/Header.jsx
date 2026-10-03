import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageCircle, Car } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { mockData } from '../mock';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${sectionId}`;
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleCall = () => {
    window.location.href = `tel:${mockData.company.phone}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${mockData.company.whatsappNumber}`, '_blank');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={mockData.company.logo} 
              alt={mockData.company.name}
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Services
            </button>
            <button onClick={() => scrollToSection('tours')} className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Tours
            </button>
            <button onClick={() => scrollToSection('fleet')} className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Fleet
            </button>
            <button onClick={() => scrollToSection('reviews')} className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Reviews
            </button>
            <Link to="/book" className="text-orange-600 font-bold hover:text-orange-700 transition-colors flex items-center space-x-1">
              <Car className="w-4 h-4 mr-1" />
              <span>Book Online</span>
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link to="/book">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md">
                <Car className="w-4 h-4 mr-1.5" />
                Book Cab
              </Button>
            </Link>
            <Button 
              onClick={handleCall}
              variant="outline" 
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button 
              onClick={handleWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-orange-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/book"
                onClick={() => setIsMenuOpen(false)}
                className="bg-orange-600 text-white font-bold p-3 rounded-xl flex items-center justify-center space-x-2 shadow-md"
              >
                <Car className="w-5 h-5" />
                <span>Book Cab & Calculate Fare</span>
              </Link>
              <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-orange-600 font-medium text-left">
                Home
              </button>
              <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-orange-600 font-medium text-left">
                Services
              </button>
              <button onClick={() => scrollToSection('tours')} className="text-gray-700 hover:text-orange-600 font-medium text-left">
                Tours
              </button>
              <button onClick={() => scrollToSection('fleet')} className="text-gray-700 hover:text-orange-600 font-medium text-left">
                Fleet
              </button>
              <button onClick={() => scrollToSection('reviews')} className="text-gray-700 hover:text-orange-600 font-medium text-left">
                Reviews
              </button>
              <div className="flex flex-col space-y-2 pt-2">
                <Button onClick={handleCall} variant="outline" className="border-orange-600 text-orange-600 w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button onClick={handleWhatsApp} className="bg-green-600 hover:bg-green-700 text-white w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
