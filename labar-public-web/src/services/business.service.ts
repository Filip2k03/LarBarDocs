import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  BusinessInquiryRequest, 
  BusinessInquiryResponse 
} from '@/types/business';

export class BusinessService {
  public static async submitInquiry(request: BusinessInquiryRequest): Promise<BusinessInquiryResponse> {
    return ApiClient.post<BusinessInquiryResponse>(API_ENDPOINTS.businessInquiries, request);
  }
}
