export const dashboardScript = String.raw`
(function () {
  window.EasyTierAdmin = window.EasyTierAdmin || {};
  const api = window.EasyTierAdmin;

  window.isPollingPaused = false;

  const TAB_DESCRIPTIONS = {
    overview: 'tab-overview-desc',
    configs: 'tab-configs-desc',
    rooms: 'tab-rooms-desc',
    tools: 'tab-tools-desc',
    settings: 'tab-settings-desc'
  };

  api.switchTab = function switchTab(tabId, el) {
    document.querySelectorAll('.menu-item').forEach((item) => item.classList.remove('active'));
    if (el) {
      el.classList.add('active');
    } else {
      const targetMenu = document.querySelector('.menu-item[data-tab="' + tabId + '"]');
      if (targetMenu) targetMenu.classList.add('active');
    }

    document.querySelectorAll('.tab-content').forEach((tab) => tab.classList.remove('active'));
    const targetTab = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
    if (targetTab) {
      targetTab.classList.add('active');
    }

    const titleEl = document.getElementById('pageTitle');
    const subtitleEl = document.getElementById('pageSubtitle');
    const menuSpan = el ? el.querySelector('span') : (document.querySelector('.menu-item[data-tab="' + tabId + '"] span'));
    
    if (titleEl && menuSpan) {
      titleEl.innerText = menuSpan.innerText;
    }
    if (subtitleEl) {
      const descKey = TAB_DESCRIPTIONS[tabId];
      if (descKey) {
        subtitleEl.setAttribute('data-i18n', descKey);
        subtitleEl.innerText = api.t(descKey, '');
      } else {
        subtitleEl.innerText = '';
      }
    }

    if (tabId === 'configs') {
      api.loadEasyTierConfigs && api.loadEasyTierConfigs();
    } else if (tabId === 'rooms' || tabId === 'overview') {
      api.loadStats && api.loadStats();
    }

    api.safeCreateIcons();
  };

  api.togglePolling = function togglePolling() {
    window.isPollingPaused = !window.isPollingPaused;
    const btn = document.getElementById('refreshToggleBtn');
    if (btn) {
      btn.innerHTML = window.isPollingPaused 
        ? '<i data-lucide="play" style="width:14px;height:14px;"></i>' 
        : '<i data-lucide="pause" style="width:14px;height:14px;"></i>';
      api.safeCreateIcons();
    }
    api.updateCountdownText();
  };

  api.manualRefresh = function manualRefresh() {
    window.countdown = 5;
    const spinner = document.getElementById('refreshSpinner');
    const clockIcon = document.getElementById('clockIcon');
    if (spinner) spinner.style.display = 'inline-block';
    if (clockIcon) clockIcon.style.display = 'none';

    Promise.all([
      api.loadStats ? api.loadStats() : Promise.resolve(),
      api.loadEasyTierConfigs ? api.loadEasyTierConfigs() : Promise.resolve()
    ]).finally(() => {
      setTimeout(() => {
        if (spinner) spinner.style.display = 'none';
        if (clockIcon) clockIcon.style.display = 'inline-block';
      }, 400);
    });
  };

  api.startPolling = function startPolling() {
    clearInterval(window.statsInterval);
    window.countdown = 5;
    window.statsInterval = setInterval(() => {
      if (window.isPollingPaused) {
        api.updateCountdownText();
        return;
      }
      window.countdown--;
      if (window.countdown <= 0) {
        window.countdown = 5;
        api.loadStats();
      }
      api.updateCountdownText();
    }, 1000);
  };

  api.loadStats = async function loadStats() {
    if (!window.token) return;
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
      if (statOnline) statOnline.innerText = api.t('stat-online', 'Online');
      if (statActiveRooms) statActiveRooms.innerText = window.globalStats.rooms.length;
      if (statConnectedPeers) statConnectedPeers.innerText = window.globalStats.totalPeers;
      if (statTotalTraffic) statTotalTraffic.innerText = api.formatBytes(window.globalStats.totalRx) + ' / ' + api.formatBytes(window.globalStats.totalTx);

      const allPeers = roomDetails.reduce((all, room) => all.concat(room.peers || []), []);
      api.renderTopology(allPeers);
      api.renderRoomsTable();

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
    const empty = document.getElementById('topoEmptyState');
    if (!svg) return;
    svg.innerHTML = '';
    if (!peers || peers.length === 0) {
      if (empty) empty.style.display = 'flex';
      svg.style.display = 'none';
      return;
    }
    if (empty) empty.style.display = 'none';
    svg.style.display = 'block';

    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 460;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    const centerX = width / 2;
    const centerY = height / 2;

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = 
      '<radialGradient id="serverGradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#818cf8" /><stop offset="100%" stop-color="#4f46e5" /></radialGradient>' +
      '<radialGradient id="peerGradient" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#34d399" /><stop offset="100%" stop-color="#059669" /></radialGradient>' +
      '<filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>';
    svg.appendChild(defs);

    // Pulse circles around server
    const pulseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulseCircle.setAttribute('cx', centerX);
    pulseCircle.setAttribute('cy', centerY);
    pulseCircle.setAttribute('r', '48');
    pulseCircle.setAttribute('fill', 'none');
    pulseCircle.setAttribute('stroke', 'rgba(99, 102, 241, 0.35)');
    pulseCircle.setAttribute('stroke-width', '1.5');
    pulseCircle.setAttribute('class', 'radar-pulse-ring');
    svg.appendChild(pulseCircle);

    // Center server node
    const serverNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    serverNode.setAttribute('cx', centerX);
    serverNode.setAttribute('cy', centerY);
    serverNode.setAttribute('r', '32');
    serverNode.setAttribute('fill', 'url(#serverGradient)');
    serverNode.setAttribute('filter', 'url(#glow)');
    svg.appendChild(serverNode);

    const serverLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    serverLabel.setAttribute('x', centerX);
    serverLabel.setAttribute('y', centerY + 52);
    serverLabel.setAttribute('fill', '#f8fafc');
    serverLabel.setAttribute('font-size', '12px');
    serverLabel.setAttribute('font-weight', '600');
    serverLabel.setAttribute('text-anchor', 'middle');
    serverLabel.textContent = 'Cloudflare WSS Relay';
    svg.appendChild(serverLabel);

    const radius = Math.min(width, height) / 2 - 60;
    peers.forEach((peer, index) => {
      const angle = (index / peers.length) * Math.PI * 2 - Math.PI / 2;
      const peerX = centerX + Math.cos(angle) * radius;
      const peerY = centerY + Math.sin(angle) * radius;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', peerX);
      line.setAttribute('y2', peerY);
      line.setAttribute('stroke', 'rgba(99, 102, 241, 0.4)');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '4 4');
      svg.appendChild(line);

      const peerNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      peerNode.setAttribute('cx', peerX);
      peerNode.setAttribute('cy', peerY);
      peerNode.setAttribute('r', '12');
      peerNode.setAttribute('fill', 'url(#peerGradient)');
      peerNode.setAttribute('style', 'cursor: pointer; filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));');

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', peerX);
      label.setAttribute('y', peerY + 22);
      label.setAttribute('fill', '#94a3b8');
      label.setAttribute('font-size', '10px');
      label.setAttribute('text-anchor', 'middle');
      label.textContent = peer.hostname || (peer.peerId ? peer.peerId.slice(0, 8) : 'Node');
      svg.appendChild(label);

      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = 'Peer ID: ' + peer.peerId + '\nHostname: ' + (peer.hostname || 'N/A') + '\nIP: ' + (peer.ipv4Addr || 'N/A') + '\nRx/Tx: ' + api.formatBytes(peer.rxBytes) + ' / ' + api.formatBytes(peer.txBytes);
      peerNode.appendChild(title);
      svg.appendChild(peerNode);
    });
  };

  api.renderRoomsTable = function renderRoomsTable() {
    const body = document.getElementById('roomsTableBody');
    if (!body) return;
    body.innerHTML = '';
    const rooms = window.globalStats.rooms || [];
    if (rooms.length === 0) {
      body.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem 1rem; color:var(--text-muted);">' + api.t('rooms-empty', 'No active rooms.') + '</td></tr>';
      return;
    }
    rooms.forEach((room) => {
      const tr = document.createElement('tr');
      tr.innerHTML = 
        '<td><div style="font-weight: 600; color: #ffffff; display:flex; align-items:center; gap:0.5rem;"><i data-lucide="radio" style="width:16px;height:16px;color:var(--primary);"></i><span>' + room.roomId + '</span></div></td>' +
        '<td><span class="badge-status badge-success">' + room.peerCount + ' ' + (room.peerCount > 1 ? 'peers' : 'peer') + '</span></td>' +
        '<td style="white-space: nowrap;">' +
          '<div class="action-btn-group">' +
            '<button type="button" class="btn-action" onclick="EasyTierAdmin.copyRoomWsUrl(' + JSON.stringify(room.roomId) + ')" title="' + api.t('action-copy-wss', 'Copy WSS') + '"><i data-lucide="copy" style="width: 14px; height: 14px;"></i> ' + api.t('action-copy-wss', 'Copy WSS') + '</button>' +
            '<button type="button" class="btn-action btn-primary-action" onclick="EasyTierAdmin.viewRoomPeers(' + JSON.stringify(room.roomId) + ')" title="' + api.t('action-view', 'View') + '"><i data-lucide="eye" style="width: 14px; height: 14px;"></i> ' + api.t('action-view', 'View') + '</button>' +
          '</div>' +
        '</td>';
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
    if (card) {
      card.style.display = 'block';
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    const titleTpl = api.t('room-peers-title', 'Room Peers — {room}');
    if (title) title.innerText = titleTpl.replace('{room}', roomId);
    if (body) body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem 1rem; color:var(--text-muted);">' + api.t('loading', 'Loading...') + '</td></tr>';
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
      body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem 1rem; color:var(--text-muted);">' + api.t('peers-empty', 'No peers in this room.') + '</td></tr>';
      return;
    }
    peers.forEach((peer) => {
      const duration = Math.floor((Date.now() - new Date(peer.connectedAt || Date.now()).getTime()) / 1000);
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;
      const timeString = (hours > 0 ? hours + 'h ' : '') + minutes + 'm ' + seconds + 's';
      const tr = document.createElement('tr');
      tr.innerHTML = 
        '<td style="font-family: monospace; font-size: 0.85rem; font-weight: 500;">' + peer.peerId + '</td>' +
        '<td><span class="badge-status badge-success" style="font-family: monospace;">' + (peer.ipv4Addr || 'Pending') + '</span></td>' +
        '<td style="color: #ffffff; font-weight: 500;">' + (peer.hostname || 'N/A') + '</td>' +
        '<td><span class="badge-status badge-secondary" style="font-size: 0.75rem;">' + (peer.easytierVersion || 'N/A') + '</span></td>' +
        '<td style="font-size: 0.85rem; font-family: monospace;">' + api.formatBytes(peer.rxBytes) + ' / ' + api.formatBytes(peer.txBytes) + '</td>' +
        '<td style="color: var(--text-secondary); font-size: 0.85rem;">' + timeString + '</td>' +
        '<td><button type="button" class="btn-action btn-danger-action" onclick="EasyTierAdmin.kickPeer(' + JSON.stringify(peer.peerId) + ')"><i data-lucide="user-minus" style="width: 14px; height: 14px;"></i> ' + api.t('action-kick', 'Kick') + '</button></td>';
      body.appendChild(tr);
    });
    api.safeCreateIcons();
    if (typeof window.refreshTableLabels === 'function') window.refreshTableLabels();
  };

  api.copyRoomWsUrl = async function copyRoomWsUrl() {
    const wssUrl = api.buildClientWsUrl();
    await api.copyWithToast(wssUrl, 'msg-copied');
  };

  api.kickPeer = async function kickPeer(peerId) {
    const tpl = api.t('msg-kick-confirm', 'Kick peer {id}?');
    if (!confirm(tpl.replace('{id}', peerId))) return;
    try {
      const res = await fetch('/api/rooms/' + encodeURIComponent(window.activeSelectedRoomId || 'default') + '/kick?peerId=' + encodeURIComponent(peerId), {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + window.token, 'X-Admin-Token': window.token }
      });
      if (res.ok) {
        alert(api.t('msg-kicked-success', 'Peer kicked successfully!'));
        api.loadStats();
      }
    } catch (error) {
      console.error(error);
    }
  };
})();
`;
