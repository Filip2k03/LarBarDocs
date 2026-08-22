/**
 * Typed API Client & WebSocket Gateway for LarBar Mobile Clients
 */

export interface GeoPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface QuoteRequest {
  pickup: GeoPoint;
  waypoints?: GeoPoint[];
  destination: GeoPoint;
  vehicleClass: 'STANDARD' | 'VIP_GOLD';
}

export interface QuoteResponse {
  quoteId: string;
  distanceKm: number;
  durationMin: number;
  estimatedFareMMK: number;
  currency: 'MMK';
  expiresAt: string;
}

export interface DriverSOSPayload {
  triggerType: 'HARDWARE_KEY' | 'PANIC_BUTTON' | 'BLUETOOTH' | 'CRASH_DETECT';
  lat: number;
  lng: number;
  headingDeg: number;
  speedKmh: number;
}

export class LarBarApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = 'https://api.larbartaxi.com') {
    this.baseUrl = baseUrl;
  }

  public setToken(token: string) {
    this.authToken = token;
  }

  public async getRideQuote(req: QuoteRequest): Promise<QuoteResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/rides/quote`, {
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
