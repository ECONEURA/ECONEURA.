import { NeuraLimits } from '../core/types';

export interface TimeGuardConfig {
  now?: () => number;
}

export interface TimeSlices {
  totalDeadline: number;
  llmDeadline: number;
  toolDeadline: number;
}

export class TimeGuard {
  private readonly now: () => number;
  private readonly tracker = new Map<string, TimeSlices>();

  constructor(config: TimeGuardConfig = {}) {
    this.now = config.now || (() => Date.now());
  }

  init(correlationId: string, limits: NeuraLimits) {
    const start = this.now();
    const deadlines: TimeSlices = {
      totalDeadline: start + limits.timeoutMs.total,
      llmDeadline: start + limits.timeoutMs.llm,
      toolDeadline: start + limits.timeoutMs.tool
    };
    this.tracker.set(correlationId, deadlines);
    return deadlines;
  }

  private ensure(correlationId: string) {
    const existing = this.tracker.get(correlationId);
    if (!existing) {
      throw new Error(`TimeGuard: correlation ${correlationId} not registered`);
    }
    return existing;
  }

  assertWithinPhase(correlationId: string, phase: 'total' | 'llm' | 'tool') {
    const deadlines = this.ensure(correlationId);
    const now = this.now();
    const deadline =
      phase === 'total'
        ? deadlines.totalDeadline
        : phase === 'llm'
          ? deadlines.llmDeadline
          : deadlines.toolDeadline;

    if (now > deadline) {
      const error = new Error(`TimeGuard: ${phase} timeout exceeded`);
      (error as any).code = `${phase.toUpperCase()}_TIMEOUT`;
      throw error;
    }
  }

  complete(correlationId: string) {
    this.tracker.delete(correlationId);
  }
}

export const defaultTimeGuard = new TimeGuard();
