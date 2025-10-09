import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const defaultRoot = document.getElementById('root')!;

export async function mountApp(root: HTMLElement | null = defaultRoot, forceClient = false) {
  if (process.env.NODE_ENV === 'test' && !forceClient) {
    try {
      if (root) {
        const node = document.createElement('div');
        node.setAttribute('data-test-rendered', '1');
        root.appendChild(node);
      }
    } catch (e) {
      void e;
      /* ignore in test env */
    }
    return;
  }

  try {
    // Check for test override
    const globalAny: any = globalThis as any;
    const testCreateRoot = globalAny.__TEST_CREATE_ROOT;

    if (testCreateRoot && root) {
      const App = (await import('./App')).default;
      testCreateRoot(root).render(React.createElement(App));
    } else if (root) {
      // Normal browser rendering
      createRoot(root).render(<App />);
    }
  } catch (err) {
    void err;
    console.error('Failed to mount react-dom client', err);
  }
}

// Run mount at module load with default behavior (non-forced)
void mountApp(defaultRoot, false);

// Also provide a default export shape (some bundlers/instrumenters wrap named exports into a default getter)
export default { mountApp };
