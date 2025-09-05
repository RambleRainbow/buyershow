import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import type { AppError, ValidationError } from '@buyershow/shared-types';

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
    stack?: string;
  };
  requestId?: string;
  timestamp: string;
}

async function errorHandler(fastify: FastifyInstance): Promise<void> {
  // 设置错误处理器
  fastify.setErrorHandler(async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.id;
    const timestamp = new Date().toISOString();

    // Zod验证错误
    if (error instanceof ZodError) {
      const validationErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));

      const response: ErrorResponse = {
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details: validationErrors,
        },
        requestId,
        timestamp,
      };

      fastify.log.warn({ 
        error: error.message, 
        requestId, 
        validationErrors 
      }, 'Validation error');

      return reply.status(400).send(response);
    }

    // 自定义应用错误
    if (error.name === 'AppError' || error.name === 'ValidationError') {
      const appError = error as AppError;
      const response: ErrorResponse = {
        error: {
          message: appError.message,
          code: appError.code || 'APP_ERROR',
          statusCode: appError.statusCode || 500,
          details: appError.details,
        },
        requestId,
        timestamp,
      };

      fastify.log.error({ 
        error: appError.message, 
        code: appError.code,
        statusCode: appError.statusCode,
        requestId 
      }, 'Application error');

      return reply.status(appError.statusCode || 500).send(response);
    }

    // Fastify内置错误
    if (error.statusCode) {
      const response: ErrorResponse = {
        error: {
          message: error.message,
          code: 'FASTIFY_ERROR',
          statusCode: error.statusCode,
        },
        requestId,
        timestamp,
      };

      fastify.log.error({ 
        error: error.message, 
        statusCode: error.statusCode,
        requestId 
      }, 'Fastify error');

      return reply.status(error.statusCode).send(response);
    }

    // 未知错误
    const response: ErrorResponse = {
      error: {
        message: fastify.config.NODE_ENV === 'production' 
          ? 'Internal Server Error' 
          : error.message,
        code: 'INTERNAL_ERROR',
        statusCode: 500,
        stack: fastify.config.NODE_ENV === 'development' ? error.stack : undefined,
      },
      requestId,
      timestamp,
    };

    fastify.log.error({ 
      error: error.message, 
      stack: error.stack,
      requestId 
    }, 'Unhandled error');

    return reply.status(500).send(response);
  });

  // 404处理
  fastify.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
    const response: ErrorResponse = {
      error: {
        message: `Route ${request.method} ${request.url} not found`,
        code: 'NOT_FOUND',
        statusCode: 404,
      },
      requestId: request.id,
      timestamp: new Date().toISOString(),
    };

    return reply.status(404).send(response);
  });
}

export default fp(errorHandler, {
  name: 'errorHandler',
});