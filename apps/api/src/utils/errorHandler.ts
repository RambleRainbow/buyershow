import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { TRPCError } from '@trpc/server';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error implements AppError {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function formatError(error: unknown): {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
} {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: error.errors,
    };
  }

  // Handle TRPC errors
  if (error instanceof TRPCError) {
    const statusCodeMap: Record<string, number> = {
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      TIMEOUT: 408,
      CONFLICT: 409,
      PRECONDITION_FAILED: 412,
      PAYLOAD_TOO_LARGE: 413,
      METHOD_NOT_SUPPORTED: 405,
      UNPROCESSABLE_CONTENT: 422,
      TOO_MANY_REQUESTS: 429,
      CLIENT_CLOSED_REQUEST: 499,
      INTERNAL_SERVER_ERROR: 500,
    };

    return {
      statusCode: statusCodeMap[error.code] || 500,
      code: error.code,
      message: error.message,
      details: error.cause,
    };
  }

  // Handle custom API errors
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  // Handle Fastify errors
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const fastifyError = error as FastifyError;
    return {
      statusCode: fastifyError.statusCode || 500,
      code: fastifyError.code || 'INTERNAL_SERVER_ERROR',
      message: fastifyError.message || 'An unexpected error occurred',
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
    };
  }

  // Fallback for unknown errors
  return {
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: error,
  };
}

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const formattedError = formatError(error);

  // Log error details
  request.log.error({
    error: {
      message: formattedError.message,
      code: formattedError.code,
      statusCode: formattedError.statusCode,
      details: formattedError.details,
      stack: error.stack,
    },
    request: {
      method: request.method,
      url: request.url,
      id: request.id,
    },
  });

  // Send response
  await reply
    .status(formattedError.statusCode)
    .send({
      error: {
        code: formattedError.code,
        message: formattedError.message,
        ...(process.env.NODE_ENV === 'development' && { details: formattedError.details }),
      },
      requestId: request.id,
    });
}

export function createAsyncErrorHandler() {
  return (fn: Function) => {
    return async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        throw formatError(error);
      }
    };
  };
}