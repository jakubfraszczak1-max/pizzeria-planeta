import test from 'node:test';
import assert from 'node:assert/strict';

import { loadConfig } from './config.js';

test('loadConfig falls back to embedded data when fetch fails', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('offline');
  };

  try {
    const result = await loadConfig();
    assert.ok(result.siteConfig?.restaurant?.name);
    assert.ok(Array.isArray(result.menuData?.categories));
    assert.ok(result.menuData.categories.length > 0);
  } finally {
    global.fetch = originalFetch;
  }
});
