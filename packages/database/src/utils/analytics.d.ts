/**
 * ASTRAL_CORE 2.0 Database Utilities - Analytics Operations
 * Utility functions for analytics and performance tracking
 */
export declare function recordAnalyticsEvent(data: {
    eventType: string;
    eventName: string;
    userHash?: string;
    sessionId?: string;
    properties?: any;
    responseTime?: number;
    success?: boolean;
}): Promise<any>;
export declare function recordPerformanceMetric(data: {
    metricType: string;
    value: number;
    unit: string;
    endpoint?: string;
    region?: string;
    target?: number;
    threshold?: number;
}): Promise<any>;
export declare function updateSystemHealth(data: {
    component: string;
    status: string;
    responseTime?: number;
    uptime?: number;
    errorRate?: number;
    errorMessage?: string;
}): Promise<any>;
export declare function createAuditLog(data: {
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    userId?: string;
    success?: boolean;
}): Promise<any>;
//# sourceMappingURL=analytics.d.ts.map