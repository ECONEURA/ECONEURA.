import type { JSONSchemaType } from 'ajv';
import type { NeuraRequestV1, NeuraLimits } from './types.js';

/**
 * JSON Schema para validación AJV de requests ECONEURA
 */

const limitsSchema: JSONSchemaType<NeuraLimits> = {
  type: 'object',
  properties: {
    maxPromptTokens: { type: 'number', minimum: 1 },
    maxCompletionTokens: { type: 'number', minimum: 1 },
    costCapEUR: { type: 'number', minimum: 0 },
    timeoutMs: {
      type: 'object',
      properties: {
        total: { type: 'number', minimum: 1000 },
        llm: { type: 'number', minimum: 500 },
        tool: { type: 'number', minimum: 500 },
      },
      required: ['total', 'llm', 'tool'],
    },
  },
  required: ['maxPromptTokens', 'maxCompletionTokens', 'costCapEUR', 'timeoutMs'],
};

export const neuraRequestSchema: JSONSchemaType<NeuraRequestV1> = {
  type: 'object',
  properties: {
    version: { type: 'string', const: '1.0' },
    agentId: { type: 'string', minLength: 1 },
    departmentId: { type: 'string', nullable: true },
    userId: { type: 'string', minLength: 1 },
    message: { type: 'string', minLength: 1 },
    metadata: { type: 'object', nullable: true, required: [] },
    limits: limitsSchema,
    idempotencyKey: { type: 'string', minLength: 1 },
    resumeToken: { type: 'string', nullable: true },
    mode: { type: 'string', enum: ['invoke', 'stream', 'task'], nullable: true },
    allowTools: { type: 'boolean', nullable: true },
    preferredRoute: { type: 'string', enum: ['azure', 'local', 'auto'], nullable: true },
  },
  required: ['version', 'agentId', 'userId', 'message', 'limits', 'idempotencyKey'],
};
