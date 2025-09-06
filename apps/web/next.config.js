/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001',
  },
  async rewrites() {
    return [
      {
        source: '/api/trpc/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3001'}/trpc/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;