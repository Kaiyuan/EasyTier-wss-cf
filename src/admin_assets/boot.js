export const bootScript = String.raw`
(function () {
  function initializeApp() {
    window.EasyTierAdmin = window.EasyTierAdmin || {};
    const api = window.EasyTierAdmin;

    if (!api.updateUI) {
      setTimeout(initializeApp, 50);
      return;
    }

    const browserLang = navigator.language || '';
    let initialLang = 'en';
    if (browserLang.startsWith('zh-CN') || browserLang.startsWith('zh-Hans')) {
      initialLang = 'zh-CN';
    } else if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK') || browserLang.startsWith('zh-Hant')) {
      initialLang = 'zh-TW';
    } else if (browserLang.startsWith('ja')) {
      initialLang = 'ja';
    } else if (browserLang.startsWith('ko')) {
      initialLang = 'ko';
    }

    const savedLang = localStorage.getItem('easytier_admin_lang');
    if (savedLang && typeof supportedLangs !== 'undefined' && supportedLangs.indexOf(savedLang) !== -1) {
      initialLang = savedLang;
    }

    window.currentLang = initialLang;
    window.token = localStorage.getItem('easytier_admin_token') || '';
    window.statsInterval = null;
    window.countdown = 5;
    window.globalStats = { rooms: [], totalPeers: 0, totalRx: 0, totalTx: 0 };
    window.activeSelectedRoomId = null;
    window.authCheckSeq = 0;
    window.easyTierConfigs = [];

    window.addEventListener('error', function (event) {
      console.error('Admin UI script error:', event.error || event.message);
    });

    const loginLang = document.getElementById('loginLang');
    const dashboardLang = document.getElementById('dashboardLang');
    if (loginLang) loginLang.value = window.currentLang;
    if (dashboardLang) dashboardLang.value = window.currentLang;

    api.updateUI();
    if (window.token) {
      api.verifyToken();
    } else {
      api.showLogin();
    }

    // Bind methods to window for HTML accessibility
    window.switchLanguage = api.switchLanguage;
    window.handleLogin = api.handleLogin;
    window.handleLogout = api.handleLogout;
    window.switchTab = api.switchTab;
    window.togglePolling = api.togglePolling;
    window.manualRefresh = api.manualRefresh;
    window.copyRelayUrl = api.copyRelayUrl;
    window.toggleMobileSidebar = api.toggleMobileSidebar;
    window.closeMobileSidebar = api.closeMobileSidebar;

    window.loadEasyTierConfigs = api.loadEasyTierConfigs;
    window.openEasyTierConfigModal = api.openEasyTierConfigModal;
    window.closeEasyTierConfigModal = api.closeEasyTierConfigModal;
    window.handleCreateEasyTierConfig = api.handleCreateEasyTierConfig;
    window.copyEasyTierCommand = api.copyEasyTierCommand;
    window.downloadEasyTierToml = api.downloadEasyTierToml;
    window.editEasyTierConfig = api.editEasyTierConfig;
    window.deleteEasyTierConfig = api.deleteEasyTierConfig;
    window.previewEasyTierConfig = api.previewEasyTierConfig;
    window.closeEasyTierPreviewModal = api.closeEasyTierPreviewModal;
    window.copyPreviewToml = api.copyPreviewToml;
    window.downloadPreviewToml = api.downloadPreviewToml;
    window.duplicateEasyTierConfig = api.duplicateEasyTierConfig;
    window.fillCurrentRelayIntoPeers = api.fillCurrentRelayIntoPeers;
    window.toggleSecretVisibility = api.toggleSecretVisibility;
    window.filterEasyTierConfigs = api.filterEasyTierConfigs;

    window.closeRoomPeers = api.closeRoomPeers;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
})();
`;
