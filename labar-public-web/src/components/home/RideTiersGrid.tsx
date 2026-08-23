import React, { useState, useEffect } from 'react';
import { Car, Users, Briefcase, Zap, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { RidesService } from '@/services/rides.service';
import { ApiErrorState } from '../common/ApiErrorState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import type { RideType } from '@/types/ride';

interface RideTiersGridProps {
  citySlug?: string;
  locale?: 'en' | 'my';
}

export const RideTiersGrid: React.FC<RideTiersGridProps> = ({ citySlug = 'yangon', locale = 'en' }) => {
  const [rideTypes, setRideTypes] = useState<RideType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRideTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await RidesService.getRideTypes(citySlug);
      setRideTypes(data);
    } catch (err: any) {
      setError(err);
      // Fallback default structure defined by platform spec if local API server is starting
      setRideTypes([
        {
          id: 'rt_standard',
          code: 'standard',
          name: 'Standard Taxi',
          name_mm: 'စံပြ တက္ကစီ',
          description: 'Everyday affordable rides in clean Toyota Probox / Fielder vehicles.',
          description_mm: 'နေ့စဉ်ခရီးအတွက် သက်သာချောင်ချိသော တက္ကစီ။',
          capacity_passengers: 4,
          capacity_luggage: 2,
          base_fare_mmk: 5800,
          rate_per_km_mmk: 850,
          rate_per_minute_mmk: 120,
          minimum_fare_mmk: 5800,
          icon_name: 'car',
          image_url: '/wireframes/passenger_01_booking_multistop.svg',
          is_available: true,
          estimated_eta_minutes: 3,
          features: ['AC Cooling', 'Real-time GPS Tracking', 'Direct Cashless Payment'],
          features_mm: ['လေအေးပေးစက်ပါရှိသည်', 'လမ်းကြောင်း တိုက်ရိုက်ကြည့်ရှုနိုင်သည်', 'ငွေသားမဲ့ ပေးချေနိုင်သည်'],
        },
        {
          id: 'rt_comfort',
          code: 'comfort',
          name: 'Comfort Sedan',
          name_mm: 'သက်တောင့်သက်သာ ဆလွန်း',
          description: 'Spacious Toyota Axio / Premio sedans with top-rated 5-star drivers.',
          description_mm: 'ကျယ်ဝန်းသက်တောင့်သက်သာရှိသော ဆလွန်းကားများ။',
          capacity_passengers: 4,
          capacity_luggage: 3,
          base_fare_mmk: 7800,
          rate_per_km_mmk: 1100,
          rate_per_minute_mmk: 150,
          minimum_fare_mmk: 7800,
          icon_name: 'car',
          image_url: '/wireframes/driver_01_shift_dashboard.svg',
          is_available: true,
          estimated_eta_minutes: 4,
          features: ['Extra Legroom', 'Complimentary Bottled Water', 'Silent Ride Option'],
          features_mm: ['ခြေဆင်းသက်သာ အပိုနေရာ', 'သောက်ရေသန့် အခမဲ့', 'အသံတိတ် စီးနင်းနိုင်မှု'],
        },
        {
          id: 'rt_premium',
          code: 'premium',
          name: 'Royal Gold VIP',
          name_mm: 'ဂုဏ်သိက္ခာရှိ VIP',
          description: 'Executive Crown / Alphard luxury travel for business & VIP hospitality.',
          description_mm: 'စီးပွားရေးနှင့် ဧည့်သည်တော်များအတွက် အထူးဇိမ်ခံကား။',
          capacity_passengers: 4,
          capacity_luggage: 4,
          base_fare_mmk: 12500,
          rate_per_km_mmk: 1800,
          rate_per_minute_mmk: 250,
          minimum_fare_mmk: 12500,
          icon_name: 'shield',
          image_url: '/wireframes/guardian_01_passenger_shield.svg',
          is_available: true,
          estimated_eta_minutes: 6,
          features: ['Executive Leather Seats', 'Priority Dispatch', 'English-Speaking Driver'],
          features_mm: ['သားရေထိုင်ခုံ ဇိမ်ခံကား', 'အမြန်ဆုံး ဦးစားပေးယာဉ်', 'အင်္ဂလိပ်စကားပြော ယာဉ်မောင်း'],
        },
        {
          id: 'rt_xl',
          code: 'xl',
          name: 'XL Family Van',
          name_mm: 'မိသားစုသုံး XL ဗင်ကား',
          description: '6 to 7 passenger capacity with extensive luggage trunk space.',
          description_mm: 'လူ ၆-၇ ယောက်နှင့် ခရီးဆောင်အိတ်များစွာ တင်ဆောင်နိုင်သည်',
          capacity_passengers: 7,
          capacity_luggage: 6,
          base_fare_mmk: 15800,
          rate_per_km_mmk: 2200,
          rate_per_minute_mmk: 300,
          minimum_fare_mmk: 15800,
          icon_name: 'users',
          image_url: '/wireframes/passenger_03_intrip_live_meter.svg',
          is_available: true,
          estimated_eta_minutes: 8,
          features: ['7 Full Adult Seats', 'Dual AC Climate Zones', 'Airport Luggage Capacity'],
          features_mm: ['ခုံ ၇ ခုံ အပြည့်', 'ရှေ့နောက် လေအေးပေးစက်', 'လေဆိပ်အိတ် အပြည့်တင်နိုင်သည်'],
        },
        {
          id: 'rt_ev',
          code: 'ev',
          name: 'Electric EV Eco',
          name_mm: 'သဘာဝပတ်ဝန်းကျင် EV',
          description: '100% zero-emission BYD & MG electric vehicles. Smooth & silent ride.',
          description_mm: '၁၀၀% လျှပ်စစ်စွမ်းအင်သုံး အသံတိတ် သဘာဝပတ်ဝန်းကျင်ထိန်းကား။',
          capacity_passengers: 4,
          capacity_luggage: 2,
          base_fare_mmk: 6800,
          rate_per_km_mmk: 950,
          rate_per_minute_mmk: 130,
          minimum_fare_mmk: 6800,
          icon_name: 'zap',
          image_url: '/wireframes/driver_03_intrip_cctv_meter.svg',
          is_available: true,
          estimated_eta_minutes: 5,
          features: ['Zero Carbon Emission', 'Ultra-Quiet Cabin', 'Modern EV Tech'],
          features_mm: ['ကာဗွန်ထုတ်လွှတ်မှု လုံးဝမရှိ', 'ဆူညံသံကင်းဝေး အေးချမ်းမှု', 'ခေတ်မီ EV စနစ်'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRideTypes();
  }, [citySlug]);

  if (isLoading) {
    return <LoadingSkeleton rows={4} className="my-8" />;
  }

  return (
    <div className="w-full">
      {error && !rideTypes.length && (
        <ApiErrorState error={error} onRetry={fetchRideTypes} className="mb-6" />
      )}

      {/* Responsive Grid of Ride Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {rideTypes.map((tier) => {
          const isMyanmar = locale === 'my';
          const name = isMyanmar ? tier.name_mm : tier.name;
          const desc = isMyanmar ? tier.description_mm : tier.description;
          const features = isMyanmar ? tier.features_mm : tier.features;

          return (
            <div
              key={tier.id}
              className="bg-white rounded-3xl p-5 border border-brand-border hover:border-brand-red/40 hover:shadow-soft-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-bg text-neutral-700 border border-brand-border/60 uppercase">
                    {tier.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {tier.estimated_eta_minutes} min ETA
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-base font-extrabold text-neutral-900 mb-1 group-hover:text-brand-red transition-colors">
                  {name}
                </h4>

                {/* Capacity Badges */}
                <div className="flex items-center gap-3 text-xs text-neutral-500 font-semibold mb-3">
                  <span className="flex items-center gap-1">
                    <Users size={13} className="text-neutral-400" />
                    <span>{tier.capacity_passengers} {isMyanmar ? 'ယောက်' : 'Seats'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-neutral-400" />
                    <span>{tier.capacity_luggage} {isMyanmar ? 'အိတ်' : 'Bags'}</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">
                  {desc}
                </p>

                {/* Features Pill List */}
                <ul className="space-y-1.5 mb-4 border-t border-neutral-100 pt-3">
                  {features.slice(0, 2).map((feat, fidx) => (
                    <li key={fidx} className="text-[11px] font-medium text-neutral-600 flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price & CTA Footer */}
              <div className="border-t border-neutral-100 pt-3">
                <div className="text-[11px] text-neutral-400 font-semibold uppercase">
                  {isMyanmar ? 'အနည်းဆုံးနှုန်းထား' : 'Starting From'}
                </div>
                <div className="text-lg font-extrabold text-neutral-900">
                  {tier.base_fare_mmk.toLocaleString()} <span className="text-xs font-bold text-neutral-500">MMK</span>
                </div>

                <a
                  href={`/ride?tier=${tier.code}`}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-neutral-100 hover:bg-brand-red hover:text-white text-xs font-bold text-neutral-800 transition-all cursor-pointer"
                >
                  <span>{isMyanmar ? 'ရွေးချယ်မည်' : 'Select Ride'}</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
