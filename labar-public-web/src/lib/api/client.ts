import { API_CONFIG } from './config';
import { ApiError } from './errors';
import type { ApiResponse, ApiErrorResponse } from '@/types/api';

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiFailureBody {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
  code?: string;
  message?: string;
  details?: ApiErrorResponse['details'];
}

export class ApiClient {
  private static baseUrl = API_CONFIG.baseUrl;

  private static buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private static async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { timeoutMs = API_CONFIG.timeoutMs, params, ...customConfig } = options;
    const url = this.buildUrl(endpoint, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
      ...API_CONFIG.headers,
      ...(customConfig.headers as Record<string, string>),
    };

    const config: RequestInit = {
      ...customConfig,
      headers,
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle successful response
      if (response.ok) {
        if (response.status === 204) {
          return {} as T;
        }
        const json = await response.json();
        // If response is wrapped in standard { status: 'success', data: ... }
        if (json && typeof json === 'object' && 'data' in json) {
          return json.data as T;
        }
        return json as T;
      }

      // Handle error responses
      let errorData: ApiFailureBody | null = null;
      try {
        errorData = await response.json();
      } catch {
        // Response was not JSON
      }

      throw new ApiError({
        message: errorData?.error?.message || errorData?.message || `HTTP error ${response.status}: ${response.statusText}`,
        status: response.status,
        code: errorData?.error?.code || errorData?.code || `HTTP_${response.status}`,
        details: errorData?.details || Object.entries(errorData?.error?.fields || {}).map(([field, message]) => ({ field, code: 'INVALID', message })),
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof ApiError) {
        throw err;
      }

      const error = err as Error;
      if (error.name === 'AbortError') {
        throw new ApiError({
          message: 'Request timed out after ' + timeoutMs + 'ms',
          status: 408,
          code: 'TIMEOUT',
          isTimeout: true,
        });
      }

      throw new ApiError({
        message: error.message || 'Network communication failure',
        status: 0,
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      });
    }
  }

  public static get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public static post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  public static bearer(token: string): HeadersInit {
    return { Authorization: `Bearer ${token}` };
  }
}
