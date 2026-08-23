import React, { useState } from 'react';
import { User, Phone, MapPin, Car, Shield, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { DriverService } from '@/services/driver.service';
import { ApiErrorState } from '../common/ApiErrorState';
import type { DriverApplicationRequest, DriverApplicationResponse } from '@/types/driver';

export const DriverApplicationForm: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [citySlug, setCitySlug] = useState<string>('yangon');
  const [nrcNumber, setNrcNumber] = useState<string>('');
  const [licenceNumber, setLicenceNumber] = useState<string>('');
  const [licenceClass, setLicenceClass] = useState<'B' | 'A' | 'T'>('B');
  const [hasOwnVehicle, setHasOwnVehicle] = useState<boolean>(true);
  const [vehicleType, setVehicleType] = useState<'STANDARD' | 'COMFORT' | 'PREMIUM' | 'XL' | 'EV'>('STANDARD');
  const [vehicleMakeModel, setVehicleMakeModel] = useState<string>('Toyota Probox (2018)');
  const [preferredWorkType, setPreferredWorkType] = useState<'FULL_TIME' | 'PART_TIME' | 'WEEKENDS'>('FULL_TIME');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [submittedResult, setSubmittedResult] = useState<DriverApplicationResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload: DriverApplicationRequest = {
      full_name: fullName,
      phone,
      city_slug: citySlug,
      nrc_number: nrcNumber,
      driving_licence_number: licenceNumber,
      licence_class: licenceClass,
      has_own_vehicle: hasOwnVehicle,
      vehicle_type: vehicleType,
      vehicle_make_model: vehicleMakeModel,
      preferred_work_type: preferredWorkType,
    };

    try {
      const response = await DriverService.submitApplication(payload);
      setSubmittedResult(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (submittedResult) {
    return (
      <div className="bg-white rounded-4xl p-8 border border-emerald-200 shadow-soft-lg text-center space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>

        <span className="badge-green">APPLICATION RECEIVED</span>

        <h3 className="text-xl font-extrabold text-neutral-900">
          Application received. Reference #{submittedResult.id}
        </h3>

        <p className="text-xs text-neutral-600 leading-relaxed">
          The LaBar API accepted the application with status <strong>{submittedResult.status}</strong>.
        </p>

        <button
          type="button"
          onClick={() => setSubmittedResult(null)}
          className="mt-4 text-xs font-bold text-brand-red hover:underline"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-4xl p-6 md:p-8 border border-brand-border shadow-soft-lg space-y-5 max-w-xl mx-auto">
      <div className="border-b border-neutral-100 pb-4">
        <h3 className="text-lg font-extrabold text-neutral-900">
          Driver Partner Online Registration
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Join Myanmar’s safest and highest-earning ride-hailing network.
        </p>
      </div>

      {error && <ApiErrorState error={error} onRetry={() => setError(null)} />}

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Full Name (နာမည်အပြည့်အစုံ)
          </label>
          <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5">
            <User size={16} className="text-neutral-400 mr-2 shrink-0" />
            <input
              type="text"
              required
              placeholder="e.g. U Myint Kyaw"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs font-semibold text-neutral-900 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Phone Number (ဖုန်းနံပါတ်)
            </label>
            <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5">
              <Phone size={16} className="text-neutral-400 mr-2 shrink-0" />
              <input
                type="tel"
                required
                placeholder="09798421092"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-semibold text-neutral-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Operating City (မြို့)
            </label>
            <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5">
              <MapPin size={16} className="text-neutral-400 mr-2 shrink-0" />
              <select
                value={citySlug}
                onChange={(e) => setCitySlug(e.target.value)}
                className="w-full text-xs font-semibold text-neutral-900 outline-none bg-transparent"
              >
                <option value="yangon">Yangon (ရန်ကုန်)</option>
                <option value="mandalay">Mandalay (မန္တလေး)</option>
                <option value="naypyidaw">Naypyidaw (နေပြည်တော်)</option>
                <option value="taunggyi">Taunggyi (တောင်ကြီး)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              NRC Number (မှတ်ပုံတင်အမှတ်)
            </label>
            <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5">
              <FileText size={16} className="text-neutral-400 mr-2 shrink-0" />
              <input
                type="text"
                required
                placeholder="8/MABANA(N)000903"
                value={nrcNumber}
                onChange={(e) => setNrcNumber(e.target.value)}
                className="w-full text-xs font-semibold text-neutral-900 outline-none uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Licence Number (လိုင်စင်အမှတ်)
            </label>
            <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5">
              <Shield size={16} className="text-neutral-400 mr-2 shrink-0" />
              <input
                type="text"
                required
                placeholder="B/00548/11"
                value={licenceNumber}
                onChange={(e) => setLicenceNumber(e.target.value)}
                className="w-full text-xs font-semibold text-neutral-900 outline-none uppercase"
              />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border space-y-2">
          <div className="text-xs font-bold text-neutral-900">Vehicle Information</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setHasOwnVehicle(true)}
              className={`p-2 rounded-xl font-bold border transition-all ${
                hasOwnVehicle ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-neutral-700'
              }`}
            >
              I have my own vehicle
            </button>
            <button
              type="button"
              onClick={() => setHasOwnVehicle(false)}
              className={`p-2 rounded-xl font-bold border transition-all ${
                !hasOwnVehicle ? 'bg-brand-red text-white border-brand-red' : 'bg-white text-neutral-700'
              }`}
            >
              Need platform vehicle
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 px-6 rounded-2xl bg-brand-red hover:bg-brand-deepRed text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Submitting Driver Application...</span>
          </>
        ) : (
          <span>Submit Driver Application (အခမဲ့ စာရင်းသွင်းမည်)</span>
        )}
      </button>
    </form>
  );
};
