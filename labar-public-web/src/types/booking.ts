export interface LocationPoint {
  address: string;
  name?: string;
  latitude: number;
  longitude: number;
  place_id?: string;
}

export interface QuotePoint {
  lat: number;
  lng: number;
}

export interface BookingQuoteRequest {
  pickup: QuotePoint;
  destination: QuotePoint;
  city?: string;
  passengers?: number;
  promo_code?: string;
  scheduled_at?: string;
  payment_method?: string;
}

export interface PricingBreakdown {
  base_fare_mmk: number;
  included_distance_meters: number;
  extra_distance_meters: number;
  distance_fare_mmk: number;
  low_speed_fare_mmk: number;
  booking_fee_mmk: number;
  service_fee_mmk: number;
  surcharge_mmk: number;
  discount_mmk: number;
  total_mmk: number;
}

export interface BookingRideOption {
  ride_type_id: string;
  code: string;
  name: string;
  capacity: number;
  estimated_driver_arrival_seconds?: number | null;
  fare: number;
  currency: string;
  pricing_breakdown: PricingBreakdown;
}

export interface BookingQuoteResponse {
  quote_id: string;
  pricing_version_id: string;
  expires_at: string;
  distance_meters: number;
  duration_seconds: number;
  route_geometry?: string;
  ride_options: BookingRideOption[];
}

export interface CreateBookingRequest {
  quote_id: string;
  ride_type_id: string;
  payment_method: 'cash' | 'wallet' | 'kbzpay' | 'wavepay' | 'ayapay';
  payment_method_id?: string;
  notes?: string;
}

export interface BookingRecord {
  id: string;
  passenger_id: string;
  driver_id?: string;
  vehicle_id?: string;
  quote_id: string;
  ride_type_id: string;
  status: string;
  pickup_lat: number;
  pickup_lng: number;
  destination_lat: number;
  destination_lng: number;
  payment_method: string;
  estimated_total_mmk: number;
  final_total_mmk?: number;
  requested_at: string;
  pickup_pin?: string;
}
