import axios, { AxiosInstance } from 'axios';
import { signPayload } from '../security/hmac';
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';

export interface MakeGeneratorConfig {
  baseUrl: string;
  apiKey?: string;
  hmacSecret?: string;
  timeoutMs?: number;
  maxAttempts?: number;
  backoffMs?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerCooldownMs?: number;
}

interface CircuitState {
  failures: number;
  openedAt?: number;
}

export class MakeActionGenerator {
  private readonly http: AxiosInstance;
  private readonly config: Required<MakeGeneratorConfig>;
  private readonly circuit: CircuitState = { failures: 0 };

  constructor(config: MakeGeneratorConfig) {
    this.config = {
      timeoutMs: 25_000,
      maxAttempts: 3,
      backoffMs: 1000,
      circuitBreakerThreshold: 5,
      circuitBreakerCooldownMs: 60_000,
      ...config
    } as Required<MakeGeneratorConfig>;

    this.http = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeoutMs
    });
  }

  private circuitOpen() {
    if (!this.circuit.openedAt) return false;
    const since = Date.now() - this.circuit.openedAt;
    if (since > this.config.circuitBreakerCooldownMs) {
      this.circuit.failures = 0;
      this.circuit.openedAt = undefined;
      return false;
    }
    return true;
  }

  private recordFailure() {
    this.circuit.failures += 1;
    if (this.circuit.failures >= this.config.circuitBreakerThreshold) {
      this.circuit.openedAt = Date.now();
      logger.warn('make.circuit.open', { failures: this.circuit.failures });
    }
  }

  private recordSuccess(latencyMs: number) {
    this.circuit.failures = 0;
    this.circuit.openedAt = undefined;
    metrics.observe('make.latency', latencyMs);
  }

  async *execute(webhookId: string, data: Record<string, unknown>) {
    if (this.circuitOpen()) {
      const error = new Error('Make circuit breaker is open');
      (error as any).code = 'CIRCUIT_OPEN';
      throw error;
    }

    const attempts = this.config.maxAttempts;
    let attempt = 0;
    const normalizedBase = this.config.baseUrl.replace(/\/$/, '');
    const normalizedId = webhookId.replace(/^\//, '');
    const url = webhookId.startsWith('http')
      ? webhookId
      : `${normalizedBase}/${normalizedId}`;

    while (attempt < attempts) {
      attempt += 1;
      const started = Date.now();

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Idempotency-Key': data.idempotencyKey as string || `make-${Date.now()}`
        };
        if (this.config.apiKey) {
          headers.Authorization = `Bearer ${this.config.apiKey}`;
        }
        if (this.config.hmacSecret) {
          headers['X-Signature'] = signPayload(data, { secret: this.config.hmacSecret });
        }

        const response = await this.http.post(url, data, { headers });
        const latency = Date.now() - started;
        this.recordSuccess(latency);
        metrics.increment('make.success');

        yield {
          attempt,
          latencyMs: latency,
          status: 'success' as const,
          breakerState: 'closed' as const,
          response: response.data
        };
        return;
      } catch (error) {
        const latency = Date.now() - started;
        this.recordFailure();
        metrics.increment('make.failure');

        const retryable = attempt < attempts;
        yield {
          attempt,
          latencyMs: latency,
          status: 'error' as const,
          breakerState: this.circuitOpen() ? 'open' : 'closed',
          error
        };

        if (!retryable || this.circuitOpen()) {
          throw error;
        }

        const backoff = this.config.backoffMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }
  }
}
