import React from 'react';
import { BarChart3, CalendarClock, ReceiptText } from 'lucide-react';

export const EarningsCalculator: React.FC = () => (
  <div className="mx-auto max-w-xl rounded-[2rem] border border-neutral-200 bg-neutral-950 p-6 text-white shadow-xl md:p-8">
    <span className="inline-flex rounded-full bg-brand-yellow px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-950">Transparent earnings</span>
    <h3 className="mt-5 text-2xl font-black tracking-tight">Know what each completed trip adds.</h3>
    <p className="mt-3 text-sm leading-6 text-neutral-400">Earnings depend on real trips, active pricing, adjustments and payout policy. LaBar does not publish a speculative income calculator.</p>
    <div className="mt-7 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl bg-white/5 p-4"><ReceiptText size={20} className="text-brand-yellow" /><strong className="mt-3 block text-xs">Trip ledger</strong></div>
      <div className="rounded-2xl bg-white/5 p-4"><BarChart3 size={20} className="text-brand-yellow" /><strong className="mt-3 block text-xs">Daily summary</strong></div>
      <div className="rounded-2xl bg-white/5 p-4"><CalendarClock size={20} className="text-brand-yellow" /><strong className="mt-3 block text-xs">Payout history</strong></div>
    </div>
  </div>
);
