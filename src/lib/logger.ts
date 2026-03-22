type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  constructor(
    private module: string,
    private minLevel: LogLevel = 'info',
  ) {}

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.minLevel]) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      ...data,
    };

    const method =
      level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    method(JSON.stringify(entry));
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }
  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }
  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }
  error(message: string, data?: Record<string, unknown>) {
    this.log('error', message, data);
  }
}

export function createLogger(module: string): Logger {
  return new Logger(module);
}
