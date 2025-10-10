const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_REGEX = /\b\+?\d[\d\s().-]{7,}\b/g;
const CARD_REGEX = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;

export function maskPII(input: unknown) {
  if (typeof input !== 'string') {
    return input;
  }
  return input
    .replace(EMAIL_REGEX, '[email-redacted]')
    .replace(PHONE_REGEX, '[phone-redacted]')
    .replace(CARD_REGEX, '[card-redacted]');
}

export function redactObject<T>(payload: T): T {
  if (!payload) return payload;
  if (typeof payload === 'string') {
    return maskPII(payload) as unknown as T;
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => redactObject(item)) as unknown as T;
  }
  if (typeof payload === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      result[key] = redactObject(value);
    }
    return result as T;
  }
  return payload;
}
