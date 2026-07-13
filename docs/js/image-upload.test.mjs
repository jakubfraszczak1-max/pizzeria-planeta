import test from 'node:test';
import assert from 'node:assert/strict';

import { buildImageUploadPath, sanitizeImageFileName, uploadImageToGitHub } from './image-upload.js';

test('sanitizeImageFileName removes unsupported characters', () => {
  assert.equal(sanitizeImageFileName('My Pizza 🍕.jpg'), 'my-pizza.jpg');
});

test('buildImageUploadPath creates a repo-safe path under the uploads folder', () => {
  const path = buildImageUploadPath('My Pizza 🍕.jpg');
  assert.match(path, /^docs\/assets\/uploads\/\d{13}-my-pizza\.jpg$/);
});

test('uploadImageToGitHub preserves binary content for webp files', async () => {
  const bytes = Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  const file = new File([bytes], 'photo.webp', { type: 'image/webp' });
  let capturedBody;

  global.fetch = async (_url, options) => {
    capturedBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({ content: { download_url: 'https://example.com/photo.webp' } })
    };
  };

  await uploadImageToGitHub({
    file,
    token: 'test-token',
    repo: { owner: 'test-owner', repo: 'test-repo' },
    branch: 'main',
    onProgress: () => {}
  });

  assert.equal(typeof capturedBody.content, 'string');
  assert.deepEqual(Buffer.from(capturedBody.content, 'base64'), Buffer.from(bytes));
});
