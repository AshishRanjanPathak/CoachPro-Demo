/**
 * Production-ready Structured JSON Logger.
 * Replaces unstructured console.log with trace-correlated structured log events.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service?: string;
  requestId?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LogMeta {
  requestId?: string;
  context?: Record<string, unknown>;
  err?: unknown;
}

class Logger {
  private serviceName: string;

  constructor(serviceName: string = "coachpro-web") {
    this.serviceName = serviceName;
  }

  private emit(level: LogLevel, message: string, meta?: { requestId?: string; context?: Record<string, unknown>; err?: unknown }) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      requestId: meta?.requestId,
      context: meta?.context,
    };

    if (meta?.err instanceof Error) {
      entry.error = {
        name: meta.err.name,
        message: meta.err.message,
        stack: process.env.NODE_ENV !== "production" ? meta.err.stack : undefined,
      };
    }

    // Server-side: emit structured JSON line
    if (typeof window === "undefined") {
      const output = JSON.stringify(entry);
      if (level === "error") process.stderr.write(output + "\n");
      else process.stdout.write(output + "\n");
    } else {
      // Browser console formatting
      const prefix = `[${entry.service}] [${entry.level.toUpperCase()}]`;
      if (level === "error") console.error(prefix, entry.message, meta?.context || "", meta?.err || "");
      else if (level === "warn") console.warn(prefix, entry.message, meta?.context || "");
      else console.log(prefix, entry.message, meta?.context || "");
    }
  }

  info(message: string, meta?: { requestId?: string; context?: Record<string, unknown> }) {
    this.emit("info", message, meta);
  }

  warn(
    message: string,
    metaOrContext?: LogMeta | Record<string, unknown>,
    err?: unknown
  ) {
    if (metaOrContext && ("requestId" in metaOrContext || "context" in metaOrContext || "err" in metaOrContext)) {
      this.emit("warn", message, metaOrContext as LogMeta);
    } else {
      this.emit("warn", message, { context: metaOrContext as Record<string, unknown>, err });
    }
  }

  error(
    message: string,
    metaOrContext?: LogMeta | Record<string, unknown>,
    err?: unknown
  ) {
    if (metaOrContext && ("requestId" in metaOrContext || "context" in metaOrContext || "err" in metaOrContext)) {
      this.emit("error", message, metaOrContext as LogMeta);
    } else {
      this.emit("error", message, { context: metaOrContext as Record<string, unknown>, err });
    }
  }

  debug(message: string, meta?: { requestId?: string; context?: Record<string, unknown> }) {
    if (process.env.NODE_ENV !== "production") {
      this.emit("debug", message, meta);
    }
  }

  withRequestId(requestId: string): LoggerWithContext {
    return new LoggerWithContext(this, requestId);
  }
}

class LoggerWithContext {
  constructor(private parent: Logger, private requestId: string) {}

  info(message: string, context?: Record<string, unknown>) {
    this.parent.info(message, { requestId: this.requestId, context });
  }

  warn(message: string, context?: Record<string, unknown>, err?: unknown) {
    this.parent.warn(message, { requestId: this.requestId, context, err });
  }

  error(message: string, context?: Record<string, unknown>, err?: unknown) {
    this.parent.error(message, { requestId: this.requestId, context, err });
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.parent.debug(message, { requestId: this.requestId, context });
  }
}

export const logger = new Logger("coachpro");
