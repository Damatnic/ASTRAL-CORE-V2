/**
 * Debug Endpoint for Platform Authentication Issues
 * This endpoint has ZERO authentication dependencies to test platform-level issues
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const debugInfo = {
    status: 'debug-endpoint-accessible',
    timestamp: new Date().toISOString(),
    message: 'If you can see this, the platform authentication issue is resolved',
    deployment: {
      environment: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL,
      nextauthUrl: process.env.NEXTAUTH_URL
    },
    platform: {
      runtime: 'edge',
      region: process.env.VERCEL_REGION,
      deployment: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8)
    }
  };

  return NextResponse.json(debugInfo, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function POST() {
  return NextResponse.json({
    message: 'POST method working',
    timestamp: new Date().toISOString()
  });
}