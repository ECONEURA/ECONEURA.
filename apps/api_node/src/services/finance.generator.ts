import axios, { AxiosInstance } from 'axios';
import dayjs from 'dayjs';
import { logger } from '../observability/logger';
import { metrics } from '../observability/metrics';

export interface FinanceGeneratorConfig {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
  maxRetries?: number;
  backoffMs?: number;
  cacheTtlMs?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerCooldownMs?: number;
}

export interface FinancialTimeSeriesPoint {
  ts: string;
  value: number;
}

export interface FinancialSnapshot {
  symbol: string;
  price: number;
  currency: string;
  change24h: number;
  marketCap?: number;
  timeSeries?: FinancialTimeSeriesPoint[];
  fetchedAt: string;
}

interface CacheEntry {
  value: FinancialSnapshot;
  expiresAt: number;
}

interface CircuitState {
  failures: number;
  openedAt?: number;
}

export class FinanceGenerator {
  private readonly http: AxiosInstance;
  private readonly config: Required<FinanceGeneratorConfig>;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly circuit: CircuitState = { failures: 0 };

  constructor(config: FinanceGeneratorConfig) {
    this.config = {
      timeoutMs: 8_000,
      maxRetries: 2,
      backoffMs: 1_000,
      cacheTtlMs: 60_000,
      circuitBreakerThreshold: 4,
      circuitBreakerCooldownMs: 30_000,
      ...config
    } as Required<FinanceGeneratorConfig>;

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

  private recordFailure(error: Error) {
    this.circuit.failures += 1;
    logger.error('finance.failure', { message: error.message, failures: this.circuit.failures });
    metrics.increment('finance.failure');
    if (this.circuit.failures >= this.config.circuitBreakerThreshold) {
      this.circuit.openedAt = Date.now();
      logger.warn('finance.circuit.open', { failures: this.circuit.failures });
    }
  }

  private recordSuccess(latencyMs: number) {
    this.circuit.failures = 0;
    this.circuit.openedAt = undefined;
    metrics.observe('finance.latency', latencyMs);
    metrics.increment('finance.success');
  }

  private getCached(symbol: string) {
    const entry = this.cache.get(symbol);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(symbol);
      return undefined;
    }
    return entry.value;
  }

  private setCached(symbol: string, snapshot: FinancialSnapshot) {
    this.cache.set(symbol, {
      value: snapshot,
      expiresAt: Date.now() + this.config.cacheTtlMs
    });
  }

  async getSnapshot(symbol: string): Promise<FinancialSnapshot> {
    const cached = this.getCached(symbol);
    if (cached) {
      metrics.increment('finance.cacheHit');
      return cached;
    }

    if (this.circuitOpen()) {
      const error = new Error('Finance circuit breaker open');
      (error as any).code = 'CIRCUIT_OPEN';
      throw error;
    }

    let attempt = 0;
    while (attempt < this.config.maxRetries) {
      attempt += 1;
      const started = Date.now();
      try {
        const headers: Record<string, string> = {};
        if (this.config.apiKey) {
          headers['x-api-key'] = this.config.apiKey;
        }

        const response = await this.http.get(`/quotes/${symbol}`, { headers });
        const latency = Date.now() - started;
        const payload = response.data;
        const snapshot: FinancialSnapshot = {
          symbol,
          price: Number(payload.price ?? payload.value ?? 0),
          currency: payload.currency ?? 'USD',
          change24h: Number(payload.change24h ?? payload.change ?? 0),
          marketCap: payload.marketCap ? Number(payload.marketCap) : undefined,
          timeSeries: Array.isArray(payload.timeSeries)
            ? payload.timeSeries.map((item: any) => ({
                ts: item.ts ?? item.timestamp ?? dayjs().toISOString(),
                value: Number(item.value ?? item.price ?? 0)
              }))
            : undefined,
          fetchedAt: dayjs().toISOString()
        };

        this.recordSuccess(latency);
        this.setCached(symbol, snapshot);
        return snapshot;
      } catch (error) {
        this.recordFailure(error as Error);
        const shouldRetry = attempt < this.config.maxRetries && !this.circuitOpen();
        if (!shouldRetry) {
          throw error;
        }
        const backoff = this.config.backoffMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }

    throw new Error(`Finance lookup failed for ${symbol}`);
  }
}
