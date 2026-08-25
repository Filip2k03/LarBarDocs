import React, { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { SupportService } from '@/services/support.service';
import { ApiErrorState } from '../common/ApiErrorState';
import type { SupportTicketRequest, SupportTicketResponse } from '@/types/support';

export const SupportTicketForm: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [category, setCategory] = useState<SupportTicketRequest['category']>('RIDE_ISSUE');
  const [bookingRef, setBookingRef] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<SupportTicketResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload: SupportTicketRequest = {
      full_name: fullName,
      phone,
      email,
      category,
      booking_reference: bookingRef || undefined,
      subject,
      message,
    };

    try {
      const res = await SupportService.submitTicket(payload);
      setResponse(res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (response) {
    return (
      <div className="bg-white rounded-4xl p-8 border border-emerald-200 shadow-soft-lg text-center space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <span className="badge-green">TICKET SUBMITTED</span>
        <h3 className="text-xl font-extrabold text-neutral-900">
          Support Ticket #{response.id}
        </h3>
        <p className="text-xs text-neutral-600 leading-relaxed">
          The LaBar API accepted your request with status <strong>{response.status}</strong>. Keep this ticket ID for follow-up.
        </p>
        <button
          type="button"
          onClick={() => setResponse(null)}
          className="text-xs font-bold text-brand-red hover:underline mt-2"
        >
          Submit another ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-4xl p-6 md:p-8 border border-brand-border shadow-soft-lg space-y-4 max-w-xl mx-auto">
      <div className="border-b border-neutral-100 pb-3">
        <h3 className="text-lg font-extrabold text-neutral-900">
          Passenger &amp; Driver Support Ticket
        </h3>
        <p className="text-xs text-neutral-500 mt-0.5">
          Submit an inquiry, payment dispute, lost item report, or safety feedback.
        </p>
      </div>

      {error && <ApiErrorState error={error} onRetry={() => setError(null)} />}

      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Ko Aung Naing"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-white border border-brand-border rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="09123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white border border-brand-border rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="aungnaing@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-brand-border rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Inquiry Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-white border border-brand-border rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 outline-none"
            >
              <option value="RIDE_ISSUE">Ride &amp; Route Issue</option>
              <option value="PAYMENT_DISPUTE">Payment &amp; KBZPay Dispute</option>
              <option value="LOST_ITEM">Lost Item in Taxi</option>
              <option value="SAFETY_REPORT">Safety &amp; Guardian Report</option>
              <option value="DRIVER_BEHAVIOR">Driver Feedback</option>
              <option value="APP_BUG">App Bug &amp; Technical Help</option>
              <option value="OTHER">Other Inquiry</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              Booking Ref (Optional)
            </label>
            <input
              type="text"
              placeholder="LB-YGN-123456"
              value={bookingRef}
              onChange={(e) => setBookingRef(e.target.value)}
              className="w-full bg-white border border-brand-border rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Subject
          </label>
          <input
            type="text"
            required
            placeholder="Brief description of the issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white border border-brand-border rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
            Detailed Message
          </label>
          <textarea
            required
            rows={4}
            placeholder="Please provide full details so our team can resolve your case promptly..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-white border border-brand-border rounded-2xl p-3 text-xs font-medium text-neutral-900 outline-none"
          />
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
            <span>Submitting Ticket...</span>
          </>
        ) : (
          <span>Submit Support Ticket</span>
        )}
      </button>
    </form>
  );
};
