import { ApiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { AuthSession, AuthUser, OtpChallenge } from '@/types/auth';

const SESSION_KEY = 'labar_passenger_session_v1';

export class AuthService {
  static requestOtp(phone: string): Promise<OtpChallenge> {
    return ApiClient.post<OtpChallenge>(API_ENDPOINTS.requestOtp, { phone, purpose: 'login' });
  }

  static verifyOtp(challengeId: string, phone: string, code: string): Promise<AuthSession> {
    return ApiClient.post<AuthSession>(API_ENDPOINTS.verifyOtp, {
      challenge_id: challengeId,
      phone,
      code,
      device_name: 'LaBar Public Website',
    });
  }

  static me(accessToken: string): Promise<AuthUser> {
    return ApiClient.get<AuthUser>(API_ENDPOINTS.currentUser, { headers: ApiClient.bearer(accessToken) });
  }

  static saveSession(session: AuthSession): void {
    if (typeof window !== 'undefined') window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  static getSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const value = window.localStorage.getItem(SESSION_KEY);
      return value ? (JSON.parse(value) as AuthSession) : null;
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_KEY);
  }
}
