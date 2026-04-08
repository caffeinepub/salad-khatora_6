/**
 * Utility functions for parsing and managing URL parameters
 * Works with both hash-based and browser-based routing
 */

export function getUrlParameter(paramName: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const regularParam = urlParams.get(paramName);
  if (regularParam !== null) return regularParam;

  const hash = window.location.hash;
  const queryStartIndex = hash.indexOf("?");
  if (queryStartIndex !== -1) {
    const hashParams = new URLSearchParams(hash.substring(queryStartIndex + 1));
    return hashParams.get(paramName);
  }
  return null;
}

export function storeSessionParameter(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function getSessionParameter(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function clearParamFromHash(paramName: string): void {
  if (!window.history.replaceState) return;
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return;
  const hashContent = hash.substring(1);
  const queryStartIndex = hashContent.indexOf("?");
  if (queryStartIndex === -1) return;
  const routePath = hashContent.substring(0, queryStartIndex);
  const params = new URLSearchParams(
    hashContent.substring(queryStartIndex + 1),
  );
  params.delete(paramName);
  const newQueryString = params.toString();
  const newHash = newQueryString ? `${routePath}?${newQueryString}` : routePath;
  const newUrl =
    window.location.pathname +
    window.location.search +
    (newHash ? `#${newHash}` : "");
  window.history.replaceState(null, "", newUrl);
}

export function getSecretParameter(paramName: string): string | null {
  const existing = getSessionParameter(paramName);
  if (existing !== null) return existing;

  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return null;
  const params = new URLSearchParams(hash.substring(1));
  const secret = params.get(paramName);
  if (secret) {
    storeSessionParameter(paramName, secret);
    clearParamFromHash(paramName);
    return secret;
  }
  return null;
}
