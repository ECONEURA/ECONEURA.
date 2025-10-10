import axios, { AxiosInstance } from 'axios';
import type { AxiosError } from 'axios';
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';

export interface SemanticSearchConfig {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
  topK?: number;
  maxRetries?: number;
  backoffMs?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerCooldownMs?: number;
}

interface SearchCircuitState {
  failures: number;
  openedAt?: number;
}

export interface SemanticSearchResult {
  id: string;
  score: number;
  source?: string;
  snippet: string;
  metadata?: Record<string, unknown>;
}

export class SemanticSearchGenerator {
  private readonly http: AxiosInstance;
  private readonly config: Required<SemanticSearchConfig>;
  private readonly circuit: SearchCircuitState = { failures: 0 };

  constructor(config: SemanticSearchConfig) {
    this.config = {
      timeoutMs: 10_000,
      topK: 6,
      maxRetries: 2,
      backoffMs: 750,
      circuitBreakerThreshold: 4,
      circuitBreakerCooldownMs: 45_000,
      ...config
    } as Required<SemanticSearchConfig>;

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

  private recordFailure(error: AxiosError | Error) {
    this.circuit.failures += 1;
    logger.error('search.failure', {
      message: error.message,
      code: (error as AxiosError).code,
      circuitFailures: this.circuit.failures
    });
    metrics.increment('search.failure');
    if (this.circuit.failures >= this.config.circuitBreakerThreshold) {
      this.circuit.openedAt = Date.now();
      logger.warn('search.circuit.open', { failures: this.circuit.failures });
    }
  }

  private recordSuccess(latencyMs: number, resultCount: number) {
    this.circuit.failures = 0;
    this.circuit.openedAt = undefined;
    metrics.observe('search.latency', latencyMs);
    metrics.increment('search.success');
    metrics.observe('search.resultCount', resultCount);
  }

  async run(query: string, filters?: Record<string, string>): Promise<SemanticSearchResult[]> {
    if (this.circuitOpen()) {
      const error = new Error('Search circuit breaker open');
      (error as any).code = 'CIRCUIT_OPEN';
      throw error;
    }

    let attempt = 0;
    const params = {
      q: query,
      top: this.config.topK,
      ...filters
    };

    while (attempt < this.config.maxRetries) {
      attempt += 1;
      const started = Date.now();
      try {
        const headers: Record<string, string> = {};
        if (this.config.apiKey) {
          headers['x-api-key'] = this.config.apiKey;
        }

        const response = await this.http.get('/search', { headers, params });
        const latency = Date.now() - started;
        const items = (response.data?.results ?? []) as SemanticSearchResult[];
        this.recordSuccess(latency, items.length);

        return items.map((item, idx) => ({
          id: item.id ?? String(idx),
          score: item.score ?? 0,
          source: item.source,
          snippet: item.snippet,
          metadata: item.metadata
        }));
      } catch (error) {
        this.recordFailure(error as AxiosError);
        const shouldRetry = attempt < this.config.maxRetries && !this.circuitOpen();
        if (!shouldRetry) {
          throw error;
        }
        const backoff = this.config.backoffMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }

    return [];
  }
}
