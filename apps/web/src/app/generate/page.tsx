'use client';

import { PhotoUpload } from '@/components/PhotoUpload';
import { useGenerationFlow } from '@/hooks/useGenerationFlow';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function GeneratePage() {
  const { generationFlow, nextStep, previousStep, canProceedToStep } = useGenerationFlow();

  const handleUploadComplete = (file: File) => {
    console.log('Upload completed:', file.name);
    // Automatically move to next step after successful upload
    if (canProceedToStep(2)) {
      setTimeout(() => nextStep(), 1000);
    }
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">制作买家秀</h1>
            <p className="text-muted-foreground mt-1">
              步骤 {generationFlow.currentStep} / {generationFlow.totalSteps}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {Array.from({ length: generationFlow.totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = step < generationFlow.currentStep;
          const isCurrent = step === generationFlow.currentStep;
          const isAccessible = canProceedToStep(step);

          return (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isAccessible
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-muted text-muted-foreground opacity-50'
                }`}
              >
                {step}
              </div>
              {step < generationFlow.totalSteps && (
                <div
                  className={`h-0.5 w-16 ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="space-y-8">
        {generationFlow.currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">上传场景照片</h2>
              <p className="text-muted-foreground">
                首先上传你的生活场景照片，这将作为买家秀的背景
              </p>
            </div>
            
            <PhotoUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              className="max-w-2xl mx-auto"
            />
          </div>
        )}

        {generationFlow.currentStep === 2 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">选择商品</h2>
            <p className="text-muted-foreground mb-8">
              商品选择功能正在开发中...
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={previousStep}>
                上一步
              </Button>
              <Button onClick={nextStep} disabled={!canProceedToStep(3)}>
                下一步
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {generationFlow.currentStep === 3 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">描述风格</h2>
            <p className="text-muted-foreground mb-8">
              风格描述功能正在开发中...
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={previousStep}>
                上一步
              </Button>
              <Button onClick={nextStep} disabled={!canProceedToStep(4)}>
                生成买家秀
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {generationFlow.currentStep === 4 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">生成结果</h2>
            <p className="text-muted-foreground mb-8">
              结果展示功能正在开发中...
            </p>
            <Button variant="outline" onClick={previousStep}>
              上一步
            </Button>
          </div>
        )}
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-16 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">调试信息</h3>
          <pre className="text-xs text-muted-foreground">
            {JSON.stringify(
              {
                currentStep: generationFlow.currentStep,
                hasSceneImage: !!generationFlow.sceneImage,
                hasProduct: !!generationFlow.selectedProduct,
                hasResult: !!generationFlow.generationResult,
                isGenerating: generationFlow.isGenerating,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}