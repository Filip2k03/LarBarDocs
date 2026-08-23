import React from 'react';
import { ArrowRight, Car, Clock3, MapPin, ShieldCheck, Smartphone } from 'lucide-react';

export const HeroBookingWidget: React.FC = () => (
  <aside className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-[0_30px_80px_-32px_rgba(23,23,23,.45)] backdrop-blur-xl sm:p-6" aria-label="Book a LaBar ride">
    <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand-yellow/25 blur-3xl" />
    <div className="relative">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-brand-red"><Car size={14} /> Ride with LaBar</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500"><ShieldCheck size={14} className="text-emerald-600" /> Account protected</span>
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-tight text-neutral-950">Tell us where. We’ll handle the road.</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-600">Sign in with your passenger account, choose two real map locations, then see fare options returned by LaBar’s API.</p>

      <div className="mt-6 space-y-2.5 rounded-3xl bg-neutral-50 p-4">
        <div className="flex min-h-12 items-center rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-500"><span className="mr-3 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" /><span>Your pickup</span></div>
        <div className="ml-[21px] h-3 border-l-2 border-dotted border-neutral-300" />
        <div className="flex min-h-12 items-center rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-500"><MapPin size={17} className="mr-3 text-brand-red" /><span>Your destination</span></div>
      </div>

      <a href="/ride?intent=book" className="btn-primary mt-5 min-h-13 w-full text-sm">Book a ride <ArrowRight size={18} /></a>
      <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] font-semibold text-neutral-500">
        <span className="flex items-center gap-2"><Clock3 size={14} /> Live API quote</span>
        <span className="flex items-center justify-end gap-2"><Smartphone size={14} /> App handoff ready</span>
      </div>
    </div>
  </aside>
);
