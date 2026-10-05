import React from 'react';
import { Users, Briefcase, Snowflake, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getCarImageUrl } from '../../lib/supabaseClient';

export default function CarCard({ car, fare, isSelected, onSelect, distanceKm }) {
  const carImageUrl = getCarImageUrl(car.image_url, car.name);

  return (
    <div
      onClick={() => onSelect(car)}
      className={`relative cursor-pointer rounded-2xl border-2 transition-all p-4 lg:p-5 flex flex-col justify-between ${
        isSelected
          ? 'border-orange-500 bg-orange-50/20 shadow-md ring-2 ring-orange-400/20'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {/* Selected Radio / Check Indicator */}
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-block text-[11px] font-bold text-orange-700 bg-orange-100/80 uppercase px-2.5 py-0.5 rounded-full mb-1">
            {car.category || 'Standard'}
          </span>
          <h3 className="text-lg font-bold text-gray-900">{car.name}</h3>
        </div>

        <div className="shrink-0">
          {isSelected ? (
            <CheckCircle2 className="w-6 h-6 text-orange-600 fill-orange-100" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
          )}
        </div>
      </div>

      {/* Car Photo & Key Specs */}
      <div className="my-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-6 flex justify-center bg-gray-50/50 p-2 rounded-xl">
          <img
            src={carImageUrl}
            alt={car.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getCarImageUrl(null, car.name);
            }}
            className="w-full h-32 object-contain rounded-xl transition-transform hover:scale-105"
          />
        </div>

        <div className="sm:col-span-6 space-y-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{car.seating_capacity} Passenger Seats</span>
          </div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{car.luggage_capacity || 2} Luggage Bags</span>
          </div>
          <div className="flex items-center space-x-2">
            <Snowflake className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Air Conditioned (AC)</span>
          </div>
          <div className="flex items-center space-x-2 text-green-700 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Clean & Sanitized</span>
          </div>
        </div>
      </div>

      {/* Pricing Footnote & Live Estimation */}
      <div className="pt-3 border-t border-gray-100 flex items-end justify-between">
        <div>
          <div className="text-[11px] text-gray-400 uppercase font-semibold">Standard Rate</div>
          <div className="text-sm font-bold text-gray-800">
            ₹{car.price_per_km}/km
          </div>
          <div className="text-[10px] text-gray-400">
            Min {car.min_km_per_day || 250} km/day
          </div>
        </div>

        <div className="text-right">
          {fare ? (
            <div>
              <div className="text-[11px] text-orange-600 font-bold uppercase">Estimated Fare</div>
              <div className="text-xl font-black text-gray-900">
                ₹{fare.estimatedTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-gray-400">
                incl. Driver Bata {fare.nightCharge > 0 ? '+ Night Chg' : ''}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">
              {distanceKm ? 'Calculating...' : 'Select locations to see total'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
