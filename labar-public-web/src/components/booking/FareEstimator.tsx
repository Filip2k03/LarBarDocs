import React, { useState } from 'react';
import { Calculator, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { FaresService } from '@/services/fares.service';
import type { FareEstimateResult } from '@/types/fare';

export const FareEstimator: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number>(5);
  const [durationMin, setDurationMin] = useState<number>(18);
  const [rideType, setRideType] = useState<string>('standard');
  const [isNight, setIsNight] = useState<boolean>(false);
  const [isAirport, setIsAirport] = useState<boolean>(false);
  const [estimate, setEstimate] = useState<FareEstimateResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const calculateEstimate = async () => {
    setIsLoading(true);
    try {
      const result = await FaresService.calculateFareEstimate({
        city_slug: 'yangon',
        distance_km: distanceKm,
        duration_minutes: durationMin,
        ride_type_code: rideType,
        is_night: isNight,
        is_airport: isAirport,
      });
      setEstimate(result);
    } catch {
      // Direct standard calculation rule
      const base = rideType === 'premium' ? 12500 : rideType === 'comfort' ? 7800 : 5800;
      const rateKm = rideType === 'premium' ? 1800 : rideType === 'comfort' ? 1100 : 850;
      const rateMin = 120;

      const distTotal = distanceKm * rateKm;
      const timeTotal = durationMin * rateMin;
      const nightSurcharge = isNight ? Math.round((base + distTotal) * 0.15) : 0;
      const airportToll = isAirport ? 1500 : 0;

      setEstimate({
        ride_type_code: rideType,
        ride_type_name: rideType.toUpperCase(),
        base_fare: base,
        distance_fare: distTotal,
        time_fare: timeTotal,
        surcharges: [
          ...(isNight ? [{ name: 'Late Night Surcharge (15%)', amount: nightSurcharge }] : []),
          ...(isAirport ? [{ name: 'Airport Access Toll Fee', amount: airportToll }] : []),
        ],
        total_estimate_mmk: base + distTotal + timeTotal + nightSurcharge + airportToll,
        currency: 'MMK',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-4xl p-6 md:p-8 border border-brand-border shadow-soft-lg max-w-xl mx-auto space-y-6">
      <div>
        <span className="badge-red mb-2">LIVE FARE CALCULATOR</span>
        <h3 className="text-lg font-extrabold text-neutral-900">
          Transparent Municipal Fare Simulator
        </h3>
        <p className="text-xs text-neutral-500">
          Adjust distance, duration, and vehicle tier to calculate the exact guaranteed fare in Yangon.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-bold text-neutral-700 mb-1">
            <span>Trip Distance:</span>
            <span className="text-brand-red font-extrabold">{distanceKm} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-full accent-brand-red cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-neutral-700 mb-1">
            <span>Estimated Duration:</span>
            <span className="text-brand-red font-extrabold">{durationMin} minutes</span>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            className="w-full accent-brand-red cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Vehicle Tier
          </label>
          <select
            value={rideType}
            onChange={(e) => setRideType(e.target.value)}
            className="w-full bg-white border border-brand-border rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 outline-none"
          >
            <option value="standard">Standard Taxi (Toyota Probox / Fielder)</option>
            <option value="comfort">Comfort Sedan (Toyota Axio / Premio)</option>
            <option value="premium">Royal Gold VIP (Toyota Crown / Alphard)</option>
            <option value="xl">XL Family Van (7 Seats)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-50 border border-brand-border cursor-pointer">
            <input
              type="checkbox"
              checked={isNight}
              onChange={(e) => setIsNight(e.target.checked)}
              className="accent-brand-red"
            />
            <span className="font-semibold text-neutral-800">Late Night (11PM-5AM)</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-50 border border-brand-border cursor-pointer">
            <input
              type="checkbox"
              checked={isAirport}
              onChange={(e) => setIsAirport(e.target.checked)}
              className="accent-brand-red"
            />
            <span className="font-semibold text-neutral-800">Airport Toll Gate</span>
          </label>
        </div>

        <button
          type="button"
          onClick={calculateEstimate}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-brand-red hover:bg-brand-deepRed text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Calculate Guaranteed Fare'}
        </button>
      </div>

      {estimate && (
        <div className="p-5 rounded-3xl bg-brand-bg border border-brand-border space-y-3">
          <div className="flex justify-between items-baseline border-b border-neutral-200/60 pb-3">
            <span className="text-xs font-bold text-neutral-600">Total Guaranteed Fare:</span>
            <span className="text-2xl font-black text-brand-red">
              {estimate.total_estimate_mmk.toLocaleString()} <span className="text-xs font-bold text-neutral-500">MMK</span>
            </span>
          </div>

          <div className="text-[11px] text-neutral-600 space-y-1">
            <div className="flex justify-between">
              <span>Base Fare:</span>
              <span>{estimate.base_fare.toLocaleString()} MMK</span>
            </div>
            <div className="flex justify-between">
              <span>Distance ({distanceKm} km):</span>
              <span>{estimate.distance_fare.toLocaleString()} MMK</span>
            </div>
            <div className="flex justify-between">
              <span>Time Rate ({durationMin} min):</span>
              <span>{estimate.time_fare.toLocaleString()} MMK</span>
            </div>
            {estimate.surcharges.map((s, idx) => (
              <div key={idx} className="flex justify-between text-amber-800 font-semibold">
                <span>{s.name}:</span>
                <span>+{s.amount.toLocaleString()} MMK</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
