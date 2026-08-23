import { z } from 'zod';

export const LocationPointSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  name: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  place_id: z.string().optional(),
});

export const BookingQuoteRequestSchema = z.object({
  pickup: LocationPointSchema,
  destination: LocationPointSchema,
  stops: z.array(LocationPointSchema).optional(),
  passenger_count: z.number().int().min(1).max(10).optional().default(1),
  promo_code: z.string().optional(),
  schedule_time: z.string().optional(),
});

export const CreateBookingRequestSchema = z.object({
  quote_id: z.string().min(1, 'Quote ID is required'),
  ride_type_id: z.string().min(1, 'Ride type selection is required'),
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  customer_phone: z.string().regex(/^(\+?95|09)?[0-9]{7,10}$/, 'Please enter a valid Myanmar phone number (e.g. 09123456789)'),
  customer_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  payment_method: z.enum(['KBZPAY', 'WAVEPAY', 'CB_PAY', 'AYA_PAY', 'CASH']),
  note_for_driver: z.string().max(200).optional(),
  guardian_phone: z.string().optional(),
});

export const DriverApplicationSchema = z.object({
  full_name: z.string().min(2, 'Full legal name is required'),
  phone: z.string().regex(/^(\+?95|09)?[0-9]{7,10}$/, 'Valid Myanmar phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  city_slug: z.string().min(1, 'Please select your operating city'),
  nrc_number: z.string().min(6, 'NRC smartcard number is required'),
  driving_licence_number: z.string().min(4, 'Driving licence number is required'),
  licence_class: z.enum(['B', 'A', 'T']),
  has_own_vehicle: z.boolean(),
  vehicle_type: z.enum(['STANDARD', 'COMFORT', 'PREMIUM', 'XL', 'EV', 'MOTORBIKE']).optional(),
  vehicle_make_model: z.string().optional(),
  vehicle_year: z.number().int().min(2000).max(2027).optional(),
  vehicle_plate: z.string().optional(),
  preferred_work_type: z.enum(['FULL_TIME', 'PART_TIME', 'WEEKENDS']),
  heard_from: z.string().optional(),
});

export const SupportTicketSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^(\+?95|09)?[0-9]{7,10}$/, 'Valid Myanmar phone number is required'),
  email: z.string().email('Valid email is required'),
  category: z.enum(['RIDE_ISSUE', 'PAYMENT_DISPUTE', 'LOST_ITEM', 'SAFETY_REPORT', 'DRIVER_BEHAVIOR', 'APP_BUG', 'OTHER']),
  booking_reference: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const BusinessInquirySchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  contact_person_name: z.string().min(2, 'Contact person name is required'),
  work_email: z.string().email('Valid work email is required'),
  work_phone: z.string().regex(/^(\+?95|09)?[0-9]{7,10}$/, 'Valid phone number is required'),
  estimated_monthly_rides: z.number().int().min(1, 'Please estimate monthly ride volume'),
  cities_needed: z.array(z.string()).min(1, 'Please select at least one city'),
  service_types: z.array(z.enum(['CORPORATE_TAXI', 'EXECUTIVE_SEDAN', 'PARCEL_LOGISTICS', 'AIRPORT_TRANSFERS'])).min(1),
  additional_notes: z.string().optional(),
});

export const ContactInquirySchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(7, 'Phone is required'),
  inquiry_type: z.enum(['GENERAL', 'PARTNERSHIP', 'MEDIA', 'GOVERNMENT_REGULATORY']),
  message: z.string().min(10, 'Message is required'),
});
