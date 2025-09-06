import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  CheckCircle,
  Star,
  Upload,
  Zap,
  Users,
  Heart,
  Share2,
  Award
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-3 py-1">
            <Sparkles className="w-4 h-4 mr-2" />
            AI 驱动的买家秀生成器
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            让每一张买家秀
            <br />
            都成为艺术品
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            上传场景照片，选择心仪商品，AI 智能生成专业级买家秀。
            <br />
            <strong>3 步搞定，1 分钟出图</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/generate">
              <Button size="lg" className="px-8 py-4 text-lg h-auto gap-2">
                <Camera className="w-5 h-5" />
                开始制作买家秀
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg h-auto">
              查看示例作品
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto text-center">
            <div>
              <div className="text-2xl font-bold text-primary">1M+</div>
              <div className="text-sm text-muted-foreground">张图片已生成</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">15s</div>
              <div className="text-sm text-muted-foreground">平均生成时间</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">4.9</div>
              <div className="text-sm text-muted-foreground">用户满意度</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">3 步制作专业买家秀</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              简单几步，让 AI 帮你创造完美的买家秀图片
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="outline">步骤 1</Badge>
                </div>
                <CardTitle className="text-xl">上传场景照片</CardTitle>
                <CardDescription className="text-base">
                  拖拽或点击上传你的生活场景照片
                  <br />
                  支持 JPG、PNG 等格式
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-12 h-12 text-blue-600/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="outline">步骤 2</Badge>
                </div>
                <CardTitle className="text-xl">选择商品和风格</CardTitle>
                <CardDescription className="text-base">
                  从商品库中选择要展示的产品
                  <br />
                  描述期望的风格和位置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-green-600/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="outline">步骤 3</Badge>
                </div>
                <CardTitle className="text-xl">AI 智能生成</CardTitle>
                <CardDescription className="text-base">
                  AI 分析场景，智能融合商品
                  <br />
                  生成专业级买家秀图片
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-purple-600/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">为什么选择我们？</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              专业的 AI 技术，简单的操作体验，完美的生成效果
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="font-semibold mb-2">闪电生成</h3>
              <p className="text-sm text-muted-foreground">
                平均 15 秒完成图片生成，快速高效
              </p>
            </Card>

            <Card className="text-center p-6">
              <Award className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold mb-2">专业质量</h3>
              <p className="text-sm text-muted-foreground">
                Google Gemini 2.5 技术，媲美专业摄影
              </p>
            </Card>

            <Card className="text-center p-6">
              <Users className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">简单易用</h3>
              <p className="text-sm text-muted-foreground">
                无需专业知识，3 步即可完成制作
              </p>
            </Card>

            <Card className="text-center p-6">
              <Heart className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="font-semibold mb-2">完全免费</h3>
              <p className="text-sm text-muted-foreground">
                无限制使用，无隐藏费用
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* User Reviews */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">用户好评如潮</h2>
            <p className="text-muted-foreground">
              看看其他用户怎么说
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm mb-4">
                "生成效果超出预期！比我自己拍的买家秀专业多了，朋友圈点赞率直接翻倍。"
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  👩‍💼
                </div>
                <div>
                  <div className="font-medium text-sm">小红</div>
                  <div className="text-xs text-muted-foreground">电商卖家</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm mb-4">
                "操作简单到不行，几分钟就能生成一张精美的产品图，AI 真是太神奇了！"
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  👨‍🎨
                </div>
                <div>
                  <div className="font-medium text-sm">老王</div>
                  <div className="text-xs text-muted-foreground">自媒体博主</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm mb-4">
                "完全免费还能有这么好的效果，简直不敢相信！现在我的所有产品图都用这个生成。"
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  👩‍🎓
                </div>
                <div>
                  <div className="font-medium text-sm">小美</div>
                  <div className="text-xs text-muted-foreground">个人创业者</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                准备好制作你的专属买家秀了吗？
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                无需注册，无需付费，立即开始体验 AI 的神奇魅力
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/generate">
                  <Button size="lg" className="px-8 py-4 text-lg h-auto gap-2">
                    <Sparkles className="w-5 h-5" />
                    免费开始制作
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg h-auto gap-2">
                  <Share2 className="w-5 h-5" />
                  分享给朋友
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold">AI 买家秀生成器</span>
          </div>
          <p className="text-sm text-muted-foreground">
            使用 Google Gemini 2.5 Flash Image 技术驱动 • 
            支持多种图片格式 • 
            完全免费使用 • 
            数据安全保障
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            © 2024 AI 买家秀生成器. 保留所有权利.
          </div>
        </div>
      </footer>
    </div>
  );
}