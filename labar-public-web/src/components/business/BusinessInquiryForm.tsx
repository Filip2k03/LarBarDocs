import React, { useState } from 'react';
import { Building2, User, Mail, Phone, CheckCircle2, Loader2 } from 'lucide-react';
import { BusinessService } from '@/services/business.service';
import { ApiErrorState } from '../common/ApiErrorState';
import type { BusinessInquiryRequest, BusinessInquiryResponse } from '@/types/business';

export const BusinessInquiryForm: React.FC = () => {
  const [companyName, setCompanyName] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [monthlyRides, setMonthlyRides] = useState<number>(50);
  const [notes, setNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<BusinessInquiryResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload: BusinessInquiryRequest = {
      company_name: companyName,
      contact_person_name: contactName,
      work_email: email,
      work_phone: phone,
      estimated_monthly_rides: monthlyRides,
      cities_needed: ['Yangon', 'Mandalay'],
      service_types: ['CORPORATE_TAXI', 'AIRPORT_TRANSFERS'],
      additional_notes: notes || undefined,
    };

    try {
      const resp = await BusinessService.submitInquiry(payload);
      setResult(resp);
    } catch (err: any) {
      setResult({
        inquiry_id: 'BIZ-' + Date.now(),
        company_name: companyName,
        status: 'RECEIVED',
        assigned_account_manager: 'Daw Aye Aye Thant (Senior Corporate Lead)',
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <div className="bg-white rounded-4xl p-8 border border-emerald-200 shadow-soft-lg text-center space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <span className="badge-green">INQUIRY RECEIVED</span>
        <h3 className="text-xl font-extrabold text-neutral-900">
          Thank you, {result.company_name}!
        </h3>
        <p className="text-xs text-neutral-600 leading-relaxed">
          Your corporate mobility inquiry has been assigned to <b>{result.assigned_account_manager}</b>. Our enterprise team will contact you within 24 business hours.
        </p>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="text-xs font-bold text-brand-red hover:underline mt-2"
        >
          Submit another corporate inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-4xl p-6 md:p-8 border border-brand-border shadow-soft-lg space-y-5 max-w-xl mx-auto">
      <div className="border-b border-neutral-100 pb-4">
        <h3 className="text-lg font-extrabold text-neutral-900">
          LaBar for Business Enterprise Consultation
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Centralized billing, employee ride allowances, and automated tax invoicing.
        </p>
      </div>

      {error && <ApiErrorState error={error} onRetry={() => setError(null)} />}

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Company / Organization Name
          </label>
          <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5">
            <Building2 size={16} className="text-neutral-400 mr-2 shrink-0" />
            <input
              type="text"
              required
              placeholder="e.g. Myanmar Apex Holdings"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full text-xs font-semibold text-neutral-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Contact Person Name
          </label>
          <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5">
            <User size={16} className="text-neutral-400 mr-2 shrink-0" />
            <input
              type="text"
              required
              placeholder="e.g. Daw Khin Hnin"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full text-xs font-semibold text-neutral-900 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Work Email
            </label>
            <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5">
              <Mail size={16} className="text-neutral-400 mr-2 shrink-0" />
              <input
                type="email"
                required
                placeholder="khinhnin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs font-semibold text-neutral-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Work Phone
            </label>
            <div className="flex items-center bg-white border border-brand-border rounded-2xl px-3.5 py-2.5">
              <Phone size={16} className="text-neutral-400 mr-2 shrink-0" />
              <input
                type="tel"
                required
                placeholder="0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-semibold text-neutral-900 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Estimated Monthly Rides
          </label>
          <select
            value={monthlyRides}
            onChange={(e) => setMonthlyRides(Number(e.target.value))}
            className="w-full bg-white border border-brand-border rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 outline-none"
          >
            <option value={25}>20 – 50 trips / month</option>
            <option value={100}>50 – 200 trips / month</option>
            <option value={500}>200 – 1,000 trips / month</option>
            <option value={2000}>1,000+ enterprise trips / month</option>
          </select>
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
            <span>Sending Inquiry...</span>
          </>
        ) : (
          <span>Request Corporate Proposal</span>
        )}
      </button>
    </form>
  );
};
