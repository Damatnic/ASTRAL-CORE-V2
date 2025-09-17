/**
 * ASTRAL_CORE 2.0 Centralized Logging System
 *
 * Replaces console.log statements with structured, configurable logging
 * that includes emergency alerting for critical crisis intervention events.
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["CRITICAL"] = 4] = "CRITICAL";
})(LogLevel || (LogLevel = {}));
class Logger {
    static instance;
    config;
    logStream;
    constructor() {
        this.config = {
            level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
            enableConsole: process.env.NODE_ENV !== 'production',
            enableFileLogging: process.env.NODE_ENV === 'production',
            enableSentryLogging: process.env.NODE_ENV === 'production',
            enableCrisisAlerts: true,
            logFilePath: process.env.LOG_FILE_PATH || './logs/astral-core.log',
            sentryDsn: process.env.SENTRY_DSN
        };
        this.initializeLogStream();
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    initializeLogStream() {
        if (this.config.enableFileLogging && this.config.logFilePath) {
            try {
                const fs = require('fs');
                const path = require('path');
                // Ensure log directory exists
                const logDir = path.dirname(this.config.logFilePath);
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }
                this.logStream = fs.createWriteStream(this.config.logFilePath, { flags: 'a' });
            }
            catch (error) {
                console.error('Failed to initialize log stream:', error);
            }
        }
    }
    formatLogEntry(entry) {
        const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
        const levelName = levelNames[entry.level];
        let formatted = `[${entry.timestamp}] ${levelName} [${entry.module}] ${entry.message}`;
        if (entry.sessionId) {
            formatted += ` [Session: ${entry.sessionId}]`;
        }
        if (entry.performanceMetrics) {
            const metrics = entry.performanceMetrics;
            if (metrics.responseTimeMs) {
                formatted += ` [Response: ${metrics.responseTimeMs}ms]`;
            }
        }
        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
            formatted += ` ${JSON.stringify(entry.metadata)}`;
        }
        return formatted;
    }
    shouldLog(level) {
        return level >= this.config.level;
    }
    writeLog(entry) {
        if (!this.shouldLog(entry.level)) {
            return;
        }
        const formatted = this.formatLogEntry(entry);
        // Console output
        if (this.config.enableConsole) {
            const colorCodes = {
                [LogLevel.DEBUG]: '\x1b[36m', // Cyan
                [LogLevel.INFO]: '\x1b[32m', // Green
                [LogLevel.WARN]: '\x1b[33m', // Yellow
                [LogLevel.ERROR]: '\x1b[31m', // Red
                [LogLevel.CRITICAL]: '\x1b[41m\x1b[37m' // Red background, white text
            };
            const resetCode = '\x1b[0m';
            const colorCode = colorCodes[entry.level] || '';
            console.log(`${colorCode}${formatted}${resetCode}`);
        }
        // File output
        if (this.config.enableFileLogging && this.logStream) {
            this.logStream.write(formatted + '\n');
        }
        // Crisis alerts for critical events
        if (this.config.enableCrisisAlerts && (entry.level === LogLevel.CRITICAL || entry.level === LogLevel.ERROR)) {
            this.sendCrisisAlert(entry);
        }
        // Sentry integration for production
        if (this.config.enableSentryLogging && entry.level >= LogLevel.ERROR) {
            this.sendToSentry(entry);
        }
    }
    sendCrisisAlert(entry) {
        // In a real implementation, this would send alerts to:
        // - Slack/Discord webhooks
        // - PagerDuty
        // - SMS alerts for critical failures
        // - Emergency escalation protocols
        if (process.env.CRISIS_ALERT_WEBHOOK) {
            // Implement webhook alert in production
        }
    }
    sendToSentry(entry) {
        // Sentry integration for error tracking
        if (typeof window !== 'undefined' && window.Sentry) {
            const Sentry = window.Sentry;
            if (entry.level === LogLevel.CRITICAL) {
                Sentry.captureException(new Error(entry.message), {
                    level: 'fatal',
                    tags: {
                        module: entry.module,
                        sessionId: entry.sessionId
                    },
                    extra: entry.metadata
                });
            }
            else if (entry.level === LogLevel.ERROR) {
                Sentry.captureException(new Error(entry.message), {
                    level: 'error',
                    tags: {
                        module: entry.module,
                        sessionId: entry.sessionId
                    },
                    extra: entry.metadata
                });
            }
        }
    }
    debug(module, message, metadata, sessionId) {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.DEBUG,
            module,
            message,
            metadata,
            sessionId
        });
    }
    info(module, message, metadata, sessionId) {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            module,
            message,
            metadata,
            sessionId
        });
    }
    warn(module, message, metadata, sessionId) {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.WARN,
            module,
            message,
            metadata,
            sessionId
        });
    }
    error(module, message, error, metadata, sessionId) {
        const errorMetadata = error ? {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            ...metadata
        } : metadata;
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.ERROR,
            module,
            message,
            metadata: errorMetadata,
            sessionId
        });
    }
    critical(module, message, error, metadata, sessionId) {
        const errorMetadata = error ? {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            ...metadata
        } : metadata;
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.CRITICAL,
            module,
            message,
            metadata: errorMetadata,
            sessionId
        });
    }
    performance(module, message, performanceMetrics, sessionId, metadata) {
        this.writeLog({
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            module,
            message,
            metadata,
            sessionId,
            performanceMetrics
        });
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        if (config.enableFileLogging !== undefined || config.logFilePath !== undefined) {
            this.initializeLogStream();
        }
    }
}
// Export singleton instance
export const logger = Logger.getInstance();
// Convenience functions for common logging patterns
export const logCrisisEvent = (event, sessionId, metadata) => {
    logger.info('CrisisIntervention', event, metadata, sessionId);
};
export const logCrisisError = (error, sessionId, errorObj, metadata) => {
    logger.error('CrisisIntervention', error, errorObj, metadata, sessionId);
};
export const logCrisisCritical = (critical, sessionId, errorObj, metadata) => {
    logger.critical('CrisisIntervention', critical, errorObj, metadata, sessionId);
};
export const logPerformance = (operation, responseTimeMs, targetMs, sessionId, metadata) => {
    const level = responseTimeMs > targetMs ? 'warn' : 'info';
    const message = `${operation} completed in ${responseTimeMs}ms (target: ${targetMs}ms)`;
    if (level === 'warn') {
        logger.warn('Performance', message, metadata, sessionId);
    }
    else {
        logger.performance('Performance', message, { responseTimeMs }, sessionId, metadata);
    }
};
//# sourceMappingURL=Logger.js.map