/**
 * Audit Logger Service
 * Logs all security-relevant events for compliance and auditing
 */

export class AuditLogger {
  constructor() {
    this.logLevels = {
      INFO: 'INFO',
      WARN: 'WARN',
      ERROR: 'ERROR'
    };
  }

  log(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: event.level || this.logLevels.INFO,
      event: event.type,
      userId: event.userId || null,
      action: event.action,
      resource: event.resource || null,
      status: event.status || 'success',
      ipAddress: event.ipAddress || null,
      userAgent: event.userAgent || null,
      details: event.details || {}
    };

    // Log to console (in production, this would go to a logging service)
    console.log(JSON.stringify(logEntry));

    // In production, send to centralized logging service
    // await this.sendToLoggingService(logEntry);
  }

  // Authentication events
  logLogin(userId, status, ipAddress, userAgent) {
    this.log({
      type: 'authentication',
      level: status === 'success' ? this.logLevels.INFO : this.logLevels.WARN,
      userId,
      action: 'login',
      status,
      ipAddress,
      userAgent
    });
  }

  logTokenValidation(userId, status) {
    this.log({
      type: 'authentication',
      level: status === 'success' ? this.logLevels.INFO : this.logLevels.ERROR,
      userId,
      action: 'token_validation',
      status
    });
  }

  // Authorization events
  logAccess(userId, resource, status) {
    this.log({
      type: 'authorization',
      level: status === 'granted' ? this.logLevels.INFO : this.logLevels.ERROR,
      userId,
      action: 'access',
      resource,
      status: status === 'granted' ? 'success' : 'failure'
    });
  }

  // User action events
  logReportGeneration(userId, reportType, status, details = {}) {
    this.log({
      type: 'user_action',
      level: status === 'success' ? this.logLevels.INFO : this.logLevels.ERROR,
      userId,
      action: 'report_generated',
      resource: reportType,
      status,
      details
    });
  }

  logPDFDownload(userId, reportType) {
    this.log({
      type: 'user_action',
      level: this.logLevels.INFO,
      userId,
      action: 'pdf_download',
      resource: reportType,
      status: 'success'
    });
  }

  logDataRefresh(userId, status, details = {}) {
    this.log({
      type: 'user_action',
      level: status === 'success' ? this.logLevels.INFO : this.logLevels.WARN,
      userId,
      action: 'data_refresh',
      status,
      details
    });
  }

  // System events
  logDataCollection(status, details = {}) {
    this.log({
      type: 'system_event',
      level: status === 'success' ? this.logLevels.INFO : this.logLevels.WARN,
      action: 'data_collection',
      status,
      details
    });
  }

  logCacheOperation(operation, status, details = {}) {
    this.log({
      type: 'system_event',
      level: status === 'success' ? this.logLevels.INFO : this.logLevels.ERROR,
      action: `cache_${operation}`,
      status,
      details
    });
  }

  logAPIError(service, error, details = {}) {
    this.log({
      type: 'system_event',
      level: this.logLevels.ERROR,
      action: 'api_error',
      resource: service,
      status: 'failure',
      details: {
        error: error.message,
        ...details
      }
    });
  }

  // Security events
  logSecurityEvent(eventType, severity, details = {}) {
    this.log({
      type: 'security_event',
      level: severity === 'critical' ? this.logLevels.ERROR : this.logLevels.WARN,
      action: eventType,
      status: 'detected',
      details
    });
  }

  // Future: Send to centralized logging service
  async sendToLoggingService(logEntry) {
    // Implementation for CloudWatch, Datadog, etc.
    // await loggingService.send(logEntry);
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();

