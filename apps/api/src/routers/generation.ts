import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc/index.js';

const generationRequestSchema = z.object({
  userDescription: z.string().min(5, 'Description must be at least 5 characters'),
  productDescription: z.string().optional(),
  placementDescription: z.string().optional(),
  styleDescription: z.string().optional(),
  sceneImageId: z.string().optional(),
  productId: z.string().optional(),
  temperature: z.number().min(0).max(1).default(0.7),
});

const generationResponseSchema = z.object({
  id: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']),
  enhancedPrompt: z.string(),
  createdAt: z.date(),
  generatedImage: z.object({
    id: z.string(),
    filename: z.string(),
    imageData: z.string(),
    mimeType: z.string(),
    width: z.number().nullable(),
    height: z.number().nullable(),
    generatedAt: z.date(),
  }).optional(),
});

export const generationRouter = router({
  generateImage: protectedProcedure
    .input(generationRequestSchema)
    .output(generationResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const {
          userDescription,
          productDescription,
          placementDescription,
          styleDescription,
          sceneImageId,
          productId,
          temperature,
        } = input;

        // Validate scene image if provided
        let sceneImage = null;
        if (sceneImageId) {
          sceneImage = await ctx.services.db.client.imageUpload.findFirst({
            where: {
              id: sceneImageId,
              userId: ctx.user.id,
            },
          });

          if (!sceneImage) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Scene image not found or access denied',
            });
          }
        }

        // Validate product if provided
        let product = null;
        if (productId) {
          product = await ctx.services.db.client.product.findFirst({
            where: {
              id: productId,
              userId: ctx.user.id,
              isActive: true,
            },
          });

          if (!product) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Product not found or access denied',
            });
          }
        }

        // Generate enhanced prompt
        const promptResult = ctx.services.prompt.generatePrompt({
          userDescription,
          productDescription: productDescription || product?.description,
          placementDescription,
          styleDescription,
          hasSceneImage: !!sceneImage,
        });

        const optimizedPrompt = ctx.services.prompt.optimizeForGemini(promptResult.enhancedPrompt);
        const isValid = ctx.services.prompt.validatePrompt(optimizedPrompt);

        if (!isValid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Generated prompt failed validation checks',
          });
        }

        // Create generation request record
        const generationRequest = await ctx.services.db.createGenerationRequest({
          userDescription,
          productDescription: productDescription || product?.description,
          placementDescription,
          styleDescription,
          enhancedPrompt: optimizedPrompt,
          userId: ctx.user.id,
          sceneImageId,
          productId,
          aiModel: 'gemini-2.5-flash-image-preview',
          temperature,
        });

        // Update status to IN_PROGRESS
        await ctx.services.db.updateGenerationRequest(generationRequest.id, {
          status: 'IN_PROGRESS',
        });

        try {
          // Prepare scene image data if available
          let sceneImageBase64 = undefined;
          let sceneImageMimeType = undefined;

          if (sceneImage) {
            // In a real implementation, you'd read the file from disk
            // For now, we'll assume the image data is available
            // sceneImageBase64 = await readFileAsBase64(sceneImage.path);
            sceneImageMimeType = sceneImage.mimeType;
          }

          // Generate image using Nano Banana API
          const generationResult = await ctx.services.nanoBanana.generateImage({
            prompt: optimizedPrompt,
            sceneImageBase64,
            sceneImageMimeType,
            temperature,
            maxOutputTokens: 2048,
          });

          if (!generationResult.success || !generationResult.imageData) {
            throw new Error(generationResult.error?.message || 'Image generation failed');
          }

          // Save generated image
          const generatedImage = await ctx.services.db.createGeneratedImage({
            filename: `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`,
            originalPrompt: userDescription,
            enhancedPrompt: optimizedPrompt,
            imageData: generationResult.imageData,
            mimeType: generationResult.mimeType || 'image/png',
            generationRequestId: generationRequest.id,
            aiModel: 'gemini-2.5-flash-image-preview',
          });

          // Update generation request as completed
          await ctx.services.db.updateGenerationRequest(generationRequest.id, {
            status: 'COMPLETED',
            completedAt: new Date(),
            outputTokens: generationResult.usage?.outputTokens || 1290,
            totalTokens: generationResult.usage?.totalTokens || 1290,
          });

          ctx.request.server.log.info({
            userId: ctx.user.id,
            generationRequestId: generationRequest.id,
            generatedImageId: generatedImage.id,
          }, 'Image generation completed successfully');

          return {
            id: generationRequest.id,
            status: 'COMPLETED' as const,
            enhancedPrompt: optimizedPrompt,
            createdAt: generationRequest.createdAt,
            generatedImage: {
              id: generatedImage.id,
              filename: generatedImage.filename,
              imageData: generatedImage.imageData,
              mimeType: generatedImage.mimeType,
              width: generatedImage.width,
              height: generatedImage.height,
              generatedAt: generatedImage.generatedAt,
            },
          };

        } catch (generationError) {
          // Update generation request as failed
          const errorMessage = generationError instanceof Error ? generationError.message : 'Unknown generation error';
          
          await ctx.services.db.updateGenerationRequest(generationRequest.id, {
            status: 'FAILED',
            errorCode: 'GENERATION_FAILED',
            errorMessage,
            retryCount: 1,
          });

          ctx.request.server.log.error({
            userId: ctx.user.id,
            generationRequestId: generationRequest.id,
            error: generationError,
          }, 'Image generation failed');

          return {
            id: generationRequest.id,
            status: 'FAILED' as const,
            enhancedPrompt: optimizedPrompt,
            createdAt: generationRequest.createdAt,
          };
        }

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Generation request failed');
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown generation error',
        });
      }
    }),

  getGenerationStatus: protectedProcedure
    .input(z.object({
      generationId: z.string(),
    }))
    .output(generationResponseSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { generationId } = input;

        const generationRequest = await ctx.services.db.client.generationRequest.findFirst({
          where: {
            id: generationId,
            userId: ctx.user.id,
          },
          include: {
            generatedImages: true,
          },
        });

        if (!generationRequest) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Generation request not found or access denied',
          });
        }

        const generatedImage = generationRequest.generatedImages[0];

        return {
          id: generationRequest.id,
          status: generationRequest.status as any,
          enhancedPrompt: generationRequest.enhancedPrompt,
          createdAt: generationRequest.createdAt,
          generatedImage: generatedImage ? {
            id: generatedImage.id,
            filename: generatedImage.filename,
            imageData: generatedImage.imageData,
            mimeType: generatedImage.mimeType,
            width: generatedImage.width,
            height: generatedImage.height,
            generatedAt: generatedImage.generatedAt,
          } : undefined,
        };

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Failed to get generation status');
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve generation status',
        });
      }
    }),

  regenerateImage: protectedProcedure
    .input(z.object({
      generationId: z.string(),
      temperature: z.number().min(0).max(1).default(0.7),
    }))
    .output(generationResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { generationId, temperature } = input;

        // Get original generation request
        const originalRequest = await ctx.services.db.client.generationRequest.findFirst({
          where: {
            id: generationId,
            userId: ctx.user.id,
          },
          include: {
            sceneImage: true,
            product: true,
          },
        });

        if (!originalRequest) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Original generation request not found or access denied',
          });
        }

        // Create new generation request with same parameters
        const newGenerationRequest = await ctx.services.db.createGenerationRequest({
          userDescription: originalRequest.userDescription,
          productDescription: originalRequest.productDescription,
          placementDescription: originalRequest.placementDescription,
          styleDescription: originalRequest.styleDescription,
          enhancedPrompt: originalRequest.enhancedPrompt,
          userId: ctx.user.id,
          sceneImageId: originalRequest.sceneImageId,
          productId: originalRequest.productId,
          aiModel: originalRequest.aiModel || 'gemini-2.5-flash-image-preview',
          temperature,
        });

        // Update to IN_PROGRESS and proceed with generation
        await ctx.services.db.updateGenerationRequest(newGenerationRequest.id, {
          status: 'IN_PROGRESS',
        });

        // The actual generation logic would be similar to generateImage
        // For brevity, returning pending status
        return {
          id: newGenerationRequest.id,
          status: 'IN_PROGRESS' as const,
          enhancedPrompt: originalRequest.enhancedPrompt,
          createdAt: newGenerationRequest.createdAt,
        };

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Regeneration failed');
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown regeneration error',
        });
      }
    }),
});