export interface City {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  services?: string[];
}
