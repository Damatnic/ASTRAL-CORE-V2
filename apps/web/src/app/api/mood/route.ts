/**
 * Mood API Routes - Database-backed mood tracking
 * Replaces localStorage with secure database persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@astralcore/database';
import { MoodService, UserService } from '@astralcore/database';
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/audit-logger';

const moodService = new MoodService(prisma as any);
const userService = new UserService(prisma as any);

// Rate limiting for mood entries (max 10 per hour per user)
const moodRateLimit = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

/**
 * GET /api/mood - Retrieve mood entries
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get or create user
    let user = await userService.findByAnonymousId(session.user.id);
    if (!user) {
      user = await userService.createUser({
        anonymousId: session.user.id,
        isAnonymous: session.user.isAnonymous ?? true,
      });
    }

    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: Math.min(limit, 100), // Cap at 100 entries
      offset,
    };

    const entries = await moodService.getMoodEntries(user.id, options);

    await auditLog({
      userId: user.id,
      action: 'MOOD_ENTRIES_RETRIEVED',
      resource: 'mood_entry',
      details: { count: entries.length, ...options },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: entries,
      count: entries.length,
    });

  } catch (error) {
    console.error('Mood retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve mood entries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mood - Create new mood entry
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    try {
      await moodRateLimit.check(10, session.user.id);
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before creating another mood entry.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.mood || body.mood < 1 || body.mood > 10) {
      return NextResponse.json(
        { error: 'Invalid mood value. Must be between 1 and 10.' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await userService.findByAnonymousId(session.user.id);
    if (!user) {
      user = await userService.createUser({
        anonymousId: session.user.id,
        isAnonymous: session.user.isAnonymous ?? true,
      });
    }

    // Create mood entry
    const moodEntry = await moodService.createMoodEntry(user.id, {
      mood: body.mood,
      emotions: body.emotions || {},
      triggers: body.triggers || [],
      activities: body.activities || [],
      sleepHours: body.sleepHours,
      notes: body.notes,
      weather: body.weather,
      medication: body.medication,
      socialInteraction: body.socialInteraction,
      timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
    });

    await auditLog({
      userId: user.id,
      action: 'MOOD_ENTRY_CREATED',
      resource: 'mood_entry',
      resourceId: moodEntry.id,
      details: { mood: body.mood },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: moodEntry,
      message: 'Mood entry created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Mood creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create mood entry' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/mood - Update mood entry
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryId, ...updateData } = body;

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await userService.findByAnonymousId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update mood entry
    const updatedEntry = await moodService.updateMoodEntry(entryId, user.id, updateData);

    await auditLog({
      userId: user.id,
      action: 'MOOD_ENTRY_UPDATED',
      resource: 'mood_entry',
      resourceId: entryId,
      details: updateData,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: updatedEntry,
      message: 'Mood entry updated successfully',
    });

  } catch (error) {
    console.error('Mood update error:', error);
    return NextResponse.json(
      { error: 'Failed to update mood entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mood - Delete mood entry
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await userService.findByAnonymousId(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete mood entry
    await moodService.deleteMoodEntry(entryId, user.id);

    await auditLog({
      userId: user.id,
      action: 'MOOD_ENTRY_DELETED',
      resource: 'mood_entry',
      resourceId: entryId,
      details: {},
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Mood entry deleted successfully',
    });

  } catch (error) {
    console.error('Mood deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete mood entry' },
      { status: 500 }
    );
  }
}