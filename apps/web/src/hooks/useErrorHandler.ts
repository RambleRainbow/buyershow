import { useCallback, useState } from 'react';

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: unknown) => {
    let appError: AppError;

    if (error instanceof Error) {
      appError = {
        message: error.message,
        code: 'CLIENT_ERROR',
        statusCode: 500,
      };
    } else if (typeof error === 'object' && error !== null) {
      const err = error as any;
      appError = {
        message: err.message || '发生未知错误',
        code: err.code || 'UNKNOWN_ERROR',
        statusCode: err.statusCode || 500,
        details: err.details,
      };
    } else {
      appError = {
        message: String(error),
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
      };
    }

    setError(appError);

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', appError);
    }

    return appError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await fn();
        return result;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling,
  };
}

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent default browser behavior
    event.preventDefault();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled error:', event.reason);
    }
  });
}