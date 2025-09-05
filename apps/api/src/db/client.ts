import { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

declare global {
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
  });
};

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export type PrismaClient = typeof prisma;

export interface DatabaseService {
  client: PrismaClient;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

export class DatabaseService implements DatabaseService {
  public client: PrismaClient;

  constructor(private fastify: FastifyInstance) {
    this.client = prisma;
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      this.fastify.log.info('Database connected successfully');
    } catch (error) {
      this.fastify.log.error({ error }, 'Failed to connect to database');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
      this.fastify.log.info('Database disconnected successfully');
    } catch (error) {
      this.fastify.log.error({ error }, 'Failed to disconnect from database');
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.fastify.log.error({ error }, 'Database health check failed');
      return false;
    }
  }

  // Utility methods for common operations
  async createUser(data: { email?: string; role?: string }): Promise<any> {
    return this.client.user.create({
      data: {
        email: data.email,
        role: data.role || 'user',
      },
    });
  }

  async findUserById(id: string): Promise<any> {
    return this.client.user.findUnique({
      where: { id },
      include: {
        imageUploads: true,
        products: true,
        generationRequests: {
          include: {
            generatedImages: true,
            sceneImage: true,
            product: true,
          },
        },
      },
    });
  }

  async createImageUpload(data: {
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    path: string;
    url: string;
    userId: string;
  }): Promise<any> {
    return this.client.imageUpload.create({ data });
  }

  async createGenerationRequest(data: {
    userDescription: string;
    productDescription?: string;
    placementDescription?: string;
    styleDescription?: string;
    enhancedPrompt: string;
    userId: string;
    sceneImageId?: string;
    productId?: string;
    aiModel?: string;
    temperature?: number;
  }): Promise<any> {
    return this.client.generationRequest.create({ data });
  }

  async updateGenerationRequest(id: string, data: {
    status?: any;
    completedAt?: Date;
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    errorCode?: string;
    errorMessage?: string;
    retryCount?: number;
  }): Promise<any> {
    return this.client.generationRequest.update({
      where: { id },
      data,
    });
  }

  async createGeneratedImage(data: {
    filename: string;
    originalPrompt: string;
    enhancedPrompt: string;
    imageData: string;
    mimeType: string;
    size?: number;
    width?: number;
    height?: number;
    quality?: string;
    style?: string;
    generationRequestId: string;
    aiModel?: string;
  }): Promise<any> {
    return this.client.generatedImage.create({ data });
  }

  async getGenerationHistory(userId: string, limit = 10): Promise<any[]> {
    return this.client.generationRequest.findMany({
      where: { userId },
      include: {
        generatedImages: true,
        sceneImage: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async updateSystemMetrics(date: Date, data: {
    totalRequests?: number;
    successfulGenerations?: number;
    failedGenerations?: number;
    totalTokensUsed?: number;
    averageProcessingTime?: number;
    apiCost?: number;
  }): Promise<any> {
    return this.client.systemMetrics.upsert({
      where: { date },
      update: data,
      create: {
        date,
        ...data,
      },
    });
  }
}

export const createDatabaseService = (fastify: FastifyInstance): DatabaseService => {
  return new DatabaseService(fastify);
};