import type { RideOptionQuote } from './ride';

export interface LocationPoint {
  address: string;
  name?: string;
  latitude: number;
  longitude: number;
  place_id?: string;
}

export interface BookingQuoteRequest {
  pickup: LocationPoint;
  destination: LocationPoint;
  stops?: LocationPoint[];
  passenger_count?: number;
  promo_code?: string;
  schedule_time?: string; // ISO date string if scheduled
}

export interface BookingQuoteResponse {
  quote_id: string;
  distance_km: number;
  duration_minutes: number;
  currency: string;
  pickup: LocationPoint;
  destination: LocationPoint;
  stops: LocationPoint[];
  ride_options: RideOptionQuote[];
  expires_at: string;
  created_at: string;
}

export interface CreateBookingRequest {
  quote_id: string;
  ride_type_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  payment_method: 'KBZPAY' | 'WAVEPAY' | 'CB_PAY' | 'AYA_PAY' | 'CASH';
  note_for_driver?: string;
  guardian_phone?: string;
}

export interface BookingRecord {
  booking_id: string;
  booking_reference: string;
  status: 'PENDING_DISPATCH' | 'OFFERING' | 'ACCEPTED' | 'ARRIVING' | 'IN_TRIP' | 'COMPLETED' | 'CANCELLED';
  customer_name: string;
  customer_phone: string;
  pickup: LocationPoint;
  destination: LocationPoint;
  ride_type_name: string;
  fare_mmk: number;
  currency: string;
  payment_method: string;
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED';
  assigned_driver?: {
    driver_id: string;
    name: string;
    phone: string;
    rating: number;
    vehicle_plate: string;
    vehicle_model: string;
    vehicle_color: string;
    current_location?: {
      latitude: number;
      longitude: number;
    };
  };
  created_at: string;
  estimated_arrival_at?: string;
}
