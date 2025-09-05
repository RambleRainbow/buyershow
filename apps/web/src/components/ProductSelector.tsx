'use client';

import { useState, useMemo } from 'react';
import { Search, ShoppingBag, Filter, Check, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';
import { useGenerationFlow } from '@/hooks/useGenerationFlow';

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  price?: number;
  currency: string;
  isActive: boolean;
}

interface ProductSelectorProps {
  onProductSelect?: (product: Product) => void;
  className?: string;
}

// Mock products for MVP (will be replaced with real API data)
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: '6.1英寸超视网膜XDR显示屏，钛金属设计',
    category: '数码产品',
    imageUrl: '/placeholder-phone.jpg',
    price: 7999,
    currency: 'CNY',
    isActive: true,
  },
  {
    id: '2',
    name: 'Nike Air Max 270',
    description: '舒适透气运动鞋，适合日常穿着',
    category: '服装鞋帽',
    imageUrl: '/placeholder-shoes.jpg',
    price: 899,
    currency: 'CNY',
    isActive: true,
  },
  {
    id: '3',
    name: '星巴克保温杯',
    description: '304不锈钢材质，保温8小时',
    category: '家居用品',
    imageUrl: '/placeholder-cup.jpg',
    price: 199,
    currency: 'CNY',
    isActive: true,
  },
  {
    id: '4',
    name: 'MacBook Pro 14寸',
    description: 'M3芯片，专业级笔记本电脑',
    category: '数码产品',
    imageUrl: '/placeholder-laptop.jpg',
    price: 14999,
    currency: 'CNY',
    isActive: true,
  },
  {
    id: '5',
    name: 'Adidas运动T恤',
    description: '透气速干面料，运动休闲两相宜',
    category: '服装鞋帽',
    imageUrl: '/placeholder-tshirt.jpg',
    price: 299,
    currency: 'CNY',
    isActive: true,
  },
  {
    id: '6',
    name: '无印良品香氛蜡烛',
    description: '天然大豆蜡，温和香氛',
    category: '家居用品',
    imageUrl: '/placeholder-candle.jpg',
    price: 89,
    currency: 'CNY',
    isActive: true,
  },
];

const CATEGORIES = ['全部', '数码产品', '服装鞋帽', '家居用品', '美妆护肤', '食品饮料'];

export function ProductSelector({ onProductSelect, className }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  
  const { generationFlow, setSelectedProduct } = useGenerationFlow();
  
  // Using mock data for MVP - will be replaced with tRPC
  const productsQuery = {
    data: { products: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length, hasMore: false },
    isLoading: false,
    error: null,
  };

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    if (!productsQuery.data?.products) return [];
    
    return productsQuery.data.products.filter((product) => {
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === '全部' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory && product.isActive;
    });
  }, [productsQuery.data?.products, searchTerm, selectedCategory]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    onProductSelect?.(product);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const isSelected = generationFlow.selectedProduct?.id === product.id;
    
    return (
      <Card 
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-2 ring-primary shadow-md'
        )}
        onClick={() => handleProductSelect(product)}
      >
        <CardHeader className="p-0">
          <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent(`
                    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                      <rect width="200" height="200" fill="#f3f4f6"/>
                      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="14">
                        ${product.name}
                      </text>
                    </svg>
                  `)}`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            
            {isSelected && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            )}

            {product.category && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 left-2 text-xs"
              >
                {product.category}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}
            {product.price && (
              <p className="text-sm font-semibold text-primary">
                ¥{product.price}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProductSkeleton = () => (
    <Card>
      <CardHeader className="p-0">
        <Skeleton className="aspect-square rounded-t-lg" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Label className="text-base font-medium">选择商品</Label>
        <p className="text-sm text-muted-foreground">
          选择你想要融入场景照片中的商品
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索商品..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Product Display */}
      {generationFlow.selectedProduct && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
              {generationFlow.selectedProduct.imageUrl ? (
                <img
                  src={generationFlow.selectedProduct.imageUrl}
                  alt={generationFlow.selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">已选择商品</h4>
              <p className="text-sm text-muted-foreground">
                {generationFlow.selectedProduct.name}
              </p>
              {generationFlow.selectedProduct.price && (
                <p className="text-xs text-primary font-medium">
                  ¥{generationFlow.selectedProduct.price}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProduct(undefined)}
              className="flex-shrink-0"
            >
              更换
            </Button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {productsQuery.isLoading 
              ? '加载中...'
              : `找到 ${filteredProducts.length} 个商品`
            }
          </p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateProduct(true)}
            className="text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加商品
          </Button>
        </div>

        {productsQuery.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              {searchTerm || selectedCategory !== '全部' 
                ? '没有找到匹配的商品' 
                : '暂无商品'}
            </p>
            <p className="text-xs mt-1">
              {searchTerm || selectedCategory !== '全部'
                ? '尝试调整搜索条件或分类筛选'
                : '点击"添加商品"创建你的第一个商品'
              }
            </p>
          </div>
        )}
      </div>

      {/* Error State */}
      {productsQuery.error && (
        <div className="text-center py-8 text-red-500">
          <p className="text-sm">加载商品失败</p>
          <p className="text-xs mt-1">{productsQuery.error.message}</p>
        </div>
      )}

      {/* Create Product Modal Placeholder */}
      {showCreateProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">添加商品</h3>
            <p className="text-sm text-muted-foreground mb-4">
              商品创建功能正在开发中...
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateProduct(false)}
              >
                取消
              </Button>
              <Button onClick={() => setShowCreateProduct(false)}>
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}