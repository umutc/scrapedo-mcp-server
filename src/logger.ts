import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  NONE = 'NONE'
}

export class Logger {
  private logFile: string;
  private logStream: fs.WriteStream;
  private logToConsole: boolean;
  private logLevel: LogLevel;

  constructor(logFileName = 'scrapedo-mcp.log', logToConsole = true) {
    const logDir = path.join(__dirname, '..', 'logs');
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.logFile = path.join(logDir, logFileName);
    this.logStream = fs.createWriteStream(this.logFile, { flags: 'a' });
    this.logToConsole = logToConsole;
    this.logLevel = this.resolveLogLevel(process.env.LOG_LEVEL);
    
    this.log(LogLevel.INFO, '='.repeat(80));
    this.log(LogLevel.INFO, 'Scrapedo MCP Server Started');
    this.log(LogLevel.INFO, `Log file: ${this.logFile}`);
    this.log(LogLevel.INFO, `Log level: ${this.logLevel}`);
    this.log(LogLevel.INFO, '='.repeat(80));
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.logLevel === LogLevel.NONE || level === LogLevel.NONE) {
      return false;
    }

    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private resolveLogLevel(envLevel?: string): LogLevel {
    if (!envLevel) {
      return LogLevel.INFO;
    }

    const normalizedLevel = envLevel.trim().toUpperCase();
    const validLevels = Object.values(LogLevel) as string[];
    return validLevels.includes(normalizedLevel)
      ? (normalizedLevel as LogLevel)
      : LogLevel.INFO;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data !== undefined) {
      if (typeof data === 'object') {
        logMessage += '\n' + JSON.stringify(data, this.sanitizeData, 2);
      } else {
        logMessage += ' ' + String(data);
      }
    }
    
    return logMessage;
  }

  private sanitizeData(key: string, value: any): any {
    // Mask sensitive data in logs
    const sensitiveKeys = ['token', 'apikey', 'api_key', 'password', 'secret', 'authorization'];
    
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      if (typeof value === 'string' && value.length > 0) {
        return value.substring(0, 4) + '***' + value.substring(value.length - 4);
      }
    }
    
    // Truncate very long strings
    if (typeof value === 'string' && value.length > 1000) {
      return value.substring(0, 1000) + '... (truncated)';
    }
    
    return value;
  }

  log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, data);
    
    // Write to file
    this.logStream.write(formattedMessage + '\n');
    
    // Write to console error stream (for MCP server)
    if (this.logToConsole) {
      console.error(formattedMessage);
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  logRequest(toolName: string, args: any): void {
    this.info(`Tool Request: ${toolName}`, {
      tool: toolName,
      arguments: args
    });
  }

  logResponse(toolName: string, response: any, duration: number): void {
    this.info(`Tool Response: ${toolName} (${duration}ms)`, {
      tool: toolName,
      duration: duration,
      success: true,
      response: response
    });
  }

  logError(toolName: string, error: any, duration?: number): void {
    this.error(`Tool Error: ${toolName}${duration ? ` (${duration}ms)` : ''}`, {
      tool: toolName,
      duration: duration,
      error: {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
        errorType: error.errorType,
        details: error.details
      }
    });
  }

  logApiCall(method: string, url: string, params?: any): void {
    this.debug(`API Call: ${method} ${url}`, {
      method,
      url: this.sanitizeUrl(url),
      params
    });
  }

  logApiResponse(method: string, url: string, status: number, data?: any): void {
    this.debug(`API Response: ${method} ${url} - ${status}`, {
      method,
      url: this.sanitizeUrl(url),
      status,
      data
    });
  }

  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Mask the token in the URL
      if (urlObj.searchParams.has('token')) {
        const token = urlObj.searchParams.get('token')!;
        urlObj.searchParams.set('token', 
          token.substring(0, 4) + '***' + token.substring(token.length - 4)
        );
      }
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  close(): void {
    this.info('Scrapedo MCP Server Shutting Down');
    this.logStream.end();
  }
}

// Singleton instance
export const logger = new Logger();
