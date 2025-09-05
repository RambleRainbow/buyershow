import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

async function loggingPlugin(fastify: FastifyInstance): Promise<void> {
  // 请求开始时的hook
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    
    // 将开始时间附加到请求上下文
    request.startTime = startTime;
    
    fastify.log.debug({
      requestId: request.id,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      startTime,
    }, 'Request started');
  });

  // 请求完成时的hook
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const endTime = Date.now();
    const duration = request.startTime ? endTime - request.startTime : 0;
    
    const logData = {
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: request.user?.id,
      contentLength: reply.getHeader('content-length'),
    };

    // 根据状态码决定日志级别
    if (reply.statusCode >= 500) {
      fastify.log.error(logData, 'Request completed with server error');
    } else if (reply.statusCode >= 400) {
      fastify.log.warn(logData, 'Request completed with client error');
    } else {
      fastify.log.info(logData, 'Request completed successfully');
    }
  });

  // 错误处理hook
  fastify.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
    fastify.log.error({
      requestId: request.id,
      method: request.method,
      url: request.url,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      userId: request.user?.id,
    }, 'Request error occurred');
  });
}

// 扩展FastifyRequest类型以包含startTime
declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
  }
}

export default fp(loggingPlugin, {
  name: 'logging',
});