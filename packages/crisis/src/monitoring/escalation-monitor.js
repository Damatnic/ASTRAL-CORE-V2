/**
 * ASTRAL_CORE 2.0 Emergency Escalation Monitoring System
 *
 * CRITICAL SYSTEM MONITORING
 *
 * Real-time monitoring and alerting for the emergency escalation system.
 * Tracks performance, availability, and response metrics for all escalation levels.
 *
 * Features:
 * - Real-time performance monitoring
 * - Escalation audit trail
 * - Alert system for system failures
 * - Response time analysis
 * - Geographic distribution tracking
 * - 24/7 system health monitoring
 */
import { randomUUID } from 'crypto';
export class EscalationMonitor {
    static instance;
    auditTrail = [];
    activeAlerts = [];
    metrics;
    thresholds;
    constructor() {
        this.thresholds = {
            level1ResponseTime: 300000, // 5 minutes
            level2ResponseTime: 180000, // 3 minutes
            level3ResponseTime: 120000, // 2 minutes
            level4ResponseTime: 60000, // 1 minute
            level5ResponseTime: 30000, // 30 seconds
            successRateThreshold: 95,
            volunteerAssignmentThreshold: 90,
            hotlineContactThreshold: 98,
            emergencyServicesThreshold: 99
        };
        this.metrics = this.initializeMetrics();
        this.startMonitoring();
    }
    static getInstance() {
        if (!EscalationMonitor.instance) {
            EscalationMonitor.instance = new EscalationMonitor();
        }
        return EscalationMonitor.instance;
    }
    /**
     * Log escalation event to audit trail
     */
    async logEscalation(sessionId, escalationResult, trigger, geolocation) {
        const auditEntry = {
            id: randomUUID(),
            timestamp: new Date(),
            action: 'ESCALATION_EXECUTED',
            sessionId,
            escalationId: escalationResult.escalationId,
            level: escalationResult.level,
            trigger,
            responseTime: escalationResult.responseTimeMs,
            targetMet: escalationResult.targetMet,
            actionsExecuted: escalationResult.nextActions,
            volunteerAssigned: escalationResult.volunteerAssigned,
            hotlineContacted: escalationResult.hotlineContacted,
            emergencyServicesContacted: escalationResult.emergencyServicesContacted,
            geolocation: geolocation ? {
                country: geolocation.country,
                state: geolocation.state,
                region: escalationResult.geographicRouting.region
            } : undefined,
            outcome: this.determineOutcome(escalationResult),
            metadata: {
                nextSteps: escalationResult.nextSteps,
                geographicRouting: escalationResult.geographicRouting
            }
        };
        this.auditTrail.push(auditEntry);
        await this.updateMetrics(auditEntry);
        await this.checkThresholds(auditEntry);
        console.log(`📋 Escalation logged: Level ${escalationResult.level} - ${auditEntry.outcome}`);
    }
    /**
     * Create system alert
     */
    async createAlert(type, severity, message, metadata) {
        const alert = {
            id: randomUUID(),
            type,
            severity,
            message,
            timestamp: new Date(),
            resolved: false,
            metadata
        };
        this.activeAlerts.push(alert);
        // Log critical alerts immediately
        if (severity === 'CRITICAL' || severity === 'HIGH') {
            console.error(`🚨 ${severity} ALERT: ${message}`);
            // In production, this would:
            // 1. Send notifications to emergency response team
            // 2. Trigger escalation to backup systems
            // 3. Log to external monitoring systems
            // 4. Send SMS/email alerts to on-call staff
        }
        return alert.id;
    }
    /**
     * Resolve system alert
     */
    async resolveAlert(alertId, resolution) {
        const alert = this.activeAlerts.find(a => a.id === alertId);
        if (!alert)
            return false;
        alert.resolved = true;
        alert.resolvedAt = new Date();
        if (resolution) {
            alert.metadata = { ...alert.metadata, resolution };
        }
        console.log(`✅ Alert resolved: ${alert.message}`);
        return true;
    }
    /**
     * Get current system metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return this.activeAlerts.filter(alert => !alert.resolved);
    }
    /**
     * Get audit trail
     */
    getAuditTrail(sessionId, level, since, limit) {
        let filtered = [...this.auditTrail];
        if (sessionId) {
            filtered = filtered.filter(entry => entry.sessionId === sessionId);
        }
        if (level) {
            filtered = filtered.filter(entry => entry.level === level);
        }
        if (since) {
            filtered = filtered.filter(entry => entry.timestamp >= since);
        }
        // Sort by timestamp, most recent first
        filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        if (limit) {
            filtered = filtered.slice(0, limit);
        }
        return filtered;
    }
    /**
     * Get performance report
     */
    async getPerformanceReport(timeframe = '24h') {
        const since = this.getTimeframeCutoff(timeframe);
        const recentEntries = this.getAuditTrail(undefined, undefined, since);
        const recentAlerts = this.activeAlerts.filter(alert => alert.timestamp >= since);
        const metrics = this.calculateMetrics(recentEntries);
        const recommendations = this.generateRecommendations(metrics, recentAlerts);
        const systemHealth = this.calculateSystemHealth(metrics, recentAlerts);
        return {
            timeframe,
            metrics,
            alerts: recentAlerts,
            recommendations,
            systemHealth
        };
    }
    /**
     * Check for threshold violations and create alerts
     */
    async checkThresholds(auditEntry) {
        const levelKey = `level${auditEntry.level}ResponseTime`;
        const threshold = this.thresholds[levelKey];
        // Check response time threshold
        if (auditEntry.responseTime > threshold) {
            await this.createAlert('PERFORMANCE', auditEntry.level >= 4 ? 'CRITICAL' : 'HIGH', `Level ${auditEntry.level} escalation exceeded response time target: ${auditEntry.responseTime}ms > ${threshold}ms`, {
                sessionId: auditEntry.sessionId,
                escalationLevel: auditEntry.level,
                responseTime: auditEntry.responseTime,
                targetTime: threshold
            });
        }
        // Check for failed actions
        if (auditEntry.outcome === 'FAILURE') {
            await this.createAlert('ERROR', auditEntry.level >= 4 ? 'CRITICAL' : 'HIGH', `Level ${auditEntry.level} escalation failed for session ${auditEntry.sessionId}`, {
                sessionId: auditEntry.sessionId,
                errorMessage: auditEntry.errorMessage,
                actionsExecuted: auditEntry.actionsExecuted
            });
        }
        // Check critical service failures
        if (auditEntry.level >= 4 && !auditEntry.hotlineContacted) {
            await this.createAlert('AVAILABILITY', 'CRITICAL', '988 Lifeline contact failed for critical escalation', {
                sessionId: auditEntry.sessionId,
                escalationLevel: auditEntry.level
            });
        }
        if (auditEntry.level === 5 && !auditEntry.emergencyServicesContacted) {
            await this.createAlert('AVAILABILITY', 'CRITICAL', 'Emergency services contact failed for Level 5 escalation', {
                sessionId: auditEntry.sessionId
            });
        }
    }
    /**
     * Update system metrics
     */
    async updateMetrics(auditEntry) {
        this.metrics.totalEscalations++;
        this.metrics.escalationsByLevel[auditEntry.level]++;
        // Update response time metrics
        const currentAvg = this.metrics.averageResponseTime;
        const total = this.metrics.totalEscalations;
        this.metrics.averageResponseTime =
            ((currentAvg * (total - 1)) + auditEntry.responseTime) / total;
        // Update level-specific response time
        const levelCount = this.metrics.escalationsByLevel[auditEntry.level];
        const currentLevelAvg = this.metrics.responseTimeByLevel[auditEntry.level];
        this.metrics.responseTimeByLevel[auditEntry.level] =
            ((currentLevelAvg * (levelCount - 1)) + auditEntry.responseTime) / levelCount;
        // Update success metrics
        if (auditEntry.targetMet) {
            this.metrics.targetsMet++;
        }
        else {
            this.metrics.targetsMissed++;
        }
        this.metrics.successRate =
            (this.metrics.targetsMet / this.metrics.totalEscalations) * 100;
        // Update service contact rates
        if (auditEntry.volunteerAssigned) {
            this.metrics.volunteerAssignmentRate =
                this.calculateServiceRate('volunteerAssigned');
        }
        if (auditEntry.hotlineContacted) {
            this.metrics.hotlineContactRate =
                this.calculateServiceRate('hotlineContacted');
        }
        if (auditEntry.emergencyServicesContacted) {
            this.metrics.emergencyServicesContactRate =
                this.calculateServiceRate('emergencyServicesContacted');
        }
        // Update geographic distribution
        if (auditEntry.geolocation?.country) {
            const country = auditEntry.geolocation.country;
            this.metrics.geographicDistribution[country] =
                (this.metrics.geographicDistribution[country] || 0) + 1;
        }
        // Update hourly distribution
        const hour = auditEntry.timestamp.getHours().toString();
        this.metrics.hourlyDistribution[hour] =
            (this.metrics.hourlyDistribution[hour] || 0) + 1;
    }
    /**
     * Calculate service contact rate
     */
    calculateServiceRate(serviceField) {
        const totalWithService = this.auditTrail.filter(entry => entry[serviceField]).length;
        const applicableTotal = serviceField === 'emergencyServicesContacted'
            ? this.auditTrail.filter(entry => entry.level === 5).length
            : serviceField === 'hotlineContacted'
                ? this.auditTrail.filter(entry => entry.level >= 4).length
                : this.auditTrail.length;
        return applicableTotal > 0 ? (totalWithService / applicableTotal) * 100 : 0;
    }
    /**
     * Determine escalation outcome
     */
    determineOutcome(result) {
        if (!result.targetMet)
            return 'FAILURE';
        if (result.level >= 4 && !result.hotlineContacted)
            return 'PARTIAL_SUCCESS';
        if (result.level === 5 && !result.emergencyServicesContacted)
            return 'PARTIAL_SUCCESS';
        if (!result.volunteerAssigned)
            return 'PARTIAL_SUCCESS';
        return 'SUCCESS';
    }
    /**
     * Initialize metrics structure
     */
    initializeMetrics() {
        return {
            totalEscalations: 0,
            escalationsByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            averageResponseTime: 0,
            responseTimeByLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            targetsMet: 0,
            targetsMissed: 0,
            successRate: 100,
            volunteerAssignmentRate: 100,
            hotlineContactRate: 100,
            emergencyServicesContactRate: 100,
            geographicDistribution: {},
            hourlyDistribution: {}
        };
    }
    /**
     * Calculate metrics for specific time period
     */
    calculateMetrics(entries) {
        if (entries.length === 0)
            return this.initializeMetrics();
        const metrics = this.initializeMetrics();
        entries.forEach(entry => {
            metrics.totalEscalations++;
            metrics.escalationsByLevel[entry.level]++;
            if (entry.targetMet) {
                metrics.targetsMet++;
            }
            else {
                metrics.targetsMissed++;
            }
        });
        metrics.successRate =
            metrics.totalEscalations > 0
                ? (metrics.targetsMet / metrics.totalEscalations) * 100
                : 100;
        return metrics;
    }
    /**
     * Generate system recommendations
     */
    generateRecommendations(metrics, alerts) {
        const recommendations = [];
        if (metrics.successRate < this.thresholds.successRateThreshold) {
            recommendations.push('Response time performance is below threshold - consider scaling volunteer capacity');
        }
        if (metrics.volunteerAssignmentRate < this.thresholds.volunteerAssignmentThreshold) {
            recommendations.push('Volunteer assignment rate is low - review volunteer availability and capacity');
        }
        const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved);
        if (criticalAlerts.length > 0) {
            recommendations.push(`${criticalAlerts.length} critical alerts require immediate attention`);
        }
        if (metrics.escalationsByLevel[5] > metrics.escalationsByLevel[4]) {
            recommendations.push('High number of Level 5 escalations - review AI assessment accuracy');
        }
        return recommendations;
    }
    /**
     * Calculate overall system health
     */
    calculateSystemHealth(metrics, alerts) {
        const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved);
        const highAlerts = alerts.filter(a => a.severity === 'HIGH' && !a.resolved);
        if (criticalAlerts.length > 0)
            return 'CRITICAL';
        if (metrics.successRate < 90 || highAlerts.length > 3)
            return 'WARNING';
        if (metrics.successRate < 95 || highAlerts.length > 1)
            return 'GOOD';
        return 'EXCELLENT';
    }
    /**
     * Get cutoff date for timeframe
     */
    getTimeframeCutoff(timeframe) {
        const now = new Date();
        switch (timeframe) {
            case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
            case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
    }
    /**
     * Start background monitoring
     */
    startMonitoring() {
        console.log('🔍 Emergency escalation monitoring system started');
        // In production, this would start:
        // 1. Real-time metric collection
        // 2. Alert generation and notification
        // 3. Performance trend analysis
        // 4. Automated system health checks
        // 5. Integration with external monitoring systems
    }
    /**
     * Export audit trail for compliance
     */
    async exportAuditTrail(format = 'JSON', timeframe) {
        const entries = timeframe
            ? this.getAuditTrail(undefined, undefined, this.getTimeframeCutoff(timeframe))
            : this.auditTrail;
        if (format === 'JSON') {
            return JSON.stringify(entries, null, 2);
        }
        // CSV and PDF export would be implemented here
        return JSON.stringify(entries, null, 2);
    }
}
export default EscalationMonitor;
//# sourceMappingURL=escalation-monitor.js.map