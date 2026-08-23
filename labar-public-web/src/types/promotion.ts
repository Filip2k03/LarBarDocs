export interface Promotion {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  discount_percent?: number | null;
  discount_fixed_mmk?: number | null;
  maximum_discount_mmk?: number | null;
  codes: string[];
}
