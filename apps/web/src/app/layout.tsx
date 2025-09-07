import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Buyer Show - AI 买家秀生成器',
  description: 'AI-powered image generation service for creating buyer show photos',
  keywords: ['AI', '买家秀', 'image generation', 'buyer show', 'social media'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <div className="min-h-screen bg-background font-sans antialiased">
              <main className="flex-1">
                {children}
              </main>
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}