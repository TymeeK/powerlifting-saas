import pino from 'pino';

// Determine if we're in a browser or Node.js environment
const isBrowser = typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

// Create pino logger instance
// In browser, pino uses console logging. In Node.js, it uses structured logging.
const baseLogger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  browser: isBrowser
    ? {
        // In browser, pino logs to console with structured output
        asObject: false, // Log as console messages, not structured objects
        write: {
          // Write logs to console
        },
      }
    : undefined,
  // Server-side configuration
  ...(!isBrowser && {
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  }),
});

// Custom logger interface with common methods
export const logger = {
  /**
   * Log informational messages
   */
  info: (message: string, ...args: any[]) => {
    baseLogger.info({ ...args }, message);
  },

  /**
   * Log warning messages
   */
  warn: (message: string, ...args: any[]) => {
    baseLogger.warn({ ...args }, message);
  },

  /**
   * Log error messages
   */
  error: (message: string, error?: Error | unknown, ...args: any[]) => {
    const errorObj =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error;
    baseLogger.error({ error: errorObj, ...args }, message);
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (message: string, ...args: any[]) => {
    baseLogger.debug({ ...args }, message);
  },

  /**
   * Log trace messages (most verbose)
   */
  trace: (message: string, ...args: any[]) => {
    baseLogger.trace({ ...args }, message);
  },

  /**
   * Log fatal errors
   */
  fatal: (message: string, error?: Error | unknown, ...args: any[]) => {
    const errorObj =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error;
    baseLogger.fatal({ error: errorObj, ...args }, message);
  },

  /**
   * Create a child logger with additional context
   */
  child: (bindings: Record<string, any>) => {
    const childLogger = baseLogger.child(bindings);
    return {
      info: (message: string, ...args: any[]) =>
        childLogger.info({ ...args }, message),
      warn: (message: string, ...args: any[]) =>
        childLogger.warn({ ...args }, message),
      error: (message: string, error?: Error | unknown, ...args: any[]) => {
        const errorObj =
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error;
        childLogger.error({ error: errorObj, ...args }, message);
      },
      debug: (message: string, ...args: any[]) =>
        childLogger.debug({ ...args }, message),
      trace: (message: string, ...args: any[]) =>
        childLogger.trace({ ...args }, message),
      fatal: (message: string, error?: Error | unknown, ...args: any[]) => {
        const errorObj =
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error;
        childLogger.fatal({ error: errorObj, ...args }, message);
      },
    };
  },
};

export default logger;
