export interface RideType {
  id: string;
  code: 'standard' | 'comfort' | 'premium' | 'xl' | 'ev' | 'delivery';
  name: string;
  name_mm: string;
  description: string;
  description_mm: string;
  capacity_passengers: number;
  capacity_luggage: number;
  base_fare_mmk: number;
  rate_per_km_mmk: number;
  rate_per_minute_mmk: number;
  minimum_fare_mmk: number;
  icon_name: string;
  image_url: string;
  is_available: boolean;
  estimated_eta_minutes: number;
  features: string[];
  features_mm: string[];
}

export interface RideOptionQuote {
  ride_type: RideType;
  estimated_fare_mmk: number;
  currency: string;
  discount_mmk?: number;
  final_fare_mmk: number;
  surge_multiplier: number;
  eta_pickup_minutes: number;
}
