import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { 
  BookingQuoteRequest, 
  BookingQuoteResponse, 
  CreateBookingRequest, 
  BookingRecord, 
  LocationPoint 
} from '@/types/booking';

export class BookingService {
  public static async getBookingQuote(request: BookingQuoteRequest): Promise<BookingQuoteResponse> {
    return ApiClient.post<BookingQuoteResponse>(API_ENDPOINTS.bookingQuote, request);
  }

  public static async createBooking(request: CreateBookingRequest, accessToken: string, idempotencyKey: string): Promise<BookingRecord> {
    return ApiClient.post<BookingRecord>(API_ENDPOINTS.createBooking, request, {
      headers: { ...ApiClient.bearer(accessToken), 'Idempotency-Key': idempotencyKey },
    });
  }

  public static async getBookingStatus(bookingId: string): Promise<BookingRecord> {
    return ApiClient.get<BookingRecord>(API_ENDPOINTS.bookingStatus(bookingId));
  }

  public static async searchLocations(query: string, accessToken: string, citySlug?: string): Promise<LocationPoint[]> {
    if (!query || query.trim().length < 2) return [];
    return ApiClient.get<LocationPoint[]>(API_ENDPOINTS.locationSearch(query, citySlug), {
      headers: ApiClient.bearer(accessToken),
    });
  }
}
