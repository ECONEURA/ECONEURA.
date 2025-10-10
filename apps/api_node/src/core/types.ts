import type { JSONSchemaType } from 'ajv';

export interface NeuraLimits {
  maxPromptTokens: number;
  maxCompletionTokens: number;
  costCapEUR: number;
  timeoutMs: {
    total: number;
    llm: number;
    tool: number;
  };
}

export interface NeuraRequestV1 {
  version: '1.0';
  agentId: string;
  departmentId?: string;
  userId: string;
  message: string;
  metadata?: Record<string, unknown>;
  limits: NeuraLimits;
  idempotencyKey: string;
  resumeToken?: string;
  mode?: 'invoke' | 'stream' | 'task';
  allowTools?: boolean;
  preferredRoute?: 'azure' | 'local' | 'auto';
}

export interface ToolExecutionSummary {
  name: string;
  type: 'make' | 'search' | 'finance' | 'custom';
  success: boolean;
  latencyMs: number;
  attempts: number;
  requestId?: string;
  errorMessage?: string;
  breakerState?: 'closed' | 'open' | 'half-open';
}

export interface VerifiedSource {
  name: string;
  url?: string;
  checksum: string;
  retrievedAt: string;
}

export interface HitlMetadata {
  required: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  reason?: string;
  resumeToken?: string;
}

