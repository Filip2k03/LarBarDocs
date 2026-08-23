import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  SupportTicketRequest, 
  SupportTicketResponse, 
  ContactInquiryRequest 
} from '@/types/support';

export class SupportService {
  public static async submitTicket(request: SupportTicketRequest): Promise<SupportTicketResponse> {
    return ApiClient.post<SupportTicketResponse>(API_ENDPOINTS.supportTickets, {
      type: request.category.toLowerCase(), priority: 'normal', subject: request.subject,
      description: request.message,
      contact: [request.full_name, request.phone, request.email, request.booking_reference].filter(Boolean).join(' | '),
    });
  }

  public static async submitContactInquiry(request: ContactInquiryRequest): Promise<{ status: 'received'; message: string }> {
    return ApiClient.post<{ status: 'received'; message: string }>(API_ENDPOINTS.contactInquiry, {
      type: request.inquiry_type.toLowerCase(), priority: 'normal', subject: `Website contact from ${request.full_name}`,
      description: request.message, contact: [request.email, request.phone].join(' | '),
    });
  }
}
