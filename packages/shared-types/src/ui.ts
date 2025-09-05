// UI组件相关类型定义

export interface PhotoUploadProps {
  onUpload: (file: ImageUpload) => void;
  onError: (error: Error) => void;
  maxSize?: number;
  allowedTypes?: string[];
  className?: string;
}

export interface ProductSelectorProps {
  products: Product[];
  selectedProduct?: Product;
  onSelect: (product: Product) => void;
  loading?: boolean;
  className?: string;
}

export interface DescriptionFormProps {
  onSubmit: (descriptions: UserDescriptions) => void;
  defaultValues?: Partial<UserDescriptions>;
  loading?: boolean;
  className?: string;
}

export interface ResultDisplayProps {
  originalImage: string;
  generatedImage?: string;
  loading?: boolean;
  onDownload?: () => void;
  onRegenerate?: () => void;
  className?: string;
}

export interface FeedbackFormProps {
  onSubmit: (feedback: UserFeedback) => void;
  loading?: boolean;
  className?: string;
}

// 通用UI状态类型
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | string;
  retry?: () => void;
}

// 表单验证类型
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T = any> {
  values: T;
  errors: ValidationError[];
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// 重新导入需要的API类型
import type { 
  ImageUpload, 
  Product, 
  UserDescriptions, 
  UserFeedback 
} from './api';