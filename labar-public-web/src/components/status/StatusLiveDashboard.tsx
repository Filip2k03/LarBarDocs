import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { StatusService } from '@/services/status.service';
import { ApiErrorState } from '@/components/common/ApiErrorState';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import type { PlatformStatusResponse } from '@/types/status';

export const StatusLiveDashboard: React.FC = () => {
  const [data, setData] = useState<PlatformStatusResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try { setData(await StatusService.getPlatformStatus()); }
    catch (err) { setData(null); setError(err as Error); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);
  if (loading && !data) return <LoadingSkeleton rows={2} className="my-8" />;
  if (error) return <ApiErrorState error={error} onRetry={load} title="Live status is unavailable" />;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${data.operational ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{data.operational ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}</div>
          <div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-neutral-400">Go API response</p><h2 className="mt-1 text-xl font-black text-neutral-950">{data.operational ? 'Service is reporting operational' : 'Service needs attention'}</h2><p className="mt-2 text-xs leading-5 text-neutral-500">Checked {new Date(data.checked_at).toLocaleString()}. No component uptime or latency is shown because the API did not return it.</p></div>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn-secondary min-h-11 shrink-0"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button>
      </div>
    </div>
  );
};
