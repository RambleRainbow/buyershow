'use client';

import { useState, useCallback } from 'react';
import { PhotoUpload } from '@/components/PhotoUpload';
import { ProductImageUpload } from '@/components/ProductImageUpload';
import { ProductSelector } from '@/components/ProductSelector';
import { DescriptionForm } from '@/components/DescriptionForm';
import { ResultDisplay } from '@/components/ResultDisplay';
import { useGenerationFlow } from '@/hooks/useGenerationFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  ShoppingBag, 
  PenTool, 
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function GeneratePage() {
  const { 
    generationFlow, 
    generateImage, 
    uploadSceneImage,
    setSelectedProduct,
    setProductImage,
    isGenerating,
    hasUnsavedProgress
  } = useGenerationFlow();

  const [isExpanded, setIsExpanded] = useState({
    upload: true,
    product: false,
    description: false
  });

  const toggleSection = (section: keyof typeof isExpanded) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleGenerate = useCallback(async (formData?: any) => {
    try {
      await generateImage({
        userDescription: formData?.userDescription || '生成专业的买家秀图片',
        productDescription: formData?.productDescription,
        styleDescription: formData?.styleDescription,
        placementDescription: formData?.placementDescription,
        temperature: 0.7,
      });
    } catch (error) {
      console.error('Generation failed:', error);
    }
  }, [generateImage]);

  const canGenerate = generationFlow.sceneImage && generationFlow.selectedProduct;

  const getSectionStatus = (section: string) => {
    switch (section) {
      case 'upload':
        return generationFlow.sceneImage ? 'completed' : 'current';
      case 'product':
        return generationFlow.selectedProduct ? 'completed' : 
               generationFlow.sceneImage ? 'current' : 'pending';
      case 'description':
        return generationFlow.generationRequest ? 'completed' :
               (generationFlow.sceneImage && generationFlow.selectedProduct) ? 'current' : 'pending';
      default:
        return 'pending';
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'current':
        return <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-100" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">AI 买家秀生成器</h1>
                <p className="text-sm text-muted-foreground">
                  在左侧完成配置，右侧实时查看生成结果
                </p>
              </div>
            </div>

            {/* Quick Status */}
            <div className="flex items-center space-x-2">
              {generationFlow.error && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  错误
                </Badge>
              )}
              {isGenerating && (
                <Badge className="gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  生成中
                </Badge>
              )}
              {generationFlow.generationResult && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  已完成
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel - Input Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">配置面板</CardTitle>
                <p className="text-sm text-muted-foreground">
                  按顺序完成以下配置，然后生成买家秀
                </p>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Step 1: Upload Photo */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('upload')}
                  >
                    <div className="flex items-center space-x-3">
                      <StatusIcon status={getSectionStatus('upload')} />
                      <div className="flex items-center space-x-2">
                        <Upload className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">1. 上传场景照片</span>
                      </div>
                    </div>
                    <Badge variant={getSectionStatus('upload') === 'completed' ? 'default' : 'outline'}>
                      {generationFlow.sceneImage ? '已完成' : '未完成'}
                    </Badge>
                  </div>
                  
                  {isExpanded.upload && (
                    <div className="ml-7 pl-4 border-l-2 border-gray-200">
                      <PhotoUpload
                        onUploadComplete={(file) => {
                          console.log('Upload completed:', file.name);
                          // Auto expand next section
                          setIsExpanded(prev => ({ ...prev, product: true }));
                        }}
                        onUploadError={(error) => {
                          console.error('Upload error:', error);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200" />

                {/* Step 2: Select Product */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('product')}
                  >
                    <div className="flex items-center space-x-3">
                      <StatusIcon status={getSectionStatus('product')} />
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="w-5 h-5 text-green-500" />
                        <span className="font-medium">2. 上传商品图片</span>
                      </div>
                    </div>
                    <Badge variant={getSectionStatus('product') === 'completed' ? 'default' : 'outline'}>
                      {generationFlow.productImage ? '已完成' : '未完成'}
                    </Badge>
                  </div>
                  
                  {isExpanded.product && (
                    <div className="ml-7 pl-4 border-l-2 border-gray-200">
                      {generationFlow.sceneImage ? (
                        <ProductImageUpload
                          onImageSelect={(base64, file) => {
                            console.log('Product image uploaded:', file.name);
                            // Update the product image in the store
                            setProductImage({
                              id: Math.random().toString(),
                              filename: file.name,
                              originalName: file.name,
                              url: base64,
                              size: file.size,
                              mimeType: file.type,
                            });
                            
                            // Also set a selected product based on the uploaded image
                            setSelectedProduct({
                              id: Math.random().toString(),
                              name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
                              description: '用户上传的商品图片',
                              imageUrl: base64,
                              currency: 'CNY',
                            });
                            
                            // Auto expand next section
                            setIsExpanded(prev => ({ ...prev, description: true }));
                          }}
                          onUploadError={(error) => {
                            console.error('Product image upload error:', error);
                          }}
                        />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>请先上传场景照片</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200" />

                {/* Step 3: Description */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('description')}
                  >
                    <div className="flex items-center space-x-3">
                      <StatusIcon status={getSectionStatus('description')} />
                      <div className="flex items-center space-x-2">
                        <PenTool className="w-5 h-5 text-purple-500" />
                        <span className="font-medium">3. 风格描述</span>
                      </div>
                    </div>
                    <Badge variant={getSectionStatus('description') === 'completed' ? 'default' : 'outline'}>
                      {generationFlow.generationRequest ? '已配置' : '可选'}
                    </Badge>
                  </div>
                  
                  {isExpanded.description && (
                    <div className="ml-7 pl-4 border-l-2 border-gray-200">
                      {generationFlow.sceneImage && generationFlow.selectedProduct ? (
                        <DescriptionForm
                          onSubmit={handleGenerate}
                          hideSubmitButton={true}
                          className=""
                        />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <PenTool className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>请先完成前面的步骤</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200" />

                {/* Generate Button */}
                <div className="pt-4">
                  <Button 
                    onClick={() => handleGenerate()}
                    disabled={!canGenerate || isGenerating}
                    className="w-full h-12 text-lg gap-2"
                    size="lg"
                  >
                    <Zap className="w-5 h-5" />
                    {isGenerating ? '生成中...' : '生成买家秀'}
                  </Button>
                  
                  {!canGenerate && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      请先上传照片并选择商品
                    </p>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Debug Info (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">调试信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-muted-foreground">
                    {JSON.stringify({
                      hasSceneImage: !!generationFlow.sceneImage,
                      hasProductImage: !!generationFlow.productImage,
                      hasProduct: !!generationFlow.selectedProduct,
                      hasRequest: !!generationFlow.generationRequest,
                      hasResult: !!generationFlow.generationResult,
                      isGenerating: isGenerating,
                      canGenerate: canGenerate,
                    }, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  生成结果
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  配置完成后，生成结果将显示在这里
                </p>
              </CardHeader>
              <CardContent>
                <ResultDisplay 
                  onRegenerate={handleGenerate}
                  onShare={(imageUrl) => {
                    navigator.clipboard.writeText(imageUrl);
                    // You can add a toast notification here
                  }}
                />
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}