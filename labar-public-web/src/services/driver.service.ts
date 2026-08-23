import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  DriverApplicationRequest, 
  DriverApplicationResponse 
} from '@/types/driver';

export class DriverService {
  public static async submitApplication(request: DriverApplicationRequest): Promise<DriverApplicationResponse> {
    return ApiClient.post<DriverApplicationResponse>(API_ENDPOINTS.driverApplications, request);
  }

  public static async checkApplicationStatus(refNumber: string): Promise<DriverApplicationResponse> {
    return ApiClient.get<DriverApplicationResponse>(API_ENDPOINTS.driverApplicationStatus(refNumber));
  }
}
