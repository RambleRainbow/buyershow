import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createNanoBananaAPIService } from '../services/nanoBananaAPIService.js';

const testConnectionSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string(),
});

export async function nanoBananaRoutes(fastify: FastifyInstance): Promise<void> {
  const nanoBananaService = createNanoBananaAPIService(fastify);

  // Test connection endpoint
  fastify.get('/nano-banana/test', {
    preHandler: fastify.authenticate,
    schema: {
      tags: ['generation'],
      summary: 'Test Nano Banana API connection',
      description: 'Test connection to Google Gemini 2.5 Flash Image API',
      response: {
        200: testConnectionSchema,
        500: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            message: z.string(),
          }),
          timestamp: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    try {
      const isConnected = await nanoBananaService.testConnection();

      if (isConnected) {
        return reply.send({
          success: true,
          message: 'Connection to Nano Banana API successful',
          timestamp: new Date().toISOString(),
        });
      } else {
        return reply.status(500).send({
          success: false,
          error: {
            code: 'CONNECTION_FAILED',
            message: 'Failed to connect to Nano Banana API',
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      fastify.log.error({ error }, 'Nano Banana connection test failed');
      
      return reply.status(500).send({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: error instanceof Error ? error.message : 'Unknown test error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });
}