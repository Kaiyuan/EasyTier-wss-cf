export const sharedScript = String.raw`
(function () {
  window.EasyTierAdmin = window.EasyTierAdmin || {};
  const api = window.EasyTierAdmin;

  api.safeCreateIcons = function safeCreateIcons() {
    try {
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    } catch (error) {
      console.warn('Lucide icons failed to load:', error);
    }
  };

  api.switchLanguage = function switchLanguage(lang) {
    window.currentLang = lang;
    localStorage.setItem('easytier_admin_lang', lang);
    const loginLang = document.getElementById('loginLang');
    const dashboardLang = document.getElementById('dashboardLang');
    if (loginLang) loginLang.value = lang;
    if (dashboardLang) dashboardLang.value = lang;
    api.updateUI();
  };

  api.updateLanguagePickerLabels = function updateLanguagePickerLabels() {
    if (typeof languageNames === 'undefined') return;
    document.querySelectorAll('.top-lang-select option').forEach((option) => {
      const label = languageNames[option.value];
      if (label) option.textContent = label;
    });
  };

  api.updateLoginUI = function updateLoginUI() {
    if (typeof loginCopy === 'undefined') return;
    const copy = loginCopy[window.currentLang] || loginCopy.en;
    if (!copy) return;
    const loginTitle = document.getElementById('loginTitle');
    const loginHint = document.getElementById('loginHint');
    const passwordLabel = document.querySelector('label[for="passwordInput"]');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.querySelector('#loginScreen button[type="submit"]');
    const loginError = document.getElementById('loginError');
    if (loginTitle) loginTitle.textContent = copy.title;
    if (loginHint) loginHint.textContent = copy.hint;
    if (passwordLabel) passwordLabel.textContent = copy.label;
    if (passwordInput) passwordInput.setAttribute('placeholder', copy.placeholder);
    if (loginButton) {
      const icon = loginButton.querySelector('i');
      loginButton.textContent = '';
      if (icon) loginButton.appendChild(icon);
      loginButton.appendChild(document.createTextNode(' ' + copy.button));
    }
    if (loginError) loginError.textContent = copy.error;
  };

  api.updateCountdownText = function updateCountdownText() {
    const refreshText = document.getElementById('refreshText');
    if (!refreshText) return;
    if (window.isPollingPaused) {
      refreshText.innerText = window.currentLang === 'zh-CN' ? '已暂停' :
        window.currentLang === 'zh-TW' ? '已暫停' :
        window.currentLang === 'ja' ? '一時停止' :
        window.currentLang === 'ko' ? '일시 중지됨' : 'Paused';
      return;
    }
    const text = window.currentLang === 'zh-CN' ? ('自动刷新 ' + window.countdown + ' 秒内') :
      window.currentLang === 'zh-TW' ? ('自動重新整理 ' + window.countdown + ' 秒內') :
      window.currentLang === 'ja' ? (window.countdown + '秒で自動更新') :
      window.currentLang === 'ko' ? (window.countdown + '초 뒤 새로고침') :
      ('Auto-refresh in ' + window.countdown + 's');
    refreshText.innerText = text;
  };

  api.formatBytes = function formatBytes(bytes) {
    if (!bytes || isNaN(bytes)) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
    return parseFloat((bytes / Math.pow(k, index)).toFixed(2)) + ' ' + sizes[index];
  };

  api.getWsPath = function getWsPath() {
    return window.serverWsPath || 'ws';
  };

  api.ensureServerMeta = async function ensureServerMeta() {
    if (window.serverWsPath && typeof window.serverRequireToken === 'boolean') return;
    if (!window.token) return;
    try {
      const res = await fetch('/api/config', {
        headers: { 'Authorization': 'Bearer ' + window.token, 'X-Admin-Token': window.token }
      });
      if (res.ok) {
        const data = await res.json();
        window.serverWsPath = data.wsPath || 'ws';
        window.serverRequireToken = !!data.requireToken;
      }
    } catch (error) {
      console.warn('Failed to load server meta', error);
    }
  };

  api.buildClientWsUrl = function buildClientWsUrl() {
    const url = new URL(location.origin);
    const proto = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const isDefaultPort =
      (proto === 'ws:' && url.port === '80') || (proto === 'wss:' && url.port === '443');
    const port = url.port && !isDefaultPort ? ':' + url.port : '';
    return proto + '//' + url.hostname + port;
  };

  api.buildTestWsUrl = function buildTestWsUrl(roomId, clientToken) {
    const wsPath = api.getWsPath().replace(/^\/+/, '').replace(/\/+$/, '') || 'ws';
    const url = new URL(api.buildClientWsUrl());
    url.pathname = '/' + wsPath;
    url.search = '';
    url.hash = '';
    url.searchParams.set('room', String(roomId || 'default').trim() || 'default');
    if (clientToken && clientToken.trim()) {
      url.searchParams.set('token', clientToken.trim());
    }
    return url.toString();
  };

  api.copyText = async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('copy failed', error);
      return false;
    }
  };

  api.t = function t(key, fallback) {
    const pack = (typeof translations !== 'undefined' && translations[window.currentLang]) || (typeof translations !== 'undefined' && translations.en) || {};
    return pack[key] || (typeof translations !== 'undefined' && translations.en && translations.en[key]) || fallback || '';
  };

  api.copyWithToast = async function copyWithToast(text, successKey) {
    const ok = await api.copyText(text);
    if (ok) {
      const msg = api.t(successKey || 'msg-copied', 'Copied to clipboard.');
      api.showToast(msg);
    }
    return ok;
  };

  api.showToast = function showToast(message) {
    let toast = document.getElementById('adminToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'adminToast';
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(api._toastTimer);
    api._toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  };

  api.copyRelayUrl = async function copyRelayUrl() {
    const url = api.buildClientWsUrl();
    await api.copyWithToast(url, 'msg-copied');
  };

  api.toggleMobileSidebar = function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  };

  api.closeMobileSidebar = function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  };

  api.updateUI = function updateUI() {
    if (typeof translations === 'undefined') return;
    const t = translations[window.currentLang] || translations.en || {};
    document.title = (t['menu-overview'] || 'Overview') + ' - EasyTier Relay Admin';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!t[key]) return;
      if (el.tagName === 'BUTTON') {
        const icon = el.querySelector('i');
        el.textContent = '';
        if (icon) el.appendChild(icon);
        el.appendChild(document.createTextNode(' ' + t[key]));
      } else {
        el.innerText = t[key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) el.setAttribute('placeholder', t[key]);
    });
    const activeMenu = document.querySelector('.menu-item.active');
    if (activeMenu) {
      const span = activeMenu.querySelector('span');
      const pageTitle = document.getElementById('pageTitle');
      if (span && pageTitle) pageTitle.innerText = span.innerText;
    }
    api.updateCountdownText();
    api.updateLanguagePickerLabels();
    api.updateLoginUI();
    if (typeof window.refreshTableLabels === 'function') {
      window.refreshTableLabels();
    }
    api.safeCreateIcons();
  };

  api.showLogin = function showLogin() {
    const loginScreen = document.getElementById('loginScreen');
    const appLayout = document.getElementById('appLayout');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (appLayout) {
      appLayout.style.display = 'none';
      appLayout.style.opacity = 0;
    }
    if (window.statsInterval) clearInterval(window.statsInterval);
  };

  api.showDashboard = function showDashboard() {
    const loginScreen = document.getElementById('loginScreen');
    const appLayout = document.getElementById('appLayout');
    if (loginScreen) loginScreen.style.display = 'none';
    if (appLayout) {
      appLayout.style.display = 'flex';
      setTimeout(() => {
        appLayout.style.opacity = 1;
      }, 50);
    }
    
    // Update relay url displays
    const topRelayDisplay = document.getElementById('topRelayUrl');
    if (topRelayDisplay) topRelayDisplay.textContent = api.buildClientWsUrl();
    const wssTestUrl = document.getElementById('wssTestUrl');
    if (wssTestUrl) wssTestUrl.textContent = 'Relay: ' + api.buildClientWsUrl();

    api.loadStats && api.loadStats();
    api.loadEasyTierConfigs && api.loadEasyTierConfigs();
    api.startPolling && api.startPolling();
    api.safeCreateIcons();
  };
})();
`;
