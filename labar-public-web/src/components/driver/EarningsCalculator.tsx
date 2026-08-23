import React, { useState } from 'react';
import { DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react';

export const EarningsCalculator: React.FC = () => {
  const [hoursPerDay, setHoursPerDay] = useState<number>(8);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(6);

  // Model: ~2.2 trips per hour, average 6,500 MMK net driver earnings per trip after 15% platform fee
  const tripsPerDay = Math.round(hoursPerDay * 2.2);
  const dailyEarnings = tripsPerDay * 6500;
  const weeklyEarnings = dailyEarnings * daysPerWeek;
  const monthlyEarnings = weeklyEarnings * 4.2;

  return (
    <div className="bg-white rounded-4xl p-6 md:p-8 border border-brand-border shadow-soft-lg max-w-xl mx-auto space-y-6">
      <div>
        <span className="badge-gold mb-2">TRANSPARENT EARNINGS ESTIMATOR</span>
        <h3 className="text-lg font-extrabold text-neutral-900">
          Calculate Your Weekly Driver Earnings
        </h3>
        <p className="text-xs text-neutral-500">
          Based on Yangon average trip rates with 15% low commission and daily payouts.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-bold text-neutral-700 mb-1.5">
            <span>Hours online per day:</span>
            <span className="text-brand-red font-extrabold">{hoursPerDay} Hours</span>
          </div>
          <input
            type="range"
            min="4"
            max="14"
            step="1"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="w-full accent-brand-red cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs font-bold text-neutral-700 mb-1.5">
            <span>Days driving per week:</span>
            <span className="text-brand-red font-extrabold">{daysPerWeek} Days</span>
          </div>
          <input
            type="range"
            min="1"
            max="7"
            step="1"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(Number(e.target.value))}
            className="w-full accent-brand-red cursor-pointer"
          />
        </div>
      </div>

      {/* Projection Display */}
      <div className="grid grid-cols-2 gap-3 p-5 rounded-3xl bg-brand-bg border border-brand-border">
        <div>
          <div className="text-[11px] font-bold text-neutral-500 uppercase">Est. Weekly Payout</div>
          <div className="text-xl font-black text-neutral-900 mt-1">
            {weeklyEarnings.toLocaleString()} <span className="text-xs font-bold text-neutral-500">MMK</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold text-neutral-500 uppercase">Est. Monthly Total</div>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {Math.round(monthlyEarnings).toLocaleString()} <span className="text-xs font-bold text-emerald-700">MMK</span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-neutral-500 leading-relaxed text-center">
        * Estimates based on typical daytime and peak hour trips in Yangon. Actual earnings depend on hours driven, passenger demand, and driver rating incentives.
      </div>
    </div>
  );
};
