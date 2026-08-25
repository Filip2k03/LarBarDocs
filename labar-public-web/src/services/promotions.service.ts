import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Promotion } from '@/types/promotion';

export class PromotionsService {
  public static async getActivePromotions(citySlug?: string): Promise<Promotion[]> {
    return ApiClient.get<Promotion[]>(API_ENDPOINTS.promotions, {
      params: citySlug ? { city: citySlug } : undefined,
    });
  }

}
