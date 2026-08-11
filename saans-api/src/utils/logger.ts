/**
 * Production-ready Logger
 * Logs to console with structured format
 * In production, integrate with monitoring services (Sentry, DataDog, etc.)
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  userId?: string;
  requestId?: string;
  errorCode?: string;
  statusCode?: number;
  details?: Record<string, any>;
  stack?: string;
}

class Logger {
  private service: string;
  private isDevelopment: boolean;

  constructor(service: string = 'SAANS-API') {
    this.service = service;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Format log entry as JSON for structured logging
   */
  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  /**
   * Get appropriate console method based on log level
   */
  private getConsoleMethod(level: LogLevel) {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Log a message
   */
  private log(entry: LogEntry): void {
    const logOutput = this.formatLog(entry);
    const consoleMethod = this.getConsoleMethod(entry.level);

    // Color coded output in development
    if (this.isDevelopment) {
      const color = this.getColorForLevel(entry.level);
      consoleMethod(`${color}%s\x1b[0m`, logOutput);
    } else {
      consoleMethod(logOutput);
    }

    // Send to monitoring service in production
    // TODO: Integrate with Sentry, DataDog, CloudWatch, etc.
    // this.sendToMonitoringService(entry);
  }

  /**
   * Get ANSI color code for log level
   */
  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[36m'; // Cyan
      case LogLevel.INFO:
        return '\x1b[32m'; // Green
      case LogLevel.WARN:
        return '\x1b[33m'; // Yellow
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      default:
        return '\x1b[0m'; // Reset
    }
  }

  /**
   * Debug level log
   */
  debug(
    message: string,
    details?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      service: this.service,
      message,
      userId,
      requestId,
      ...(details && { details }),
    });
  }

  /**
   * Info level log
   */
  info(
    message: string,
    details?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      service: this.service,
      message,
      userId,
      requestId,
      ...(details && { details }),
    });
  }

  /**
   * Warning level log
   */
  warn(
    message: string,
    details?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      service: this.service,
      message,
      userId,
      requestId,
      ...(details && { details }),
    });
  }

  /**
   * Error level log
   */
  error(
    message: string,
    error?: Error | any,
    details?: Record<string, any>,
    userId?: string,
    requestId?: string
  ): void {
    // Sanitize error message to avoid exposing sensitive details
    const sanitizedMessage = this.sanitizeErrorMessage(error?.message || message);

    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      service: this.service,
      message: sanitizedMessage,
      userId,
      requestId,
      errorCode: error?.errorCode,
      statusCode: error?.statusCode,
      stack: this.isDevelopment ? error?.stack : undefined,
      ...(details && { details }),
    });
  }

  /**
   * Log controller action start
   */
  logControllerStart(
    controller: string,
    action: string,
    userId?: string,
    requestId?: string
  ): void {
    this.info(
      `[${controller}] ${action} started`,
      { controller, action },
      userId,
      requestId
    );
  }

  /**
   * Log controller action completion
   */
  logControllerSuccess(
    controller: string,
    action: string,
    statusCode: number,
    userId?: string,
    requestId?: string
  ): void {
    this.info(
      `[${controller}] ${action} completed`,
      { controller, action, statusCode },
      userId,
      requestId
    );
  }

  /**
   * Log controller action error
   */
  logControllerError(
    controller: string,
    action: string,
    error: Error | any,
    statusCode: number,
    userId?: string,
    requestId?: string
  ): void {
    this.error(
      `[${controller}] ${action} failed`,
      error,
      { controller, action, statusCode },
      userId,
      requestId
    );
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    duration: number,
    success: boolean,
    details?: Record<string, any>
  ): void {
    const logFn = success ? this.info.bind(this) : this.warn.bind(this);
    logFn(
      `Database operation: ${operation} (${duration}ms)`,
      { operation, duration, success, ...details }
    );
  }

  /**
   * Log external API call
   */
  logExternalApiCall(
    service: string,
    endpoint: string,
    statusCode?: number,
    duration?: number,
    error?: Error
  ): void {
    if (error) {
      this.error(
        `External API call to ${service} failed`,
        error,
        { service, endpoint, statusCode, duration }
      );
    } else {
      this.info(
        `External API call to ${service} succeeded`,
        { service, endpoint, statusCode, duration }
      );
    }
  }

  /**
   * Sanitize error message to avoid exposing sensitive data
   */
  private sanitizeErrorMessage(message: string): string {
    if (!message) return message;

    // Remove sensitive patterns
    let sanitized = message;

    // Remove email addresses
    sanitized = sanitized.replace(/[^\s:/@]+@[^\s:/@]+\.[^\s:/@]+/g, '[EMAIL]');

    // Remove API keys and tokens (basic pattern)
    sanitized = sanitized.replace(/(['"])(?:api[_-]?key|token|secret)(['"])?\s*[:=]\s*['"]?[^'"]+['"]?/gi, '$1[REDACTED]$2');

    // Remove database connection strings
    sanitized = sanitized.replace(/mongodb:\/\/[^\s]*/gi, 'mongodb://[REDACTED]');
    sanitized = sanitized.replace(/postgresql:\/\/[^\s]*/gi, 'postgresql://[REDACTED]');

    // Remove file paths that might reveal system structure
    if (sanitized.length > 500) {
      sanitized = sanitized.substring(0, 500) + '...';
    }

    return sanitized;
  }
}

// Export singleton instance
export const logger = new Logger('SAANS-API');

// Export for module-specific logging
export function createLogger(moduleName: string): Logger {
  return new Logger(`SAANS-${moduleName}`);
}

export default logger;
