'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Sparkles, 
  Home, 
  Camera, 
  HelpCircle,
  User
} from 'lucide-react';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/generate', label: '制作买家秀', icon: Camera, highlight: true },
    { href: '/help', label: '使用帮助', icon: HelpCircle },
    { href: '/profile', label: '个人中心', icon: User },
  ];

  return (
    <nav className={cn('bg-background/95 backdrop-blur border-b sticky top-0 z-50', className)}>
      <div className="container-mobile">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <span className="font-bold text-lg sm:text-xl">买家秀生成器</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={item.highlight ? "default" : "ghost"}
                    className={cn(
                      "gap-2",
                      item.highlight && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden touch-target"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="py-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors touch-target",
                        item.highlight
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.highlight && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          推荐
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}