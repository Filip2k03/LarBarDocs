export interface BusinessInquiryRequest {
  company_name: string;
  contact_person_name: string;
  work_email: string;
  work_phone: string;
  estimated_monthly_rides: number;
  cities_needed: string[];
  service_types: ('CORPORATE_TAXI' | 'EXECUTIVE_SEDAN' | 'PARCEL_LOGISTICS' | 'AIRPORT_TRANSFERS')[];
  additional_notes?: string;
}

export interface BusinessInquiryResponse {
  inquiry_id: string;
  company_name: string;
  status: 'RECEIVED';
  assigned_account_manager: string;
  created_at: string;
}
