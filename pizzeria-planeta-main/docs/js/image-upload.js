const DEFAULT_UPLOAD_DIR = 'docs/assets/uploads';

export function sanitizeImageFileName(fileName) {
  const original = String(fileName || '').normalize('NFKD');
  const match = original.match(/(\.[^.]+)$/);
  const extension = match ? match[1].toLowerCase() : '';
  const baseName = original.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'image';
  return `${baseName}${extension}` || 'image';
}

export function buildImageUploadPath(fileName) {
  const safeName = sanitizeImageFileName(fileName);
  const timestamp = Date.now();
  return `${DEFAULT_UPLOAD_DIR}/${timestamp}-${safeName}`;
}

export async function uploadImageToGitHub({ file, token, repo, branch, onProgress }) {
  if (!file) throw new Error('Brak pliku');
  if (!token) throw new Error('Brak tokena GitHub');

  const path = buildImageUploadPath(file.name);
  const content = await file.text();
  const base64Content = typeof btoa === 'function'
    ? btoa(unescape(encodeURIComponent(content)))
    : Buffer.from(content).toString('base64');

  const payload = {
    message: `Upload image ${file.name}`,
    content: base64Content,
    branch
  };

  onProgress?.({ stage: 'uploading', path });

  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nie udało się wgrać pliku: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return {
    path,
    downloadUrl: data.content?.download_url || data.download_url || '',
    htmlUrl: data.content?.html_url || data.html_url || ''
  };
}
