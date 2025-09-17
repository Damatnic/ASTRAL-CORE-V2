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
    id: string;
    sessionId: string | null;
    timestamp: Date;
    responseTime: number | null;
    eventType: string;
    eventName: string;
    userHash: string | null;
    properties: import("packages/database/generated/client/runtime/library").JsonValue | null;
    success: boolean;
    errorCode: string | null;
} | {
    id: string;
    sessionId: string | null;
    timestamp: Date;
    responseTime: number | null;
    eventType: string;
    eventName: string;
    userHash: string | null;
    properties: import("packages/database/generated/client/runtime/library").JsonValue | null;
    success: boolean;
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
    status: import("packages/database/generated/client").$Enums.MetricStatus;
    id: string;
    timestamp: Date;
    metricType: string;
    value: number;
    unit: string;
    endpoint: string | null;
    region: string | null;
    target: number | null;
    threshold: number | null;
} | {
    status: import("packages/database/generated/client").$Enums.MetricStatus;
    id: string;
    timestamp: Date;
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
    status: import("packages/database/generated/client").$Enums.HealthStatus;
    uptime: number | null;
    id: string;
    timestamp: Date;
    responseTime: number | null;
    memoryUsage: number | null;
    cpuUsage: number | null;
    component: string;
    errorRate: number | null;
    lastError: Date | null;
    errorMessage: string | null;
    diskUsage: number | null;
} | {
    status: import("packages/database/generated/client").$Enums.HealthStatus;
    uptime: number | null;
    id: string;
    timestamp: Date;
    responseTime: number | null;
    memoryUsage: number | null;
    cpuUsage: number | null;
    component: string;
    errorRate: number | null;
    lastError: Date | null;
    errorMessage: string | null;
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
    id: string;
    sessionId: string | null;
    timestamp: Date;
    resourceId: string | null;
    success: boolean;
    errorMessage: string | null;
    userId: string | null;
    action: string;
    resource: string;
    details: import("packages/database/generated/client/runtime/library").JsonValue | null;
    ipAddress: string | null;
    userAgent: string | null;
} | {
    id: string;
    sessionId: string | null;
    timestamp: Date;
    resourceId: string | null;
    success: boolean;
    errorMessage: string | null;
    userId: string | null;
    action: string;
    resource: string;
    details: import("packages/database/generated/client/runtime/library").JsonValue | null;
    ipAddress: string | null;
    userAgent: string | null;
}>;
//# sourceMappingURL=analytics.d.ts.map