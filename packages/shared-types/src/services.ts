// 服务层相关类型定义

// Google Nano Banana API相关类型
export interface NanoBananaAPIConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
}

export interface NanoBananaAPIResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  usage?: {
    tokensUsed: number;
    cost: number;
  };
}

// 提示生成服务类型
export interface PromptGenerationConfig {
  maxLength?: number;
  includePhotographyTerms?: boolean;
  styleMapping?: Record<string, string>;
}

export interface GeneratedPrompt {
  text: string;
  confidence: number;
  usedTerms: string[];
}

// 文件服务类型
export interface FileServiceConfig {
  maxSize: number;
  allowedTypes: string[];
  uploadPath: string;
  publicUrl: string;
}

export interface FileMetadata {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: Date;
}

// 错误类型
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class APIError extends AppError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, 'API_ERROR');
    this.name = 'APIError';
  }
}

// 服务接口
export interface IFileUploadService {
  upload(file: Buffer, metadata: Partial<FileMetadata>): Promise<FileMetadata>;
  delete(id: string): Promise<void>;
  getUrl(id: string): Promise<string>;
}

export interface INanoBananaAPIService {
  generateImage(prompt: string): Promise<NanoBananaAPIResponse>;
  checkHealth(): Promise<boolean>;
}

export interface IPromptGenerationService {
  generatePrompt(
    scene: string,
    product: Product,
    descriptions: UserDescriptions
  ): Promise<GeneratedPrompt>;
}

// 重新导入需要的类型
import type { Product, UserDescriptions } from './api';