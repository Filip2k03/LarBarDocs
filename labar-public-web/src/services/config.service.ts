import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { SystemConfig } from '@/types/api';

export class ConfigService {
  public static async getSystemConfig(): Promise<SystemConfig> {
    return ApiClient.get<SystemConfig>(API_ENDPOINTS.config);
  }
}
