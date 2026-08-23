export interface SupportTicketRequest {
  full_name: string;
  phone: string;
  email: string;
  category: 'RIDE_ISSUE' | 'PAYMENT_DISPUTE' | 'LOST_ITEM' | 'SAFETY_REPORT' | 'DRIVER_BEHAVIOR' | 'APP_BUG' | 'OTHER';
  booking_reference?: string;
  subject: string;
  message: string;
}

export interface SupportTicketResponse {
  ticket_id: string;
  ticket_number: string;
  status: 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  created_at: string;
  estimated_reply_hours: number;
}

export interface ContactInquiryRequest {
  full_name: string;
  email: string;
  phone: string;
  inquiry_type: 'GENERAL' | 'PARTNERSHIP' | 'MEDIA' | 'GOVERNMENT_REGULATORY';
  message: string;
}
