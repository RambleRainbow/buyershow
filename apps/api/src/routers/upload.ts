import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc/index.js';

const uploadResponseSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  size: z.number(),
  mimeType: z.string(),
  url: z.string(),
});

export const uploadRouter = router({
  uploadScene: protectedProcedure
    .input(z.object({
      fileData: z.string(), // Base64 encoded file data
      fileName: z.string(),
      mimeType: z.string(),
      fileSize: z.number(),
    }))
    .output(uploadResponseSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { fileData, fileName, mimeType, fileSize } = input;
        
        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (fileSize > maxSize) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `File size exceeds maximum allowed size of ${maxSize} bytes`,
          });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(mimeType)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `File type ${mimeType} is not allowed`,
          });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(fileData.split(',')[1] || fileData, 'base64');
        
        // Create a mock multipart file object for the upload service
        const mockFile = {
          filename: fileName,
          mimetype: mimeType,
          file: {
            readableLength: buffer.length,
          },
          toBuffer: async () => buffer,
        } as any;

        const result = await ctx.services.fileUpload.uploadScenePhoto(mockFile);
        
        // Save to database
        await ctx.services.db.createImageUpload({
          filename: result.filename,
          originalName: result.originalName,
          size: result.size,
          mimeType: result.mimeType,
          path: result.path,
          url: result.url,
          userId: ctx.user.id,
        });

        return {
          filename: result.filename,
          originalName: result.originalName,
          size: result.size,
          mimeType: result.mimeType,
          url: result.url,
        };

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Scene upload failed');
        
        if (error instanceof TRPCError) {
          throw error;
        }

        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(error instanceof Error ? error.message : 'Unknown error');
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
        });
      }
    }),

  deleteScene: protectedProcedure
    .input(z.object({
      filename: z.string(),
    }))
    .output(z.object({
      success: z.boolean(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { filename } = input;
        
        // Check if file belongs to user
        const imageUpload = await ctx.services.db.client.imageUpload.findFirst({
          where: {
            filename,
            userId: ctx.user.id,
          },
        });

        if (!imageUpload) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'File not found or access denied',
          });
        }

        // Delete physical file
        await ctx.services.fileUpload.deleteFile(filename);
        
        // Delete from database
        await ctx.services.db.client.imageUpload.delete({
          where: { id: imageUpload.id },
        });

        return {
          success: true,
          message: 'File deleted successfully',
        };

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Scene deletion failed');
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown deletion error',
        });
      }
    }),

  listUserUploads: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
    }))
    .output(z.array(z.object({
      id: z.string(),
      filename: z.string(),
      originalName: z.string(),
      size: z.number(),
      mimeType: z.string(),
      url: z.string(),
      uploadedAt: z.date(),
    })))
    .query(async ({ ctx, input }) => {
      try {
        const uploads = await ctx.services.db.client.imageUpload.findMany({
          where: { userId: ctx.user.id },
          orderBy: { uploadedAt: 'desc' },
          take: input.limit,
          select: {
            id: true,
            filename: true,
            originalName: true,
            size: true,
            mimeType: true,
            url: true,
            uploadedAt: true,
          },
        });

        return uploads;

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Failed to list uploads');
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve uploads',
        });
      }
    }),
});