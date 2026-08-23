export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: string;
  };
}

export interface ApiErrorDetail {
  field?: string;
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: ApiErrorDetail[];
  timestamp?: string;
  request_id?: string;
}

export interface SystemConfig {
  app_name: string;
  tagline: string;
  support_phone: string;
  support_email: string;
  chat_enabled: boolean;
  chat_endpoint?: string;
  driver_registration_open: boolean;
  minimum_app_version: {
    ios: string;
    android: string;
  };
  supported_currencies: string[];
  default_currency: string;
  active_cities_count: number;
}
