import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

interface ApiErrorStateProps {
  error: Error | ApiError | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export const ApiErrorState: React.FC<ApiErrorStateProps> = ({
  error,
  onRetry,
  title = 'Service Temporarily Unavailable',
  className = '',
}) => {
  const isNetwork = error instanceof ApiError && (error.isNetworkError || error.isTimeout);
  const message = error instanceof ApiError 
    ? error.getUserMessage('en')
    : error?.message || 'Unable to communicate with the LaBar live API server.';

  return (
    <div className={`rounded-3xl border border-red-200 bg-red-50/70 p-6 text-center ${className}`}>
      <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-brand-red mb-3">
        {isNetwork ? <WifiOff size={22} /> : <AlertCircle size={22} />}
      </div>
      <h4 className="text-base font-bold text-neutral-900 mb-1">{title}</h4>
      <p className="text-xs text-neutral-600 max-w-md mx-auto mb-4">{message}</p>
      
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold border border-neutral-300 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
