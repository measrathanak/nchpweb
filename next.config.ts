import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable i18n routing
  reactStrictMode: true,
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '*.local',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_TYPO3_API_URL: process.env.NEXT_PUBLIC_TYPO3_API_URL,
    NEXT_PUBLIC_SOLR_URL: process.env.NEXT_PUBLIC_SOLR_URL,
  },

  // Headers for optimization
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects for language handling
  async redirects() {
    return [
      {
        source: '/articles',
        destination: '/en/articles',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
