import React, { useState } from 'react';
import { Car, Package, Plane, ArrowRight, Clock, Users, Loader2 } from 'lucide-react';
import { LocationAutocomplete } from '../booking/LocationAutocomplete';
import { BookingService } from '@/services/booking.service';
import type { LocationPoint } from '@/types/booking';

export const HeroBookingWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ride' | 'delivery' | 'airport'>('ride');
  const [pickup, setPickup] = useState<LocationPoint | null>({
    name: 'Sule Square, Yangon',
    address: 'Sule Pagoda Road, Kyauktada Township, Yangon',
    latitude: 16.7794,
    longitude: 96.1554,
  });
  const [destination, setDestination] = useState<LocationPoint | null>({
    name: 'Junction City Mall',
    address: 'Bogyoke Aung San Road, Pabedan Township, Yangon',
    latitude: 16.7788,
    longitude: 96.1528,
  });
  const [scheduleTime, setScheduleTime] = useState<string>('now');
  const [passengers, setPassengers] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSeePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pickup || !destination) {
      setErrorMessage('Please specify both pickup and destination locations.');
      return;
    }

    setIsLoading(true);
    try {
      // Call Real Go API for Quote
      const quote = await BookingService.getBookingQuote({
        pickup,
        destination,
        passenger_count: passengers,
      });

      // Redirect to full booking page with active quote
      window.location.href = `/ride?quote_id=${encodeURIComponent(quote.quote_id)}&service=${activeTab}`;
    } catch (err: any) {
      // If API server is starting or custom query, redirect with search query params
      const params = new URLSearchParams({
        pickup_addr: pickup.address,
        pickup_lat: String(pickup.latitude),
        pickup_lng: String(pickup.longitude),
        dest_addr: destination.address,
        dest_lat: String(destination.latitude),
        dest_lng: String(destination.longitude),
        service: activeTab,
        passengers: String(passengers),
      });
      window.location.href = `/ride?${params.toString()}`;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-4xl p-5 md:p-6 shadow-soft-lg border border-brand-border/80 backdrop-blur-md">
      {/* Service Type Tab Switcher */}
      <div className="flex items-center justify-between p-1 bg-brand-bg rounded-2xl mb-4 border border-brand-border/60">
        <button
          type="button"
          onClick={() => setActiveTab('ride')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ride'
              ? 'bg-white text-brand-red shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Car size={15} />
          <span>Ride</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('delivery')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'delivery'
              ? 'bg-white text-brand-red shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Package size={15} />
          <span>Delivery</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('airport')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'airport'
              ? 'bg-white text-brand-red shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Plane size={15} />
          <span>Airport</span>
        </button>
      </div>

      {/* Input Fields Form */}
      <form onSubmit={handleSeePrices} className="space-y-3">
        {/* Pickup Input */}
        <LocationAutocomplete
          label="From"
          placeholder="Enter pickup location"
          value={pickup}
          onChange={setPickup}
          iconColor="text-emerald-500"
        />

        {/* Destination Input */}
        <LocationAutocomplete
          label="To"
          placeholder="Where are you going?"
          value={destination}
          onChange={setDestination}
          iconColor="text-brand-red"
        />

        {/* Schedule & Passenger Dual Selectors */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Time Picker */}
          <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3 py-2 text-xs font-semibold text-neutral-800">
            <Clock size={15} className="text-neutral-400 mr-2 shrink-0" />
            <select
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full bg-transparent outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="now">Now (ယခု)</option>
              <option value="15m">In 15 mins</option>
              <option value="30m">In 30 mins</option>
              <option value="1h">In 1 hour</option>
              <option value="schedule">Schedule later...</option>
            </select>
          </div>

          {/* Passenger Count */}
          <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3 py-2 text-xs font-semibold text-neutral-800">
            <Users size={15} className="text-neutral-400 mr-2 shrink-0" />
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full bg-transparent outline-none cursor-pointer text-xs font-semibold"
            >
              <option value={1}>1 Passenger</option>
              <option value={2}>2 Passengers</option>
              <option value={3}>3 Passengers</option>
              <option value={4}>4 Passengers</option>
              <option value={6}>6 Passengers (XL)</option>
            </select>
          </div>
        </div>

        {errorMessage && (
          <div className="text-xs text-brand-red font-medium px-1">
            {errorMessage}
          </div>
        )}

        {/* See Prices Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-brand-red hover:bg-brand-deepRed active:scale-[0.98] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Calculating Route &amp; Fares...</span>
            </>
          ) : (
            <>
              <span>See Prices</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
