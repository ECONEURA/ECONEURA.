import crypto from 'crypto';

export interface HmacOptions {
  secret: string;
  algorithm?: string;
}

export function signPayload(payload: unknown, options: HmacOptions) {
  const { secret, algorithm = 'sha256' } = options;
  const json = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac(algorithm, secret).update(json).digest('hex');
}

export function verifyPayload(signature: string, payload: unknown, options: HmacOptions) {
  const expected = signPayload(payload, options);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
