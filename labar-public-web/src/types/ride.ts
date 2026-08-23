export interface RideType {
  id: string;
  code: string;
  name: string;
  capacity: number;
  service: string;
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
