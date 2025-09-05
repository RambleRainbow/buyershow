// 工具类型定义

// 通用工具类型
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : never;

// 深度可选类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 排除null和undefined
export type NonNullable<T> = T extends null | undefined ? never : T;

// 提取Promise的结果类型
export type Awaited<T> = T extends Promise<infer U> ? U : T;

// 函数类型工具
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

// 对象键值操作
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// 配置类型
export interface AppConfig {
  app: {
    name: string;
    version: string;
    port: number;
    env: 'development' | 'production' | 'test';
  };
  api: {
    prefix: string;
    timeout: number;
    maxRequestSize: string;
  };
  upload: {
    maxSize: number;
    allowedTypes: string[];
    destination: string;
  };
  nanoBanana: {
    apiKey: string;
    baseUrl: string;
    timeout: number;
    maxRetries: number;
  };
  database: {
    url: string;
    provider: 'sqlite' | 'postgresql';
    logging: boolean;
  };
  redis?: {
    url: string;
    ttl: number;
  };
}

// 环境变量类型
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  DATABASE_URL: string;
  NANO_BANANA_API_KEY: string;
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: string;
  REDIS_URL?: string;
}

// 日志相关类型
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

export interface Logger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
}

// 验证相关类型
export interface ValidationRule<T = any> {
  field: keyof T;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

// 缓存相关类型
export interface CacheOptions {
  key: string;
  ttl?: number; // seconds
  tags?: string[];
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  invalidateTag(tag: string): Promise<void>;
}