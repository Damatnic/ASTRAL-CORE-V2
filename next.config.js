/** @type {import('next').NextConfig} */

// Determine which app to build based on environment variable
const APP_TO_BUILD = process.env.VERCEL_BUILD_APP || 'web';

// Load the appropriate Next.js config
const nextConfig = APP_TO_BUILD === 'admin' 
  ? require('./apps/admin/next.config.js')
  : require('./apps/web/next.config.js');

module.exports = nextConfig;