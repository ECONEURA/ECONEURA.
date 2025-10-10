import crypto from 'crypto';
import { NeuraRequestV1 } from '../core/types';

const MODEL_PRICING_EUR: Record<string, { prompt: number; completion: number }> = {
  'gpt-4o': { prompt: 0.0046, completion: 0.0138 },
  'gpt-4o-mini': { prompt: 0.00014, completion: 0.00056 },
  'o1-preview': { prompt: 0.0138, completion: 0.0552 },
  'o1-mini': { prompt: 0.00276, completion: 0.01104 }
};

const DAILY_CAPS_EUR: Record<string, number> = {};

function getPricing(model: string) {
  return MODEL_PRICING_EUR[model] || MODEL_PRICING_EUR['gpt-4o'];
}

function naiveTokenEstimate(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  return Math.max(words * 1.33, chars / 4.2) | 0;
}

export interface CostGuardContext {
  model: string;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  estimatedCostEUR: number;
  requestCostCap: number;
  dailyBudgetCap?: number;
}

export interface CostGuardOptions {
  dailyBudgetsEUR?: Record<string, number>;
  onBudgetHit?: (agentId: string, context: CostGuardContext) => void;
}

const agentSpendTracker = new Map<string, { day: string; spend: number }>();

function getDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getAgentSpend(agentId: string) {
  const record = agentSpendTracker.get(agentId);
  const today = getDayKey();
  if (!record || record.day !== today) {
    return { day: today, spend: 0 };
  }
  return record;
}

function addAgentSpend(agentId: string, amount: number) {
  const today = getDayKey();
  const record = getAgentSpend(agentId);
  agentSpendTracker.set(agentId, {
    day: today,
    spend: record.day === today ? record.spend + amount : amount
  });
}

export class CostGuard {
  private readonly dailyBudgets: Record<string, number>;
  private readonly onBudgetHit?: (agentId: string, context: CostGuardContext) => void;

  constructor(options: CostGuardOptions = {}) {
    this.dailyBudgets = options.dailyBudgetsEUR || DAILY_CAPS_EUR;
    this.onBudgetHit = options.onBudgetHit;
  }

  estimate(request: NeuraRequestV1, model: string): CostGuardContext {
    const pricing = getPricing(model);
    const estimatedPromptTokens = Math.min(
      request.limits.maxPromptTokens,
      naiveTokenEstimate(request.message)
    );
    const estimatedCompletionTokens = request.limits.maxCompletionTokens;

    const estimatedCostEUR =
      (estimatedPromptTokens / 1_000_000) * pricing.prompt +
      (estimatedCompletionTokens / 1_000_000) * pricing.completion;

    const agentBudgetCap = this.dailyBudgets[request.agentId];

    return {
      model,
      estimatedPromptTokens,
      estimatedCompletionTokens,
      estimatedCostEUR,
      requestCostCap: request.limits.costCapEUR,
      dailyBudgetCap: agentBudgetCap
    };
  }

  assertWithinCaps(request: NeuraRequestV1, model: string) {
    const context = this.estimate(request, model);

    if (context.estimatedCostEUR > context.requestCostCap) {
      const error = new Error(
        `CostGuard: estimated cost €${context.estimatedCostEUR.toFixed(5)} exceeds request cap €${context.requestCostCap.toFixed(5)}`
      );
      (error as any).code = 'COST_CAP_EXCEEDED';
      (error as any).context = context;
      throw error;
    }

    if (context.dailyBudgetCap !== undefined) {
      const spend = getAgentSpend(request.agentId);
      if (spend.spend + context.estimatedCostEUR > context.dailyBudgetCap) {
        this.onBudgetHit?.(request.agentId, context);
        const error = new Error(
          `BudgetGuard: agent ${request.agentId} would exceed daily cap €${context.dailyBudgetCap.toFixed(2)}`
        );
        (error as any).code = 'DAILY_BUDGET_EXCEEDED';
        (error as any).context = context;
        throw error;
      }
    }

    return context;
  }

  registerActualSpend(agentId: string, amount: number) {
    addAgentSpend(agentId, amount);
  }

  static buildResumeToken(agentId: string, payload: Record<string, unknown>) {
    const raw = JSON.stringify({ agentId, payload, ts: Date.now() });
    return Buffer.from(raw).toString('base64url');
  }

  static parseResumeToken(resumeToken?: string) {
    if (!resumeToken) return undefined;
    try {
      const json = Buffer.from(resumeToken, 'base64url').toString('utf8');
      return JSON.parse(json) as Record<string, unknown>;
    } catch (error) {
      return undefined;
    }
  }

  static hashContext(context: unknown) {
    const json = JSON.stringify(context);
    return crypto.createHash('sha256').update(json).digest('base64url');
  }
}

export const defaultCostGuard = new CostGuard();
