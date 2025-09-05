'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useGenerationFlow } from '@/hooks/useGenerationFlow';
import type { FileWithPreview } from '@/types/api';

interface PhotoUploadProps {
  onUploadComplete?: (file: File) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

export function PhotoUpload({ onUploadComplete, onUploadError, className }: PhotoUploadProps) {
  const [preview, setPreview] = useState<FileWithPreview | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  
  const { uploadSceneImage, isUploading, uploadError, generationFlow } = useGenerationFlow();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError('');
    setUploadProgress(0);

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = `文件过大，请选择小于 ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB 的图片`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Create preview
    const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
    }) as FileWithPreview;
    
    setPreview(fileWithPreview);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await uploadSceneImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      onUploadComplete?.(file);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '上传失败';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      setUploadProgress(0);
    }
  }, [uploadSceneImage, onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    disabled: isUploading,
  });

  const removePreview = useCallback(() => {
    if (preview?.preview) {
      URL.revokeObjectURL(preview.preview);
    }
    setPreview(null);
    setUploadProgress(0);
    setError('');
  }, [preview]);

  const currentError = error || uploadError;
  const hasUploadedImage = generationFlow.sceneImage;
  const isComplete = uploadProgress === 100 && !currentError;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label className="text-base font-medium">上传场景照片</Label>
        <p className="text-sm text-muted-foreground">
          选择你的生活场景照片，AI 将把商品自然融入其中
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {preview || hasUploadedImage ? (
            <div className="relative">
              <div className="aspect-video bg-gray-50 flex items-center justify-center">
                {preview?.preview ? (
                  <img
                    src={preview.preview}
                    alt="预览图"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : hasUploadedImage ? (
                  <img
                    src={hasUploadedImage.url}
                    alt={hasUploadedImage.originalName}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : null}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 min-w-[200px]">
                    <div className="flex items-center space-x-2 mb-2">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">上传中...</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploadProgress}%
                    </p>
                  </div>
                </div>
              )}

              {/* Success/Error Overlay */}
              {(isComplete || currentError) && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  {isComplete && (
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  {currentError && (
                    <div className="bg-red-500 text-white rounded-full p-1">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )}

              {/* Remove Button */}
              {!isUploading && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 left-2"
                  onClick={removePreview}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              {/* File Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white text-sm">
                  <p className="font-medium">
                    {preview?.name || hasUploadedImage?.originalName}
                  </p>
                  <p className="opacity-80 text-xs">
                    {preview 
                      ? `${(preview.size / 1024 / 1024).toFixed(1)}MB`
                      : hasUploadedImage
                      ? `${(hasUploadedImage.size / 1024 / 1024).toFixed(1)}MB`
                      : ''
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                'hover:border-primary/50 hover:bg-primary/5',
                isDragActive && 'border-primary bg-primary/10',
                isUploading && 'cursor-not-allowed opacity-50',
                'aspect-video flex flex-col items-center justify-center space-y-4'
              )}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-primary/10 rounded-full p-3">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                
                {isDragActive ? (
                  <p className="text-lg font-medium">放下文件开始上传</p>
                ) : (
                  <>
                    <p className="text-lg font-medium">点击或拖拽上传图片</p>
                    <p className="text-sm text-muted-foreground">
                      支持 JPG、PNG、WebP、GIF 格式，最大 10MB
                    </p>
                  </>
                )}
              </div>

              <Button variant="outline" disabled={isUploading}>
                <Upload className="w-4 h-4 mr-2" />
                选择文件
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {currentError && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{currentError}</p>
        </div>
      )}

      {/* Success Message */}
      {isComplete && !currentError && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">图片上传成功！</p>
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>💡 <strong>提示：</strong>选择清晰、光线良好的场景照片效果更佳</p>
        <p>🎯 <strong>建议：</strong>避免过于复杂的背景，有助于 AI 更好地融入商品</p>
      </div>
    </div>
  );
}