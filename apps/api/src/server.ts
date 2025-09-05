import Fastify, { type FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastifyMultipart from '@fastify/multipart';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authPlugin } from './middleware/auth.js';
import { loggingPlugin } from './middleware/logging.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 构建Fastify应用
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.app.env === 'development' ? 'debug' : 'info',
      transport: config.app.env === 'development' 
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
    maxParamLength: 100,
  }).withTypeProvider<ZodTypeProvider>();

  // 设置验证和序列化编译器
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // 安全中间件
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // CORS配置
  await app.register(fastifyCors, {
    origin: config.app.env === 'development' 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : [config.app.frontendUrl],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true,
  });

  // 速率限制
  await app.register(fastifyRateLimit, {
    max: config.api.rateLimitMax,
    timeWindow: config.api.rateLimitWindow,
    hook: 'preHandler',
    keyGenerator: (request) => {
      return request.headers['x-forwarded-for'] as string || request.ip;
    },
  });

  // 文件上传支持
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: config.upload.maxSize,
      files: 1,
    },
  });

  // 静态文件服务
  await app.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/static/',
  });

  // Swagger文档
  if (config.app.env === 'development') {
    await app.register(fastifySwagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'Buyer Show API',
          description: 'AI-powered image generation API for buyer show',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${config.app.port}`,
            description: 'Development server',
          },
        ],
        tags: [
          { name: 'health', description: 'Health check endpoints' },
          { name: 'upload', description: 'File upload endpoints' },
          { name: 'products', description: 'Product management endpoints' },
          { name: 'generation', description: 'Image generation endpoints' },
        ],
      },
    });

    await app.register(fastifySwaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject) => {
        return swaggerObject;
      },
    });
  }

  // 注册自定义插件
  await app.register(loggingPlugin);
  await app.register(authPlugin);
  await app.register(errorHandler);

  // 健康检查端点
  app.get('/health', {
    schema: {
      tags: ['health'],
      summary: 'Health check',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  });

  // 根路径
  app.get('/', async (request, reply) => {
    return { 
      message: 'Buyer Show API Server',
      version: '1.0.0',
      docs: config.app.env === 'development' ? '/docs' : undefined,
    };
  });

  return app;
}

// 启动服务器
async function start(): Promise<void> {
  try {
    const app = await buildApp();
    
    const address = await app.listen({
      port: config.app.port,
      host: config.app.host,
    });

    app.log.info(`🚀 Server ready at: ${address}`);
    
    if (config.app.env === 'development') {
      app.log.info(`📚 API Documentation: http://localhost:${config.app.port}/docs`);
    }

    // 优雅关闭
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        app.log.info(`Received ${signal}, shutting down gracefully...`);
        try {
          await app.close();
          app.log.info('Server closed successfully');
          process.exit(0);
        } catch (error) {
          app.log.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  void start();
}

export { start };