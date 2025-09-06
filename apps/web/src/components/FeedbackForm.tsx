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
import { 
  Star, 
  MessageCircle, 
  Send, 
  CheckCircle, 
  Heart,
  ThumbsUp,
  ThumbsDown,
  Camera,
  Palette,
  Zap
} from 'lucide-react';

// Form validation schema
const feedbackSchema = z.object({
  rating: z.number()
    .min(1, '请给出评分')
    .max(5, '评分不能超过5星'),
  category: z.string()
    .min(1, '请选择反馈类型'),
  comment: z.string()
    .min(5, '评论至少需要5个字符')
    .max(500, '评论不能超过500个字符')
    .optional(),
  wouldRecommend: z.boolean().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSubmit?: (data: FeedbackFormData) => void;
  generationId?: string;
  className?: string;
}

// Feedback categories
const FEEDBACK_CATEGORIES = [
  { id: 'quality', label: '图片质量', icon: Camera, color: 'bg-blue-500' },
  { id: 'style', label: '风格效果', icon: Palette, color: 'bg-purple-500' },
  { id: 'speed', label: '生成速度', icon: Zap, color: 'bg-yellow-500' },
  { id: 'overall', label: '整体体验', icon: Heart, color: 'bg-red-500' },
];

// Quick feedback options
const QUICK_FEEDBACK = [
  { rating: 5, comment: '效果超出预期，非常满意！', category: 'overall' },
  { rating: 4, comment: '整体不错，还有提升空间', category: 'overall' },
  { rating: 3, comment: '一般般，基本达到预期', category: 'overall' },
  { rating: 2, comment: '效果不太理想，需要改进', category: 'quality' },
  { rating: 1, comment: '很不满意，希望重新优化', category: 'quality' },
];

export function FeedbackForm({ onSubmit, generationId, className }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    mode: 'onChange',
    defaultValues: {
      rating: 0,
      category: '',
      comment: '',
      wouldRecommend: undefined,
    },
  });

  const watchedValues = watch();
  const currentRating = watchedValues.rating || 0;

  const handleFormSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Feedback submitted:', {
        ...data,
        generationId,
        timestamp: new Date().toISOString(),
      });
      
      onSubmit?.(data);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFeedback = (feedback: typeof QUICK_FEEDBACK[0]) => {
    setValue('rating', feedback.rating, { shouldValidate: true });
    setValue('category', feedback.category, { shouldValidate: true });
    setValue('comment', feedback.comment, { shouldValidate: true });
    setSelectedCategory(feedback.category);
  };

  const handleStarClick = (rating: number) => {
    setValue('rating', rating, { shouldValidate: true });
  };

  const handleCategorySelect = (categoryId: string) => {
    setValue('category', categoryId, { shouldValidate: true });
    setSelectedCategory(categoryId);
  };

  // Success state
  if (isSubmitted) {
    return (
      <Card className={cn('max-w-md mx-auto text-center', className)}>
        <CardContent className="p-6 space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">反馈提交成功！</h3>
            <p className="text-sm text-muted-foreground">
              感谢您的宝贵意见，我们会持续优化产品体验
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSubmitted(false)}
          >
            重新评价
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('max-w-2xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          用户反馈
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          您的反馈对我们改进产品非常重要
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Quick Feedback Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">快速评价</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_FEEDBACK.slice(0, 4).map((feedback, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto p-3 text-left justify-start"
                  onClick={() => handleQuickFeedback(feedback)}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-3 h-3',
                            i < feedback.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs">{feedback.comment}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              整体评分 <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const rating = index + 1;
                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleStarClick(rating)}
                    className={cn(
                      'transition-colors hover:scale-110',
                      rating <= currentRating
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    )}
                  >
                    <Star
                      className={cn(
                        'w-8 h-8',
                        rating <= currentRating && 'fill-current'
                      )}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm text-muted-foreground">
                {currentRating > 0 ? `${currentRating}/5` : '请评分'}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
          </div>

          {/* Feedback Category */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              反馈类型 <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {FEEDBACK_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      'p-4 border rounded-lg transition-colors',
                      'flex flex-col items-center gap-2 text-sm',
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-muted-foreground/50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white',
                      category.color
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={cn(
                      'font-medium',
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {category.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              详细评论 <Badge variant="secondary">可选</Badge>
            </Label>
            <Textarea
              {...register('comment')}
              placeholder="请详细描述您的使用体验、建议或遇到的问题..."
              className="min-h-[100px]"
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {watchedValues.comment?.length || 0}/500 字符
            </p>
          </div>

          {/* Would Recommend */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">是否愿意推荐给朋友？</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={watchedValues.wouldRecommend === true ? "default" : "outline"}
                size="sm"
                onClick={() => setValue('wouldRecommend', true)}
                className="gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                愿意推荐
              </Button>
              <Button
                type="button"
                variant={watchedValues.wouldRecommend === false ? "destructive" : "outline"}
                size="sm"
                onClick={() => setValue('wouldRecommend', false)}
                className="gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                不会推荐
              </Button>
            </div>
          </div>

          {/* Preview Summary */}
          {(currentRating > 0 || selectedCategory || watchedValues.comment) && (
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-2">
                <Label className="text-sm font-medium">反馈预览</Label>
                <div className="space-y-1 text-sm">
                  {currentRating > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">评分：</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: currentRating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                        <span className="ml-1">{currentRating}/5</span>
                      </div>
                    </div>
                  )}
                  {selectedCategory && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">类型：</span>
                      <span>{FEEDBACK_CATEGORIES.find(c => c.id === selectedCategory)?.label}</span>
                    </div>
                  )}
                  {watchedValues.comment && (
                    <div>
                      <span className="text-muted-foreground">评论：</span>
                      <p className="mt-1 text-xs bg-background p-2 rounded border">
                        {watchedValues.comment}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting}
              className="gap-2 min-w-32"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  提交反馈
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}