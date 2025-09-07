import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc/index.js';

const generationHistorySchema = z.object({
  id: z.string(),
  userDescription: z.string(),
  productDescription: z.string().nullable(),
  placementDescription: z.string().nullable(),
  styleDescription: z.string().nullable(),
  enhancedPrompt: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
  aiModel: z.string().nullable(),
  promptTokens: z.number().nullable(),
  outputTokens: z.number().nullable(),
  totalTokens: z.number().nullable(),
  temperature: z.number().nullable(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  retryCount: z.number(),
  sceneImage: z.object({
    id: z.string(),
    filename: z.string(),
    originalName: z.string(),
    url: z.string(),
  }).nullable(),
  product: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    imageUrl: z.string().nullable(),
  }).nullable(),
  generatedImages: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    imageData: z.string(),
    mimeType: z.string(),
    size: z.number().nullable(),
    width: z.number().nullable(),
    height: z.number().nullable(),
    quality: z.string().nullable(),
    style: z.string().nullable(),
    generatedAt: z.date(),
    isPublic: z.boolean(),
  })),
});

const generationSummarySchema = z.object({
  id: z.string(),
  userDescription: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']),
  createdAt: z.date(),
  completedAt: z.date().nullable(),
  hasGeneratedImage: z.boolean(),
  sceneImage: z.object({
    filename: z.string(),
    url: z.string(),
  }).nullable(),
  product: z.object({
    name: z.string(),
  }).nullable(),
});

export const historyRouter = router({
  list: protectedProcedure
    .input(z.object({
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .output(z.object({
      generations: z.array(generationSummarySchema),
      total: z.number(),
      hasMore: z.boolean(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { status, limit, offset } = input;

        const where = {
          userId: ctx.user.id,
          ...(status && { status }),
        };

        const [generations, total] = await Promise.all([
          ctx.services.db.client.generationRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            select: {
              id: true,
              userDescription: true,
              status: true,
              createdAt: true,
              completedAt: true,
              sceneImage: {
                select: {
                  filename: true,
                  url: true,
                },
              },
              product: {
                select: {
                  name: true,
                },
              },
              generatedImages: {
                select: {
                  id: true,
                },
                take: 1,
              },
            },
          }),
          ctx.services.db.client.generationRequest.count({ where }),
        ]);

        const generationsWithImages = generations.map((gen: any) => ({
          ...gen,
          hasGeneratedImage: gen.generatedImages.length > 0,
          generatedImages: undefined, // Remove from response
        }));

        return {
          generations: generationsWithImages,
          total,
          hasMore: offset + limit < total,
        };

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Failed to list generation history');
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve generation history',
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .output(generationHistorySchema)
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;

        const generation = await ctx.services.db.client.generationRequest.findFirst({
          where: {
            id,
            userId: ctx.user.id,
          },
          include: {
            sceneImage: {
              select: {
                id: true,
                filename: true,
                originalName: true,
                url: true,
              },
            },
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
              },
            },
            generatedImages: {
              select: {
                id: true,
                filename: true,
                imageData: true,
                mimeType: true,
                size: true,
                width: true,
                height: true,
                quality: true,
                style: true,
                generatedAt: true,
                isPublic: true,
              },
            },
          },
        });

        if (!generation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Generation not found or access denied',
          });
        }

        return generation;

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Failed to get generation');
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve generation',
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .output(z.object({
      success: z.boolean(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = input;

        // Check if generation belongs to user
        const generation = await ctx.services.db.client.generationRequest.findFirst({
          where: {
            id,
            userId: ctx.user.id,
          },
          include: {
            generatedImages: true,
          },
        });

        if (!generation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Generation not found or access denied',
          });
        }

        // Delete associated generated images first (cascade should handle this, but being explicit)
        if (generation.generatedImages.length > 0) {
          await ctx.services.db.client.generatedImage.deleteMany({
            where: {
              generationRequestId: id,
            },
          });
        }

        // Delete the generation request
        await ctx.services.db.client.generationRequest.delete({
          where: { id },
        });

        ctx.request.server.log.info({
          userId: ctx.user.id,
          generationId: id,
        }, 'Generation deleted successfully');

        return {
          success: true,
          message: 'Generation deleted successfully',
        };

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Generation deletion failed');
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete generation',
        });
      }
    }),

  getStats: protectedProcedure
    .output(z.object({
      totalGenerations: z.number(),
      completedGenerations: z.number(),
      failedGenerations: z.number(),
      pendingGenerations: z.number(),
      totalTokensUsed: z.number(),
      averageProcessingTime: z.number().nullable(),
    }))
    .query(async ({ ctx }) => {
      try {
        const [
          totalGenerations,
          completedGenerations,
          failedGenerations,
          pendingGenerations,
          tokenStats,
          _processingTimeStats,
        ] = await Promise.all([
          ctx.services.db.client.generationRequest.count({
            where: { userId: ctx.user.id },
          }),
          ctx.services.db.client.generationRequest.count({
            where: { userId: ctx.user.id, status: 'COMPLETED' },
          }),
          ctx.services.db.client.generationRequest.count({
            where: { userId: ctx.user.id, status: 'FAILED' },
          }),
          ctx.services.db.client.generationRequest.count({
            where: { 
              userId: ctx.user.id, 
              status: { in: ['PENDING', 'IN_PROGRESS'] } 
            },
          }),
          ctx.services.db.client.generationRequest.aggregate({
            where: { userId: ctx.user.id },
            _sum: { totalTokens: true },
          }),
          ctx.services.db.client.generationRequest.aggregate({
            where: { 
              userId: ctx.user.id, 
              status: 'COMPLETED',
              completedAt: { not: null },
            },
            _avg: {
              // This would need a computed field for processing time
              // For now, returning null
            },
          }),
        ]);

        return {
          totalGenerations,
          completedGenerations,
          failedGenerations,
          pendingGenerations,
          totalTokensUsed: tokenStats._sum.totalTokens || 0,
          averageProcessingTime: null, // Would need to compute from createdAt/completedAt
        };

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Failed to get generation stats');
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve generation statistics',
        });
      }
    }),
});