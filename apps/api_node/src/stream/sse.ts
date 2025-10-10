import { ServerResponse } from 'http';
import { CostGuard } from '../guards/costGuard';

export interface SSEOptions {
  retryMs?: number;
  heartbeatIntervalMs?: number;
  drainTimeoutMs?: number;
}

export interface SSECursor {
  index: number;
  ts: number;
}

export class SSEStream {
  private readonly res: ServerResponse;
  private readonly retryMs: number;
  private readonly heartbeatIntervalMs: number;
  private readonly drainTimeoutMs: number;
  private heartbeatTimer?: NodeJS.Timeout;
  private cursor: SSECursor = { index: 0, ts: Date.now() };
  private readonly startedAt = Date.now();
  private closed = false;

  constructor(res: ServerResponse, options: SSEOptions = {}) {
    this.res = res;
    this.retryMs = options.retryMs ?? 2500;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? 15_000;
    this.drainTimeoutMs = options.drainTimeoutMs ?? 10_000;
  }

  start(initialPayload?: Record<string, unknown>) {
    this.res.statusCode = 200;
    this.res.setHeader('Content-Type', 'text/event-stream');
    this.res.setHeader('Cache-Control', 'no-cache');
    this.res.setHeader('Connection', 'keep-alive');
    this.res.setHeader('X-Accel-Buffering', 'no');
    this.writeRaw(`retry: ${this.retryMs}\n`);

    if (initialPayload) {
      this.event('start', initialPayload);
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.closed) return;
      this.comment(`heartbeat ${Date.now()}`);
    }, this.heartbeatIntervalMs);

    this.res.on('close', () => this.stop());
    this.res.on('finish', () => this.stop());
  }

  async event(event: string, data: unknown) {
    await this.write({ event, data });
  }

  async token(content: string) {
    this.cursor = { index: this.cursor.index + 1, ts: Date.now() };
    await this.write({ event: 'token', data: { content, cursor: this.cursor } });
  }

  async usage(payload: Record<string, unknown>) {
    await this.write({ event: 'usage', data: payload });
  }

  async end(payload?: Record<string, unknown>) {
    if (payload) {
      await this.write({ event: 'done', data: payload });
    } else {
      this.writeRaw('event: done\ndata: {}\n\n');
    }
    this.stop();
  }

  async error(error: Error | string) {
    const payload = typeof error === 'string' ? { message: error } : { message: error.message, code: (error as any).code };
    await this.write({ event: 'error', data: payload });
    this.stop();
  }

  comment(text: string) {
    this.writeRaw(`: ${text}\n`);
  }

  getResumeToken(additional?: Record<string, unknown>) {
    return CostGuard.buildResumeToken('sse', {
      cursor: this.cursor,
      startedAt: this.startedAt,
      additional
    });
  }

  private stop() {
    if (this.closed) return;
    this.closed = true;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    try {
      this.res.end();
    } catch (_) {
      /* noop */
    }
  }

  private writeRaw(payload: string) {
    if (this.closed) return;
    this.res.write(payload + '\n');
  }

  private async write({ event, data }: { event: string; data: unknown }) {
    if (this.closed) return;
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
    const chunk = `event: ${event}\ndata: ${serialized}\n\n`;

    const writable = this.res.write(chunk);
    if (!writable) {
      await this.awaitDrain();
    }
  }

  private awaitDrain() {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('SSE backpressure: drain timeout'));
      }, this.drainTimeoutMs);

      const cleanup = () => {
        clearTimeout(timeout);
        this.res.off('drain', onDrain);
        this.res.off('error', onError);
      };

      const onDrain = () => {
        cleanup();
        resolve();
      };

      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };

      this.res.once('drain', onDrain);
      this.res.once('error', onError);
    });
  }
}
