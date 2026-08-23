export interface DriverApplicationRequest {
  full_name: string;
  phone: string;
  email?: string;
  city_slug: string;
  nrc_number: string;
  driving_licence_number: string;
  licence_class: 'B' | 'A' | 'T';
  has_own_vehicle: boolean;
  vehicle_type?: 'STANDARD' | 'COMFORT' | 'PREMIUM' | 'XL' | 'EV' | 'MOTORBIKE';
  vehicle_make_model?: string;
  vehicle_year?: number;
  vehicle_plate?: string;
  preferred_work_type: 'FULL_TIME' | 'PART_TIME' | 'WEEKENDS';
  heard_from?: string;
}

export interface DriverApplicationResponse {
  application_id: string;
  reference_number: string;
  status: 'SUBMITTED_PENDING_REGISTRAR_REVIEW';
  next_step_instructions: string;
  next_step_instructions_mm: string;
  nearest_branch_address: string;
  created_at: string;
}
