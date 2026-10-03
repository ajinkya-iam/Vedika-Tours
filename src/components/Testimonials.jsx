import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { mockData } from '../mock';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockData.testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % mockData.testimonials.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + mockData.testimonials.length) % mockData.testimonials.length);
  };

  return (
    <section id="reviews" className="py-20 bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <div className="w-24 h-1 bg-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Real experiences from our satisfied customers
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Stars */}
            <div className="flex justify-center mb-6">
              {[...Array(mockData.testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400 mx-1" />
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-gray-700 text-lg md:text-xl text-center mb-8 leading-relaxed min-h-[100px]">
              "{mockData.testimonials[currentIndex].text}"
            </p>

            {/* Customer Info */}
            <div className="text-center">
              <p className="text-gray-900 font-bold text-xl mb-1">
                {mockData.testimonials[currentIndex].name}
              </p>
              <p className="text-gray-500 text-sm">
                {mockData.testimonials[currentIndex].date}
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <Button
                onClick={goToPrev}
                variant="outline"
                size="icon"
                className="rounded-full border-orange-600 text-orange-600 hover:bg-orange-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {/* Dots Indicator */}
              <div className="flex space-x-2">
                {mockData.testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-orange-600 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={goToNext}
                variant="outline"
                size="icon"
                className="rounded-full border-orange-600 text-orange-600 hover:bg-orange-50"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Google Rating Section */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white rounded-3xl shadow-xl px-12 py-8 border-2 border-orange-100">
            <div className="flex items-center justify-center space-x-4">
              <img 
                src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
                alt="Google" 
                className="h-8"
              />
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-5xl font-bold text-gray-900">{mockData.company.rating}</span>
                  <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-gray-600 mt-1">
                  Based on {mockData.company.totalReviews} reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
