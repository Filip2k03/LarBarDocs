/**
 * Typed API Client & WebSocket Gateway for LaBar Mobile Clients
 */

export interface GeoPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface QuoteRequest {
  distance_km: number;
  payment_method: 'CASH' | 'KBZPAY' | 'WAVEPAY' | 'AYAPAY';
  promo_credits: number;
}

export interface QuoteResponse {
  quote_id: string;
  policy_version: string;
  requested_distance_km: number;
  billable_distance_km: number;
  payment_method: QuoteRequest['payment_method'];
  currency: 'MMK';
  breakdown: {
    transport_fare_mmk: number;
    extra_distance_steps: number;
    extra_distance_fare_mmk: number;
    service_fee_mmk: number;
    promo_credits_applied: number;
    promo_discount_mmk: number;
    subtotal_mmk: number;
    cash_rounding_mmk: number;
    payable_mmk: number;
  };
  expires_at: string;
}

export interface DriverSOSPayload {
  triggerType: 'HARDWARE_KEY' | 'PANIC_BUTTON' | 'BLUETOOTH' | 'CRASH_DETECT';
  lat: number;
  lng: number;
  headingDeg: number;
  speedKmh: number;
}

export class LaBarApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = 'https://api.labartaxi.com') {
    this.baseUrl = baseUrl;
  }

  public setToken(token: string) {
    this.authToken = token;
  }

  public async getRideQuote(req: QuoteRequest): Promise<QuoteResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/fares/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Quote failed: ${res.statusText}`);
    return res.json();
  }

  public async triggerDriverSOS(payload: DriverSOSPayload): Promise<{ incidentId: string; tier: string }> {
    const res = await fetch(`${this.baseUrl}/api/v1/driver/emergency/sos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`SOS trigger failed: ${res.statusText}`);
    return res.json();
  }
}
