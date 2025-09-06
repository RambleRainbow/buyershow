import type { FastifyRequest, FastifyReply } from 'fastify';
import { createMockDatabaseService } from '../db/mockClient.js';
import { createFileUploadService } from '../services/fileUploadService.js';
import { createNanoBananaAPIService } from '../services/nanoBananaAPIService.js';
import { createPromptGenerationService } from '../services/promptGenerationService.js';
import type { User } from '../middleware/auth.js';

export interface CreateContextOptions {
  request: FastifyRequest;
  reply: FastifyReply;
}

export interface Context {
  request: FastifyRequest;
  reply: FastifyReply;
  user?: User;
  services: {
    db: ReturnType<typeof createMockDatabaseService>;
    fileUpload: ReturnType<typeof createFileUploadService>;
    nanoBanana: ReturnType<typeof createNanoBananaAPIService>;
    prompt: ReturnType<typeof createPromptGenerationService>;
  };
}

export function createContext({ request, reply }: CreateContextOptions): Context {
  const fastify = request.server;
  
  return {
    request,
    reply,
    user: request.user,
    services: {
      db: createMockDatabaseService(fastify),
      fileUpload: createFileUploadService(fastify),
      nanoBanana: createNanoBananaAPIService(fastify),
      prompt: createPromptGenerationService(fastify),
    },
  };
}