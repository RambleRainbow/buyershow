import { useStore } from '@/store/useStore';
import { trpc } from '@/utils/trpc';
import { useCallback } from 'react';

export function useGenerationFlow() {
  const {
    generationFlow,
    setCurrentStep,
    setSceneImage,
    setSelectedProduct,
    setGenerationRequest,
    setGenerationResult,
    setIsGenerating,
    setError,
    resetGenerationFlow,
  } = useStore();

  // tRPC hooks
  const uploadSceneMutation = trpc.upload.uploadScene.useMutation();
  const generateImageMutation = trpc.generation.generateImage.useMutation();
  const getGenerationStatusQuery = trpc.generation.getGenerationStatus.useQuery(
    { generationId: generationFlow.generationResult?.id || '' },
    {
      enabled: !!generationFlow.generationResult?.id && generationFlow.isGenerating,
      refetchInterval: (data) => {
        // Stop polling when generation is complete or failed
        return data?.status === 'IN_PROGRESS' || data?.status === 'PENDING' ? 2000 : false;
      },
    }
  );

  // Step navigation
  const nextStep = useCallback(() => {
    if (generationFlow.currentStep < generationFlow.totalSteps) {
      setCurrentStep(generationFlow.currentStep + 1);
    }
  }, [generationFlow.currentStep, generationFlow.totalSteps, setCurrentStep]);

  const previousStep = useCallback(() => {
    if (generationFlow.currentStep > 1) {
      setCurrentStep(generationFlow.currentStep - 1);
    }
  }, [generationFlow.currentStep, setCurrentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= generationFlow.totalSteps) {
      setCurrentStep(step);
    }
  }, [generationFlow.totalSteps, setCurrentStep]);

  // File upload
  const uploadSceneImage = useCallback(async (file: File) => {
    try {
      setError(undefined);
      
      // Convert file to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadSceneMutation.mutateAsync({
        fileData,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      setSceneImage({
        id: Math.random().toString(), // This would come from the API response
        filename: result.filename,
        originalName: result.originalName,
        url: result.url,
        size: result.size,
        mimeType: result.mimeType,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      throw error;
    }
  }, [uploadSceneMutation, setSceneImage, setError]);

  // Image generation
  const generateImage = useCallback(async (request: {
    userDescription: string;
    productDescription?: string;
    placementDescription?: string;
    styleDescription?: string;
    temperature?: number;
  }) => {
    try {
      setError(undefined);
      setIsGenerating(true);

      const generationRequest = {
        ...request,
        sceneImageId: generationFlow.sceneImage?.id,
        productId: generationFlow.selectedProduct?.id,
        temperature: request.temperature || 0.7,
      };

      setGenerationRequest(generationRequest);

      const result = await generateImageMutation.mutateAsync(generationRequest);

      setGenerationResult({
        id: result.id,
        status: result.status,
        enhancedPrompt: result.enhancedPrompt,
        createdAt: new Date(result.createdAt),
        generatedImage: result.generatedImage ? {
          id: result.generatedImage.id,
          filename: result.generatedImage.filename,
          imageData: result.generatedImage.imageData,
          mimeType: result.generatedImage.mimeType,
          width: result.generatedImage.width || undefined,
          height: result.generatedImage.height || undefined,
          generatedAt: new Date(result.generatedImage.generatedAt),
        } : undefined,
      });

      // If generation completed immediately, go to results step
      if (result.status === 'COMPLETED') {
        goToStep(4);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      setError(errorMessage);
      setIsGenerating(false);
      throw error;
    }
  }, [
    generationFlow.sceneImage?.id,
    generationFlow.selectedProduct?.id,
    generateImageMutation,
    setGenerationRequest,
    setGenerationResult,
    setIsGenerating,
    setError,
    goToStep,
  ]);

  // Step validation
  const canProceedToStep = useCallback((step: number) => {
    switch (step) {
      case 1:
        return true; // Always can access step 1
      case 2:
        return !!generationFlow.sceneImage; // Need scene image for step 2
      case 3:
        return !!generationFlow.sceneImage; // Need scene image for step 3
      case 4:
        return !!generationFlow.generationResult; // Need generation result for step 4
      default:
        return false;
    }
  }, [generationFlow.sceneImage, generationFlow.generationResult]);

  return {
    // State
    generationFlow,
    
    // Navigation
    nextStep,
    previousStep,
    goToStep,
    canProceedToStep,
    
    // Actions
    uploadSceneImage,
    generateImage,
    setSelectedProduct,
    resetGenerationFlow,
    
    // Loading states
    isUploading: uploadSceneMutation.isLoading,
    isGenerating: generateImageMutation.isLoading || generationFlow.isGenerating,
    
    // Errors
    uploadError: uploadSceneMutation.error?.message,
    generationError: generateImageMutation.error?.message || generationFlow.error,
  };
}