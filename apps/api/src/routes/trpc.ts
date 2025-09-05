import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from '../routers/appRouter.js';
import { createContext } from '../trpc/context.js';

export async function trpcRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext: ({ req, res }: { req: FastifyRequest; res: FastifyReply }) => {
        return createContext({ request: req, reply: res });
      },
      onError: ({ error, type, path, input, ctx, req }) => {
        fastify.log.error({
          error: {
            name: error.name,
            message: error.message,
            code: error.code,
            cause: error.cause,
          },
          type,
          path,
          input,
          userId: ctx?.user?.id,
          requestId: req?.id,
        }, 'tRPC error occurred');
      },
    },
  });
}