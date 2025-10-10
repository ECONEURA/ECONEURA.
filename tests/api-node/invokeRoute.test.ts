import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const ROUTE_PATH = '../../apps/api_node/routes/invoke.js';
const MAKE_SERVICE_PATH = '../../apps/api_node/services/makeService.js';
const OPENAI_SERVICE_PATH = '../../apps/api_node/services/openaiService.js';

async function buildApp() {
  const module = await import(ROUTE_PATH);
  const invokeRouter = module.default || module;

  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.correlationId = 'test-correlation';
    next();
  });
  app.use('/api/invoke', invokeRouter);
  return app;
}

describe('POST /api/invoke/:agentId', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('devuelve metadata extendida para agentes Make', async () => {
    const invokeMakeAgent = vi.fn(async () => ({
      result: { ok: true },
      _meta: {
        attempts: 2,
        breakerState: 'half-open',
        diagnostics: [{ attempt: 1 }],
        replayed: false,
        idempotencyKey: 'explicit-key'
      }
    }));

    vi.doMock(MAKE_SERVICE_PATH, () => ({ invokeMakeAgent }));
    vi.doMock(OPENAI_SERVICE_PATH, () => ({ invokeOpenAIAgent: vi.fn() }));

    const app = await buildApp();

    const response = await request(app)
      .post('/api/invoke/a-ceo-01')
      .set('Idempotency-Key', 'idempotent-12345678')
      .send({ input: 'ping' });

    expect(response.status).toBe(200);
    expect(response.body.idempotencyKey).toBe('idempotent-12345678');
    expect(response.body.attempts).toBe(2);
    expect(response.body.breakerState).toBe('half-open');
    expect(response.body.toolDiagnostics).toHaveLength(1);
    expect(response.body.result).toEqual({ ok: true });
  });

  it('mapea errores de Make a códigos HTTP específicos', async () => {
    const makeError = new Error('Circuit open');
    // @ts-expect-error inyectar código para test
    makeError.code = 'CIRCUIT_OPEN';
    makeError.diagnostics = { breaker: 'open' };

    vi.doMock(MAKE_SERVICE_PATH, () => ({
      invokeMakeAgent: vi.fn(async () => {
        throw makeError;
      })
    }));
    vi.doMock(OPENAI_SERVICE_PATH, () => ({ invokeOpenAIAgent: vi.fn() }));

    const app = await buildApp();

    const response = await request(app)
      .post('/api/invoke/a-ceo-01')
      .send({ input: 'ping' });

    expect(response.status).toBe(503);
    expect(response.body.error).toBe('CIRCUIT_OPEN');
    expect(response.body.retryable).toBe(true);
    expect(response.body.diagnostics).toEqual({ breaker: 'open' });
  });
});
