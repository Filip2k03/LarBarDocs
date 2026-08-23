export interface CityZone {
  zone_id: string;
  name: string;
  name_mm: string;
  is_active: boolean;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  name_mm: string;
  state_region: string;
  state_region_mm: string;
  is_active: boolean;
  services_available: ('ride' | 'delivery' | 'airport' | 'schedule' | 'business')[];
  center_lat: number;
  center_lng: number;
  zoom_level: number;
  active_drivers_count: number;
  description: string;
  description_mm: string;
  popular_destinations: {
    name: string;
    name_mm: string;
    lat: number;
    lng: number;
    category: 'airport' | 'mall' | 'pagoda' | 'station' | 'hospital';
  }[];
  zones: CityZone[];
}
