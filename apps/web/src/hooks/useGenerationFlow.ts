import { useStore } from '@/store/useStore';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useGenerationFlow() {
  const router = useRouter();
  const {
    generationFlow,
    setCurrentStep,
    setSceneImage,
    setProductImage,
    setSelectedProduct,
    setGenerationRequest,
    setGenerationResult,
    setIsGenerating,
    setError,
    resetGenerationFlow,
  } = useStore();

  // Auto-save state to localStorage for persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        currentStep: generationFlow.currentStep,
        sceneImage: generationFlow.sceneImage,
        productImage: generationFlow.productImage,
        selectedProduct: generationFlow.selectedProduct,
        generationRequest: generationFlow.generationRequest,
        generationResult: generationFlow.generationResult,
        timestamp: Date.now(),
      };
      localStorage.setItem('buyershow_generation_state', JSON.stringify(stateToSave));
    }
  }, [generationFlow]);

  // Restore state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('buyershow_generation_state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          // Only restore if saved within last 24 hours
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            if (parsed.sceneImage) setSceneImage(parsed.sceneImage);
            if (parsed.productImage) setProductImage(parsed.productImage);
            if (parsed.selectedProduct) setSelectedProduct(parsed.selectedProduct);
            if (parsed.generationRequest) setGenerationRequest(parsed.generationRequest);
            if (parsed.generationResult) setGenerationResult(parsed.generationResult);
            if (parsed.currentStep && parsed.currentStep !== generationFlow.currentStep) {
              setCurrentStep(parsed.currentStep);
            }
          }
        } catch (error) {
          console.warn('Failed to restore generation state:', error);
        }
      }
    }
  }, []);

  // Real API call to our backend
  const uploadSceneMutation = {
    mutateAsync: async (data: any) => {
      // For now, we'll store the base64 data locally since the backend isn't fully connected
      return {
        filename: data.fileName,
        originalName: data.fileName,
        url: data.fileData, // Use the base64 data as URL for now
        size: data.fileSize,
        mimeType: data.mimeType,
      };
    },
    isLoading: false,
    error: null,
  };
  
  const generateImageMutation = {
    mutateAsync: async (data: any) => {
      try {
        setIsGenerating(true);
        
        // Call our backend API directly
        const response = await fetch('http://localhost:3001/trpc/generation.generateImage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': `web_user_${Date.now()}`, // Add authentication header
          },
          body: JSON.stringify({
            userDescription: data.userDescription || '生成专业的买家秀图片',
            styleDescription: data.styleDescription,
            placementDescription: data.placementDescription,
            sceneImageBase64: generationFlow.sceneImage?.url,
            productImageBase64: generationFlow.productImage?.url,
            temperature: data.temperature || 0.7,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error.message);
        }

        return result.result.data;
      } catch (error) {
        console.error('API call failed:', error);
        setIsGenerating(false);
        throw error;
      }
    },
    isLoading: false,
    error: null,
  };
  
  const getGenerationStatusQuery = {
    data: null,
    isLoading: false,
    error: null,
  };

  // Enhanced step validation with detailed requirements
  const canProceedToStep = useCallback((step: number) => {
    switch (step) {
      case 1:
        return true; // Always can access step 1 (upload scene)
      case 2:
        return !!generationFlow.sceneImage; // Need scene image for step 2 (select product)
      case 3:
        return !!(generationFlow.sceneImage && generationFlow.selectedProduct); // Need scene + product for step 3 (describe style)
      case 4:
        return !!(
          generationFlow.sceneImage && 
          generationFlow.selectedProduct && 
          generationFlow.generationRequest
        ); // Need complete request for step 4 (results)
      default:
        return false;
    }
  }, [
    generationFlow.sceneImage, 
    generationFlow.selectedProduct, 
    generationFlow.generationRequest
  ]);

  // Enhanced step navigation with validation  
  const nextStep = useCallback(() => {
    const next = generationFlow.currentStep + 1;
    if (next <= generationFlow.totalSteps && canProceedToStep(next)) {
      setCurrentStep(next);
      return true;
    }
    return false;
  }, [generationFlow.currentStep, generationFlow.totalSteps, setCurrentStep, canProceedToStep]);

  const previousStep = useCallback(() => {
    if (generationFlow.currentStep > 1) {
      setCurrentStep(generationFlow.currentStep - 1);
      return true;
    }
    return false;
  }, [generationFlow.currentStep, setCurrentStep]);

  const goToStep = useCallback((step: number, force = false) => {
    if (step >= 1 && step <= generationFlow.totalSteps) {
      if (force || canProceedToStep(step)) {
        setCurrentStep(step);
        return true;
      }
    }
    return false;
  }, [generationFlow.totalSteps, setCurrentStep, canProceedToStep]);

  // Navigate to generate page with specific step
  const navigateToStep = useCallback((step: number) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
      router.push('/generate');
    }
  }, [router, setCurrentStep, canProceedToStep]);

  // Start new generation flow
  const startNewGeneration = useCallback(() => {
    resetGenerationFlow();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('buyershow_generation_state');
    }
    router.push('/generate');
  }, [resetGenerationFlow, router]);

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

  // Product image upload 
  const uploadProductImage = useCallback(async (file: File) => {
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

      setProductImage({
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
  }, [uploadSceneMutation, setProductImage, setError]);

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

      const resultData = {
        id: result.id,
        status: result.status,
        enhancedPrompt: result.enhancedPrompt,
        generatedImageUrl: result.generatedImage?.imageData 
          ? `data:${result.generatedImage.mimeType || 'image/jpeg'};base64,${result.generatedImage.imageData}` 
          : '',
        createdAt: new Date(result.createdAt),
        processingTime: '15',
      };
      
      setGenerationResult(resultData);

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

  // Get step completion status
  const getStepStatus = useCallback((step: number) => {
    switch (step) {
      case 1:
        return generationFlow.sceneImage ? 'completed' : 'current';
      case 2:
        return generationFlow.selectedProduct ? 'completed' : 
               generationFlow.sceneImage ? 'current' : 'locked';
      case 3:
        return generationFlow.generationRequest ? 'completed' :
               (generationFlow.sceneImage && generationFlow.selectedProduct) ? 'current' : 'locked';
      case 4:
        return generationFlow.generationResult ? 'completed' :
               generationFlow.generationRequest ? 'current' : 'locked';
      default:
        return 'locked';
    }
  }, [
    generationFlow.sceneImage,
    generationFlow.selectedProduct, 
    generationFlow.generationRequest,
    generationFlow.generationResult
  ]);

  // Get validation messages for blocked steps
  const getStepValidationMessage = useCallback((step: number) => {
    switch (step) {
      case 2:
        return !generationFlow.sceneImage ? '请先上传场景照片' : '';
      case 3:
        return !generationFlow.sceneImage ? '请先上传场景照片' :
               !generationFlow.selectedProduct ? '请先选择商品' : '';
      case 4:
        return !generationFlow.sceneImage ? '请先上传场景照片' :
               !generationFlow.selectedProduct ? '请先选择商品' :
               !generationFlow.generationRequest ? '请先完成风格描述' : '';
      default:
        return '';
    }
  }, [
    generationFlow.sceneImage,
    generationFlow.selectedProduct,
    generationFlow.generationRequest
  ]);

  // Regenerate image with current settings
  const regenerateImage = useCallback(async () => {
    if (generationFlow.generationRequest) {
      setIsGenerating(true);
      try {
        // Clear previous result
        setGenerationResult(undefined);
        
        // Use same request parameters
        const result = await generateImageMutation.mutateAsync(generationFlow.generationRequest);
        
        setGenerationResult({
          id: result.id,
          status: result.status,
          enhancedPrompt: result.enhancedPrompt,
          generatedImageUrl: result.generatedImage?.imageData 
            ? `data:${result.generatedImage.mimeType || 'image/jpeg'};base64,${result.generatedImage.imageData}` 
            : '',
          createdAt: new Date(result.createdAt),
          processingTime: '15',
        });
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Regeneration failed';
        setError(errorMessage);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    }
  }, [generationFlow.generationRequest, generateImageMutation, setGenerationResult, setError, setIsGenerating]);

  // Clear specific step data
  const clearStepData = useCallback((step: number) => {
    switch (step) {
      case 1:
        setSceneImage(undefined);
        // Also clear dependent steps
        setSelectedProduct(undefined);
        setGenerationRequest(undefined);
        setGenerationResult(undefined);
        break;
      case 2:
        setSelectedProduct(undefined);
        // Also clear dependent steps
        setGenerationRequest(undefined);
        setGenerationResult(undefined);
        break;
      case 3:
        setGenerationRequest(undefined);
        // Also clear dependent steps
        setGenerationResult(undefined);
        break;
      case 4:
        setGenerationResult(undefined);
        break;
    }
  }, [setSceneImage, setSelectedProduct, setGenerationRequest, setGenerationResult]);

  return {
    // State
    generationFlow,
    
    // Navigation
    nextStep,
    previousStep,
    goToStep,
    navigateToStep,
    startNewGeneration,
    canProceedToStep,
    
    // Step information
    getStepStatus,
    getStepValidationMessage,
    
    // Actions
    uploadSceneImage,
    uploadProductImage,
    generateImage,
    regenerateImage,
    setSelectedProduct,
    setProductImage,
    setGenerationRequest,
    resetGenerationFlow,
    clearStepData,
    
    // Loading states
    isUploading: uploadSceneMutation.isLoading,
    isGenerating: generateImageMutation.isLoading || generationFlow.isGenerating,
    
    // Errors
    uploadError: uploadSceneMutation.error?.message,
    generationError: generateImageMutation.error?.message || generationFlow.error,
    
    // Utilities
    hasUnsavedProgress: !!(
      generationFlow.sceneImage || 
      generationFlow.selectedProduct || 
      generationFlow.generationRequest
    ),
  };
}