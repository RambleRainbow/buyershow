import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
          AI 买家秀生成器
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          上传你的场景照片，选择商品，AI 帮你生成完美的买家秀图片，轻松分享到社交媒体
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>📸 上传场景</CardTitle>
            <CardDescription>
              上传你的生活场景照片，可以是家里、办公室、户外等任意场景
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🛍️ 选择商品</CardTitle>
            <CardDescription>
              选择你想要展示的商品，描述希望商品出现的位置和风格
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>✨ AI 生成</CardTitle>
            <CardDescription>
              AI 智能分析场景，将商品自然融入你的照片中，生成专业买家秀
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="text-center">
        <Link href="/generate">
          <Button size="lg" className="px-8 py-3 text-lg">
            开始制作买家秀
          </Button>
        </Link>
      </div>

      <div className="mt-16 text-center text-gray-500">
        <p className="text-sm">
          使用 Google Gemini 2.5 Flash Image 技术驱动 • 
          支持多种图片格式 • 
          完全免费使用
        </p>
      </div>
    </div>
  );
}