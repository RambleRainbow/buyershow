import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { NanoBananaAPIService } from './services/nanoBananaAPIService.js';
import { PromptGenerationService } from './services/promptGenerationService.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const app = Fastify({
  logger: {
    level: 'info'
  }
});

const generationRequestSchema = z.object({
  userDescription: z.string().min(5, 'Description must be at least 5 characters'),
  styleDescription: z.string().optional(),
  positionDescription: z.string().optional(),
  productImageBase64: z.string().optional(),
  sceneImageBase64: z.string().optional(),
  temperature: z.number().min(0).max(1).default(0.7),
});

// Initialize services
const nanoBananaService = new NanoBananaAPIService(app);
const promptService = new PromptGenerationService(app);

// Ensure output directory exists
const outputDir = path.join(process.cwd(), 'generated-images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Health check endpoint
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Simple tRPC-compatible generation endpoint
app.post('/trpc/generation.generateImage', async (request, reply) => {
  try {
    const { input } = request.body as { input: any };
    
    // Validate input
    const validatedInput = generationRequestSchema.parse(input);
    
    // Generate enhanced prompt
    const promptResult = promptService.generatePrompt({
      userDescription: validatedInput.userDescription,
      styleDescription: validatedInput.styleDescription,
      placementDescription: validatedInput.positionDescription,
      hasSceneImage: false, // For simplicity, no scene image for now
    });

    const optimizedPrompt = promptService.optimizeForGemini(promptResult.enhancedPrompt);
    const isValid = promptService.validatePrompt(optimizedPrompt);

    if (!isValid) {
      throw new Error('Generated prompt failed validation checks');
    }

    app.log.info({ promptLength: optimizedPrompt.length }, 'Calling Nano Banana API');

    // Prepare multi-image generation request
    let sceneImageData, productImageData;
    
    if (validatedInput.sceneImageBase64) {
      // Extract base64 data (remove data URL prefix if present)
      sceneImageData = validatedInput.sceneImageBase64.includes(',') 
        ? validatedInput.sceneImageBase64.split(',')[1]
        : validatedInput.sceneImageBase64;
    }
    
    if (validatedInput.productImageBase64) {
      // Extract base64 data (remove data URL prefix if present)
      productImageData = validatedInput.productImageBase64.includes(',')
        ? validatedInput.productImageBase64.split(',')[1] 
        : validatedInput.productImageBase64;
    }

    // Generate image using Nano Banana API with multi-image support
    const generationResult = await nanoBananaService.generateImage({
      prompt: optimizedPrompt,
      sceneImageBase64: sceneImageData,
      sceneImageMimeType: sceneImageData ? 'image/jpeg' : undefined,
      productImageBase64: productImageData,
      productImageMimeType: productImageData ? 'image/jpeg' : undefined,
      temperature: validatedInput.temperature,
      maxOutputTokens: 2048,
    });

    if (!generationResult.success || !generationResult.imageData) {
      throw new Error(generationResult.error?.message || 'Image generation failed');
    }

    app.log.info('Image generated successfully');

    // Save image to filesystem for inspection
    const timestamp = Date.now();
    const filename = `generated_${timestamp}.png`;
    const filepath = path.join(outputDir, filename);
    
    // Convert base64 to buffer and save
    const imageBuffer = Buffer.from(generationResult.imageData, 'base64');
    fs.writeFileSync(filepath, imageBuffer);
    
    app.log.info({ filepath, fileSize: imageBuffer.length }, 'Image saved to filesystem');

    // Return tRPC-compatible response
    return {
      result: {
        data: {
          id: Math.random().toString(),
          status: 'COMPLETED',
          enhancedPrompt: optimizedPrompt,
          createdAt: new Date().toISOString(),
          generatedImage: {
            id: Math.random().toString(),
            filename: filename,
            imageData: `data:${generationResult.mimeType};base64,${generationResult.imageData}`,
            mimeType: generationResult.mimeType || 'image/png',
            width: 1024,
            height: 1024,
            generatedAt: new Date().toISOString(),
            savedPath: filepath, // For debugging/inspection
          },
        }
      }
    };

  } catch (error: any) {
    app.log.error({ error }, 'Generation request failed');
    
    reply.status(500);
    return {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Image generation failed',
      }
    };
  }
});

// Root endpoint
app.get('/', async (request, reply) => {
  return { 
    message: 'Buyer Show API Server - Simple Version',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      generate: '/trpc/generation.generateImage'
    }
  };
});

// Start server
const start = async () => {
  try {
    // Enable CORS
    await app.register(fastifyCors, {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    const address = await app.listen({
      port: 3001,
      host: 'localhost',
    });
    
    app.log.info(`🚀 Simple API Server ready at: ${address}`);
    app.log.info(`📡 Nano Banana API Key configured: ${process.env.NANO_BANANA_API_KEY ? 'Yes' : 'No'}`);
    
  } catch (error) {
    app.log.error('Error starting server:', error);
    process.exit(1);
  }
};

void start();