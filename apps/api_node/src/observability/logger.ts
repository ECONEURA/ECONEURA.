export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogFields {
  agentId?: string;
  correlationId?: string;
  userId?: string;
  event?: string;
  durationMs?: number;
  tokens?: number;
  costEUR?: number;
  context?: Record<string, unknown>;
  error?: unknown;
  [key: string]: unknown;
}

function safeSerialize(value: unknown) {
  try {
    return typeof value === 'string' ? value : JSON.stringify(value);
  } catch (_) {
    return '[unserializable]';
  }
}

function emit(level: LogLevel, message: string, fields: LogFields = {}) {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    level,
    message,
    ...fields
  };
  const output = JSON.stringify(payload);
  if (level === 'error' || level === 'warn') {
    console.error(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  debug(message: string, fields?: LogFields) {
    emit('debug', message, fields);
  },
  info(message: string, fields?: LogFields) {
    emit('info', message, fields);
  },
  warn(message: string, fields?: LogFields) {
    emit('warn', message, fields);
  },
  error(message: string, fields?: LogFields) {
    const serialized = { ...fields };
    if (fields?.error instanceof Error) {
      serialized.error = {
        message: fields.error.message,
        stack: fields.error.stack,
        name: fields.error.name
      };
    }
    emit('error', message, serialized);
  }
};

export function logRequestLifecycle(stage: string, fields: LogFields) {
  logger.info(`gateway.${stage}`, fields);
}
