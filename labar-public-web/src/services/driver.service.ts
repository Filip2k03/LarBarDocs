import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  DriverApplicationRequest, 
  DriverApplicationResponse 
} from '@/types/driver';

export class DriverService {
  public static async submitApplication(request: DriverApplicationRequest): Promise<DriverApplicationResponse> {
    return ApiClient.post<DriverApplicationResponse>(API_ENDPOINTS.driverApplications, {
      type: 'driver_application', priority: 'normal', subject: `Driver application: ${request.full_name}`,
      description: JSON.stringify({ city: request.city_slug, nrc: request.nrc_number, licence: request.driving_licence_number, licence_class: request.licence_class, has_vehicle: request.has_own_vehicle, vehicle_type: request.vehicle_type, vehicle: request.vehicle_make_model, work_type: request.preferred_work_type }),
      contact: `${request.full_name} | ${request.phone}${request.email ? ` | ${request.email}` : ''}`,
    });
  }

  public static async checkApplicationStatus(refNumber: string): Promise<DriverApplicationResponse> {
    return ApiClient.get<DriverApplicationResponse>(API_ENDPOINTS.driverApplicationStatus(refNumber));
  }
}
