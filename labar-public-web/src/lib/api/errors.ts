import type { ApiErrorDetail } from '@/types/api';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: ApiErrorDetail[];
  public readonly isNetworkError: boolean;
  public readonly isTimeout: boolean;

  constructor({
    message,
    status = 500,
    code = 'INTERNAL_ERROR',
    details = [],
    isNetworkError = false,
    isTimeout = false,
  }: {
    message: string;
    status?: number;
    code?: string;
    details?: ApiErrorDetail[];
    isNetworkError?: boolean;
    isTimeout?: boolean;
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  public getUserMessage(locale: 'en' | 'my' = 'en'): string {
    if (this.isTimeout) {
      return locale === 'my'
        ? 'ဆာဗာ တုံ့ပြန်မှု ကြန့်ကြာနေပါသည်။ ကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ။'
        : 'Server request timed out. Please check your connection and retry.';
    }

    if (this.isNetworkError) {
      return locale === 'my'
        ? 'အင်တာနက် ချိတ်ဆက်မှု မရရှိနိုင်ပါ။ ဆာဗာနှင့် ချိတ်ဆက်၍ မရပါ။'
        : 'Unable to connect to server. Please check your internet connection.';
    }

    if (this.status === 404) {
      return locale === 'my'
        ? 'ရှာဖွေနေသော အချက်အလက် မတွေ့ရှိပါ။'
        : 'The requested resource was not found.';
    }

    if (this.status === 422 && this.details.length > 0) {
      return this.details.map((d) => d.message).join('. ');
    }

    if (this.status === 429) {
      return locale === 'my'
        ? 'တောင်းဆိုမှု များပြားနေပါသည်။ ကျေးဇူးပြု၍ ခဏစောင့်ဆိုင်းပြီးမှ ပြန်လည်ကြိုးစားပါ။'
        : 'Too many requests. Please wait a moment before trying again.';
    }

    return this.message || (locale === 'my' ? 'ချို့ယွင်းချက် ဖြစ်ပေါ်နေပါသည်။' : 'An error occurred.');
  }
}
