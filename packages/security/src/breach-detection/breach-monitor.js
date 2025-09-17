/**
 * Data Breach Detection and Response System
 * Real-time monitoring and automatic incident response for mental health platform
 */
import * as crypto from 'crypto';
import { EventEmitter } from 'events';
import { SecurityLogger } from '../logging/security-logger';
import { AuditService } from '../audit';
export class BreachDetectionService extends EventEmitter {
    logger;
    auditService;
    threatPatterns = new Map();
    userProfiles = new Map();
    activeAlerts = new Map();
    blockedIPs = new Set();
    monitoring = true;
    constructor() {
        super();
        this.logger = new SecurityLogger();
        this.auditService = new AuditService();
        this.initializeThreatPatterns();
        this.startMonitoring();
    }
    /**
     * Initialize threat detection patterns
     */
    initializeThreatPatterns() {
        const patterns = [
            {
                id: 'bulk_phi_access',
                name: 'Bulk PHI Data Access',
                description: 'Detects unusual volume of PHI data access',
                indicators: [
                    { field: 'phi_access_count', operator: 'threshold', value: 50, weight: 0.8 },
                    { field: 'access_timeframe', operator: 'threshold', value: 3600000, weight: 0.6 }, // 1 hour
                    { field: 'unique_patients', operator: 'threshold', value: 20, weight: 0.7 }
                ],
                threshold: 0.7,
                severity: 'critical',
                autoResponse: true
            },
            {
                id: 'off_hours_access',
                name: 'Off-Hours Data Access',
                description: 'Detects data access during unusual hours',
                indicators: [
                    { field: 'access_time', operator: 'anomaly', value: 'off_hours', weight: 0.5 },
                    { field: 'phi_access', operator: 'equals', value: true, weight: 0.8 },
                    { field: 'user_role', operator: 'equals', value: 'admin', weight: 0.3 }
                ],
                threshold: 0.6,
                severity: 'medium',
                autoResponse: false
            },
            {
                id: 'sql_injection_attempt',
                name: 'SQL Injection Attempt',
                description: 'Detects potential SQL injection attacks',
                indicators: [
                    { field: 'input_contains', operator: 'regex', value: /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION).*(\=|\'|\")/i, weight: 0.9 },
                    { field: 'error_response', operator: 'contains', value: 'sql', weight: 0.7 },
                    { field: 'repeated_attempts', operator: 'threshold', value: 3, weight: 0.8 }
                ],
                threshold: 0.8,
                severity: 'critical',
                autoResponse: true
            },
            {
                id: 'privilege_escalation',
                name: 'Privilege Escalation Attempt',
                description: 'Detects attempts to gain unauthorized privileges',
                indicators: [
                    { field: 'role_change_attempt', operator: 'equals', value: true, weight: 0.9 },
                    { field: 'admin_endpoint_access', operator: 'equals', value: true, weight: 0.8 },
                    { field: 'user_role', operator: 'equals', value: 'user', weight: 0.7 }
                ],
                threshold: 0.7,
                severity: 'high',
                autoResponse: true
            },
            {
                id: 'geographic_anomaly',
                name: 'Geographic Access Anomaly',
                description: 'Detects access from unusual geographic locations',
                indicators: [
                    { field: 'location_distance', operator: 'threshold', value: 500, weight: 0.6 }, // 500 miles
                    { field: 'access_timeframe', operator: 'threshold', value: 3600000, weight: 0.8 }, // 1 hour
                    { field: 'phi_access', operator: 'equals', value: true, weight: 0.7 }
                ],
                threshold: 0.7,
                severity: 'medium',
                autoResponse: false
            },
            {
                id: 'data_exfiltration',
                name: 'Data Exfiltration Attempt',
                description: 'Detects potential data theft',
                indicators: [
                    { field: 'download_volume', operator: 'threshold', value: 100, weight: 0.8 }, // 100 MB
                    { field: 'export_requests', operator: 'threshold', value: 10, weight: 0.7 },
                    { field: 'compressed_files', operator: 'equals', value: true, weight: 0.6 }
                ],
                threshold: 0.7,
                severity: 'critical',
                autoResponse: true
            }
        ];
        patterns.forEach(pattern => {
            this.threatPatterns.set(pattern.id, pattern);
        });
    }
    /**
     * Start monitoring for security threats
     */
    startMonitoring() {
        this.monitoring = true;
        // Monitor every 30 seconds
        setInterval(() => {
            if (this.monitoring) {
                this.performThreatAnalysis();
            }
        }, 30000);
        // Update user profiles every 5 minutes
        setInterval(() => {
            this.updateUserProfiles();
        }, 5 * 60 * 1000);
    }
    /**
     * Analyze recent activities for threats
     */
    async performThreatAnalysis() {
        try {
            // Get recent audit events
            const recentEvents = await this.auditService.queryEvents({
                dateFrom: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
                limit: 1000
            });
            // Check each threat pattern
            for (const [patternId, pattern] of this.threatPatterns) {
                await this.checkThreatPattern(pattern, recentEvents);
            }
            // Check for behavioral anomalies
            await this.checkBehavioralAnomalies(recentEvents);
        }
        catch (error) {
            this.logger.error('Threat analysis failed', error);
        }
    }
    /**
     * Check specific threat pattern against events
     */
    async checkThreatPattern(pattern, events) {
        const suspiciousActivities = new Map();
        // Group events by user/IP for analysis
        events.forEach(event => {
            const key = event.userId || event.ip || 'unknown';
            if (!suspiciousActivities.has(key)) {
                suspiciousActivities.set(key, []);
            }
            suspiciousActivities.get(key).push(event);
        });
        // Analyze each group
        for (const [identifier, userEvents] of suspiciousActivities) {
            const score = this.calculateThreatScore(pattern, userEvents);
            if (score >= pattern.threshold) {
                await this.createBreachAlert({
                    type: pattern.id,
                    severity: pattern.severity,
                    description: `${pattern.name}: ${pattern.description}`,
                    userId: identifier.startsWith('user:') ? identifier.substring(5) : undefined,
                    ip: identifier.startsWith('ip:') ? identifier.substring(3) : undefined,
                    indicators: pattern.indicators.map(indicator => ({
                        type: indicator.field,
                        value: indicator.value,
                        confidence: score
                    })),
                    automated: pattern.autoResponse,
                    affectedData: this.analyzeAffectedData(userEvents)
                });
            }
        }
    }
    /**
     * Calculate threat score based on pattern indicators
     */
    calculateThreatScore(pattern, events) {
        let totalScore = 0;
        let totalWeight = 0;
        pattern.indicators.forEach(indicator => {
            const score = this.evaluateIndicator(indicator, events);
            totalScore += score * indicator.weight;
            totalWeight += indicator.weight;
        });
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }
    /**
     * Evaluate individual indicator
     */
    evaluateIndicator(indicator, events) {
        switch (indicator.operator) {
            case 'threshold':
                return this.evaluateThreshold(indicator, events);
            case 'equals':
                return this.evaluateEquals(indicator, events);
            case 'contains':
                return this.evaluateContains(indicator, events);
            case 'regex':
                return this.evaluateRegex(indicator, events);
            case 'anomaly':
                return this.evaluateAnomaly(indicator, events);
            default:
                return 0;
        }
    }
    /**
     * Evaluate threshold-based indicator
     */
    evaluateThreshold(indicator, events) {
        switch (indicator.field) {
            case 'phi_access_count':
                const phiCount = events.filter(e => e.phi).length;
                return phiCount >= indicator.value ? 1 : 0;
            case 'access_timeframe':
                const timeSpan = this.getTimeSpan(events);
                return timeSpan <= indicator.value ? 1 : 0;
            case 'download_volume':
                const downloadVolume = this.calculateDownloadVolume(events);
                return downloadVolume >= indicator.value ? 1 : 0;
            default:
                return 0;
        }
    }
    /**
     * Evaluate equals-based indicator
     */
    evaluateEquals(indicator, events) {
        switch (indicator.field) {
            case 'phi_access':
                return events.some(e => e.phi === indicator.value) ? 1 : 0;
            case 'user_role':
                return events.some(e => e.details?.role === indicator.value) ? 1 : 0;
            default:
                return 0;
        }
    }
    /**
     * Evaluate contains-based indicator
     */
    evaluateContains(indicator, events) {
        return events.some(e => JSON.stringify(e).toLowerCase().includes(indicator.value.toLowerCase())) ? 1 : 0;
    }
    /**
     * Evaluate regex-based indicator
     */
    evaluateRegex(indicator, events) {
        const regex = new RegExp(indicator.value);
        return events.some(e => regex.test(JSON.stringify(e.details || {}))) ? 1 : 0;
    }
    /**
     * Evaluate anomaly-based indicator
     */
    evaluateAnomaly(indicator, events) {
        switch (indicator.value) {
            case 'off_hours':
                return this.isOffHoursActivity(events) ? 1 : 0;
            default:
                return 0;
        }
    }
    /**
     * Create breach alert
     */
    async createBreachAlert(alertData) {
        const alert = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            type: alertData.type || 'unauthorized_access',
            severity: alertData.severity || 'medium',
            description: alertData.description || 'Security alert detected',
            userId: alertData.userId,
            ip: alertData.ip,
            indicators: alertData.indicators || [],
            automated: alertData.automated || false,
            status: 'active',
            affectedData: alertData.affectedData
        };
        this.activeAlerts.set(alert.id, alert);
        // Log the alert
        await this.auditService.logSecurityViolation(`breach_alert:${alert.type}`, {
            alertId: alert.id,
            severity: alert.severity,
            automated: alert.automated,
            indicators: alert.indicators
        }, alert.ip, alert.userId);
        // Emit alert event
        this.emit('breachAlert', alert);
        // Execute automated response if configured
        if (alert.automated) {
            await this.executeAutomatedResponse(alert);
        }
        // Send notifications based on severity
        await this.sendNotifications(alert);
        return alert;
    }
    /**
     * Execute automated response to breach
     */
    async executeAutomatedResponse(alert) {
        const response = {
            id: crypto.randomUUID(),
            alertId: alert.id,
            timestamp: new Date(),
            actions: [],
            notificationsSent: [],
            complianceRequirements: {
                hipaa: alert.affectedData?.type === 'phi',
                gdpr: true,
                state: ['california'] // Add relevant state breach notification laws
            }
        };
        // Determine actions based on alert type and severity
        const actions = this.determineResponseActions(alert);
        for (const action of actions) {
            try {
                const result = await this.executeAction(action, alert);
                response.actions.push({
                    type: action,
                    executed: true,
                    timestamp: new Date(),
                    result
                });
            }
            catch (error) {
                response.actions.push({
                    type: action,
                    executed: false,
                    timestamp: new Date(),
                    result: error
                });
            }
        }
        alert.response = response;
        this.activeAlerts.set(alert.id, alert);
        await this.auditService.logEvent({
            action: 'automated_breach_response',
            resource: 'security',
            details: {
                alertId: alert.id,
                actions: response.actions,
                success: response.actions.every(a => a.executed)
            },
            risk: 'high'
        });
    }
    /**
     * Determine response actions based on alert
     */
    determineResponseActions(alert) {
        const actions = [];
        // Always alert admin for high/critical alerts
        if (alert.severity === 'high' || alert.severity === 'critical') {
            actions.push('alert_admin');
        }
        // Block IP for injection attempts or system compromise
        if (alert.type === 'injection_attempt' || alert.type === 'system_compromise') {
            if (alert.ip) {
                actions.push('block_ip');
            }
        }
        // Disable account for privilege escalation or unauthorized access
        if (alert.type === 'privilege_escalation' || alert.type === 'unauthorized_access') {
            if (alert.userId) {
                actions.push('disable_account');
                actions.push('revoke_session');
            }
        }
        // Backup data for critical breaches
        if (alert.severity === 'critical' && alert.affectedData?.type === 'phi') {
            actions.push('backup_data');
        }
        // Notify authorities for PHI breaches above threshold
        if (alert.affectedData?.type === 'phi' && alert.affectedData?.records > 500) {
            actions.push('notify_authorities');
        }
        return actions;
    }
    /**
     * Execute specific action
     */
    async executeAction(action, alert) {
        switch (action) {
            case 'block_ip':
                if (alert.ip) {
                    this.blockedIPs.add(alert.ip);
                    return { blocked: true, ip: alert.ip };
                }
                break;
            case 'disable_account':
                if (alert.userId) {
                    // This would integrate with user management system
                    return { disabled: true, userId: alert.userId };
                }
                break;
            case 'revoke_session':
                if (alert.userId) {
                    // This would integrate with session management
                    return { revoked: true, userId: alert.userId };
                }
                break;
            case 'alert_admin':
                return await this.sendAdminAlert(alert);
            case 'backup_data':
                return await this.initiateDataBackup(alert);
            case 'notify_authorities':
                return await this.notifyAuthorities(alert);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }
    /**
     * Check for behavioral anomalies
     */
    async checkBehavioralAnomalies(events) {
        const userEvents = new Map();
        events.forEach(event => {
            if (event.userId) {
                if (!userEvents.has(event.userId)) {
                    userEvents.set(event.userId, []);
                }
                userEvents.get(event.userId).push(event);
            }
        });
        for (const [userId, userEventList] of userEvents) {
            const profile = this.userProfiles.get(userId);
            if (profile) {
                const anomalyScore = this.calculateAnomalyScore(profile, userEventList);
                if (anomalyScore > 0.7) {
                    await this.createBreachAlert({
                        type: 'data_access_anomaly',
                        severity: anomalyScore > 0.9 ? 'critical' : 'high',
                        description: `Behavioral anomaly detected for user ${userId}`,
                        userId,
                        indicators: [
                            { type: 'anomaly_score', value: anomalyScore, confidence: anomalyScore }
                        ],
                        automated: false
                    });
                }
            }
        }
    }
    /**
     * Calculate anomaly score for user behavior
     */
    calculateAnomalyScore(profile, events) {
        let anomalyScore = 0;
        let factors = 0;
        // Check access volume
        const accessVolume = events.length;
        if (accessVolume > profile.baseline.dataAccessVolume * 3) {
            anomalyScore += 0.3;
            factors++;
        }
        // Check time patterns
        const offHoursAccess = events.filter(e => this.isOffHours(new Date(e.timestamp))).length;
        if (offHoursAccess / events.length > 0.5) {
            anomalyScore += 0.4;
            factors++;
        }
        // Check location patterns
        const uniqueIPs = new Set(events.map(e => e.ip).filter(Boolean)).size;
        if (uniqueIPs > 3) {
            anomalyScore += 0.3;
            factors++;
        }
        return factors > 0 ? anomalyScore / factors : 0;
    }
    /**
     * Update user behavior profiles
     */
    updateUserProfiles() {
        // This would typically pull from a database
        // For now, we'll maintain in-memory profiles
    }
    /**
     * Utility methods
     */
    getTimeSpan(events) {
        if (events.length === 0)
            return 0;
        const times = events.map(e => new Date(e.timestamp).getTime());
        return Math.max(...times) - Math.min(...times);
    }
    calculateDownloadVolume(events) {
        return events.reduce((total, event) => {
            return total + (event.details?.downloadSize || 0);
        }, 0);
    }
    isOffHoursActivity(events) {
        return events.some(e => this.isOffHours(new Date(e.timestamp)));
    }
    isOffHours(date) {
        const hour = date.getHours();
        return hour < 6 || hour > 22; // Before 6 AM or after 10 PM
    }
    analyzeAffectedData(events) {
        const phiEvents = events.filter(e => e.phi);
        if (phiEvents.length > 0) {
            return {
                type: 'phi',
                records: phiEvents.length,
                details: { events: phiEvents.length }
            };
        }
        return undefined;
    }
    async sendNotifications(alert) {
        // Implementation would send notifications via email, SMS, etc.
    }
    async sendAdminAlert(alert) {
        // Implementation would alert administrators
        return { sent: true, recipients: ['admin@astralcore.org'] };
    }
    async initiateDataBackup(alert) {
        // Implementation would backup affected data
        return { backup_id: crypto.randomUUID(), timestamp: new Date() };
    }
    async notifyAuthorities(alert) {
        // Implementation would notify relevant authorities
        return { notified: ['HHS', 'state_ag'], timestamp: new Date() };
    }
    /**
     * Public methods
     */
    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }
    async resolveAlert(alertId, resolution) {
        const alert = this.activeAlerts.get(alertId);
        if (alert) {
            alert.status = 'resolved';
            await this.auditService.logEvent({
                action: 'alert_resolved',
                resource: 'security',
                details: { alertId, resolution },
                risk: 'medium'
            });
        }
    }
    isIPBlocked(ip) {
        return this.blockedIPs.has(ip);
    }
    unblockIP(ip) {
        this.blockedIPs.delete(ip);
    }
    stopMonitoring() {
        this.monitoring = false;
    }
}
export default BreachDetectionService;
//# sourceMappingURL=breach-monitor.js.map