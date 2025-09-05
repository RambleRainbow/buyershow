// 数据库相关类型定义

// Prisma相关类型扩展
export interface DatabaseConfig {
  url: string;
  provider: 'sqlite' | 'postgresql' | 'mysql';
  maxConnections?: number;
  timeout?: number;
}

// 数据库模型基础类型
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 扩展的数据库模型
export interface ImageUploadModel extends BaseModel {
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  isActive: boolean;
  generationRequests?: GenerationRequestModel[];
}

export interface ProductModel extends BaseModel {
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
  generationRequests?: GenerationRequestModel[];
}

export interface GenerationRequestModel extends BaseModel {
  userId: string;
  originalImageId: string;
  originalImage?: ImageUploadModel;
  productId: string;
  product?: ProductModel;
  descriptions: string; // JSON字符串存储UserDescriptions
  generatedPrompt: string;
  resultImageUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  feedback?: string; // JSON字符串存储UserFeedback
  processingStartedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
}

// 查询选项类型
export interface QueryOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  where?: Record<string, any>;
  include?: Record<string, boolean | QueryOptions>;
}

// 数据库操作结果类型
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 数据库服务接口
export interface IImageUploadRepository {
  create(data: Omit<ImageUploadModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImageUploadModel>;
  findById(id: string): Promise<ImageUploadModel | null>;
  findMany(options?: QueryOptions): Promise<ImageUploadModel[]>;
  update(id: string, data: Partial<ImageUploadModel>): Promise<ImageUploadModel>;
  delete(id: string): Promise<void>;
}

export interface IProductRepository {
  create(data: Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductModel>;
  findById(id: string): Promise<ProductModel | null>;
  findMany(options?: QueryOptions): Promise<ProductModel[]>;
  findByCategory(category: string): Promise<ProductModel[]>;
  update(id: string, data: Partial<ProductModel>): Promise<ProductModel>;
  delete(id: string): Promise<void>;
}

export interface IGenerationRequestRepository {
  create(data: Omit<GenerationRequestModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<GenerationRequestModel>;
  findById(id: string): Promise<GenerationRequestModel | null>;
  findMany(options?: QueryOptions): Promise<GenerationRequestModel[]>;
  findByStatus(status: GenerationRequestModel['status']): Promise<GenerationRequestModel[]>;
  findByUser(userId: string, options?: QueryOptions): Promise<PaginatedResult<GenerationRequestModel>>;
  update(id: string, data: Partial<GenerationRequestModel>): Promise<GenerationRequestModel>;
  updateStatus(id: string, status: GenerationRequestModel['status'], errorMessage?: string): Promise<GenerationRequestModel>;
  delete(id: string): Promise<void>;
}