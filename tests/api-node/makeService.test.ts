import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const SERVICE_PATH = '../../apps/api_node/services/makeService.js';
const BRIDGE_PATH = '../../apps/api_node/services/generatorsBridge.js';

let executionPlan: Array<{ type: 'yield' | 'throw'; value?: any; error?: Error }> = [];
let resolveMock: ReturnType<typeof vi.fn>;

async function loadMakeService() {
  vi.resetModules();

  executionPlan = [];
  resolveMock = vi.fn(() => ({
    generator: {
      execute: async function* (_webhookId: string, _payload: Record<string, unknown>) {
        for (const step of executionPlan) {
          if (step.type === 'yield') {
            yield step.value;
            if (step.value?.status === 'success') {
              return;
            }
          } else if (step.type === 'throw') {
            throw step.error ?? new Error('execution plan error');
          }
        }
        throw new Error('execution plan exhausted');
      },
    },
    webhookId: 'hooks/test'
  }));

  vi.doMock(BRIDGE_PATH, () => ({ resolveMakeGenerator: resolveMock }));

  return import(SERVICE_PATH);
}

function pushSuccess(response: Record<string, unknown>, attempt = 1) {
  executionPlan.push({
    type: 'yield',
    value: {
      attempt,
      status: 'success',
      latencyMs: 12,
      breakerState: 'closed',
      response
    }
  });
}

function pushError(error: Error, attempt = 1) {
  executionPlan.push({
    type: 'yield',
    value: {
      attempt,
      status: 'error',
      latencyMs: 8,
      breakerState: 'open',
      error
    }
  });
  executionPlan.push({ type: 'throw', error });
}

describe('invokeMakeAgent', () => {
  beforeEach(() => {
    process.env.MAKE_HMAC_SECRET = 'secret';
  });

  afterEach(() => {
    delete process.env.MAKE_HMAC_SECRET;
  });

  it('returns metadata and caches idempotent responses', async () => {
    const { invokeMakeAgent } = await loadMakeService();

    pushSuccess({ ok: true });

    const payload = {
      input: 'hola',
      correlationId: 'cid-1',
      idempotencyKey: 'make-cache-123456',
      metadata: { foo: 'bar' }
    };

    const first = await invokeMakeAgent('a-ceo-01', payload);
    expect(first._meta?.replayed).toBe(false);
    expect(first._meta?.attempts).toBe(1);
    expect(first._meta?.idempotencyKey).toBe(payload.idempotencyKey);

    executionPlan.length = 0; // no nuevas ejecuciones
    const second = await invokeMakeAgent('a-ceo-01', payload);

    expect(second._meta?.replayed).toBe(true);
    expect(resolveMock).toHaveBeenCalledTimes(1);
  });

  it('propaga errores con diagnósticos cuando fallan los intentos', async () => {
    const { invokeMakeAgent } = await loadMakeService();

    const failure = new Error('Circuit open');
    // @ts-expect-error establecer code para test
    failure.code = 'CIRCUIT_OPEN';
    pushError(failure);

    await expect(
      invokeMakeAgent('a-ceo-01', {
        input: 'hola',
        correlationId: 'cid-2',
        idempotencyKey: 'make-error-987654'
      })
    ).rejects.toThrow('Circuit open');

    const lastCall = resolveMock.mock.results.at(-1)?.value as { webhookId: string };
    expect(lastCall?.webhookId).toBe('hooks/test');
  });
});
