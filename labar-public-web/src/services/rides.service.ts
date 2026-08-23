import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { RideType } from '@/types/ride';

export class RidesService {
  public static async getRideTypes(citySlug?: string): Promise<RideType[]> {
    return ApiClient.get<RideType[]>(API_ENDPOINTS.rideTypes, {
      params: citySlug ? { city: citySlug } : undefined,
    });
  }
}
