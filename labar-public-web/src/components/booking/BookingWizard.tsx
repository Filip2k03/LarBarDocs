import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Loader2, LockKeyhole, Phone, ShieldCheck } from 'lucide-react';
import { ApiErrorState } from '@/components/common/ApiErrorState';
import { LocationAutocomplete } from './LocationAutocomplete';
import { AuthService } from '@/services/auth.service';
import { BookingService } from '@/services/booking.service';
import { API_CONFIG } from '@/lib/api/config';
import type { AuthSession, OtpChallenge } from '@/types/auth';
import type { BookingQuoteResponse, BookingRecord, BookingRideOption, LocationPoint } from '@/types/booking';

type Stage = 'auth' | 'route' | 'options' | 'confirmed';
type PaymentMethod = 'cash' | 'wallet' | 'kbzpay' | 'wavepay' | 'ayapay';

const money = (value: number, currency = 'MMK') =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value) + ` ${currency}`;

export const BookingWizard: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [stage, setStage] = useState<Stage>('auth');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [pickup, setPickup] = useState<LocationPoint | null>(null);
  const [destination, setDestination] = useState<LocationPoint | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [quote, setQuote] = useState<BookingQuoteResponse | null>(null);
  const [selected, setSelected] = useState<BookingRideOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const saved = AuthService.getSession();
    if (!saved) return;
    setSession(saved);
    setStage('route');
    AuthService.me(saved.access_token).catch(() => {
      AuthService.clearSession();
      setSession(null);
      setStage('auth');
    });
  }, []);

  const quoteExpired = useMemo(
    () => Boolean(quote && new Date(quote.expires_at).getTime() <= Date.now()),
    [quote]
  );

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      setChallenge(await AuthService.requestOtp(phone.trim()));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!challenge) return;
    setError(null);
    setIsLoading(true);
    try {
      const next = await AuthService.verifyOtp(challenge.challenge_id, phone.trim(), code.trim());
      AuthService.saveSession(next);
      setSession(next);
      setStage('route');
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestQuote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pickup || !destination) return;
    setError(null);
    setIsLoading(true);
    try {
      const next = await BookingService.getBookingQuote({
        pickup: { lat: pickup.latitude, lng: pickup.longitude },
        destination: { lat: destination.latitude, lng: destination.longitude },
        city: 'yangon',
        passengers,
        promo_code: promoCode.trim() || undefined,
        payment_method: paymentMethod,
      });
      setQuote(next);
      setSelected(next.ride_options[0] || null);
      setStage('options');
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !quote || !selected || quoteExpired) return;
    setError(null);
    setIsLoading(true);
    try {
      const key = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${quote.quote_id}`;
      const result = await BookingService.createBooking(
        {
          quote_id: quote.quote_id,
          ride_type_id: selected.ride_type_id,
          payment_method: paymentMethod,
          notes: notes.trim() || undefined,
        },
        session.access_token,
        key
      );
      setBooking(result);
      setStage('confirmed');
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.clearSession();
    setSession(null);
    setStage('auth');
    setQuote(null);
  };

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-[0_24px_70px_-30px_rgba(23,23,23,.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4 sm:px-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-brand-red">Real Go API booking</p>
          <h2 className="mt-1 text-lg font-extrabold text-neutral-950">{stage === 'auth' ? 'Sign in to start' : stage === 'route' ? 'Where can we take you?' : stage === 'options' ? 'Choose your ride' : 'Your request is live'}</h2>
        </div>
        {session && stage !== 'confirmed' && (
          <button type="button" onClick={logout} className="min-h-11 rounded-full border border-neutral-200 px-4 text-xs font-bold text-neutral-600 hover:bg-neutral-50">Change account</button>
        )}
      </div>

      <div className="p-5 sm:p-8">
        {error && <ApiErrorState error={error} onRetry={() => setError(null)} className="mb-6" />}

        {stage === 'auth' && (
          <div className="grid gap-7 md:grid-cols-[1fr_.85fr] md:items-center">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-brand-red"><LockKeyhole size={22} /></div>
              <h3 className="text-2xl font-black tracking-tight text-neutral-950">Your account keeps the ride connected.</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">We use LaBar phone verification before showing location results or confirming a ride. The same passenger account works in the mobile app.</p>
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-neutral-50 p-4 text-xs leading-5 text-neutral-600">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <span>No ride, fare, driver, or confirmation is created unless the Go API returns it.</span>
              </div>
            </div>
            {!challenge ? (
              <form onSubmit={requestOtp} className="space-y-4 rounded-3xl border border-neutral-200 bg-neutral-50/70 p-5">
                <label className="block text-xs font-bold text-neutral-700" htmlFor="booking-phone">Myanmar phone number</label>
                <div className="flex min-h-12 items-center rounded-2xl border border-neutral-200 bg-white px-4 focus-within:border-brand-red focus-within:ring-2 focus-within:ring-red-100">
                  <Phone size={17} className="mr-3 text-neutral-400" />
                  <input id="booking-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxxx" className="w-full bg-transparent text-sm font-semibold outline-none" />
                </div>
                <button disabled={isLoading} className="btn-primary min-h-12 w-full">{isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Send verification code <ArrowRight size={17} /></>}</button>
                <a href={API_CONFIG.passengerAppUrl} className="flex min-h-11 items-center justify-center text-xs font-bold text-neutral-600 underline decoration-neutral-300 underline-offset-4">Open the Passenger app instead</a>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4 rounded-3xl border border-neutral-200 bg-neutral-50/70 p-5">
                <p className="text-xs leading-5 text-neutral-600">Enter the one-time code sent to <strong>{phone}</strong>.</p>
                <label className="sr-only" htmlFor="booking-otp">Verification code</label>
                <input id="booking-otp" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" className="min-h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-center text-lg font-black tracking-[.3em] outline-none focus:border-brand-red focus:ring-2 focus:ring-red-100" />
                <button disabled={isLoading} className="btn-primary min-h-12 w-full">{isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Verify and continue'}</button>
                <button type="button" onClick={() => { setChallenge(null); setCode(''); }} className="min-h-11 w-full text-xs font-bold text-neutral-600">Use another number</button>
              </form>
            )}
          </div>
        )}

        {stage === 'route' && session && (
          <form onSubmit={requestQuote} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <LocationAutocomplete accessToken={session.access_token} required type="pickup" label="Pickup" placeholder="Search your pickup" value={pickup} onChange={setPickup} />
              <LocationAutocomplete accessToken={session.access_token} required type="dropoff" label="Destination" placeholder="Where are you going?" value={destination} onChange={setDestination} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-xs font-bold text-neutral-700">Passengers<select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="mt-2 min-h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-brand-red">{[1,2,3,4,5,6,7,8].map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
              <label className="text-xs font-bold text-neutral-700">Payment preference<select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-2 min-h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-brand-red"><option value="cash">Cash</option><option value="wallet">LaBar Wallet</option><option value="kbzpay">KBZPay</option><option value="wavepay">WavePay</option><option value="ayapay">AYA Pay</option></select></label>
              <label className="text-xs font-bold text-neutral-700">Promo code <span className="font-normal text-neutral-400">optional</span><input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className="mt-2 min-h-12 w-full rounded-2xl border border-neutral-200 px-4 text-sm font-semibold uppercase outline-none focus:border-brand-red" /></label>
            </div>
            <button disabled={isLoading || !pickup || !destination} className="btn-primary min-h-13 w-full sm:w-auto">{isLoading ? <><Loader2 size={18} className="animate-spin" /> Getting live options</> : <>See live ride options <ArrowRight size={17} /></>}</button>
          </form>
        )}

        {stage === 'options' && quote && (
          <form onSubmit={confirmBooking} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4 text-xs text-neutral-600"><span><strong className="text-neutral-950">{(quote.distance_meters / 1000).toFixed(1)} km</strong> · about {Math.ceil(quote.duration_seconds / 60)} min</span><span className="flex items-center gap-1.5"><Clock3 size={14} /> Quote expires {new Date(quote.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            {quote.ride_options.length ? <div className="grid gap-3">{quote.ride_options.map((option) => <button key={option.ride_type_id} type="button" onClick={() => setSelected(option)} className={`flex min-h-20 items-center justify-between rounded-2xl border p-4 text-left transition ${selected?.ride_type_id === option.ride_type_id ? 'border-brand-red bg-red-50 ring-2 ring-red-100' : 'border-neutral-200 hover:border-neutral-300'}`}><span><span className="block text-sm font-extrabold text-neutral-950">{option.name}</span><span className="mt-1 block text-xs text-neutral-500">Up to {option.capacity} passengers{option.estimated_driver_arrival_seconds ? ` · about ${Math.ceil(option.estimated_driver_arrival_seconds / 60)} min away` : ''}</span></span><strong className="ml-4 text-sm text-neutral-950">{money(option.fare, option.currency)}</strong></button>)}</div> : <p className="rounded-2xl bg-neutral-50 p-5 text-sm text-neutral-600">The API returned no ride types for this route.</p>}
            <label className="block text-xs font-bold text-neutral-700">Note for your driver <span className="font-normal text-neutral-400">optional</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={200} rows={3} className="mt-2 w-full rounded-2xl border border-neutral-200 p-4 text-sm outline-none focus:border-brand-red" /></label>
            {quoteExpired && <p className="rounded-2xl bg-amber-50 p-4 text-xs font-semibold text-amber-900">This quote has expired. Return to the route step for a fresh price.</p>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={() => setStage('route')} className="btn-secondary min-h-12"><ArrowLeft size={17} /> Change route</button><button disabled={isLoading || !selected || quoteExpired} className="btn-primary min-h-12">{isLoading ? <><Loader2 size={18} className="animate-spin" /> Sending request</> : <>Confirm {selected ? money(selected.fare, selected.currency) : ''} <ArrowRight size={17} /></>}</button></div>
          </form>
        )}

        {stage === 'confirmed' && booking && (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={34} /></div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-emerald-700">Accepted by LaBar API</p>
            <h3 className="mt-2 text-2xl font-black text-neutral-950">Your ride request is searching.</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">Ride ID <strong>{booking.id}</strong>. Open the passenger app to follow dispatch, driver location, and trip updates in real time.</p>
            <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 rounded-2xl bg-neutral-50 p-4 text-left text-xs"><span className="text-neutral-500">Status<strong className="mt-1 block text-neutral-950">{booking.status}</strong></span><span className="text-neutral-500">Estimated total<strong className="mt-1 block text-neutral-950">{money(booking.estimated_total_mmk)}</strong></span></div>
            <a href={API_CONFIG.passengerAppUrl} className="btn-primary mt-6 min-h-12">Continue in Passenger app <ArrowRight size={17} /></a>
          </div>
        )}
      </div>
    </div>
  );
};
