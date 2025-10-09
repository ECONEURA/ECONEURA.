import React from 'react';
import EconeuraCockpit from './EconeuraCockpit';
import TestApp from './TestApp';
import SimpleEconeuraCockpit from './SimpleEconeuraCockpit';
// Conditionally render the Cockpit preview page when ?preview=cockpit is present
import CockpitPreviewPage from './pages/CockpitPreviewPage';

export default function App() {
  try {
    const params =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (params && params.get('preview') === 'cockpit') {
      return <CockpitPreviewPage />;
    }
    // Test mode
    if (params && params.get('test') === '1') {
      return <TestApp />;
    }
    // Simple mode
    if (params && params.get('simple') === '1') {
      return <SimpleEconeuraCockpit />;
    }
  } catch (_) {
    /* noop - render default */
  }
  return <EconeuraCockpit />;
}
