export const tokensSettingsScript = String.raw`
(function () {
  window.EasyTierAdmin = window.EasyTierAdmin || {};
  const api = window.EasyTierAdmin;

  api.loadSettings = async function loadSettings() {
    // RequireToken is removed, settings tab only shows admin password information.
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
      }
    } catch (error) {
      console.error(error);
    }
  };

  api.renderEasyTierConfigs = function renderEasyTierConfigs() {
    const body = document.getElementById('easyTierConfigsTableBody');
    if (!body) return;
    body.innerHTML = '';
    if (!window.easyTierConfigs.length) {
      body.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">' + (translations[window.currentLang]['easytier-config-empty'] || 'No configuration files.') + '</td></tr>';
      return;
    }
    window.easyTierConfigs.forEach((config) => {
      const peersSummary = (config.peers || '').split('\n').filter(Boolean).join(', ') || '—';
      const tr = document.createElement('tr');
      tr.innerHTML = '<td style="font-weight: 600; color: #ffffff;">' + (config.instance_name || config.network_name || '') + '</td>' +
        '<td>' + (config.network_name || '') + '</td>' +
        '<td>' + (config.ipv4 || 'DHCP') + '</td>' +
        '<td style="font-family: monospace; font-size: 0.85rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + (config.peers || '') + '">' + peersSummary + '</td>' +
        '<td style="color: var(--text-secondary);">' + new Date(config.createdAt || Date.now()).toLocaleString() + '</td>' +
        '<td style="white-space: nowrap;">' +
        '<button type="button" class="btn-action" onclick="EasyTierAdmin.downloadEasyTierToml(' + "'" + config.id + "'" + ')"><i data-lucide="download" style="width: 14px; height: 14px;"></i> ' + (translations[window.currentLang]['action-download-toml'] || 'Download TOML') + '</button> ' +
        '<button type="button" class="btn-action" onclick="EasyTierAdmin.copyEasyTierCommand(' + "'" + config.id + "'" + ')"><i data-lucide="terminal" style="width: 14px; height: 14px;"></i> ' + (translations[window.currentLang]['action-copy-cmd'] || 'Copy Cmd') + '</button> ' +
        '<button type="button" class="btn-action" onclick="EasyTierAdmin.editEasyTierConfig(' + "'" + config.id + "'" + ')"><i data-lucide="edit-3" style="width: 14px; height: 14px;"></i> ' + (translations[window.currentLang]['action-edit'] || 'Edit') + '</button> ' +
        '<button type="button" class="btn-action btn-danger-action" onclick="EasyTierAdmin.deleteEasyTierConfig(' + "'" + config.id + "'" + ')"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> ' + (translations[window.currentLang]['action-delete'] || 'Delete') + '</button></td>';
      body.appendChild(tr);
    });
    api.safeCreateIcons();
    if (typeof window.refreshTableLabels === 'function') window.refreshTableLabels();
  };

  api.downloadEasyTierToml = function downloadEasyTierToml(configId) {
    const config = (window.easyTierConfigs || []).find((entry) => entry.id === configId);
    if (!config) return;
    
    let toml = '# EasyTier Configuration File\n';
    if (config.instance_name) toml += 'instance_name = "' + config.instance_name + '"\n';
    if (config.ipv4) toml += 'ipv4 = "' + config.ipv4 + '"\n';
    toml += 'dhcp = ' + (config.dhcp ? 'true' : 'false') + '\n';
    
    toml += 'listeners = [ "wss://0.0.0.0:443" ]\n';
    
    if (config.rpc_portal) toml += 'rpc_portal = "' + config.rpc_portal + '"\n';
    toml += '\n';
    
    toml += '[network_identity]\n';
    toml += 'network_name = "' + (config.network_name || '') + '"\n';
    toml += 'network_secret = "' + (config.network_secret || '') + '"\n\n';
    
    let peers = (config.peers || '').split('\n').map(x => x.trim()).filter(Boolean);
    // Auto-generate default peer URL pointing to this relay if none configured
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
  };

  api.deleteEasyTierConfig = async function deleteEasyTierConfig(configId) {
    if (!confirm(translations[window.currentLang]['msg-config-delete-confirm'] || 'Delete this config?')) return;
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
        alert(translations[window.currentLang]['msg-config-deleted'] || 'Deleted');
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
    // Pre-fill Peers field with this relay's WSS URL
    try {
      const relayUrl = api.buildClientWsUrl();
      const peersField = document.getElementById('easyTierConfigPeers');
      if (peersField && !peersField.value.trim()) {
        peersField.value = relayUrl;
      }
    } catch(e) {
      console.warn('Failed to pre-fill WSS URL', e);
    }
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
        } else {
          api.loadEasyTierConfigs();
        }
        alert(translations[window.currentLang]['msg-config-added'] || 'Configuration Saved');
        api.closeEasyTierConfigModal();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || translations[window.currentLang]['msg-config-failed'] || 'Failed to save configuration');
      }
    } catch (error) {
      console.error(error);
    }
  };
})();
`;
