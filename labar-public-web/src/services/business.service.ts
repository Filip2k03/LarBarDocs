import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  BusinessInquiryRequest, 
  BusinessInquiryResponse 
} from '@/types/business';

export class BusinessService {
  public static async submitInquiry(request: BusinessInquiryRequest): Promise<BusinessInquiryResponse> {
    return ApiClient.post<BusinessInquiryResponse>(API_ENDPOINTS.businessInquiries, {
      type: 'business_inquiry', priority: 'normal', subject: `Business inquiry: ${request.company_name}`,
      description: JSON.stringify({ monthly_rides: request.estimated_monthly_rides, cities: request.cities_needed, services: request.service_types, notes: request.additional_notes }),
      contact: `${request.contact_person_name} | ${request.work_email} | ${request.work_phone}`,
    });
  }
}
