interface CacheEntry<T> {
  value: T;
  storedAt: number;
  expiresAt: number;
}

export interface IdempotencyGuardOptions<T> {
  ttlMs?: number;
  maxEntries?: number;
  serialize?: (value: T) => string;
}

export class IdempotencyGuard<T = unknown> {
  private readonly ttlMs: number;
  private readonly maxEntries: number;
  private readonly serialize: (value: T) => string;
  private readonly cache = new Map<string, CacheEntry<T>>();

  constructor(options: IdempotencyGuardOptions<T> = {}) {
    this.ttlMs = options.ttlMs ?? 1000 * 60 * 60 * 24; // 24h default
    this.maxEntries = options.maxEntries ?? 10_000;
    this.serialize = options.serialize ?? ((value: T) => JSON.stringify(value));
  }

  get(idempotencyKey: string): T | undefined {
    const entry = this.cache.get(idempotencyKey);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(idempotencyKey);
      return undefined;
    }
    return entry.value;
  }

  set(idempotencyKey: string, value: T) {
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }
    const now = Date.now();
    this.cache.set(idempotencyKey, {
      value,
      storedAt: now,
      expiresAt: now + this.ttlMs
    });
  }

  getOrSet(idempotencyKey: string, valueFactory: () => T) {
    const existing = this.get(idempotencyKey);
    if (existing !== undefined) {
      return { reused: true, value: existing } as const;
    }
    const value = valueFactory();
    this.set(idempotencyKey, value);
    return { reused: false, value } as const;
  }

  private evictOldest() {
    const oldest = Array.from(this.cache.entries()).sort((a, b) => a[1].storedAt - b[1].storedAt)[0];
    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }

  snapshot() {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      storedAt: entry.storedAt,
      expiresAt: entry.expiresAt
    }));
  }
}

export const defaultIdempotencyGuard = new IdempotencyGuard<any>();
