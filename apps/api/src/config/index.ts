import { z } from 'zod';
import { config as loadEnv } from 'dotenv';

// Load environment variables from .env file
loadEnv();

const configSchema = z.object({
  app: z.object({
    env: z.enum(['development', 'production', 'test']).default('development'),
    port: z.coerce.number().default(3001),
    host: z.string().default('localhost'),
    frontendUrl: z.string().default('http://localhost:3000'),
  }),
  api: z.object({
    rateLimitMax: z.coerce.number().default(100),
    rateLimitWindow: z.string().default('1 minute'),
  }),
  upload: z.object({
    maxSize: z.coerce.number().default(10 * 1024 * 1024),
  }),
  nanoBanana: z.object({
    apiKey: z.string().min(1, 'Google Nano Banana API key is required'),
    baseUrl: z.string().url().default('https://generativelanguage.googleapis.com'),
    proxyUrl: z.string().url().optional(),
  }),
});

const envConfig = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  api: {
    rateLimitMax: process.env.RATE_LIMIT_MAX || 100,
    rateLimitWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',
  },
  upload: {
    maxSize: process.env.UPLOAD_MAX_SIZE || 10 * 1024 * 1024,
  },
  nanoBanana: {
    apiKey: process.env.NANO_BANANA_API_KEY || '',
    baseUrl: process.env.NANO_BANANA_BASE_URL || 'https://generativelanguage.googleapis.com',
    proxyUrl: process.env.PROXY_URL,
  },
};

export const config = configSchema.parse(envConfig);

export type Config = z.infer<typeof configSchema>;