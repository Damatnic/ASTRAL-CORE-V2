/**
 * ASTRAL_CORE 2.0 - Admin Dashboard API
 *
 * ADMINISTRATIVE SYSTEM OVERVIEW
 * This endpoint provides comprehensive system metrics and insights
 * for administrative oversight of the crisis intervention platform.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger, withErrorHandling, ErrorCategory, ErrorSeverity } from '@astralcore/shared';

interface DashboardMetrics {
  overview: {
    totalCrisesHandled: number;
    activeSessions: number;
    availableVolunteers: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
    uptime: number;
  };
  performance: {
    averageResponseTime: number;
    sessionCompletionRate: number;
    volunteerSatisfactionScore: number;
    systemResponseTime: number;
  };
  trends: {
    sessionTrends: Array<{
      date: string;
      count: number;
      urgencyBreakdown: Record<string, number>;
    }>;
    volunteerUtilization: any[];
  };
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    severity: string;
    timestamp: string;
  }>;
}

/**
 * Validate admin session and permissions
 */
async function validateAdminAccess(request: NextRequest): Promise<boolean> {
  // Implementation for admin authentication
  // For now, we'll use a simple header check until full auth is implemented
  const adminToken = request.headers.get('x-admin-token');
  const userAgent = request.headers.get('user-agent');
  
  // In development, allow requests from admin dashboard
  if (process.env.NODE_ENV === 'development') {
    return userAgent?.includes('Admin') || adminToken === process.env.ADMIN_TEMP_TOKEN;
  }
  
  // In production, implement proper JWT validation
  // TODO: Replace with proper JWT token validation when auth system is complete
  return adminToken === process.env.ADMIN_API_TOKEN;
}

export async function GET(request: NextRequest): Promise<NextResponse<DashboardMetrics | { error: string }>> {
    return withErrorHandling(
      async () => {
        // Validate admin access
        const hasAccess = await validateAdminAccess(request);
        if (!hasAccess) {
          logger.warn('AdminDashboard', 'Unauthorized admin dashboard access attempt', {
            userAgent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          });
          
          return NextResponse.json(
            { error: 'Unauthorized access' }, 
            { status: 401 }
          );
        }

        logger.info('AdminDashboard', 'Admin dashboard metrics requested');
        // Get overview metrics
        const [totalCrises, activeSessions, availableVolunteers, recentPerformance] = await Promise.all([
            prisma.crisisSession.count(),
            prisma.crisisSession.count({
                where: { status: 'active' }
            }),
            prisma.volunteer.count({
                where: {
                    status: 'online',
                    isAvailable: true
                }
            }),
            prisma.crisisSession.findMany({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                },
                select: {
                    responseTimeMs: true,
                    status: true,
                    urgencyLevel: true,
                    createdAt: true
                }
            })
        ]);
        // Calculate performance metrics
        const completedSessions = recentPerformance.filter((s) => s.status === 'completed');
        const avgResponseTime = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + (s.responseTimeMs || 0), 0) / completedSessions.length
            : 0;
        const sessionCompletionRate = recentPerformance.length > 0
            ? (completedSessions.length / recentPerformance.length) * 100
            : 0;
        // Get trend data (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const trendData = await prisma.crisisSession.findMany({
            where: {
                createdAt: { gte: sevenDaysAgo }
            },
            select: {
                createdAt: true,
                urgencyLevel: true,
                status: true
            }
        });
        // Process trend data
        const sessionTrends = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
            const dayData = trendData.filter((session) => session.createdAt.toDateString() === date.toDateString());
            const urgencyBreakdown = dayData.reduce((acc, session) => {
                acc[session.urgencyLevel] = (acc[session.urgencyLevel] || 0) + 1;
                return acc;
            }, {});
            return {
                date: date.toISOString().split('T')[0],
                count: dayData.length,
                urgencyBreakdown
            };
        });
        // Generate sample alerts (in production, these would come from monitoring systems)
        const alerts = [
            {
                id: 'alert_001',
                type: 'performance',
                message: 'Average response time increased by 15% in the last hour',
                severity: 'medium',
                timestamp: new Date().toISOString()
            }
        ];
        const metrics: DashboardMetrics = {
            overview: {
                totalCrisesHandled: totalCrises,
                activeSessions,
                availableVolunteers,
                systemHealth: avgResponseTime < 30000 ? 'healthy' : avgResponseTime < 60000 ? 'warning' : 'critical',
                uptime: 99.9 // This would come from monitoring system
            },
            performance: {
                averageResponseTime: Math.round(avgResponseTime),
                sessionCompletionRate: Math.round(sessionCompletionRate * 100) / 100,
                volunteerSatisfactionScore: 4.8, // This would come from feedback system
                systemResponseTime: 150 // This would come from health monitoring
            },
            trends: {
                sessionTrends,
                volunteerUtilization: [] // Would be populated from volunteer tracking
            },
            alerts
        };
        
        logger.info('AdminDashboard', 'Dashboard metrics generated successfully', {
          totalSessions: totalCrises,
          activeSessions,
          availableVolunteers,
          systemHealth: metrics.overview.systemHealth
        });
        
        return NextResponse.json(metrics);
      },
      {
        operationName: 'fetchAdminDashboardMetrics',
        category: ErrorCategory.DATABASE,
        context: {
          endpoint: '/api/admin/dashboard',
          userAgent: request.headers.get('user-agent')
        }
      }
    ).catch((error) => {
      logger.error('AdminDashboard', 'Failed to fetch dashboard metrics', error as Error);
      return NextResponse.json(
        { error: 'Failed to fetch dashboard metrics' }, 
        { status: 500 }
      );
    });
}
//# sourceMappingURL=route.js.map