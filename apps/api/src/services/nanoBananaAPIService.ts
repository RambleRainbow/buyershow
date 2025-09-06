import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { config } from '../config/index.js';
import { ProxyAgent } from 'undici';

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
    index: z.number().optional(), // Index field is optional in the actual API response
  })),
  usageMetadata: z.any().optional(),
  modelVersion: z.string().optional(),
  responseId: z.string().optional(),
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

  private async makeRequest(payload: any, attempt: number = 1, useProxy: boolean = true): Promise<any> {
    try {
      const url = `${this.baseUrl}/v1beta/models/${this.modelName}:generateContent`;
      
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
      };

      // Add proxy agent if configured and useProxy is true
      if (config.nanoBanana.proxyUrl && useProxy) {
        const proxyAgent = new ProxyAgent(config.nanoBanana.proxyUrl);
        (requestOptions as any).dispatcher = proxyAgent;
        
        this.fastify.log.info({
          proxyUrl: config.nanoBanana.proxyUrl
        }, 'Using proxy server for Nano Banana API request');
      } else if (!useProxy) {
        this.fastify.log.info('Attempting direct connection (without proxy)');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      requestOptions.signal = controller.signal;

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonResponse = await response.json();
      
      // Log the actual response structure for debugging
      this.fastify.log.info({
        responseKeys: Object.keys(jsonResponse),
        candidatesLength: jsonResponse.candidates?.length,
        firstCandidate: jsonResponse.candidates?.[0] ? Object.keys(jsonResponse.candidates[0]) : null
      }, 'API Response structure');

      return jsonResponse;
    } catch (error: any) {
      this.fastify.log.error({
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
          errno: error.errno,
          status: error.status,
          statusCode: error.statusCode,
        },
        attempt,
        payload: { ...payload, contents: '[REDACTED]' },
        proxyUrl: config.nanoBanana.proxyUrl,
      }, 'Nano Banana API request failed');

      if (attempt < this.maxRetries) {
        await this.sleep(this.retryDelay * attempt);
        return this.makeRequest(payload, attempt + 1, useProxy);
      }

      // If all attempts with proxy failed, try once without proxy
      if (config.nanoBanana.proxyUrl && useProxy && attempt === this.maxRetries) {
        this.fastify.log.warn('All proxy attempts failed, trying direct connection');
        return this.makeRequest(payload, 1, false);
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