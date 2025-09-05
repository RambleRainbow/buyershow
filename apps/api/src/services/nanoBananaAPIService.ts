import { ofetch } from 'ofetch';
import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { config } from '../config/index.js';

const geminiContentSchema = z.object({
  text: z.string().optional(),
  parts: z.array(z.object({
    text: z.string().optional(),
    inlineData: z.object({
      mimeType: z.string(),
      data: z.string(),
    }).optional(),
  })).optional(),
});

const geminiRequestSchema = z.object({
  contents: z.array(geminiContentSchema),
  generationConfig: z.object({
    temperature: z.number().optional(),
    topK: z.number().optional(),
    topP: z.number().optional(),
    maxOutputTokens: z.number().optional(),
  }).optional(),
});

const geminiResponseSchema = z.object({
  candidates: z.array(z.object({
    content: z.object({
      parts: z.array(z.object({
        text: z.string().optional(),
        inlineData: z.object({
          mimeType: z.string(),
          data: z.string(),
        }).optional(),
      })),
    }),
    finishReason: z.string(),
    index: z.number(),
  })),
});

export interface ImageGenerationRequest {
  prompt: string;
  sceneImageBase64?: string;
  sceneImageMimeType?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageData?: string;
  mimeType?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  usage?: {
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export class NanoBananaAPIService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly modelName: string = 'gemini-2.5-flash-image-preview';
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;

  constructor(private fastify: FastifyInstance) {
    this.baseUrl = config.nanoBanana.baseUrl;
    this.apiKey = config.nanoBanana.apiKey;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest(payload: any, attempt: number = 1): Promise<any> {
    try {
      const url = `${this.baseUrl}/v1beta/models/${this.modelName}:generateContent`;
      
      const response = await ofetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: payload,
        timeout: 60000,
      });

      return response;
    } catch (error: any) {
      this.fastify.log.error({
        error,
        attempt,
        payload: { ...payload, contents: '[REDACTED]' },
      }, 'Nano Banana API request failed');

      if (attempt < this.maxRetries) {
        await this.sleep(this.retryDelay * attempt);
        return this.makeRequest(payload, attempt + 1);
      }

      throw error;
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const contents: any[] = [];

      if (request.sceneImageBase64 && request.sceneImageMimeType) {
        contents.push({
          parts: [
            {
              text: `User uploaded scene image. Please integrate the described product into this scene naturally. ${request.prompt}`,
            },
            {
              inlineData: {
                mimeType: request.sceneImageMimeType,
                data: request.sceneImageBase64,
              },
            },
          ],
        });
      } else {
        contents.push({
          parts: [
            {
              text: request.prompt,
            },
          ],
        });
      }

      const payload = {
        contents,
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxOutputTokens || 2048,
        },
      };

      const validatedPayload = geminiRequestSchema.parse(payload);
      
      this.fastify.log.info({
        hasSceneImage: !!request.sceneImageBase64,
        promptLength: request.prompt.length,
      }, 'Sending request to Nano Banana API');

      const response = await this.makeRequest(validatedPayload);
      const validatedResponse = geminiResponseSchema.parse(response);

      if (!validatedResponse.candidates?.[0]?.content?.parts) {
        throw new Error('No content generated from API');
      }

      const parts = validatedResponse.candidates[0].content.parts;
      const imagePart = parts.find(part => part.inlineData?.mimeType?.startsWith('image/'));

      if (!imagePart?.inlineData) {
        throw new Error('No image data found in response');
      }

      this.fastify.log.info({
        finishReason: validatedResponse.candidates[0].finishReason,
        mimeType: imagePart.inlineData.mimeType,
      }, 'Image generated successfully');

      return {
        success: true,
        imageData: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
        usage: {
          outputTokens: 1290, // Standard tokens per image
        },
      };

    } catch (error: any) {
      this.fastify.log.error({ error }, 'Image generation failed');

      let errorCode = 'GENERATION_FAILED';
      let errorMessage = 'Failed to generate image';

      if (error.status === 401 || error.statusCode === 401) {
        errorCode = 'INVALID_API_KEY';
        errorMessage = 'Invalid or missing API key';
      } else if (error.status === 429 || error.statusCode === 429) {
        errorCode = 'RATE_LIMIT_EXCEEDED';
        errorMessage = 'API rate limit exceeded';
      } else if (error.status === 400 || error.statusCode === 400) {
        errorCode = 'INVALID_REQUEST';
        errorMessage = 'Invalid request format or content';
      } else if (error.status >= 500 || error.statusCode >= 500) {
        errorCode = 'API_ERROR';
        errorMessage = 'API server error';
      }

      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          details: {
            originalError: error.message,
            status: error.status || error.statusCode,
          },
        },
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const testRequest: ImageGenerationRequest = {
        prompt: 'A simple test image of a banana',
        temperature: 0.1,
        maxOutputTokens: 1024,
      };

      const response = await this.generateImage(testRequest);
      return response.success;
    } catch (error) {
      this.fastify.log.error({ error }, 'Connection test failed');
      return false;
    }
  }
}

export const createNanoBananaAPIService = (fastify: FastifyInstance): NanoBananaAPIService => {
  return new NanoBananaAPIService(fastify);
};