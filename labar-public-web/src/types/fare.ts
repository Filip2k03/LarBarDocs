export interface FareRule {
  city_slug: string;
  ride_type_code: string;
  base_fare_mmk: number;
  rate_per_km_mmk: number;
  rate_per_minute_mmk: number;
  minimum_fare_mmk: number;
  night_surcharge_percent: number; // e.g. 15% (11 PM - 5 AM)
  airport_toll_fee_mmk: number;
  cancellation_fee_mmk: number;
  effective_date: string;
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
