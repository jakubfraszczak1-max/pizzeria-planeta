import { setConfigOverrides, clearConfigOverrides } from './config.js';
import { initAdminMenuEditor, refreshAdminMenuEditor } from './admin-menu.js';
import { buildGithubContentsPayload, getDefaultGithubRepo } from './github-sync.js';

const PASS = 'admin';

const loginEl = document.getElementById('login');
const panelEl = document.getElementById('panel');
const passInput = document.getElementById('admin-pass');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const configArea = document.getElementById('config-json');
const menuArea = document.getElementById('menu-json');
const downloadBtn = document.getElementById('download-btn');
const clearBtn = document.getElementById('clear-btn');
const saveRepoBtn = document.getElementById('save-repo-btn');
const saveTokenBtn = document.getElementById('save-token-btn');
const githubTokenInput = document.getElementById('github-token');

async function showPanel() {
  loginEl.style.display = 'none';
  panelEl.style.display = 'block';
  await loadFiles();
  initAdminMenuEditor();
  loadStoredToken();
}

function hidePanel() {
  loginEl.style.display = 'block';
  panelEl.style.display = 'none';
}

loginBtn.addEventListener('click', async () => {
  if (passInput.value === PASS) {
    await showPanel();
  } else {
    alert('Niepoprawne hasło');
  }
});

logoutBtn.addEventListener('click', () => {
  hidePanel();
  passInput.value = '';
});

function loadStoredToken() {
  const token = localStorage.getItem('github_token') || '';
  if (githubTokenInput) githubTokenInput.value = token;
  return token;
}

saveTokenBtn?.addEventListener('click', () => {
  const token = githubTokenInput?.value?.trim() || '';
  if (!token) {
    alert('Wpisz token GitHub');
    return;
  }
  localStorage.setItem('github_token', token);
  alert('Token zapisany lokalnie w tej przeglądarce.');
});

async function loadFiles() {
  try {
    const [cfgRes, menuRes] = await Promise.all([
      fetch('data/config.json', { cache: 'no-store' }),
      fetch('data/menu.json', { cache: 'no-store' })
    ]);

    const cfg = cfgRes.ok ? await cfgRes.json() : {};
    const menu = menuRes.ok ? await menuRes.json() : {};

    configArea.value = JSON.stringify(cfg, null, 2);
    menuArea.value = JSON.stringify(menu, null, 2);
    setConfigOverrides({ site: cfg, menu });
    refreshAdminMenuEditor();
  } catch (err) {
    console.error(err);
    configArea.value = '{}';
    menuArea.value = '{}';
  }
}

saveRepoBtn?.addEventListener('click', async () => {
  try {
    const site = JSON.parse(configArea.value);
    const menu = JSON.parse(menuArea.value);
    const repo = getDefaultGithubRepo();

    const configPayload = buildGithubContentsPayload(JSON.stringify(site, null, 2), 'Aktualizacja config.json z panelu admina');
    const menuPayload = buildGithubContentsPayload(JSON.stringify(menu, null, 2), 'Aktualizacja menu.json z panelu admina');

    const token = loadStoredToken() || prompt('Wklej token GitHub z uprawnieniami repo');
    if (!token) return;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json'
    };

    const configRes = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/docs/data/config.json?ref=${repo.branch}`, {
      method: 'GET',
      headers
    });
    const configFile = await configRes.json();
    await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/docs/data/config.json`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ...configPayload,
        sha: configFile.sha,
        branch: repo.branch
      })
    });

    const menuRes = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/docs/data/menu.json?ref=${repo.branch}`, {
      method: 'GET',
      headers
    });
    const menuFile = await menuRes.json();
    await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/docs/data/menu.json`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        ...menuPayload,
        sha: menuFile.sha,
        branch: repo.branch
      })
    });

    setConfigOverrides({ site, menu });
    alert('Zmiany zapisane w repozytorium i zastosowane globalnie.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  } catch (err) {
    console.error(err);
    alert('Nie udało się zapisać zmian w repozytorium: ' + err.message);
  }
});

downloadBtn.addEventListener('click', () => {
  const cfgBlob = new Blob([configArea.value], { type: 'application/json' });
  const menuBlob = new Blob([menuArea.value], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(cfgBlob);
  a.download = 'config.json';
  a.click();
  URL.revokeObjectURL(a.href);

  const b = document.createElement('a');
  b.href = URL.createObjectURL(menuBlob);
  b.download = 'menu.json';
  b.click();
  URL.revokeObjectURL(b.href);
});

clearBtn.addEventListener('click', () => {
  if (confirm('Usunąć lokalne nadpisania i przywrócić pliki z repo?')) {
    clearConfigOverrides();
    alert('Lokalne nadpisania usunięte. Odśwież stronę.');
    loadFiles();
  }
});

// Auto-show if already logged in (sessionStorage)
if (sessionStorage.getItem('admin_logged') === '1') {
  showPanel().catch(err => console.error(err));
}

// remember login for session
loginBtn.addEventListener('click', () => {
  if (passInput.value === PASS) sessionStorage.setItem('admin_logged', '1');
});
