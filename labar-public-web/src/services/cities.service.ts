import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { City } from '@/types/city';

export class CitiesService {
  public static async getAllCities(): Promise<City[]> {
    return ApiClient.get<City[]>(API_ENDPOINTS.cities);
  }

  public static async getCityBySlug(slug: string): Promise<City> {
    return ApiClient.get<City>(API_ENDPOINTS.cityBySlug(slug));
  }
}
