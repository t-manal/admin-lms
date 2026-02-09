/** @type {import('next').NextConfig} */

/**
 * ENVIRONMENT-AWARE CONFIGURATION
 * 
 * In development: Proxies API requests to localhost:4000
 * In production: Uses BACKEND_URL or NEXT_PUBLIC_API_BASE_URL environment variable
 * 
 * SECURITY: Never hardcode production URLs in the codebase
 */

const isProduction = process.env.NODE_ENV === 'production';

// Production backend URL from environment variable
// Railway sets this automatically, or it can be manually configured
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

// Development fallback
// Development fallback
// const DEV_BACKEND_URL = 'http://localhost:4000'; // REMOVED FOR PRODUCTION MIGRATION

const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.b-cdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'manalbackend-production.up.railway.app',
      }
    ],
    domains: ['lms-image.b-cdn.net'],
  },
  
  // Security headers for production
  async headers() {
    if (!isProduction) {
      return [];
    }

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },


};

const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

module.exports = withNextIntl(nextConfig);
