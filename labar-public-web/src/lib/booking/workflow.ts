import { z } from 'zod';
import type { LocationPoint } from '@/types/booking';

export const bookingStages = ['auth', 'route', 'options', 'confirmed'] as const;
export type BookingStage = (typeof bookingStages)[number];
export type BookingPaymentMethod = 'cash' | 'wallet' | 'kbzpay' | 'wavepay' | 'ayapay';

const transitions: Record<BookingStage, readonly BookingStage[]> = {
  auth: ['route'],
  route: ['auth', 'options'],
  options: ['auth', 'route', 'confirmed'],
  confirmed: ['auth', 'route'],
};

export function canTransitionBooking(from: BookingStage, to: BookingStage): boolean {
  return from === to || transitions[from].includes(to);
}

export function normalizeMyanmarPhone(value: string): string {
  const compact = value.replace(/[\s()-]/g, '');
  if (compact.startsWith('+959')) return `0${compact.slice(3)}`;
  if (compact.startsWith('959')) return `0${compact.slice(2)}`;
  return compact;
}

export const myanmarPhoneSchema = z
  .string()
  .transform(normalizeMyanmarPhone)
  .pipe(z.string().regex(/^09\d{7,9}$/, 'Enter a valid Myanmar mobile number.'));

const locationSchema: z.ZodType<LocationPoint> = z.object({
  address: z.string().min(1),
  name: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  place_id: z.string().optional(),
});

export const bookingDraftSchema = z.object({
  pickup: locationSchema.nullable(),
  destination: locationSchema.nullable(),
  passengers: z.number().int().min(1).max(8),
  promoCode: z.string().max(50),
  paymentMethod: z.enum(['cash', 'wallet', 'kbzpay', 'wavepay', 'ayapay']),
  notes: z.string().max(200),
});

export type BookingDraft = z.infer<typeof bookingDraftSchema>;

export function parseBookingDraft(value: string | null): BookingDraft | null {
  if (!value) return null;
  try {
    const parsed = bookingDraftSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function isQuoteExpired(expiresAt: string, now = Date.now()): boolean {
  const expiry = new Date(expiresAt).getTime();
  return !Number.isFinite(expiry) || expiry <= now;
}
