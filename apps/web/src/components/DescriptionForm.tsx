'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGenerationFlow } from '@/hooks/useGenerationFlow';
import { Palette, MapPin, Lightbulb, Sparkles } from 'lucide-react';

// Form validation schema
const descriptionSchema = z.object({
  style: z.string()
    .min(5, '风格描述至少需要5个字符')
    .max(200, '风格描述不能超过200个字符'),
  position: z.string()
    .min(5, '位置描述至少需要5个字符')
    .max(200, '位置描述不能超过200个字符'),
  additional: z.string()
    .max(300, '额外要求不能超过300个字符')
    .optional(),
});

type DescriptionFormData = z.infer<typeof descriptionSchema>;

interface DescriptionFormProps {
  onSubmit?: (data: DescriptionFormData) => void;
  className?: string;
  hideSubmitButton?: boolean;
}

// Predefined style suggestions
const STYLE_SUGGESTIONS = [
  { label: '自然写实', value: '自然写实风格，真实的光照和阴影' },
  { label: '小清新', value: '小清新风格，柔和的色调，温馨的氛围' },
  { label: '复古怀旧', value: '复古怀旧风格，暖黄色调，胶片质感' },
  { label: '现代简约', value: '现代简约风格，干净的背景，简洁的构图' },
  { label: '时尚大片', value: '时尚大片风格，专业的打光，商业摄影感' },
  { label: '日系风格', value: '日系风格，柔和的光线，淡雅的色彩' },
];

// Predefined position suggestions  
const POSITION_SUGGESTIONS = [
  { label: '桌面上', value: '商品自然地放置在桌面上' },
  { label: '手中', value: '商品被自然地握在手中或托在手上' },
  { label: '前景中', value: '商品作为前景主体，背景略显虚化' },
  { label: '生活场景', value: '商品融入到日常生活场景中' },
  { label: '展示台', value: '商品放置在展示台或架子上' },
  { label: '随意摆放', value: '商品随意摆放在生活空间中' },
];

