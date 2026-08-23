import React, { useEffect, useState } from 'react';
import { ArrowRight, Car, Users } from 'lucide-react';
import { RidesService } from '@/services/rides.service';
import { ApiErrorState } from '@/components/common/ApiErrorState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import type { RideType } from '@/types/ride';

interface Props { citySlug?: string; locale?: 'en' | 'my'; }

export const RideTiersGrid: React.FC<Props> = ({ citySlug = 'yangon' }) => {
  const [items, setItems] = useState<RideType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const load = async () => {
    setLoading(true); setError(null);
    try { setItems(await RidesService.getRideTypes(citySlug)); }
    catch (err) { setItems([]); setError(err as Error); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [citySlug]);
  if (loading) return <LoadingSkeleton rows={3} className="my-6" />;
  if (error) return <ApiErrorState error={error} onRetry={load} title="Ride types are unavailable" />;
  if (!items.length) return <p className="rounded-3xl border border-neutral-200 bg-white p-7 text-center text-sm text-neutral-600">No active ride types were returned for this city.</p>;

  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => (
    <article key={item.id} className="group rounded-[1.75rem] border border-neutral-200 bg-white p-5 transition hover:-translate-y-1 hover:border-brand-red/30 hover:shadow-xl">
      <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-brand-red"><Car size={21} /></span><span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600">{item.service}</span></div>
      <h3 className="mt-5 text-lg font-black text-neutral-950">{item.name}</h3>
      <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-neutral-500"><Users size={14} /> Up to {item.capacity} passengers</p>
      <a href={`/ride?tier=${encodeURIComponent(item.code)}`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-brand-red">Check this ride <ArrowRight size={15} /></a>
    </article>
  ))}</div>;
};
