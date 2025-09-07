import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc/index.js';

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  imageUrl: z.string().nullable(),
  price: z.number().nullable(),
  currency: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive().optional(),
  currency: z.string().default('CNY'),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const productsRouter = router({
  create: protectedProcedure
    .input(createProductSchema)
    .output(productSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const product = await ctx.services.db.client.product.create({
          data: {
            ...input,
            userId: ctx.user.id,
          },
        });

        ctx.request.server.log.info({
          userId: ctx.user.id,
          productId: product.id,
          productName: product.name,
        }, 'Product created successfully');

        return product;

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Product creation failed');
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create product',
        });
      }
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
    }).merge(updateProductSchema))
    .output(productSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check if product belongs to user
        const existingProduct = await ctx.services.db.client.product.findFirst({
          where: {
            id,
            userId: ctx.user.id,
          },
        });

        if (!existingProduct) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found or access denied',
          });
        }

        const updatedProduct = await ctx.services.db.client.product.update({
          where: { id },
          data: updateData,
        });

        ctx.request.server.log.info({
          userId: ctx.user.id,
          productId: id,
        }, 'Product updated successfully');

        return updatedProduct;

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Product update failed');
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update product',
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .output(z.object({
      success: z.boolean(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = input;

        // Check if product belongs to user
        const existingProduct = await ctx.services.db.client.product.findFirst({
          where: {
            id,
            userId: ctx.user.id,
          },
        });

        if (!existingProduct) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found or access denied',
          });
        }

        // Soft delete by setting isActive to false
        await ctx.services.db.client.product.update({
          where: { id },
          data: { isActive: false },
        });

        ctx.request.server.log.info({
          userId: ctx.user.id,
          productId: id,
        }, 'Product deleted successfully');

        return {
          success: true,
          message: 'Product deleted successfully',
        };

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Product deletion failed');
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete product',
        });
      }
    }),

  list: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      isActive: z.boolean().default(true),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .output(z.object({
      products: z.array(productSchema),
      total: z.number(),
      hasMore: z.boolean(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { category, isActive, limit, offset } = input;

        const where = {
          userId: ctx.user.id,
          isActive,
          ...(category && { category }),
        };

        const [products, total] = await Promise.all([
          ctx.services.db.client.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
          }),
          ctx.services.db.client.product.count({ where }),
        ]);

        return {
          products,
          total,
          hasMore: offset + limit < total,
        };

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Failed to list products');
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve products',
        });
      }
    }),

  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .output(productSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;

        const product = await ctx.services.db.client.product.findFirst({
          where: {
            id,
            userId: ctx.user.id,
          },
        });

        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found or access denied',
          });
        }

        return product;

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Failed to get product');
        
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve product',
        });
      }
    }),

  getCategories: protectedProcedure
    .output(z.array(z.object({
      category: z.string(),
      count: z.number(),
    })))
    .query(async ({ ctx }) => {
      try {
        const categories = await ctx.services.db.client.product.groupBy({
          by: ['category'],
          where: {
            userId: ctx.user.id,
            isActive: true,
            category: {
              not: null,
            },
          },
          _count: {
            category: true,
          },
          orderBy: {
            _count: {
              category: 'desc',
            },
          },
        });

        return categories.map((item: any) => ({
          category: item.category || '',
          count: item._count.category,
        }));

      } catch (error) {
        ctx.request.server.log.error({ error, userId: ctx.user.id }, 'Failed to get categories');
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve categories',
        });
      }
    }),
});