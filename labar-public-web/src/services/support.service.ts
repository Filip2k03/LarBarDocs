import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  SupportTicketRequest, 
  SupportTicketResponse, 
  ContactInquiryRequest 
} from '@/types/support';

export class SupportService {
  public static async submitTicket(request: SupportTicketRequest): Promise<SupportTicketResponse> {
    return ApiClient.post<SupportTicketResponse>(API_ENDPOINTS.supportTickets, request);
  }

  public static async submitContactInquiry(request: ContactInquiryRequest): Promise<{ status: 'received'; message: string }> {
    return ApiClient.post<{ status: 'received'; message: string }>(API_ENDPOINTS.contactInquiry, request);
  }
}
