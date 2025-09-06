'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ProductImageUploadProps {
  onImageSelect?: (imageBase64: string, file: File) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  value?: string; // base64 image data
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

export function ProductImageUpload({ onImageSelect, onUploadError, className, value }: ProductImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError('');
    setUploadProgress(0);
    setIsUploading(true);

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = `文件过大，请选择小于 ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB 的图片`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      setIsUploading(false);
      return;
    }

    try {
      // Create preview and base64 data
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        
        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsUploading(false);
              onImageSelect?.(base64String, file);
              return 100;
            }
            return prev + 10;
          });
        }, 50);
      };

      reader.onerror = () => {
        const errorMsg = '图片读取失败，请重试';
        setError(errorMsg);
        onUploadError?.(errorMsg);
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '上传失败，请重试';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      setIsUploading(false);
    }
  }, [onImageSelect, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    disabled: isUploading,
  });

  const clearImage = useCallback(() => {
    setPreview('');
    setError('');
    setUploadProgress(0);
    onImageSelect?.('', new File([], ''));
  }, [onImageSelect]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label htmlFor="product-image">商品图片</Label>
        <p className="text-sm text-muted-foreground">
          上传商品图片，将与场景图片自然融合
        </p>
      </div>

      {preview ? (
        <div className="space-y-4">
          <Card className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="商品预览"
                  className="w-full h-full object-cover"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={clearImage}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                处理中... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      ) : (
        <Card 
          {...getRootProps()} 
          className={cn(
            'border-2 border-dashed transition-colors cursor-pointer hover:border-primary/50',
            isDragActive && 'border-primary bg-primary/5',
            error && 'border-destructive',
            isUploading && 'pointer-events-none opacity-50'
          )}
        >
          <input {...getInputProps()} />
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-8">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              <ShoppingBag className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="font-medium">
                {isDragActive ? '松开以上传商品图片' : '上传商品图片'}
              </h3>
              <p className="text-sm text-muted-foreground">
                拖拽图片到此处，或点击选择文件
              </p>
              <p className="text-xs text-muted-foreground">
                支持 JPG、PNG、WebP、GIF，最大 10MB
              </p>
            </div>

            {!isDragActive && (
              <Button variant="outline" size="sm" disabled={isUploading}>
                <Upload className="w-4 h-4 mr-2" />
                选择文件
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {preview && !isUploading && !error && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span>商品图片已准备就绪</span>
        </div>
      )}
    </div>
  );
}