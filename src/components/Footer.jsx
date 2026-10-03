import React from 'react';
import { MapPin, Phone, Car, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockData } from '../mock';

const Footer = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 pb-24 md:pb-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-orange-400 mb-4">
              {mockData.company.name}
            </h3>
            <p className="text-gray-300 mb-4">
              Your trusted travel partner for safe, sanitized, and comfortable journeys across Maharashtra.
            </p>
            <div className="flex items-center space-x-2 text-yellow-400">
              <span className="text-2xl font-bold">{mockData.company.rating}</span>
              <span className="text-gray-300">({mockData.company.totalReviews} reviews)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/book" className="text-orange-400 hover:text-orange-300 font-semibold flex items-center space-x-1 transition-colors">
                  <Car className="w-4 h-4 mr-1" />
                  <span>Book Online (KM Calculator)</span>
                </Link>
              </li>
              <li>
                <button onClick={() => scrollToSection('home')} className="text-gray-300 hover:text-orange-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('services')} className="text-gray-300 hover:text-orange-400 transition-colors">
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('tours')} className="text-gray-300 hover:text-orange-400 transition-colors">
                  Tours
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('fleet')} className="text-gray-300 hover:text-orange-400 transition-colors">
                  Fleet
                </button>
              </li>
              <li>
                <Link to="/admin" className="text-gray-500 hover:text-gray-300 text-xs flex items-center space-x-1 pt-2 transition-colors">
                  <Shield className="w-3 h-3 mr-1" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{mockData.company.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0" />
                <a href={`tel:${mockData.company.phone}`} className="text-gray-300 hover:text-orange-400 transition-colors">
                  {mockData.company.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm md:text-base">
            © {new Date().getFullYear()} {mockData.company.name}. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs md:text-sm mt-3 px-4">
            Design and Develop by{' '}
            <a 
              href="https://wa.me/917020875431?text=Hi%2C%20I%20saw%20your%20work%20on%20Vedika%20Tours%20website.%20Can%20you%20build%20a%20similar%20website%20for%20my%20business%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              Silent Codder
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
