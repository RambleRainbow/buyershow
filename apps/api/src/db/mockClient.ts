import type { FastifyInstance } from 'fastify';

export interface DatabaseService {
  client: any;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
  createUser(data: { email?: string; role?: string }): Promise<any>;
  findUserById(id: string): Promise<any>;
  createImageUpload(data: {
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    path: string;
    url: string;
    userId: string;
  }): Promise<any>;
  createGenerationRequest(data: {
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
  }): Promise<any>;
  updateGenerationRequest(id: string, data: {
    status?: any;
    completedAt?: Date;
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    errorCode?: string;
    errorMessage?: string;
    retryCount?: number;
  }): Promise<any>;
  createGeneratedImage(data: {
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
  }): Promise<any>;
  getGenerationHistory(userId: string, limit?: number): Promise<any[]>;
  updateSystemMetrics(date: Date, data: {
    totalRequests?: number;
    successfulGenerations?: number;
    failedGenerations?: number;
    totalTokensUsed?: number;
    averageProcessingTime?: number;
    apiCost?: number;
  }): Promise<any>;
}

export class MockDatabaseService implements DatabaseService {
  public client: any = {
    imageUpload: {
      findFirst: async () => null,
      create: async (data: any) => ({ id: Math.random().toString(), ...data.data }),
    },
    product: {
      findFirst: async () => null,
      findMany: async () => [],
    },
    user: {
      findUnique: async () => null,
      create: async (data: any) => ({ id: Math.random().toString(), ...data.data }),
    },
    generationRequest: {
      findFirst: async () => null,
      findMany: async () => [],
      create: async (data: any) => ({ 
        id: Math.random().toString(), 
        createdAt: new Date(),
        status: 'PENDING',
        ...data.data 
      }),
      update: async (params: any) => ({ 
        id: params.where.id, 
        ...params.data 
      }),
    },
    generatedImages: {
      create: async (data: any) => ({ 
        id: Math.random().toString(),
        generatedAt: new Date(),
        ...data.data 
      }),
    },
  };

  constructor(private fastify: FastifyInstance) {}

  async connect(): Promise<void> {
    this.fastify.log.info('Mock database connected');
  }

  async disconnect(): Promise<void> {
    this.fastify.log.info('Mock database disconnected');
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  // Utility methods for common operations (mock implementations)
  async createUser(data: { email?: string; role?: string }): Promise<any> {
    return {
      id: Math.random().toString(),
      email: data.email,
      role: data.role || 'user',
      createdAt: new Date(),
    };
  }

  async findUserById(id: string): Promise<any> {
    return {
      id,
      email: 'mock@example.com',
      role: 'user',
      imageUploads: [],
      products: [],
      generationRequests: [],
    };
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
    return {
      id: Math.random().toString(),
      ...data,
      createdAt: new Date(),
    };
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
    return {
      id: Math.random().toString(),
      ...data,
      status: 'PENDING',
      createdAt: new Date(),
    };
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
    return {
      id,
      ...data,
      updatedAt: new Date(),
    };
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
    return {
      id: Math.random().toString(),
      ...data,
      generatedAt: new Date(),
    };
  }

  async getGenerationHistory(_userId: string, _limit = 10): Promise<any[]> {
    return [];
  }

  async updateSystemMetrics(date: Date, data: {
    totalRequests?: number;
    successfulGenerations?: number;
    failedGenerations?: number;
    totalTokensUsed?: number;
    averageProcessingTime?: number;
    apiCost?: number;
  }): Promise<any> {
    return {
      date,
      ...data,
    };
  }
}

export const createMockDatabaseService = (fastify: FastifyInstance): DatabaseService => {
  return new MockDatabaseService(fastify);
};