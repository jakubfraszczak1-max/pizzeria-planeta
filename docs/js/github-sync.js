export function buildGithubContentsPayload(content, message) {
  return {
    message,
    content: btoa(unescape(encodeURIComponent(content)))
  };
}

export function getDefaultGithubRepo() {
  return {
    owner: 'jakubfraszczak1-max',
    repo: 'pizzeria-planeta',
    branch: 'main'
  };
}
