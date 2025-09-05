import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createPromptGenerationService } from '../services/promptGenerationService.js';

const promptRequestSchema = z.object({
  userDescription: z.string().min(5, 'User description must be at least 5 characters'),
  productDescription: z.string().optional(),
  placementDescription: z.string().optional(),
  styleDescription: z.string().optional(),
  hasSceneImage: z.boolean().default(false),
});

const promptResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    enhancedPrompt: z.string(),
    originalPrompt: z.string(),
    components: z.object({
      productPlacement: z.string(),
      styleGuide: z.string(),
      photographyTerms: z.string(),
      composition: z.string(),
    }),
    optimizedPrompt: z.string(),
    isValid: z.boolean(),
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  timestamp: z.string(),
});

export async function promptRoutes(fastify: FastifyInstance): Promise<void> {
  const promptService = createPromptGenerationService(fastify);

  // Generate enhanced prompt endpoint
  fastify.post('/prompt/generate', {
    preHandler: fastify.authenticate,
    schema: {
      tags: ['generation'],
      summary: 'Generate enhanced prompt',
      description: 'Convert user description into optimized AI prompt for image generation',
      body: promptRequestSchema,
      response: {
        200: promptResponseSchema,
        400: promptResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const promptRequest = request.body as z.infer<typeof promptRequestSchema>;
      
      const result = promptService.generatePrompt(promptRequest);
      const optimizedPrompt = promptService.optimizeForGemini(result.enhancedPrompt);
      const isValid = promptService.validatePrompt(optimizedPrompt);

      if (!isValid) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'INVALID_PROMPT',
            message: 'Generated prompt failed validation checks',
            details: {
              promptLength: optimizedPrompt.length,
              originalDescription: promptRequest.userDescription,
            },
          },
          timestamp: new Date().toISOString(),
        });
      }

      fastify.log.info({
        userId: request.user?.id,
        originalLength: result.originalPrompt.length,
        enhancedLength: result.enhancedPrompt.length,
        optimizedLength: optimizedPrompt.length,
        hasSceneImage: promptRequest.hasSceneImage,
      }, 'Prompt generated successfully');

      return reply.send({
        success: true,
        data: {
          enhancedPrompt: result.enhancedPrompt,
          originalPrompt: result.originalPrompt,
          components: result.components,
          optimizedPrompt,
          isValid,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      fastify.log.error({
        userId: request.user?.id,
        error,
      }, 'Prompt generation failed');

      return reply.status(400).send({
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown prompt generation error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Validate prompt endpoint
  fastify.post('/prompt/validate', {
    preHandler: fastify.authenticate,
    schema: {
      tags: ['generation'],
      summary: 'Validate prompt',
      description: 'Validate if a prompt meets requirements for AI generation',
      body: z.object({
        prompt: z.string().min(1),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.object({
            isValid: z.boolean(),
            promptLength: z.number(),
            issues: z.array(z.string()).optional(),
            optimizedPrompt: z.string(),
          }),
          timestamp: z.string(),
        }),
        400: z.object({
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
      const { prompt } = request.body as { prompt: string };
      
      const isValid = promptService.validatePrompt(prompt);
      const optimizedPrompt = promptService.optimizeForGemini(prompt);
      const issues: string[] = [];

      if (prompt.length < 10) {
        issues.push('Prompt too short (minimum 10 characters)');
      }
      if (prompt.length > 4000) {
        issues.push('Prompt too long (maximum 4000 characters)');
      }

      fastify.log.debug({
        userId: request.user?.id,
        promptLength: prompt.length,
        isValid,
        issuesCount: issues.length,
      }, 'Prompt validated');

      return reply.send({
        success: true,
        data: {
          isValid,
          promptLength: prompt.length,
          issues: issues.length > 0 ? issues : undefined,
          optimizedPrompt,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      fastify.log.error({
        userId: request.user?.id,
        error,
      }, 'Prompt validation failed');

      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown validation error',
        },
        timestamp: new Date().toISOString(),
      });
    }
  });
}