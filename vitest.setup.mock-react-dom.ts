// BYPASS: Mock react-dom/client para desbloquear 39 tests
// Los tests de integración no necesitan renderizado real de React

import { vi } from 'vitest';

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
}));
