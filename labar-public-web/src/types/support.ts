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
  id: string;
  status: string;
  created_at: string;
}

export interface ContactInquiryRequest {
  full_name: string;
  email: string;
  phone: string;
  inquiry_type: 'GENERAL' | 'PARTNERSHIP' | 'MEDIA' | 'GOVERNMENT_REGULATORY';
  message: string;
}
