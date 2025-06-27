export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor() {
    this.log(LogLevel.INFO, "SYSTEM", "Logger initialized");
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.log(LogLevel.INFO, "SYSTEM", `Log level set to ${LogLevel[level]}`);
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private log(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      category,
      message,
      data,
      error,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    const levelLabel = LogLevel[level].padEnd(8);
    const categoryLabel = category.padEnd(15);
    const timestamp = entry.timestamp.split("T")[1].split(".")[0];

    const logMessage = `[${timestamp}] ${levelLabel} [${categoryLabel}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, data || "");
        break;
      case LogLevel.INFO:
        console.info(logMessage, data || "");
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data || "");
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data || "", error || "");
        break;
      case LogLevel.CRITICAL:
        console.error(`🚨 CRITICAL: ${logMessage}`, data || "", error || "");
        break;
    }
  }

  public debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  public info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  public warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  public error(
    category: string,
    message: string,
    data?: any,
    error?: Error
  ): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  public critical(
    category: string,
    message: string,
    data?: any,
    error?: Error
  ): void {
    this.log(LogLevel.CRITICAL, category, message, data, error);
  }

  public websocket(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, `WEBSOCKET_${category}`, message, data);
  }

  public incident(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, `INCIDENT_${category}`, message, data);
  }

  public auth(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, `AUTH_${category}`, message, data);
  }

  public api(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, `API_${category}`, message, data);
  }

  public sound(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, `SOUND_${category}`, message, data);
  }

  public location(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, `LOCATION_${category}`, message, data);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  public getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter((log) => log.category.includes(category));
  }

  public clearLogs(): void {
    this.logs = [];
    this.info("SYSTEM", "Logs cleared");
  }
}

export const logger = Logger.getInstance();

export const logDebug = (category: string, message: string, data?: any) =>
  logger.debug(category, message, data);

export const logInfo = (category: string, message: string, data?: any) =>
  logger.info(category, message, data);

export const logWarn = (category: string, message: string, data?: any) =>
  logger.warn(category, message, data);

export const logError = (
  category: string,
  message: string,
  data?: any,
  error?: Error
) => logger.error(category, message, data, error);

export const logCritical = (
  category: string,
  message: string,
  data?: any,
  error?: Error
) => logger.critical(category, message, data, error);

export const logWebSocket = (category: string, message: string, data?: any) =>
  logger.websocket(category, message, data);

export const logIncident = (category: string, message: string, data?: any) =>
  logger.incident(category, message, data);

export const logAuth = (category: string, message: string, data?: any) =>
  logger.auth(category, message, data);

export const logApi = (category: string, message: string, data?: any) =>
  logger.api(category, message, data);

export const logSound = (category: string, message: string, data?: any) =>
  logger.sound(category, message, data);

export const logLocation = (category: string, message: string, data?: any) =>
  logger.location(category, message, data);
