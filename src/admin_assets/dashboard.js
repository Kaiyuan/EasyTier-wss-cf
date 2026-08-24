export const dashboardScript = String.raw`
(function () {
  window.EasyTierAdmin = window.EasyTierAdmin || {};
  const api = window.EasyTierAdmin;

  api.switchTab = function switchTab(tabId, el) {
    document.querySelectorAll('.menu-item').forEach((item) => item.classList.remove('active'));
    if (el) el.classList.add('active');
    document.querySelectorAll('.tab-content').forEach((tab) => tab.classList.remove('active'));
    const title = el && el.querySelector('span') ? el.querySelector('span').innerText : '';
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.innerText = title;
    document.getElementById('tabOverview').classList.add('active');
    api.loadEasyTierConfigs();
  };

  api.startPolling = function startPolling() {
    clearInterval(window.statsInterval);
    window.countdown = 5;
    window.statsInterval = setInterval(() => {
      window.countdown--;
      if (window.countdown <= 0) {
        window.countdown = 5;
        api.loadStats();
      }
      api.updateCountdownText();
    }, 1000);
  };

  api.loadStats = async function loadStats() {
    try {
      const res = await fetch('/api/rooms', {
        headers: { 'Authorization': 'Bearer ' + window.token, 'X-Admin-Token': window.token }
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      window.globalStats.rooms = data.rooms || [];
      window.globalStats.totalPeers = 0;
      window.globalStats.totalRx = 0;
      window.globalStats.totalTx = 0;

      const roomDetails = await Promise.all(window.globalStats.rooms.map(async (room) => {
        const detailRes = await fetch('/api/rooms/' + encodeURIComponent(room.roomId) + '/stats', {
          headers: { 'Authorization': 'Bearer ' + window.token, 'X-Admin-Token': window.token }
        });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          return Object.assign({}, room, { peers: detail.peers || [] });
        }
        return Object.assign({}, room, { peers: [] });
      }));

      roomDetails.forEach((room) => {
        window.globalStats.totalPeers += room.peers.length;
        room.peers.forEach((peer) => {
          window.globalStats.totalRx += peer.rxBytes || 0;
          window.globalStats.totalTx += peer.txBytes || 0;
        });
      });

      const statOnline = document.getElementById('statOnline');
      const statActiveRooms = document.getElementById('statActiveRooms');
      const statConnectedPeers = document.getElementById('statConnectedPeers');
      const statTotalTraffic = document.getElementById('statTotalTraffic');
      if (statOnline) statOnline.innerText = translations[window.currentLang]['stat-online'];
      if (statActiveRooms) statActiveRooms.innerText = window.globalStats.rooms.length;
      if (statConnectedPeers) statConnectedPeers.innerText = window.globalStats.totalPeers;
      if (statTotalTraffic) statTotalTraffic.innerText = api.formatBytes(window.globalStats.totalRx) + ' / ' + api.formatBytes(window.globalStats.totalTx);

      const refreshText = document.getElementById('refreshText');
      if (refreshText) {
        refreshText.innerText = window.currentLang === 'zh-CN' ? '自动刷新中...' :
          window.currentLang === 'zh-TW' ? '自動重新整理中...' :
          window.currentLang === 'ja' ? '自動更新中...' :
          window.currentLang === 'ko' ? '자동 새로고침 중...' : 'Auto-refreshing...';
      }

      api.renderTopology(roomDetails.reduce((all, room) => all.concat(room.peers || []), []));

      if (window.activeSelectedRoomId) {
        const activeRoom = roomDetails.find((room) => room && room.roomId === window.activeSelectedRoomId);
        if (activeRoom) api.renderPeersTable(activeRoom.peers || []);
      }
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  api.renderTopology = function renderTopology(peers) {
    const svg = document.getElementById('topoSvg');
    const empty = document.getElementById('topoEmptyText');
    if (!svg || !empty) return;
    svg.innerHTML = '';
    if (!peers || peers.length === 0) {
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 520;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    const centerX = width / 2;
    const centerY = height / 2;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = '<radialGradient id="serverGradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#818cf8" /><stop offset="100%" stop-color="#4f46e5" /></radialGradient>' +
      '<radialGradient id="peerGradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#34d399" /><stop offset="100%" stop-color="#059669" /></radialGradient>';
    svg.appendChild(defs);
    const serverNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    serverNode.setAttribute('cx', centerX);
    serverNode.setAttribute('cy', centerY);
    serverNode.setAttribute('r', '36');
    serverNode.setAttribute('fill', 'url(#serverGradient)');
    serverNode.setAttribute('style', 'filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.6));');
    svg.appendChild(serverNode);
    const serverLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    serverLabel.setAttribute('x', centerX);
    serverLabel.setAttribute('y', centerY + 60);
    serverLabel.setAttribute('fill', '#f3f4f6');
    serverLabel.setAttribute('font-size', '12px');
    serverLabel.setAttribute('text-anchor', 'middle');
    serverLabel.textContent = 'WSS RELAY';
    svg.appendChild(serverLabel);
    const radius = Math.min(width, height) / 2 - 70;
    peers.forEach((peer, index) => {
      const angle = (index / peers.length) * Math.PI * 2 - Math.PI / 2;
      const peerX = centerX + Math.cos(angle) * radius;
      const peerY = centerY + Math.sin(angle) * radius;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', peerX);
      line.setAttribute('y2', peerY);
      line.setAttribute('stroke', 'rgba(96, 165, 250, 0.25)');
      line.setAttribute('stroke-width', '1.5');
      svg.appendChild(line);
      const peerNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      peerNode.setAttribute('cx', peerX);
      peerNode.setAttribute('cy', peerY);
      peerNode.setAttribute('r', '10');
      peerNode.setAttribute('fill', 'url(#peerGradient)');
      peerNode.setAttribute('style', 'cursor: pointer; filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.5));');
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = 'Peer ID: ' + peer.peerId + '\nHostname: ' + (peer.hostname || 'N/A') + '\nIP: ' + (peer.ipv4Addr || 'N/A');
      peerNode.appendChild(title);
      svg.appendChild(peerNode);
    });
  };

  api.loadRooms = function loadRooms() {
    api.renderRoomsTable();
  };

  api.renderRoomsTable = function renderRoomsTable() {
    const body = document.getElementById('roomsTableBody');
    if (!body) return;
    body.innerHTML = '';
    if (window.globalStats.rooms.length === 0) {
      body.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">' + (translations[window.currentLang]['rooms-empty'] || 'No active rooms. Connect a client to start.') + '</td></tr>';
      return;
    }
    window.globalStats.rooms.forEach((room) => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td style="font-weight: 600; color: #ffffff;">' + room.roomId + '</td>' +
        '<td><span class="badge-status badge-success">' + room.peerCount + '</span></td>' +
        '<td style="white-space: nowrap;">' +
        '<button type="button" class="btn-action" onclick="EasyTierAdmin.copyRoomWsUrl(' + JSON.stringify(room.roomId) + ')"><i data-lucide="copy" style="width: 14px; height: 14px;"></i> ' + translations[window.currentLang]['action-copy-wss'] + '</button> ' +
        '<button type="button" class="btn-action" onclick="EasyTierAdmin.viewRoomPeers(' + JSON.stringify(room.roomId) + ')"><i data-lucide="eye" style="width: 14px; height: 14px;"></i> ' + translations[window.currentLang]['action-view'] + '</button></td>';
      body.appendChild(tr);
    });
    api.safeCreateIcons();
    if (typeof window.refreshTableLabels === 'function') window.refreshTableLabels();
  };

  api.viewRoomPeers = async function viewRoomPeers(roomId) {
    window.activeSelectedRoomId = roomId;
    const card = document.getElementById('roomPeersCard');
    const title = document.getElementById('roomPeersTitle');
    const body = document.getElementById('peersTableBody');
    if (card) card.style.display = 'block';
    const titleTpl = translations[window.currentLang]['room-peers-title'] || 'Room Peers — {room}';
    if (title) title.innerText = titleTpl.replace('{room}', roomId);
    if (body) body.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">' + (translations[window.currentLang]['loading'] || 'Loading...') + '</td></tr>';
    api.loadStats();
  };

  api.closeRoomPeers = function closeRoomPeers() {
    window.activeSelectedRoomId = null;
    const card = document.getElementById('roomPeersCard');
    if (card) card.style.display = 'none';
  };

  api.renderPeersTable = function renderPeersTable(peers) {
    const body = document.getElementById('peersTableBody');
    if (!body) return;
    body.innerHTML = '';
    if (!peers || peers.length === 0) {
      body.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">' + (translations[window.currentLang]['peers-empty'] || '') + '</td></tr>';
      return;
    }
    peers.forEach((peer) => {
      const duration = Math.floor((Date.now() - new Date(peer.connectedAt || Date.now()).getTime()) / 1000);
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      const timeString = (hours > 0 ? hours + 'h ' : '') + minutes + 'm ' + seconds + 's';
      const tr = document.createElement('tr');
      tr.innerHTML = '<td style="font-family: monospace; font-weight: 500;">' + peer.peerId + '</td>' +
        '<td style="color: var(--success); font-weight: 600;">' + (peer.ipv4Addr || 'Pending') + '</td>' +
        '<td>' + (peer.hostname || 'N/A') + '</td>' +
        '<td><span class="badge-status badge-warning" style="font-size: 0.75rem;">' + (peer.easytierVersion || 'N/A') + '</span></td>' +
        '<td style="font-size: 0.85rem;">' + api.formatBytes(peer.rxBytes) + ' / ' + api.formatBytes(peer.txBytes) + '</td>' +
        '<td>' + timeString + '</td>' +
        '<td><button class="btn-action btn-danger-action" onclick="EasyTierAdmin.kickPeer(' + JSON.stringify(peer.peerId) + ')"><i data-lucide="user-minus" style="width: 14px; height: 14px;"></i> ' + translations[window.currentLang]['action-kick'] + '</button></td>';
      body.appendChild(tr);
    });
    api.safeCreateIcons();
    if (typeof window.refreshTableLabels === 'function') window.refreshTableLabels();
  };

  api.copyRoomWsUrl = async function copyRoomWsUrl() {
    // EasyTier 客户端仅支持 scheme://host[:port]，房间/令牌无法通过 URL 携带；
    // 真实客户端固定接入 default 房间，鉴权依赖网络名 + 密码（或网络白名单）。
    const wssUrl = api.buildClientWsUrl();
    await api.copyWithToast(wssUrl, 'msg-copied');
  };

  api.kickPeer = async function kickPeer(peerId) {
    const tpl = translations[window.currentLang]['msg-kick-confirm'] || 'Kick peer {id}?';
    if (!confirm(tpl.replace('{id}', peerId))) return;
    try {
      const res = await fetch('/api/rooms/' + encodeURIComponent(window.activeSelectedRoomId) + '/kick?peerId=' + encodeURIComponent(peerId), {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + window.token, 'X-Admin-Token': window.token }
      });
      if (res.ok) {
        alert(translations[window.currentLang]['msg-kicked-success']);
        api.loadStats();
      }
    } catch (error) {
      console.error(error);
    }
  };
})();
`;
