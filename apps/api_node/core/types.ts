import { z } from 'zod';

/**
 * 📦 Neura Gateway Contracts (v1)
 *
 * Objetivo: contratos inmutables para requests/responses del gateway.
 * - Declaramos schemas Zod para validación runtime.
 * - Exportamos tipos TypeScript derivados para tipado estático.
 */

const idRegex = /^[a-z0-9-]{3,64}$/i;
const corrRegex = /^[a-z0-9-]{8,128}$/i;

export const NeuraRequestSchemaV1 = z.object({
  version: z.literal('v1'),
  agentId: z.string().regex(idRegex, 'agentId inválido'),
  userId: z.string().regex(idRegex, 'userId inválido'),
  input: z.union([
    z.string().min(1, 'input requerido'),
    z.object({}).passthrough()
  ]),
  context: z.object({}).passthrough().optional(),
  costCapEUR: z.number().min(0).max(100).default(5),
  idempotencyKey: z.string().regex(corrRegex, 'idempotencyKey inválido'),
  resumeToken: z.string().max(128).optional(),
  locale: z.string().max(10).optional(),
  metadata: z.object({}).passthrough().optional(),
  limits: z.object({
    maxTokens: z.number().int().min(256).max(8000).optional(),
    timeoutMs: z.number().int().min(1000).max(120000).optional(),
    toolTimeoutMs: z.number().int().min(1000).max(60000).optional(),
    overallTimeoutMs: z.number().int().min(2000).max(180000).optional()
  }).optional()
});

export const NeuraResponseSchemaV1 = z.object({
  version: z.literal('v1'),
  agentId: z.string().regex(idRegex),
  userId: z.string().regex(idRegex),
  correlationId: z.string().regex(corrRegex),
  output: z.string().optional(),
  resumeToken: z.string().optional(),
  events: z.array(z.object({
    type: z.string(),
    ts: z.string(),
    payload: z.object({}).passthrough()
  })).default([]),
  usage: z.object({
    promptTokens: z.number().int().min(0),
    completionTokens: z.number().int().min(0),
    totalTokens: z.number().int().min(0),
    costEUR: z.number().min(0)
  }),
  guardrails: z.object({
    costCapEUR: z.number().min(0),
    estimatedCostEUR: z.number().min(0),
    timeBudgetMs: z.number().int().min(0),
    hitlRequired: z.boolean()
  }),
  debug: z.object({}).passthrough().optional(),
  status: z.enum(['ok', 'hitl', 'failed', 'timeout', 'cancelled'])
});

export type NeuraRequestV1 = z.infer<typeof NeuraRequestSchemaV1>;
export type NeuraResponseV1 = z.infer<typeof NeuraResponseSchemaV1>;

export const NeuraSchemas = {
  request: NeuraRequestSchemaV1,
  response: NeuraResponseSchemaV1
};
