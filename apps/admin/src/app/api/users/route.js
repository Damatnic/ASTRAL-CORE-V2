/**
 * ASTRAL_CORE 2.0 - Admin User Management API
 *
 * ADMINISTRATIVE USER MANAGEMENT
 * This endpoint provides user account management capabilities
 * for administrators to oversee the crisis platform users.
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(request) {
    try {
        // TODO: Implement admin session validation
        console.log('📋 Admin user management data requested');
        // Get user statistics
        const [totalUsers, activeUsers, totalVolunteers, onlineVolunteers, recentUsers, volunteers] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: {
                    lastActivity: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Active in last 30 days
                    }
                }
            }),
            prisma.volunteer.count(),
            prisma.volunteer.count({
                where: { status: 'online' }
            }),
            prisma.user.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { crisisSessions: true }
                    }
                }
            }),
            prisma.volunteer.findMany({
                take: 50,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { assignedSessions: true }
                    }
                }
            })
        ]);
        const userData = {
            users: recentUsers.map((user) => ({
                id: user.id,
                email: user.email,
                status: user.status,
                createdAt: user.createdAt.toISOString(),
                lastActivity: user.lastActivity?.toISOString() || '',
                sessionsCount: user._count.crisisSessions,
                riskLevel: 'low' // This would be calculated based on session history
            })),
            volunteers: volunteers.map((volunteer) => ({
                id: volunteer.id,
                email: volunteer.email,
                status: volunteer.status,
                specializations: volunteer.specializations || [],
                sessionsHandled: volunteer._count.assignedSessions,
                averageRating: volunteer.averageRating || 0,
                certificationStatus: volunteer.certificationStatus
            })),
            statistics: {
                totalUsers,
                activeUsers,
                totalVolunteers,
                onlineVolunteers,
                pendingApplications: 0 // This would come from a pending applications table
            }
        };
        return NextResponse.json(userData);
    }
    catch (error) {
        console.error('❌ Admin user management error:', error);
        return NextResponse.json({ error: 'Failed to fetch user management data' }, { status: 500 });
    }
}
export async function PATCH(request) {
    try {
        // TODO: Implement admin session validation
        const body = await request.json();
        const { userId, action, data } = body;
        if (!userId || !action) {
            return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
        }
        console.log(`🔧 Admin action: ${action} for user: ${userId}`);
        switch (action) {
            case 'suspend':
                await prisma.user.update({
                    where: { id: userId },
                    data: { status: 'suspended' }
                });
                break;
            case 'activate':
                await prisma.user.update({
                    where: { id: userId },
                    data: { status: 'active' }
                });
                break;
            case 'update_volunteer_status':
                if (data?.volunteerId) {
                    await prisma.volunteer.update({
                        where: { id: data.volunteerId },
                        data: {
                            status: data.status,
                            certificationStatus: data.certificationStatus
                        }
                    });
                }
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('❌ Admin user management action error:', error);
        return NextResponse.json({ error: 'Failed to perform user management action' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map