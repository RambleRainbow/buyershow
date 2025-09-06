'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useGenerationFlow } from '@/hooks/useGenerationFlow';
import { FeedbackForm } from '@/components/FeedbackForm';
import { 
  Download, 
  RefreshCw, 
  Share2, 
  Eye, 
  EyeOff, 
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  ImageIcon
} from 'lucide-react';

interface ResultDisplayProps {
  onRegenerate?: () => void;
  onShare?: (imageUrl: string) => void;
  className?: string;
}

export function ResultDisplay({ onRegenerate, onShare, className }: ResultDisplayProps) {
  const [showComparison, setShowComparison] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { generationFlow, regenerateImage } = useGenerationFlow();
  
  const { generationResult, sceneImage, selectedProduct, isGenerating } = generationFlow;

  // Mock generation progress for demo
  const [generationProgress, setGenerationProgress] = useState(isGenerating ? 45 : 100);

  const handleDownload = async (imageUrl: string, filename: string) => {
    setIsDownloading(true);
    try {
      // Create download link
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerate = () => {
    regenerateImage();
    onRegenerate?.();
  };

  const handleShare = () => {
    if (generationResult?.generatedImageUrl) {
      onShare?.(generationResult.generatedImageUrl);
    }
  };

  // Loading State
  if (isGenerating) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">正在生成买家秀...</h2>
            <p className="text-muted-foreground">
              AI正在将您的商品融入场景照片中，请稍候
            </p>
          </div>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">生成进度</span>
              <span className="font-medium">{generationProgress}%</span>
            </div>
            <Progress value={generationProgress} className="w-full" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              预计还需 {Math.ceil((100 - generationProgress) * 0.3)} 秒
            </div>
          </CardContent>
        </Card>

        {/* Preview of inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {sceneImage && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">原始场景</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={sceneImage.url}
                    alt="原始场景"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {selectedProduct && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">选中商品</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {selectedProduct.imageUrl ? (
                    <Image
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="font-medium text-sm">{selectedProduct.name}</p>
                  {selectedProduct.price && (
                    <p className="text-sm text-muted-foreground">¥{selectedProduct.price}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Error State  
  if (generationResult?.status === 'FAILED') {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">生成失败</h2>
            <p className="text-muted-foreground">
              {generationResult.error || '生成过程中出现了问题，请重试'}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleRegenerate} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            重新生成
          </Button>
        </div>
      </div>
    );
  }

  // Success State
  if (!generationResult || generationResult.status !== 'COMPLETED') {
    return (
      <div className={cn('text-center py-16', className)}>
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">暂无结果</h2>
        <p className="text-muted-foreground">
          请先完成前面的步骤来生成买家秀
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">生成完成！</h2>
          <p className="text-muted-foreground">
            您的专属买家秀已经生成完成，快来看看效果吧
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
          <button
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
              showComparison 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            )}
            onClick={() => setShowComparison(true)}
          >
            <Eye className="w-4 h-4" />
            对比展示
          </button>
          <button
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
              !showComparison 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            )}
            onClick={() => setShowComparison(false)}
          >
            <EyeOff className="w-4 h-4" />
            仅看结果
          </button>
        </div>
      </div>

      {/* Image Display */}
      {showComparison ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">原始场景</CardTitle>
              <Badge variant="secondary">原图</Badge>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                {sceneImage ? (
                  <Image
                    src={sceneImage.url}
                    alt="原始场景"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generated Image */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">生成结果</CardTitle>
              <Badge className="gap-1">
                <Zap className="w-3 h-3" />
                AI生成
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <Image
                  src={generationResult.generatedImageUrl}
                  alt="生成的买家秀"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Single Generated Image */
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">您的专属买家秀</CardTitle>
            <Badge className="gap-1">
              <Zap className="w-3 h-3" />
              AI生成
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <Image
                src={generationResult.generatedImageUrl}
                alt="生成的买家秀"
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Details */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-base">生成详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedProduct && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">商品：</span>
              <span className="font-medium">{selectedProduct.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">生成时间：</span>
            <span className="font-medium">
              {generationResult.createdAt ? new Date(generationResult.createdAt).toLocaleString('zh-CN') : '刚刚'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">处理时长：</span>
            <span className="font-medium">{generationResult.processingTime || '15'}秒</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          onClick={() => handleDownload(generationResult.generatedImageUrl, '买家秀-生成结果.jpg')}
          disabled={isDownloading}
          className="gap-2 min-w-32"
        >
          <Download className="w-4 h-4" />
          {isDownloading ? '下载中...' : '下载图片'}
        </Button>

        <Button
          variant="outline"
          onClick={handleRegenerate}
          className="gap-2 min-w-32"
        >
          <RefreshCw className="w-4 h-4" />
          重新生成
        </Button>

        <Button
          variant="outline"
          onClick={handleShare}
          className="gap-2 min-w-32"
        >
          <Share2 className="w-4 h-4" />
          分享结果
        </Button>
      </div>

      {/* User Feedback */}
      <FeedbackForm
        generationId={generationResult.id}
        onSubmit={(feedback) => {
          console.log('Feedback received:', feedback);
          // Handle feedback submission
        }}
        className="mt-8"
      />
    </div>
  );
}