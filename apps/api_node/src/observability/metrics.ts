interface SummaryStat {
  count: number;
  sum: number;
  values: number[];
}

function initSummary(): SummaryStat {
  return { count: 0, sum: 0, values: [] };
}

export class MetricsRegistry {
  private readonly summaries = new Map<string, SummaryStat>();
  private readonly counters = new Map<string, number>();

  observe(key: string, value: number) {
    const summary = this.summaries.get(key) ?? initSummary();
    summary.count += 1;
    summary.sum += value;
    summary.values.push(value);
    if (summary.values.length > 1_000) {
      summary.values.splice(0, summary.values.length - 1_000);
    }
    this.summaries.set(key, summary);
  }

  increment(key: string, delta = 1) {
    this.counters.set(key, (this.counters.get(key) ?? 0) + delta);
  }

  summarize(key: string, percentile = 0.95) {
    const summary = this.summaries.get(key);
    if (!summary || summary.count === 0) {
      return {
        count: 0,
        avg: 0,
        percentile: 0
      };
    }
    const sorted = [...summary.values].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * percentile));
    return {
      count: summary.count,
      avg: summary.sum / summary.count,
      percentile: sorted[idx]
    };
  }

  getCounter(key: string) {
    return this.counters.get(key) ?? 0;
  }

  snapshot() {
    const summaries: Record<string, ReturnType<MetricsRegistry['summarize']>> = {};
    for (const key of this.summaries.keys()) {
      summaries[key] = this.summarize(key);
    }

    const counters: Record<string, number> = {};
    for (const [key, value] of this.counters.entries()) {
      counters[key] = value;
    }

    return { summaries, counters };
  }
}

export const metrics = new MetricsRegistry();
