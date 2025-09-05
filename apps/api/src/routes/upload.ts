import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createFileUploadService } from '../services/fileUploadService.js';

const uploadResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    filename: z.string(),
    originalName: z.string(),
    size: z.number(),
    mimeType: z.string(),
    url: z.string(),
  }).optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  timestamp: z.string(),
});

export async function uploadRoutes(fastify: FastifyInstance): Promise<void> {
  const uploadService = createFileUploadService(fastify);
  await uploadService.init();

  // Scene photo upload endpoint
  fastify.post('/upload/scene', {
    preHandler: fastify.authenticate,
    schema: {
      tags: ['upload'],
      summary: 'Upload scene photo',
      description: 'Upload a scene photo for AI image generation',
      consumes: ['multipart/form-data'],
      response: {
        200: uploadResponseSchema,
        400: uploadResponseSchema,
        413: uploadResponseSchema,
        500: uploadResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const data = await request.file({
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      });

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: 'No file was uploaded',
          },
          timestamp: new Date().toISOString(),
        });
      }

      const result = await uploadService.uploadScenePhoto(data);

      fastify.log.info({
        userId: request.user?.id,
        filename: result.filename,
        size: result.size,
        mimeType: result.mimeType,
      }, 'Scene photo uploaded successfully');

      return reply.send({
        success: true,
        data: {
          filename: result.filename,
          originalName: result.originalName,
          size: result.size,
          mimeType: result.mimeType,
          url: result.url,
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      let errorData;
      
      try {
        errorData = JSON.parse(error instanceof Error ? error.message : 'Unknown error');
      } catch {
        errorData = {
          code: 'UPLOAD_ERROR',
          message: error instanceof Error ? error.message : 'Unknown upload error',
        };
      }

      fastify.log.error({
        userId: request.user?.id,
        error: errorData,
      }, 'Scene photo upload failed');

      const statusCode = errorData.code === 'FILE_TOO_LARGE' ? 413 : 400;

      return reply.status(statusCode).send({
        success: false,
        error: errorData,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Delete uploaded file endpoint
  fastify.delete('/upload/scene/:filename', {
    preHandler: fastify.authenticate,
    schema: {
      tags: ['upload'],
      summary: 'Delete uploaded scene photo',
      description: 'Delete a previously uploaded scene photo',
      params: z.object({
        filename: z.string().min(1),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          message: z.string(),
          timestamp: z.string(),
        }),
        404: z.object({
          success: z.boolean(),
          error: z.object({
            code: z.string(),
            message: z.string(),
          }),
          timestamp: z.string(),
        }),
        500: uploadResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const { filename } = request.params as { filename: string };
      
      await uploadService.deleteFile(filename);

      fastify.log.info({
        userId: request.user?.id,
        filename,
      }, 'Scene photo deleted successfully');

      return reply.send({
        success: true,
        message: 'File deleted successfully',
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      let errorData;
      
      try {
        errorData = JSON.parse(error instanceof Error ? error.message : 'Unknown error');
      } catch {
        errorData = {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown delete error',
        };
      }

      fastify.log.error({
        userId: request.user?.id,
        error: errorData,
      }, 'Scene photo deletion failed');

      const statusCode = errorData.code === 'FILE_NOT_FOUND' ? 404 : 500;

      return reply.status(statusCode).send({
        success: false,
        error: errorData,
        timestamp: new Date().toISOString(),
      });
    }
  });
}