export function DescriptionForm({ onSubmit, className, hideSubmitButton = false }: DescriptionFormProps) {
  const [activeStyleTab, setActiveStyleTab] = useState<'input' | 'suggestions'>('suggestions');
  const [activePositionTab, setActivePositionTab] = useState<'input' | 'suggestions'>('suggestions');
  
  const { generationFlow, setGenerationRequest } = useGenerationFlow();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<DescriptionFormData>({
    resolver: zodResolver(descriptionSchema),
    mode: 'onChange',
    defaultValues: {
      style: '',
      position: '',
      additional: '',
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = (data: DescriptionFormData) => {
    // Save to global state
    setGenerationRequest({
      sceneImageId: generationFlow.sceneImage?.id || '',
      productId: generationFlow.selectedProduct?.id || '',
      styleDescription: data.style,
      placementDescription: data.position,
      userDescription: data.additional || '',
      temperature: 0.7,
    });
    
    onSubmit?.(data);
  };

  const handleSuggestionClick = (field: 'style' | 'position', value: string) => {
    setValue(field, value, { shouldValidate: true });
  };

  const SuggestionGrid = ({ 
    suggestions, 
    field, 
    currentValue 
  }: { 
    suggestions: typeof STYLE_SUGGESTIONS, 
    field: 'style' | 'position',
    currentValue: string 
  }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.label}
          type="button"
          variant={currentValue === suggestion.value ? "default" : "outline"}
          size="sm"
          className="h-auto p-3 text-left justify-start"
          onClick={() => handleSuggestionClick(field, suggestion.value)}
        >
          <span className="text-xs">{suggestion.label}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Label className="text-base font-medium">描述生成要求</Label>
        <p className="text-sm text-muted-foreground">
          详细描述您希望的风格和商品位置，这将帮助AI更好地生成买家秀
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Style Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              风格描述
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              描述您希望的照片风格、色调、氛围等
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tab Toggle */}
            <div className="flex space-x-1 bg-muted rounded-lg p-1">
              <button
                type="button"
                className={cn(
                  'flex-1 py-2 px-3 text-sm rounded-md transition-colors',
                  activeStyleTab === 'suggestions' 
                    ? 'bg-background shadow-sm' 
                    : 'hover:bg-background/50'
                )}
                onClick={() => setActiveStyleTab('suggestions')}
              >
                <Sparkles className="w-4 h-4 inline mr-1" />
                风格建议
              </button>
              <button
                type="button"
                className={cn(
                  'flex-1 py-2 px-3 text-sm rounded-md transition-colors',
                  activeStyleTab === 'input' 
                    ? 'bg-background shadow-sm' 
                    : 'hover:bg-background/50'
                )}
                onClick={() => setActiveStyleTab('input')}
              >
                自定义输入
              </button>
            </div>

            {activeStyleTab === 'suggestions' ? (
              <SuggestionGrid 
                suggestions={STYLE_SUGGESTIONS}
                field="style"
                currentValue={watchedValues.style}
              />
            ) : (
              <div className="space-y-2">
                <Textarea
                  {...register('style')}
                  placeholder="例如：自然写实风格，柔和的光线，温馨的色调..."
                  className="min-h-[100px]"
                />
                {errors.style && (
                  <p className="text-sm text-destructive">{errors.style.message}</p>
                )}
              </div>
            )}

            {/* Show current selection */}
            {watchedValues.style && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Label className="text-sm font-medium text-primary">当前选择：</Label>
                <p className="text-sm mt-1">{watchedValues.style}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Position Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              位置描述
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              描述商品在照片中的具体位置和摆放方式
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tab Toggle */}
            <div className="flex space-x-1 bg-muted rounded-lg p-1">
              <button
                type="button"
                className={cn(
                  'flex-1 py-2 px-3 text-sm rounded-md transition-colors',
                  activePositionTab === 'suggestions' 
                    ? 'bg-background shadow-sm' 
                    : 'hover:bg-background/50'
                )}
                onClick={() => setActivePositionTab('suggestions')}
              >
                <MapPin className="w-4 h-4 inline mr-1" />
                位置建议
              </button>
              <button
                type="button"
                className={cn(
                  'flex-1 py-2 px-3 text-sm rounded-md transition-colors',
                  activePositionTab === 'input' 
                    ? 'bg-background shadow-sm' 
                    : 'hover:bg-background/50'
                )}
                onClick={() => setActivePositionTab('input')}
              >
                自定义输入
              </button>
            </div>

            {activePositionTab === 'suggestions' ? (
              <SuggestionGrid 
                suggestions={POSITION_SUGGESTIONS}
                field="position"
                currentValue={watchedValues.position}
              />
            ) : (
              <div className="space-y-2">
                <Textarea
                  {...register('position')}
                  placeholder="例如：商品自然地放置在桌面的右前方..."
                  className="min-h-[100px]"
                />
                {errors.position && (
                  <p className="text-sm text-destructive">{errors.position.message}</p>
                )}
              </div>
            )}

            {/* Show current selection */}
            {watchedValues.position && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Label className="text-sm font-medium text-primary">当前选择：</Label>
                <p className="text-sm mt-1">{watchedValues.position}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Requirements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              额外要求 <Badge variant="secondary">可选</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              任何其他特殊要求或细节说明
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                {...register('additional')}
                placeholder="例如：希望背景虚化，商品占画面的三分之一..."
                className="min-h-[80px]"
              />
              {errors.additional && (
                <p className="text-sm text-destructive">{errors.additional.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {watchedValues.additional?.length || 0}/300 字符
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Summary */}
        {(watchedValues.style || watchedValues.position) && (
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">生成预览</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">完整描述：</Label>
                <p className="text-sm p-3 bg-background rounded-md border">
                  {[watchedValues.style, watchedValues.position, watchedValues.additional]
                    .filter(Boolean)
                    .join('，')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        {!hideSubmitButton && (
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={!isValid}
              className="min-w-32"
            >
              确认描述
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}