// 共享类型主入口文件

// API相关类型
export * from './api';

// UI组件相关类型
export * from './ui';

// 服务层相关类型
export * from './services';

// 数据库相关类型
export * from './database';

// 工具类型
export * from './utils';

// 版本信息
export const SHARED_TYPES_VERSION = '1.0.0';

// 常量定义
export const CONSTANTS = {
  // 文件相关常量
  FILE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    UPLOAD_TIMEOUT: 30000, // 30秒
  },
  
  // API相关常量
  API: {
    TIMEOUT: 30000, // 30秒
    MAX_RETRIES: 3,
    RATE_LIMIT: 100, // 每分钟请求数
  },
  
  // 图像生成相关常量
  GENERATION: {
    TIMEOUT: 60000, // 60秒
    MAX_PROMPT_LENGTH: 1000,
    SUPPORTED_STYLES: [
      'natural',
      'artistic',
      'realistic',
      'cartoon',
      'vintage',
      'modern'
    ] as const,
  },
  
  // 用户反馈相关常量
  FEEDBACK: {
    MIN_RATING: 1,
    MAX_RATING: 5,
    MAX_COMMENT_LENGTH: 500,
  },
  
  // 数据库相关常量
  DATABASE: {
    CONNECTION_TIMEOUT: 10000,
    QUERY_TIMEOUT: 30000,
    MAX_CONNECTIONS: 10,
  }
} as const;

// 类型守卫函数
export const isImageUpload = (obj: any): obj is import('./api').ImageUpload => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.filename === 'string' &&
    typeof obj.filepath === 'string' &&
    typeof obj.mimetype === 'string' &&
    typeof obj.size === 'number' &&
    obj.uploadedAt instanceof Date;
};

export const isProduct = (obj: any): obj is import('./api').Product => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.imageUrl === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.isActive === 'boolean';
};

export const isGenerationRequest = (obj: any): obj is import('./api').GenerationRequest => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    typeof obj.originalImageId === 'string' &&
    typeof obj.productId === 'string' &&
    obj.descriptions &&
    typeof obj.generatedPrompt === 'string' &&
    ['pending', 'processing', 'completed', 'failed'].includes(obj.status) &&
    obj.createdAt instanceof Date;
};