import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SceneImage {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  price?: number;
  currency: string;
}

interface GenerationRequest {
  userDescription: string;
  productDescription?: string;
  placementDescription?: string;
  styleDescription?: string;
  sceneImageId?: string;
  productId?: string;
  temperature: number;
}

interface GenerationResult {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  enhancedPrompt: string;
  createdAt: Date;
  generatedImage?: {
    id: string;
    filename: string;
    imageData: string;
    mimeType: string;
    width?: number;
    height?: number;
    generatedAt: Date;
  };
}

interface GenerationFlow {
  currentStep: number;
  totalSteps: number;
  sceneImage?: SceneImage;
  selectedProduct?: Product;
  generationRequest?: GenerationRequest;
  generationResult?: GenerationResult;
  isGenerating: boolean;
  error?: string;
}

interface AppState {
  // Generation Flow
  generationFlow: GenerationFlow;
  
  // Actions
  setCurrentStep: (step: number) => void;
  setSceneImage: (image: SceneImage | undefined) => void;
  setSelectedProduct: (product: Product | undefined) => void;
  setGenerationRequest: (request: GenerationRequest) => void;
  setGenerationResult: (result: GenerationResult | undefined) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | undefined) => void;
  resetGenerationFlow: () => void;
  
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // User preferences
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'zh-CN' | 'en-US';
    autoSave: boolean;
  };
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'zh-CN' | 'en-US') => void;
  setAutoSave: (autoSave: boolean) => void;
}

const initialGenerationFlow: GenerationFlow = {
  currentStep: 1,
  totalSteps: 4,
  isGenerating: false,
};

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        generationFlow: initialGenerationFlow,
        sidebarOpen: false,
        preferences: {
          theme: 'system',
          language: 'zh-CN',
          autoSave: true,
        },

        // Generation Flow Actions
        setCurrentStep: (step) =>
          set(
            (state) => ({
              generationFlow: {
                ...state.generationFlow,
                currentStep: step,
              },
            }),
            false,
            'setCurrentStep'
          ),

        setSceneImage: (image) =>
          set(
            (state) => ({
              generationFlow: {
                ...state.generationFlow,
                sceneImage: image,
              },
            }),
            false,
            'setSceneImage'
          ),

        setSelectedProduct: (product) =>
          set(
            (state) => ({
              generationFlow: {
                ...state.generationFlow,
                selectedProduct: product,
              },
            }),
            false,
            'setSelectedProduct'
          ),

        setGenerationRequest: (request) =>
          set(
            (state) => ({
              generationFlow: {
                ...state.generationFlow,
                generationRequest: request,
              },
            }),
            false,
            'setGenerationRequest'
          ),

        setGenerationResult: (result) =>
          set(
            (state) => ({
              generationFlow: {
                ...state.generationFlow,
                generationResult: result,
                isGenerating: false,
                error: undefined,
              },
            }),
            false,
            'setGenerationResult'
          ),

        setIsGenerating: (isGenerating) =>
          set(
            (state) => ({
              generationFlow: {
                ...state.generationFlow,
                isGenerating,
                error: isGenerating ? undefined : state.generationFlow.error,
              },
            }),
            false,
            'setIsGenerating'
          ),

        setError: (error) =>
          set(
            (state) => ({
              generationFlow: {
                ...state.generationFlow,
                error,
                isGenerating: false,
              },
            }),
            false,
            'setError'
          ),

        resetGenerationFlow: () =>
          set(
            {
              generationFlow: initialGenerationFlow,
            },
            false,
            'resetGenerationFlow'
          ),

        // UI Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),

        // Preferences Actions
        setTheme: (theme) =>
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                theme,
              },
            }),
            false,
            'setTheme'
          ),

        setLanguage: (language) =>
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                language,
              },
            }),
            false,
            'setLanguage'
          ),

        setAutoSave: (autoSave) =>
          set(
            (state) => ({
              preferences: {
                ...state.preferences,
                autoSave,
              },
            }),
            false,
            'setAutoSave'
          ),
      }),
      {
        name: 'buyershow-storage',
        partialize: (state) => ({
          preferences: state.preferences,
          // Don't persist generation flow to avoid stale state
        }),
      }
    ),
    {
      name: 'BuyerShowStore',
    }
  )
);

// Computed selectors
export const useGenerationFlow = () => useStore((state) => state.generationFlow);
export const useCurrentStep = () => useStore((state) => state.generationFlow.currentStep);
export const useSceneImage = () => useStore((state) => state.generationFlow.sceneImage);
export const useSelectedProduct = () => useStore((state) => state.generationFlow.selectedProduct);
export const useGenerationResult = () => useStore((state) => state.generationFlow.generationResult);
export const useIsGenerating = () => useStore((state) => state.generationFlow.isGenerating);
export const useGenerationError = () => useStore((state) => state.generationFlow.error);

// UI selectors
export const useSidebarOpen = () => useStore((state) => state.sidebarOpen);
export const usePreferences = () => useStore((state) => state.preferences);