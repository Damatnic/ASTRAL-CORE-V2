/**
 * ASTRAL_CORE 2.0 Database Utilities - Analytics Operations
 * Utility functions for analytics and performance tracking
 */
import { prisma } from '../index';
export async function recordAnalyticsEvent(data) {
    return await prisma.analyticsEvent.create({
        data: {
            eventType: data.eventType,
            eventName: data.eventName,
            userHash: data.userHash,
            sessionId: data.sessionId,
            properties: data.properties,
            responseTime: data.responseTime,
            success: data.success ?? true,
        },
    });
}
export async function recordPerformanceMetric(data) {
    const status = data.threshold && data.value > data.threshold ? 'WARNING' : 'NORMAL';
    return await prisma.performanceMetric.create({
        data: {
            metricType: data.metricType,
            value: data.value,
            unit: data.unit,
            endpoint: data.endpoint,
            region: data.region,
            target: data.target,
            threshold: data.threshold,
            status: status,
        },
    });
}
export async function updateSystemHealth(data) {
    return await prisma.systemHealth.create({
        data: {
            component: data.component,
            status: data.status,
            responseTime: data.responseTime,
            uptime: data.uptime,
            errorRate: data.errorRate,
            errorMessage: data.errorMessage,
        },
    });
}
export async function createAuditLog(data) {
    return await prisma.auditLog.create({
        data: {
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId,
            details: data.details,
            userId: data.userId,
            success: data.success ?? true,
        },
    });
}
//# sourceMappingURL=analytics.js.map