import { router } from '../trpc/index.js';
import { uploadRouter } from './upload.js';
import { generationRouter } from './generation.js';
import { productsRouter } from './products.js';
import { historyRouter } from './history.js';

export const appRouter = router({
  upload: uploadRouter,
  generation: generationRouter,
  products: productsRouter,
  history: historyRouter,
});

export type AppRouter = typeof appRouter;