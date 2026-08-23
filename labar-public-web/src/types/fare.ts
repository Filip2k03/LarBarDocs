export interface FareRule {
  city: string;
  pricing_version_id: string;
  version: number;
  ride_type: string;
  base_fare_mmk: number;
  included_distance_meters: number;
  per_km_mmk: number;
  low_speed_threshold_kph: number;
  low_speed_per_minute_mmk: number;
  booking_fee_mmk: number;
  service_fee_mmk: number;
}

export interface FareEstimateRequest {
  city_slug: string;
  distance_km: number;
  duration_minutes: number;
  ride_type_code?: string;
  is_night?: boolean;
  is_airport?: boolean;
}

export interface FareEstimateResult {
  ride_type_code: string;
  ride_type_name: string;
  base_fare: number;
  distance_fare: number;
  time_fare: number;
  surcharges: { name: string; amount: number }[];
  total_estimate_mmk: number;
  currency: string;
}
