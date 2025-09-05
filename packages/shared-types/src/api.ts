// API相关类型定义

export interface ImageUpload {
  id: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
}

export interface UserDescriptions {
  position: string;
  scene: string;
  style: string;
  angle: string;
  lighting: string;
}

export interface UserFeedback {
  rating: number;
  styleMatch: number;
  quality: number;
  comments?: string;
}

export interface GenerationRequest {
  id: string;
  userId: string;
  originalImageId: string;
  productId: string;
  descriptions: UserDescriptions;
  generatedPrompt: string;
  resultImageUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  feedback?: UserFeedback;
  createdAt: Date;
  completedAt?: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 文件上传响应
export interface UploadResponse {
  id: string;
  url: string;
  filename: string;
}

// 图像生成响应
export interface GenerationResponse {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}