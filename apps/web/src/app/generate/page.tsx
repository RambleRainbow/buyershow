'use client';

import { PhotoUpload } from '@/components/PhotoUpload';
import { ProductSelector } from '@/components/ProductSelector';
import { DescriptionForm } from '@/components/DescriptionForm';
import { ResultDisplay } from '@/components/ResultDisplay';
import { useGenerationFlow } from '@/hooks/useGenerationFlow';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function GeneratePage() {
  const { generationFlow, nextStep, previousStep, canProceedToStep, generateImage } = useGenerationFlow();

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

            {/* Next Step Button - Show after successful upload */}
            {generationFlow.sceneImage && (
              <div className="text-center pt-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">场景照片上传成功！</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    接下来选择你想要融入场景中的商品
                  </p>
                  <Button 
                    onClick={nextStep}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
                    disabled={!canProceedToStep(2)}
                  >
                    开始选择商品
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {generationFlow.currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">选择商品</h2>
              <p className="text-muted-foreground">
                选择你想要融入场景照片中的商品
              </p>
            </div>
            
            <ProductSelector
              onProductSelect={(product) => {
                console.log('Product selected:', product.name);
              }}
              className="max-w-4xl mx-auto"
            />

            <div className="flex justify-center space-x-4 pt-8">
              <Button variant="outline" onClick={previousStep}>
                上一步
              </Button>
              <Button 
                onClick={nextStep} 
                disabled={!generationFlow.selectedProduct}
              >
                下一步
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {generationFlow.currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">描述风格</h2>
              <p className="text-muted-foreground">
                详细描述您希望的风格和商品位置，这将帮助AI更好地生成买家秀
              </p>
            </div>
            
            <DescriptionForm
              onSubmit={async (data) => {
                console.log('Description submitted:', data);
                try {
                  // Generate image with the form data
                  await generateImage({
                    userDescription: data.userDescription || '生成专业的买家秀图片',
                    productDescription: data.productDescription,
                    styleDescription: data.styleDescription,
                    temperature: 0.7,
                  });
                  // The generateImage function will automatically move to step 4 when completed
                } catch (error) {
                  console.error('Generation failed:', error);
                }
              }}
              className="max-w-4xl mx-auto"
            />

            <div className="flex justify-center space-x-4 pt-8">
              <Button variant="outline" onClick={previousStep}>
                上一步
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    if (!generationFlow.generationRequest) {
                      // If no generation request yet, create a basic one
                      await generateImage({
                        userDescription: '生成专业的买家秀图片',
                        styleDescription: '自然融入场景',
                        temperature: 0.7,
                      });
                    } else {
                      // Move to next step if generation request exists
                      nextStep();
                    }
                  } catch (error) {
                    console.error('Generation failed:', error);
                  }
                }}
                disabled={!generationFlow.selectedProduct}
              >
                生成买家秀
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {generationFlow.currentStep === 4 && (
          <div className="space-y-6">
            <ResultDisplay
              onRegenerate={() => {
                console.log('Regenerating...');
                // Stay on current step for regeneration
              }}
              onShare={(imageUrl) => {
                console.log('Sharing:', imageUrl);
                // Handle sharing logic
              }}
              className="max-w-6xl mx-auto"
            />

            <div className="flex justify-center pt-8">
              <Button variant="outline" onClick={previousStep}>
                上一步
              </Button>
            </div>
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