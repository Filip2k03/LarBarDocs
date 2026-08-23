import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { PlatformStatusResponse } from '@/types/status';

export class StatusService {
  public static async getPlatformStatus(): Promise<PlatformStatusResponse> {
    return ApiClient.get<PlatformStatusResponse>(API_ENDPOINTS.status);
  }
}
