import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

export interface PromptRequest {
  userDescription: string;
  productDescription?: string;
  placementDescription?: string;
  styleDescription?: string;
  hasSceneImage: boolean;
}

export interface PromptResult {
  enhancedPrompt: string;
  originalPrompt: string;
  components: {
    productPlacement: string;
    styleGuide: string;
    photographyTerms: string;
    composition: string;
  };
}

const photographyStyles = {
  natural: {
    terms: ['natural lighting', 'candid', 'authentic', 'lifestyle photography'],
    keywords: ['soft shadows', 'warm tones', 'realistic proportions'],
  },
  artistic: {
    terms: ['artistic composition', 'creative angle', 'dramatic lighting'],
    keywords: ['depth of field', 'bokeh', 'rule of thirds'],
  },
  commercial: {
    terms: ['commercial photography', 'product showcase', 'clean background'],
    keywords: ['sharp focus', 'professional lighting', 'high-end quality'],
  },
  casual: {
    terms: ['casual lifestyle', 'everyday setting', 'relaxed atmosphere'],
    keywords: ['natural poses', 'comfortable environment', 'informal'],
  },
  luxury: {
    terms: ['luxury photography', 'premium quality', 'elegant setting'],
    keywords: ['sophisticated lighting', 'refined composition', 'high-end'],
  },
};

const compositionRules = [
  'maintain natural perspective and scale',
  'ensure proper lighting consistency',
  'blend seamlessly with existing environment',
  'preserve original image quality and style',
  'maintain realistic shadows and reflections',
];

const placementKeywords = {
  foreground: ['prominently displayed', 'center focus', 'main subject'],
  background: ['subtly placed', 'background element', 'environmental context'],
  handheld: ['naturally held', 'in use', 'interactive placement'],
  surface: ['placed on surface', 'resting naturally', 'stable positioning'],
};

export class PromptGenerationService {
  constructor(private fastify: FastifyInstance) {}

  private detectStyle(description: string): keyof typeof photographyStyles {
    const lowerDescription = description.toLowerCase();
    
    if (lowerDescription.includes('luxury') || lowerDescription.includes('premium') || lowerDescription.includes('elegant')) {
      return 'luxury';
    }
    if (lowerDescription.includes('commercial') || lowerDescription.includes('professional') || lowerDescription.includes('clean')) {
      return 'commercial';
    }
    if (lowerDescription.includes('artistic') || lowerDescription.includes('creative') || lowerDescription.includes('dramatic')) {
      return 'artistic';
    }
    if (lowerDescription.includes('casual') || lowerDescription.includes('relaxed') || lowerDescription.includes('everyday')) {
      return 'casual';
    }
    
    return 'natural';
  }

  private extractPlacementType(description: string): keyof typeof placementKeywords {
    const lowerDescription = description.toLowerCase();
    
    if (lowerDescription.includes('hold') || lowerDescription.includes('hand') || lowerDescription.includes('using')) {
      return 'handheld';
    }
    if (lowerDescription.includes('table') || lowerDescription.includes('surface') || lowerDescription.includes('desk')) {
      return 'surface';
    }
    if (lowerDescription.includes('background') || lowerDescription.includes('behind') || lowerDescription.includes('distant')) {
      return 'background';
    }
    
    return 'foreground';
  }

  private enhanceProductDescription(productDescription?: string): string {
    if (!productDescription) return 'the product';
    
    const enhancements = [
      'high-quality',
      'well-designed',
      'realistic',
      'detailed',
    ];
    
    return `${enhancements[Math.floor(Math.random() * enhancements.length)]} ${productDescription}`;
  }

  generatePrompt(request: PromptRequest): PromptResult {
    const style = this.detectStyle(request.styleDescription || request.userDescription);
    const placementType = this.extractPlacementType(request.placementDescription || request.userDescription);
    const styleConfig = photographyStyles[style];
    const placementConfig = placementKeywords[placementType];
    
    const enhancedProduct = this.enhanceProductDescription(request.productDescription);
    
    // Build prompt components
    const components = {
      productPlacement: request.placementDescription || `${placementConfig[0]} in the scene`,
      styleGuide: `${styleConfig.terms.join(', ')}, ${styleConfig.keywords.join(', ')}`,
      photographyTerms: compositionRules.slice(0, 3).join(', '),
      composition: 'natural integration, professional quality, photorealistic result',
    };

    // Original user prompt
    const originalPrompt = request.userDescription;

    // Enhanced prompt for better AI results
    const enhancedPrompt = request.hasSceneImage 
      ? `Please seamlessly integrate ${enhancedProduct} into this scene. ${request.userDescription}. 

Style requirements: ${components.styleGuide}
Placement: ${components.productPlacement}
Quality standards: ${components.photographyTerms}, ${components.composition}

The final image should look completely natural and professional, as if the product was originally part of the scene. Maintain the original lighting, perspective, and atmosphere while ensuring the product fits perfectly within the environment.`

      : `Create a high-quality lifestyle photograph featuring ${enhancedProduct}. ${request.userDescription}

Photography style: ${components.styleGuide}
Composition: ${components.composition}
Technical requirements: ${components.photographyTerms}

The image should be suitable for social media sharing and showcase the product in an appealing, realistic way that potential buyers would find engaging and trustworthy.`;

    this.fastify.log.debug({
      style,
      placementType,
      promptLength: enhancedPrompt.length,
      hasSceneImage: request.hasSceneImage,
    }, 'Generated enhanced prompt');

    return {
      enhancedPrompt,
      originalPrompt,
      components,
    };
  }

  validatePrompt(prompt: string): boolean {
    // Basic validation rules
    if (prompt.length < 10) return false;
    if (prompt.length > 4000) return false;
    
    // Check for inappropriate content keywords
    const inappropriateKeywords = [
      'violence', 'illegal', 'harmful', 'nsfw', 'adult',
      'weapon', 'drug', 'gambling', 'hate',
    ];
    
    const lowerPrompt = prompt.toLowerCase();
    return !inappropriateKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  optimizeForGemini(prompt: string): string {
    // Gemini-specific optimizations based on documentation
    const optimizations = [
      'Focus on descriptive narrative rather than keywords',
      'Include environmental context and atmosphere',
      'Specify desired artistic style and mood',
      'Mention technical photography aspects',
    ];

    // Add narrative structure for better Gemini understanding
    if (!prompt.toLowerCase().includes('create') && !prompt.toLowerCase().includes('generate')) {
      prompt = `Create a photorealistic image: ${prompt}`;
    }

    // Ensure the prompt encourages narrative understanding
    if (prompt.length > 500) {
      // For longer prompts, add structure
      return `${prompt}\n\nPlease interpret this request as a complete scene description and create a cohesive, high-quality photographic image that tells the story described above.`;
    }

    return prompt;
  }
}

export const createPromptGenerationService = (fastify: FastifyInstance): PromptGenerationService => {
  return new PromptGenerationService(fastify);
};