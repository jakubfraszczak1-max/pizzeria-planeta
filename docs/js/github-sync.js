export function buildGithubContentsPayload(content, message) {
  return {
    message,
    content: btoa(unescape(encodeURIComponent(content)))
  };
}

export function getDefaultGithubRepo() {
  return {
    owner: 'AtomeXxxx',
    repo: 'pizzeria-planeta',
    branch: 'main'
  };
}
