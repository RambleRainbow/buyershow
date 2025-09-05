// Re-export types from the API router for use in the frontend
export type { AppRouter } from '../../../api/src/routers/appRouter.js';

// Additional frontend-specific types
export interface FileWithPreview extends File {
  preview?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface GenerationStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isAccessible: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface GenerationConfig {
  temperature: number;
  maxOutputTokens: number;
  style: 'natural' | 'artistic' | 'commercial' | 'casual' | 'luxury';
  quality: 'draft' | 'standard' | 'hd';
}