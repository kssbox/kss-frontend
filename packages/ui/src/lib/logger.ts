export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

class Logger {
  private prefix: string

  constructor(prefix: string = 'Chat') {
    this.prefix = `[${prefix}]`
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]) {
    const timestamp = new Date().toISOString()
    return [timestamp, this.prefix, level.toUpperCase(), message, ...args]
  }

  debug(message: string, ...args: unknown[]) {
    console.debug(...this.formatMessage(LogLevel.DEBUG, message, ...args))
  }

  info(message: string, ...args: unknown[]) {
    console.info(...this.formatMessage(LogLevel.INFO, message, ...args))
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(...this.formatMessage(LogLevel.WARN, message, ...args))
  }

  error(message: string, error?: Error, ...args: unknown[]) {
    console.error(...this.formatMessage(LogLevel.ERROR, message, ...args))
    if (error) {
      console.error(error)
    }
  }
}

export const logger = new Logger('ChatCore')
