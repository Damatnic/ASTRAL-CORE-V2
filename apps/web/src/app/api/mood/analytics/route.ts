/**
 * Mood Analytics API Routes - Advanced mood insights and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { MoodService, UserService } from '@/lib/db';
import { auditLog } from '@/lib/audit-logger';

const moodService = new MoodService(prisma as any);
const userService = new UserService(prisma as any);

/**
 * GET /api/mood/analytics - Get comprehensive mood analytics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const includeInsights = searchParams.get('insights') === 'true';
    const includeChartData = searchParams.get('chartData') === 'true';

    // Get user
    const user = await userService.findByAnonymousId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get analytics
    const analytics = await moodService.getMoodAnalytics(user.id, days);

    // Get insights if requested
    let insights = null;
    if (includeInsights) {
      insights = await moodService.getMoodInsights(user.id);
    }

    // Get chart data if requested
    let chartData = null;
    if (includeChartData) {
      chartData = await moodService.getMoodChartData(user.id, days);
    }

    await auditLog({
      userId: user.id,
      action: 'MOOD_ANALYTICS_ACCESSED',
      resource: 'mood_analytics',
      details: { days, includeInsights, includeChartData },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        insights,
        chartData,
        generatedAt: new Date(),
      },
    });

  } catch (error) {
    console.error('Mood analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve mood analytics' },
      { status: 500 }
    );
  }
}