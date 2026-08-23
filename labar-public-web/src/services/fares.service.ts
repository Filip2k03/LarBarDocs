import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { FareRule, FareEstimateRequest, FareEstimateResult } from '@/types/fare';

export class FaresService {
  public static async getFareRules(citySlug?: string): Promise<FareRule[]> {
    return ApiClient.get<FareRule[]>(API_ENDPOINTS.fares, {
      params: citySlug ? { city: citySlug } : undefined,
    });
  }

  public static async calculateFareEstimate(request: FareEstimateRequest): Promise<FareEstimateResult> {
    return ApiClient.post<FareEstimateResult>(API_ENDPOINTS.fareEstimate, request);
  }
}