export interface NeuraResponseV1 {
  version: '1.0';
  agentId: string;
  userId: string;
  correlationId: string;
  status: 'success' | 'error' | 'hitl_required';
  output?: string;
  resumeToken?: string;
  streamCursor?: string;
  hitl?: HitlMetadata;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costEUR: number;
  };
  model?: {
    id: string;
    tier: 'premium' | 'economy' | 'deep-reasoning' | 'deep-reasoning-lite';
    reason: string;
    complexity?: number | null;
    trigger?: string | null;
  };
  diagnostics?: {
    startedAt: string;
    completedAt?: string;
    durationMs?: number;
    checkpoints?: string[];
    warnings?: string[];
    checksum?: string;
    sources?: VerifiedSource[];
    tools?: ToolExecutionSummary[];
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export const DEFAULT_LIMITS: NeuraLimits = {
  maxPromptTokens: 6000,
  maxCompletionTokens: 4000,
  costCapEUR: 0.05,
  timeoutMs: {
    total: 180000,
    llm: 120000,
    tool: 45000
  }
};

export const NeuraRequestSchema: JSONSchemaType<NeuraRequestV1> = {
  $id: 'https://econeura.ai/schemas/neura-request-v1.json',
  type: 'object',
  properties: {
    version: { type: 'string', const: '1.0' },
    agentId: { type: 'string', minLength: 3 },
    departmentId: { type: 'string', nullable: true, minLength: 2 },
    userId: { type: 'string', minLength: 1 },
    message: { type: 'string', minLength: 1 },
    metadata: {
      type: 'object',
      nullable: true,
      required: [],
      additionalProperties: true
    },
    limits: {
      type: 'object',
      properties: {
        maxPromptTokens: { type: 'integer', minimum: 1 },
        maxCompletionTokens: { type: 'integer', minimum: 1 },
        costCapEUR: { type: 'number', minimum: 0 },
        timeoutMs: {
          type: 'object',
          properties: {
            total: { type: 'integer', minimum: 1000 },
            llm: { type: 'integer', minimum: 1000 },
            tool: { type: 'integer', minimum: 1000 }
          },
          required: ['total', 'llm', 'tool'],
          additionalProperties: false
        }
      },
      required: ['maxPromptTokens', 'maxCompletionTokens', 'costCapEUR', 'timeoutMs'],
      additionalProperties: false
    },
    idempotencyKey: { type: 'string', minLength: 8 },
    resumeToken: { type: 'string', nullable: true, minLength: 8 },
    mode: { type: 'string', nullable: true, enum: ['invoke', 'stream', 'task'] },
    allowTools: { type: 'boolean', nullable: true },
    preferredRoute: { type: 'string', nullable: true, enum: ['azure', 'local', 'auto'] }
  },
  required: ['version', 'agentId', 'userId', 'message', 'limits', 'idempotencyKey'],
  additionalProperties: false
};

export const NeuraResponseSchema: JSONSchemaType<NeuraResponseV1> = {
  $id: 'https://econeura.ai/schemas/neura-response-v1.json',
  type: 'object',
  properties: {
    version: { type: 'string', const: '1.0' },
    agentId: { type: 'string' },
    userId: { type: 'string' },
    correlationId: { type: 'string' },
    status: { type: 'string', enum: ['success', 'error', 'hitl_required'] },
    output: { type: 'string', nullable: true },
    resumeToken: { type: 'string', nullable: true },
    streamCursor: { type: 'string', nullable: true },
    hitl: {
      type: 'object',
      nullable: true,
      properties: {
        required: { type: 'boolean' },
        status: { type: 'string', nullable: true, enum: ['pending', 'approved', 'rejected', 'expired'] },
        expiresAt: { type: 'string', nullable: true },
        approvedBy: { type: 'string', nullable: true },
        approvedAt: { type: 'string', nullable: true },
        reason: { type: 'string', nullable: true },
        resumeToken: { type: 'string', nullable: true }
      },
      required: ['required'],
      additionalProperties: false
    },
    usage: {
      type: 'object',
      nullable: true,
      properties: {
        promptTokens: { type: 'integer' },
        completionTokens: { type: 'integer' },
        totalTokens: { type: 'integer' },
        costEUR: { type: 'number' }
      },
      required: ['promptTokens', 'completionTokens', 'totalTokens', 'costEUR'],
      additionalProperties: false
    },
    model: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string' },
        tier: { type: 'string', enum: ['premium', 'economy', 'deep-reasoning', 'deep-reasoning-lite'] },
        reason: { type: 'string' },
        complexity: { type: 'number', nullable: true },
        trigger: { type: 'string', nullable: true }
      },
      required: ['id', 'tier', 'reason'],
      additionalProperties: false
    },
    diagnostics: {
      type: 'object',
      nullable: true,
      properties: {
        startedAt: { type: 'string' },
        completedAt: { type: 'string', nullable: true },
        durationMs: { type: 'integer', nullable: true },
        checkpoints: {
          type: 'array',
          nullable: true,
          items: { type: 'string' }
        },
        warnings: {
          type: 'array',
          nullable: true,
          items: { type: 'string' }
        },
        checksum: { type: 'string', nullable: true },
        sources: {
          type: 'array',
          nullable: true,
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              url: { type: 'string', nullable: true },
              checksum: { type: 'string' },
              retrievedAt: { type: 'string' }
            },
            required: ['name', 'checksum', 'retrievedAt'],
            additionalProperties: false
          }
        },
        tools: {
          type: 'array',
          nullable: true,
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string', enum: ['make', 'search', 'finance', 'custom'] },
              success: { type: 'boolean' },
              latencyMs: { type: 'integer' },
              attempts: { type: 'integer' },
              requestId: { type: 'string', nullable: true },
              errorMessage: { type: 'string', nullable: true },
              breakerState: { type: 'string', nullable: true, enum: ['closed', 'open', 'half-open'] }
            },
            required: ['name', 'type', 'success', 'latencyMs', 'attempts'],
            additionalProperties: false
          }
        }
      },
      required: ['startedAt'],
      additionalProperties: false
    },
    error: {
      type: 'object',
      nullable: true,
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        retryable: { type: 'boolean' }
      },
      required: ['code', 'message', 'retryable'],
      additionalProperties: false
    }
  },
  required: ['version', 'agentId', 'userId', 'correlationId', 'status'],
  additionalProperties: false
};

export const NeuraSchemas = {
  request: NeuraRequestSchema,
  response: NeuraResponseSchema
};
