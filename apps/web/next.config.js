/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip type checking during build for deployment
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
  },
  
  // Skip ESLint during build for deployment  
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_TYPE_CHECK === 'true',
  },

  // Enable external packages for server components
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  // Turbopack configuration
  turbopack: {
    root: require('path').resolve(__dirname, '../../'),
  },

  // Optimize for crisis response speed
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Security headers for HIPAA compliance
  async headers() {
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
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sentry-cdn.com",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                  "font-src 'self' https://fonts.gstatic.com",
                  "img-src 'self' data: https: blob:",
                  "connect-src 'self' ws: wss: https: http://localhost:* https://api.astralcore.org https://socket.astralcore.org https://o4505801209782272.ingest.sentry.io",
                  "media-src 'self'",
                  "frame-src 'none'",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' https://js.sentry-cdn.com",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                  "font-src 'self' https://fonts.gstatic.com",
                  "img-src 'self' data: https:",
                  "connect-src 'self' wss: https: https://api.astralcore.org https://socket.astralcore.org https://o4505801209782272.ingest.sentry.io",
                  "media-src 'self'",
                  "frame-src 'none'",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "upgrade-insecure-requests",
                ].join('; '),
          },
          // Crisis-specific security headers
          {
            key: 'X-Crisis-Ready',
            value: 'true',
          },
          {
            key: 'X-Response-Target',
            value: '<200ms',
          },
        ],
      },
      // Special headers for crisis endpoints
      {
        source: '/api/crisis/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'X-Priority',
            value: 'crisis-urgent',
          },
        ],
      },
    ];
  },

  // Redirects for crisis support
  async redirects() {
    return [
      {
        source: '/help',
        destination: '/crisis',
        permanent: false,
      },
      {
        source: '/emergency',
        destination: '/crisis',
        permanent: false,
      },
      {
        source: '/suicide-prevention',
        destination: '/crisis',
        permanent: false,
      },
    ];
  },

  // Image optimization
  images: {
    domains: ['cdn.astralcore.org'],
    formats: ['image/webp', 'image/avif'],
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('webpack-bundle-analyzer')).BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
      return config;
    },
  }),

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.NODE_ENV === 'production' ? 'production-value' : 'development-value',
  },

  // Output configuration for deployment
  output: 'standalone',
  
  
  // Remove workspace dependencies for standalone deployment
};

module.exports = nextConfig;