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
}): Promise<{
    sessionId: string | null;
    success: boolean;
    timestamp: Date;
    id: string;
    responseTime: number | null;
    eventType: string;
    eventName: string;
    userHash: string | null;
    properties: import("packages/database/generated/client/runtime/library").JsonValue | null;
    errorCode: string | null;
} | {
    sessionId: string | null;
    success: boolean;
    timestamp: Date;
    id: string;
    responseTime: number | null;
    eventType: string;
    eventName: string;
    userHash: string | null;
    properties: import("packages/database/generated/client/runtime/library").JsonValue | null;
    errorCode: string | null;
}>;
export declare function recordPerformanceMetric(data: {
    metricType: string;
    value: number;
    unit: string;
    endpoint?: string;
    region?: string;
    target?: number;
    threshold?: number;
}): Promise<{
    timestamp: Date;
    id: string;
    status: import("packages/database/generated/client").$Enums.MetricStatus;
    metricType: string;
    value: number;
    unit: string;
    endpoint: string | null;
    region: string | null;
    target: number | null;
    threshold: number | null;
} | {
    timestamp: Date;
    id: string;
    status: import("packages/database/generated/client").$Enums.MetricStatus;
    metricType: string;
    value: number;
    unit: string;
    endpoint: string | null;
    region: string | null;
    target: number | null;
    threshold: number | null;
}>;
export declare function updateSystemHealth(data: {
    component: string;
    status: string;
    responseTime?: number;
    uptime?: number;
    errorRate?: number;
    errorMessage?: string;
}): Promise<{
    timestamp: Date;
    id: string;
    status: import("packages/database/generated/client").$Enums.HealthStatus;
    responseTime: number | null;
    component: string;
    uptime: number | null;
    errorRate: number | null;
    lastError: Date | null;
    errorMessage: string | null;
    cpuUsage: number | null;
    memoryUsage: number | null;
    diskUsage: number | null;
} | {
    timestamp: Date;
    id: string;
    status: import("packages/database/generated/client").$Enums.HealthStatus;
    responseTime: number | null;
    component: string;
    uptime: number | null;
    errorRate: number | null;
    lastError: Date | null;
    errorMessage: string | null;
    cpuUsage: number | null;
    memoryUsage: number | null;
    diskUsage: number | null;
}>;
export declare function createAuditLog(data: {
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    userId?: string;
    success?: boolean;
}): Promise<{
    sessionId: string | null;
    success: boolean;
    timestamp: Date;
    id: string;
    resourceId: string | null;
    errorMessage: string | null;
    userId: string | null;
    action: string;
    resource: string;
    details: import("packages/database/generated/client/runtime/library").JsonValue | null;
    ipAddress: string | null;
    userAgent: string | null;
} | {
    sessionId: string | null;
    success: boolean;
    timestamp: Date;
    id: string;
    resourceId: string | null;
    errorMessage: string | null;
    userId: string | null;
    action: string;
    resource: string;
    details: import("packages/database/generated/client/runtime/library").JsonValue | null;
    ipAddress: string | null;
    userAgent: string | null;
}>;
//# sourceMappingURL=analytics.d.ts.map