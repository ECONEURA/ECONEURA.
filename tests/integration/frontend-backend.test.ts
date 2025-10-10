/**
 * Integration test: Frontend → Backend
 * Validates that the Cockpit can communicate with the Gateway
 */

describe('Frontend-Backend Integration', () => {
  const BACKEND_URL = 'http://localhost:8080';

  test('Backend health endpoint responds', async () => {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('service', 'econeura-minimal-gateway');
  });

  test('Backend invoke endpoint accepts requests', async () => {
    const payload = {
      message: 'Integration test message',
      userId: 'test-user-integration'
    };

    const response = await fetch(`${BACKEND_URL}/api/invoke/neura-1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'success');
    expect(data).toHaveProperty('agentId', 'neura-1');
    expect(data.input).toEqual(payload);
  });

  test('Backend handles CORS headers correctly', async () => {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  test('Backend returns 404 for unknown routes', async () => {
    const response = await fetch(`${BACKEND_URL}/api/nonexistent`);
    expect(response.status).toBe(404);
  });
});
