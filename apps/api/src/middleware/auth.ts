import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

// 用户信息接口（临时简化版本）
export interface User {
  id: string;
  email?: string;
  role: 'user' | 'admin';
}

// 扩展Fastify请求类型
declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

async function authPlugin(fastify: FastifyInstance): Promise<void> {
  // 简单的用户ID生成器（MVP版本，后续会替换为真实认证）
  function generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 认证装饰器 - 用于需要认证的路由
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // MVP版本：从header中获取临时用户ID，如果没有则生成一个
      let userId = request.headers['x-user-id'] as string;
      
      if (!userId) {
        // 生成临时用户ID（MVP版本）
        userId = generateUserId();
        fastify.log.info({ userId }, 'Generated temporary user ID for MVP');
      }

      // 设置用户信息
      request.user = {
        id: userId,
        role: 'user',
      };

      fastify.log.debug({ userId: request.user.id }, 'User authenticated');
      
    } catch (error) {
      fastify.log.error({ error }, 'Authentication failed');
      
      return reply.status(401).send({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
          statusCode: 401,
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 管理员认证装饰器
  fastify.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    // 首先进行普通认证
    await fastify.authenticate(request, reply);
    
    if (!request.user || request.user.role !== 'admin') {
      return reply.status(403).send({
        error: {
          message: 'Admin access required',
          code: 'FORBIDDEN',
          statusCode: 403,
        },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 可选认证装饰器 - 不强制要求认证，但如果有token会解析
  fastify.decorate('optionalAuth', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = request.headers['x-user-id'] as string;
      
      if (userId) {
        request.user = {
          id: userId,
          role: 'user',
        };
        
        fastify.log.debug({ userId: request.user.id }, 'Optional authentication successful');
      }
    } catch (error) {
      // 可选认证失败时不抛出错误，只记录日志
      fastify.log.debug({ error }, 'Optional authentication failed');
    }
  });
}

// 扩展Fastify实例类型
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(authPlugin, {
  name: 'auth',
});