export const authScript = String.raw`
(function () {
  window.EasyTierAdmin = window.EasyTierAdmin || {};
  const api = window.EasyTierAdmin;

  api.verifyToken = async function verifyToken() {
    const verifySeq = ++window.authCheckSeq;
    const tokenSnapshot = window.token;
    try {
      const res = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': 'Bearer ' + window.token,
          'X-Admin-Token': window.token
        }
      });
      if (verifySeq !== window.authCheckSeq || tokenSnapshot !== window.token) return;
      if (res.ok) {
        await api.ensureServerMeta();
        api.showDashboard();
      } else {
        api.showLogin();
      }
    } catch (error) {
      if (verifySeq !== window.authCheckSeq || tokenSnapshot !== window.token) return;
      api.showLogin();
    }
  };

  api.handleLogin = async function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('passwordInput').value;
    const loginSeq = ++window.authCheckSeq;
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (loginSeq !== window.authCheckSeq) return;
      if (res.ok && data.token) {
        window.token = data.token;
        localStorage.setItem('easytier_admin_token', window.token);
        await api.ensureServerMeta();
        // showDashboard() already loads stats, EasyTier configs and starts polling
        api.showDashboard();
        api.updateUI();
      } else {
        const loginError = document.getElementById('loginError');
        if (loginError) loginError.style.display = 'block';
      }
    } catch (error) {
      if (loginSeq !== window.authCheckSeq) return;
      const loginError = document.getElementById('loginError');
      if (loginError) loginError.style.display = 'block';
    }
  };

  api.handleLogout = function handleLogout() {
    window.authCheckSeq++;
    window.token = '';
    localStorage.removeItem('easytier_admin_token');
    api.showLogin();
  };
})();
`;
