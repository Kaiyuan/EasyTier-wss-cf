export const tokensSettingsScript = String.raw`
(function () {
  window.EasyTierAdmin = window.EasyTierAdmin || {};
  const api = window.EasyTierAdmin;

  api.currentConfigFilter = '';
  window.currentPreviewConfigId = null;

  api.loadSettings = async function loadSettings() {
    // Settings tab shows admin password & system information
  };

  api.loadEasyTierConfigs = async function loadEasyTierConfigs() {
    try {
      const res = await fetch('/api/config', {
        headers: { 'Authorization': 'Bearer ' + window.token, 'X-Admin-Token': window.token }
      });
      if (res.ok) {
        const data = await res.json();
        window.easyTierConfigs = Array.isArray(data.easyTierConfigs) ? data.easyTierConfigs : [];
        api.renderEasyTierConfigs();
        api.updateConfigStatsSummary();
      }
    } catch (error) {
      console.error('Failed to load EasyTier configs:', error);
    }
  };

  api.updateConfigStatsSummary = function updateConfigStatsSummary() {
    const list = window.easyTierConfigs || [];
    const totalEl = document.getElementById('statTotalConfigsVal');
    const dhcpEl = document.getElementById('statDhcpConfigsVal');
    const encEl = document.getElementById('statEncConfigsVal');
    if (totalEl) totalEl.textContent = list.length;
    if (dhcpEl) dhcpEl.textContent = list.filter(c => c.dhcp).length;
    if (encEl) encEl.textContent = list.filter(c => c.enable_encryption !== false).length;
  };

  api.filterEasyTierConfigs = function filterEasyTierConfigs(query) {
    api.currentConfigFilter = (query || '').toLowerCase().trim();
    api.renderEasyTierConfigs();
  };

  api.renderEasyTierConfigs = function renderEasyTierConfigs(customList) {
    const body = document.getElementById('easyTierConfigsTableBody');
    if (!body) return;
    body.innerHTML = '';
    
    let configs = customList || window.easyTierConfigs || [];
    if (api.currentConfigFilter) {
      const q = api.currentConfigFilter;
      configs = configs.filter(c => 
        (c.instance_name || '').toLowerCase().includes(q) ||
        (c.network_name || '').toLowerCase().includes(q) ||
        (c.ipv4 || '').toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q)
      );
    }

    if (!configs.length) {
      const emptyMsg = api.currentConfigFilter
        ? (api.t('easytier-config-empty', 'No matching configuration files.'))
        : (api.t('easytier-config-empty', 'No configuration files. Click "+ Add Config File" to create one.'));
      body.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2.5rem 1rem; color:var(--text-muted);"><i data-lucide="inbox" style="width:32px;height:32px;margin:0 auto 0.5rem;display:block;opacity:0.5;"></i>' + emptyMsg + '</td></tr>';
      api.safeCreateIcons();
      return;
    }

    configs.forEach((config) => {
      const peersArray = (config.peers || '').split('\n').map(x => x.trim()).filter(Boolean);
      const peersCount = peersArray.length;
      const peersSummary = peersCount > 0 ? (peersCount + ' peer' + (peersCount > 1 ? 's' : '')) : 'Relay only';
      
      const ipDisplay = config.dhcp 
        ? '<span class="badge-status badge-info">DHCP</span>'
        : (config.ipv4 ? '<span style="font-family: monospace; font-weight: 600; color: var(--success);">' + config.ipv4 + '</span>' : '<span style="color:var(--text-muted);">—</span>');

      const tr = document.createElement('tr');
      tr.innerHTML = 
        '<td>' +
          '<div style="font-weight: 600; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">' +
            '<i data-lucide="network" style="width: 16px; height: 16px; color: var(--primary);"></i>' +
            '<span>' + (config.instance_name || config.network_name || 'easytier') + '</span>' +
          '</div>' +
          (config.notes ? '<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">' + config.notes + '</div>' : '') +
        '</td>' +
        '<td><span class="badge-network">' + (config.network_name || 'default') + '</span></td>' +
        '<td>' + ipDisplay + '</td>' +
        '<td><span class="badge-status badge-secondary" title="' + (config.peers || '') + '">' + peersSummary + '</span></td>' +
        '<td style="color: var(--text-secondary); font-size: 0.85rem;">' + new Date(config.createdAt || Date.now()).toLocaleDateString() + '</td>' +
        '<td style="white-space: nowrap;">' +
          '<div class="action-btn-group">' +
            '<button type="button" class="btn-action" title="' + (api.t('btn-preview', 'Preview')) + '" onclick="EasyTierAdmin.previewEasyTierConfig(\'' + config.id + '\')"><i data-lucide="eye" style="width: 14px; height: 14px;"></i></button>' +
            '<button type="button" class="btn-action" title="' + (api.t('action-download-toml', 'Download TOML')) + '" onclick="EasyTierAdmin.downloadEasyTierToml(\'' + config.id + '\')"><i data-lucide="download" style="width: 14px; height: 14px;"></i></button>' +
            '<button type="button" class="btn-action" title="' + (api.t('action-copy-cmd', 'Copy Command')) + '" onclick="EasyTierAdmin.copyEasyTierCommand(\'' + config.id + '\')"><i data-lucide="terminal" style="width: 14px; height: 14px;"></i></button>' +
            '<button type="button" class="btn-action" title="' + (api.t('btn-duplicate', 'Duplicate')) + '" onclick="EasyTierAdmin.duplicateEasyTierConfig(\'' + config.id + '\')"><i data-lucide="copy" style="width: 14px; height: 14px;"></i></button>' +
            '<button type="button" class="btn-action" title="' + (api.t('action-edit', 'Edit')) + '" onclick="EasyTierAdmin.editEasyTierConfig(\'' + config.id + '\')"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i></button>' +
            '<button type="button" class="btn-action btn-danger-action" title="' + (api.t('action-delete', 'Delete')) + '" onclick="EasyTierAdmin.deleteEasyTierConfig(\'' + config.id + '\')"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button>' +
          '</div>' +
        '</td>';
      body.appendChild(tr);
    });
    api.safeCreateIcons();
    if (typeof window.refreshTableLabels === 'function') window.refreshTableLabels();
  };

  api.generateEasyTierTomlString = function generateEasyTierTomlString(config) {
    if (!config) return '';
    let toml = '# =========================================\n';
    toml += '# EasyTier Client Configuration\n';
    toml += '# Generated by EasyTier-wss-cf Admin Panel\n';
    toml += '# =========================================\n\n';

    if (config.instance_name) toml += 'instance_name = "' + config.instance_name + '"\n';
    if (config.ipv4) toml += 'ipv4 = "' + config.ipv4 + '"\n';
    toml += 'dhcp = ' + (config.dhcp ? 'true' : 'false') + '\n';
    toml += 'listeners = [ "wss://0.0.0.0:443" ]\n';
    if (config.rpc_portal) toml += 'rpc_portal = "' + config.rpc_portal + '"\n';
    toml += '\n[network_identity]\n';
    toml += 'network_name = "' + (config.network_name || '') + '"\n';
    toml += 'network_secret = "' + (config.network_secret || '') + '"\n\n';

    let peers = (config.peers || '').split('\n').map(x => x.trim()).filter(Boolean);
    if (peers.length === 0) {
      peers = [api.buildClientWsUrl()];
    }
    peers.forEach(peer => {
      toml += '[[peer]]\nuri = "' + peer + '"\n\n';
    });

    const proxy_networks = (config.proxy_networks || '').split('\n').map(x => x.trim()).filter(Boolean);
    proxy_networks.forEach(cidr => {
      toml += '[[proxy_network]]\ncidr = "' + cidr + '"\n\n';
    });

    toml += '[flags]\n';
    toml += 'default_protocol = "' + (config.default_protocol || 'tcp') + '"\n';
    toml += 'dev_name = "' + (config.dev_name || 'tun0') + '"\n';
    toml += 'enable_encryption = ' + (config.enable_encryption !== false ? 'true' : 'false') + '\n';
    toml += 'enable_ipv6 = ' + (config.enable_ipv6 !== false ? 'true' : 'false') + '\n';
    toml += 'mtu = ' + (config.mtu || 1380) + '\n';
    toml += 'latency_first = ' + (config.latency_first ? 'true' : 'false') + '\n';
    return toml;
  };

  api.previewEasyTierConfig = function previewEasyTierConfig(configId) {
    const config = (window.easyTierConfigs || []).find((entry) => entry.id === configId);
    if (!config) return;
    window.currentPreviewConfigId = configId;
    const toml = api.generateEasyTierTomlString(config);
    const pre = document.getElementById('previewTomlCode');
    const title = document.getElementById('previewModalTitle');
    if (pre) pre.textContent = toml;
    if (title) title.textContent = (config.instance_name || config.network_name) + '.toml';
    const modal = document.getElementById('easyTierPreviewModal');
    if (modal) modal.style.display = 'flex';
    api.safeCreateIcons();
  };

  api.closeEasyTierPreviewModal = function closeEasyTierPreviewModal() {
    const modal = document.getElementById('easyTierPreviewModal');
    if (modal) modal.style.display = 'none';
    window.currentPreviewConfigId = null;
  };

  api.copyPreviewToml = async function copyPreviewToml() {
    const pre = document.getElementById('previewTomlCode');
    if (pre && pre.textContent) {
      await api.copyWithToast(pre.textContent, 'msg-copied');
    }
  };

  api.downloadPreviewToml = function downloadPreviewToml() {
    if (window.currentPreviewConfigId) {
      api.downloadEasyTierToml(window.currentPreviewConfigId);
    }
  };

  api.duplicateEasyTierConfig = function duplicateEasyTierConfig(configId) {
    const config = (window.easyTierConfigs || []).find((entry) => entry.id === configId);
    if (!config) return;
    api.openEasyTierConfigModal();
    document.getElementById('easyTierConfigId').value = ''; // new record
    document.getElementById('easyTierConfigInstanceName').value = (config.instance_name || '') + ' (Copy)';
    document.getElementById('easyTierConfigNetworkName').value = config.network_name || '';
    document.getElementById('easyTierConfigNetworkSecret').value = config.network_secret || '';
    document.getElementById('easyTierConfigIpv4').value = config.ipv4 || '';
    document.getElementById('easyTierConfigDhcp').checked = !!config.dhcp;
    document.getElementById('easyTierConfigPeers').value = config.peers || '';
    document.getElementById('easyTierConfigRpcPortal').value = config.rpc_portal || '127.0.0.1:15888';
    document.getElementById('easyTierConfigProtocol').value = config.default_protocol || 'tcp';
    document.getElementById('easyTierConfigDevName').value = config.dev_name || 'tun0';
    document.getElementById('easyTierConfigMtu').value = config.mtu || 1380;
    document.getElementById('easyTierConfigProxyNetworks').value = config.proxy_networks || '';
    document.getElementById('easyTierConfigEncryption').checked = config.enable_encryption !== false;
    document.getElementById('easyTierConfigIpv6').checked = config.enable_ipv6 !== false;
    document.getElementById('easyTierConfigLatencyFirst').checked = !!config.latency_first;
    document.getElementById('easyTierConfigNotes').value = config.notes || '';
  };

  api.downloadEasyTierToml = function downloadEasyTierToml(configId) {
    const config = (window.easyTierConfigs || []).find((entry) => entry.id === configId);
    if (!config) return;
    const toml = api.generateEasyTierTomlString(config);
    const blob = new Blob([toml], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (config.instance_name || config.network_name || 'easytier') + '.toml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  api.copyEasyTierCommand = async function copyEasyTierCommand(configId) {
    const config = (window.easyTierConfigs || []).find((entry) => entry.id === configId);
    if (!config) return;
    const cmd = 'easytier-core -c ' + (config.instance_name || config.network_name || 'easytier') + '.toml';
    await api.copyWithToast(cmd, 'msg-copied');
  };

  api.fillCurrentRelayIntoPeers = function fillCurrentRelayIntoPeers() {
    try {
      const relayUrl = api.buildClientWsUrl();
      const textarea = document.getElementById('easyTierConfigPeers');
      if (!textarea) return;
      const current = textarea.value.trim();
      if (!current) {
        textarea.value = relayUrl;
      } else if (!current.includes(relayUrl)) {
        textarea.value = current + '\n' + relayUrl;
      }
    } catch (e) {
      console.warn('Failed to insert current relay:', e);
    }
  };

  api.toggleSecretVisibility = function toggleSecretVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    if (btn) {
      btn.innerHTML = isPassword ? '<i data-lucide="eye-off" style="width:16px;height:16px;"></i>' : '<i data-lucide="eye" style="width:16px;height:16px;"></i>';
      api.safeCreateIcons();
    }
  };

  api.editEasyTierConfig = function editEasyTierConfig(configId) {
    const config = (window.easyTierConfigs || []).find((entry) => entry.id === configId);
    if (!config) return;
    
    document.getElementById('easyTierConfigId').value = config.id;
    document.getElementById('easyTierConfigInstanceName').value = config.instance_name || '';
    document.getElementById('easyTierConfigNetworkName').value = config.network_name || '';
    document.getElementById('easyTierConfigNetworkSecret').value = config.network_secret || '';
    document.getElementById('easyTierConfigIpv4').value = config.ipv4 || '';
    document.getElementById('easyTierConfigDhcp').checked = !!config.dhcp;
    document.getElementById('easyTierConfigPeers').value = config.peers || '';
    document.getElementById('easyTierConfigRpcPortal').value = config.rpc_portal || '127.0.0.1:15888';
    document.getElementById('easyTierConfigProtocol').value = config.default_protocol || 'tcp';
    document.getElementById('easyTierConfigDevName').value = config.dev_name || 'tun0';
    document.getElementById('easyTierConfigMtu').value = config.mtu || 1380;
    document.getElementById('easyTierConfigProxyNetworks').value = config.proxy_networks || '';
    document.getElementById('easyTierConfigEncryption').checked = config.enable_encryption !== false;
    document.getElementById('easyTierConfigIpv6').checked = config.enable_ipv6 !== false;
    document.getElementById('easyTierConfigLatencyFirst').checked = !!config.latency_first;
    document.getElementById('easyTierConfigNotes').value = config.notes || '';
    
    const modal = document.getElementById('easyTierConfigModal');
    if (modal) modal.style.display = 'flex';
    api.safeCreateIcons();
  };

  api.deleteEasyTierConfig = async function deleteEasyTierConfig(configId) {
    if (!confirm(api.t('msg-config-delete-confirm', 'Delete this config?'))) return;
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + window.token,
          'X-Admin-Token': window.token
        },
        body: JSON.stringify({ deleteEasyTierConfigId: configId })
      });
      if (res.ok) {
        alert(api.t('msg-config-deleted', 'Deleted'));
        api.loadEasyTierConfigs();
      }
    } catch (error) {
      console.error(error);
    }
  };

  api.openEasyTierConfigModal = function openEasyTierConfigModal() {
    api.closeEasyTierConfigModal();
    const modal = document.getElementById('easyTierConfigModal');
    if (modal) modal.style.display = 'flex';
    // Pre-fill Peers field with this relay's WSS URL if empty
    try {
      const relayUrl = api.buildClientWsUrl();
      const peersField = document.getElementById('easyTierConfigPeers');
      if (peersField && !peersField.value.trim()) {
        peersField.value = relayUrl;
      }
    } catch(e) {
      console.warn('Failed to pre-fill WSS URL', e);
    }
    api.safeCreateIcons();
  };

  api.closeEasyTierConfigModal = function closeEasyTierConfigModal() {
    const modal = document.getElementById('easyTierConfigModal');
    if (modal) modal.style.display = 'none';
    document.getElementById('easyTierConfigId').value = '';
    document.getElementById('easyTierConfigInstanceName').value = '';
    document.getElementById('easyTierConfigNetworkName').value = '';
    document.getElementById('easyTierConfigNetworkSecret').value = '';
    document.getElementById('easyTierConfigIpv4').value = '';
    document.getElementById('easyTierConfigDhcp').checked = false;
    document.getElementById('easyTierConfigPeers').value = '';
    document.getElementById('easyTierConfigRpcPortal').value = '127.0.0.1:15888';
    document.getElementById('easyTierConfigProtocol').value = 'tcp';
    document.getElementById('easyTierConfigDevName').value = 'tun0';
    document.getElementById('easyTierConfigMtu').value = '1380';
    document.getElementById('easyTierConfigProxyNetworks').value = '';
    document.getElementById('easyTierConfigEncryption').checked = true;
    document.getElementById('easyTierConfigIpv6').checked = true;
    document.getElementById('easyTierConfigLatencyFirst').checked = false;
    document.getElementById('easyTierConfigNotes').value = '';
  };

  api.handleCreateEasyTierConfig = async function handleCreateEasyTierConfig(event) {
    event.preventDefault();
    const easyTierConfig = {
      id: document.getElementById('easyTierConfigId').value.trim() || undefined,
      instance_name: document.getElementById('easyTierConfigInstanceName').value.trim(),
      network_name: document.getElementById('easyTierConfigNetworkName').value.trim(),
      network_secret: document.getElementById('easyTierConfigNetworkSecret').value.trim(),
      ipv4: document.getElementById('easyTierConfigIpv4').value.trim(),
      dhcp: document.getElementById('easyTierConfigDhcp').checked,
      peers: document.getElementById('easyTierConfigPeers').value.trim(),
      rpc_portal: document.getElementById('easyTierConfigRpcPortal').value.trim(),
      default_protocol: document.getElementById('easyTierConfigProtocol').value,
      dev_name: document.getElementById('easyTierConfigDevName').value.trim(),
      mtu: Number(document.getElementById('easyTierConfigMtu').value) || 1380,
      proxy_networks: document.getElementById('easyTierConfigProxyNetworks').value.trim(),
      enable_encryption: document.getElementById('easyTierConfigEncryption').checked,
      enable_ipv6: document.getElementById('easyTierConfigIpv6').checked,
      latency_first: document.getElementById('easyTierConfigLatencyFirst').checked,
      notes: document.getElementById('easyTierConfigNotes').value.trim()
    };
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + window.token,
          'X-Admin-Token': window.token
        },
        body: JSON.stringify({ easyTierConfig })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.config && Array.isArray(result.config.easyTierConfigs)) {
          window.easyTierConfigs = result.config.easyTierConfigs;
          api.renderEasyTierConfigs();
          api.updateConfigStatsSummary();
        } else {
          api.loadEasyTierConfigs();
        }
        alert(api.t('msg-config-added', 'Configuration Saved'));
        api.closeEasyTierConfigModal();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || api.t('msg-config-failed', 'Failed to save configuration'));
      }
    } catch (error) {
      console.error(error);
    }
  };
})();
`;
