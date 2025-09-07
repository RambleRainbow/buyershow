'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Upload, Sparkles, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface LoadingStateProps {
  type: 'skeleton' | 'spinner' | 'progress' | 'dots';
  text?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ type, text, progress = 0, size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (type === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  if (type === 'progress' && progress !== undefined) {
    return (
      <div className="w-full space-y-2">
        <Progress value={progress} className="h-2" />
        {text && (
          <p className="text-sm text-center text-muted-foreground">
            {text} ({Math.round(progress)}%)
          </p>
        )}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  return null;
}

export function ImageUploadSkeleton() {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <Skeleton className="w-24 h-24 rounded-lg" />
          <div className="space-y-2 text-center">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-48 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card>
      <CardHeader className="p-4">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-3">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ResultCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="aspect-square rounded-lg" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </CardContent>
    </Card>
  );
}

interface GenerationProgressProps {
  stage: 'uploading' | 'processing' | 'generating' | 'finalizing' | 'complete';
  progress?: number;
}

export function GenerationProgress({ stage, progress = 0 }: GenerationProgressProps) {
  const stages = [
    { key: 'uploading', label: '上传图片', icon: Upload },
    { key: 'processing', label: '处理数据', icon: Loader2 },
    { key: 'generating', label: 'AI 生成中', icon: Sparkles },
    { key: 'finalizing', label: '优化结果', icon: ImageIcon },
    { key: 'complete', label: '完成', icon: CheckCircle2 },
  ];

  const currentStageIndex = stages.findIndex(s => s.key === stage);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        {stages.map((s, index) => {
          const Icon = s.icon;
          const isActive = index === currentStageIndex;
          const isCompleted = index < currentStageIndex;
          
          return (
            <div
              key={s.key}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted ? 'bg-primary text-primary-foreground' : ''}
                  ${isActive ? 'bg-primary/20 text-primary animate-pulse' : ''}
                  ${!isCompleted && !isActive ? 'bg-muted text-muted-foreground' : ''}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-spin' : ''}`} />
              </div>
              <span className={`
                text-xs text-center
                ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}
              `}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {stage !== 'complete' && (
        <Progress value={progress} className="h-2" />
      )}
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {stage === 'uploading' && '正在上传您的图片...'}
          {stage === 'processing' && '正在处理图片数据...'}
          {stage === 'generating' && 'AI 正在生成买家秀...'}
          {stage === 'finalizing' && '正在优化生成结果...'}
          {stage === 'complete' && '生成完成！'}
        </p>
      </div>
    </div>
  );
}

interface StepLoadingProps {
  step: number;
  title: string;
  description?: string;
}

export function StepLoading({ step, title, description }: StepLoadingProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">步骤 {step}</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm">{title}</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">加载中</h3>
          <p className="text-sm text-muted-foreground">请稍候...</p>
        </div>
      </div>
    </div>
  );
}