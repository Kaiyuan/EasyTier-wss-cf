import { sharedScript } from './shared.js';
import { authScript } from './auth.js';
import { dashboardScript } from './dashboard.js';
import { tokensSettingsScript } from './tokens-settings.js';
import { bootScript } from './boot.js';
import { dashboardCss } from './style.css.js';

const assets = {
  'shared.js': sharedScript,
  'auth.js': authScript,
  'dashboard.js': dashboardScript,
  'tokens-settings.js': tokensSettingsScript,
  'boot.js': bootScript,
  'style.css': dashboardCss,
};

// Content-hash versions let the browser cache assets indefinitely (immutable)
// while still picking up new builds: the URL changes whenever content changes.
// This removes ~7 requests per panel load after the first visit.
function contentHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

const assetVersions = {};
for (const [name, content] of Object.entries(assets)) {
  assetVersions[name] = contentHash(content);
}

export function getAdminAsset(name) {
  return assets[name] || null;
}

export function versionedAssetPath(name) {
  const version = assetVersions[name];
  return '/assets/admin/' + name + (version ? '?v=' + version : '');
}
