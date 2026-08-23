export interface Promotion {
  id: string;
  code: string;
  title: string;
  title_mm: string;
  description: string;
  description_mm: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number; // e.g. 20 (20%) or 1500 (1500 MMK)
  max_discount_mmk?: number;
  min_spend_mmk: number;
  valid_from: string;
  valid_until: string;
  applicable_cities: string[];
  applicable_ride_types: string[];
  banner_image_url?: string;
  is_active: boolean;
  terms: string[];
  terms_mm: string[];
}
