import test from 'node:test';
import assert from 'node:assert/strict';

import { buildImageUploadPath, sanitizeImageFileName } from './image-upload.js';

test('sanitizeImageFileName removes unsupported characters', () => {
  assert.equal(sanitizeImageFileName('My Pizza 🍕.jpg'), 'my-pizza.jpg');
});

test('buildImageUploadPath creates a repo-safe path under the uploads folder', () => {
  const path = buildImageUploadPath('My Pizza 🍕.jpg');
  assert.match(path, /^docs\/assets\/uploads\/\d{13}-my-pizza\.jpg$/);
});
