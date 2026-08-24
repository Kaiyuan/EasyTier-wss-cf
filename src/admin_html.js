import { buildAdminI18nScript } from "./admin_i18n/index.js";

export const serveAdminDashboard = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EasyTier Relay Dashboard</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <link rel="stylesheet" href="/assets/admin/style.css">
</head>
<body>

    <!-- LOGIN SCREEN -->
    <div id="loginScreen">
        <div class="login-card">
            <div class="login-logo">
                <i data-lucide="network"></i>
                <span>EasyTier Admin</span>
            </div>
            <div class="login-copy" style="text-align: center; margin: 0.5rem 0 1.5rem;">
                <h1 id="loginTitle" data-i18n="login-title">Sign in to continue</h1>
                <p id="loginHint" data-i18n="login-hint">Use the admin password configured in Cloudflare Workers to unlock the dashboard.</p>
            </div>
            
            <div class="form-group" style="text-align: center; margin-bottom: 2rem;">
                <div class="top-lang-wrapper" style="display: inline-flex;" onclick="document.getElementById('loginLang').focus()">
                    <i data-lucide="languages" style="width: 14px; height: 14px;"></i>
                    <select id="loginLang" class="top-lang-select" onchange="switchLanguage(this.value)">
                        <option value="en">English</option>
                        <option value="zh-CN">简体中文</option>
                        <option value="zh-TW">繁體中文</option>
                        <option value="ja">日本語</option>
                        <option value="ko">한국어</option>
                    </select>
                    <i data-lucide="chevron-down" class="top-lang-arrow"></i>
                </div>
            </div>

            <form onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label for="passwordInput" data-i18n="login-label">Admin Password</label>
                    <input type="password" id="passwordInput" class="form-control" data-i18n-placeholder="password-placeholder" placeholder="Enter admin password" required>
                </div>
                <button type="submit" class="btn-submit" data-i18n="login-btn">Sign In</button>
            </form>
            <p id="loginError" class="login-error" data-i18n="login-error">Incorrect password. Please try again.</p>
        </div>
    </div>

    <!-- APP LAYOUT -->
    <div id="appLayout">
        <!-- Mobile Top Navigation (only visible on small screens) -->
                <!-- Sidebar Overlay for Mobile -->

        <!-- Sidebar -->

        <!-- Main Content -->
        <main>
            <div class="top-nav">
                <h2 id="pageTitle" class="page-title" data-i18n="menu-overview">Overview</h2>
                <div class="header-controls">
                    <div class="refresh-indicator">
                        <div id="refreshSpinner" class="refresh-spinner"></div>
                        <i data-lucide="clock" id="clockIcon" style="width: 14px; height: 14px;"></i>
                        <span id="refreshText">Auto-refresh in 5s</span>
                    </div>
                    <div class="top-lang-wrapper" onclick="document.getElementById('dashboardLang').focus()">
                        <i data-lucide="languages" style="width: 14px; height: 14px;"></i>
                        <select id="dashboardLang" class="top-lang-select" onchange="switchLanguage(this.value)">
                            <option value="en">English</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁體中文</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                        </select>
                        <i data-lucide="chevron-down" class="top-lang-arrow"></i>
                    </div>
                </div>
            </div>



            <!-- TAB: OVERVIEW -->
            <div id="tabOverview" class="tab-content active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i data-lucide="activity"></i></div>
                        <div class="stat-data">
                            <span class="stat-label" data-i18n="stat-status">Status</span>
                            <span class="stat-val" style="color: var(--success);" data-i18n="stat-online">Online</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i data-lucide="folder"></i></div>
                        <div class="stat-data">
                            <span class="stat-label" data-i18n="stat-active-rooms">Active Rooms</span>
                            <span id="statActiveRooms" class="stat-val">0</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i data-lucide="users"></i></div>
                        <div class="stat-data">
                            <span class="stat-label" data-i18n="stat-connected-peers">Total Peers</span>
                            <span id="statConnectedPeers" class="stat-val">0</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i data-lucide="arrow-down-up"></i></div>
                        <div class="stat-data">
                            <span class="stat-label" data-i18n="stat-total-traffic">Traffic (Rx/Tx)</span>
                            <span id="statTotalTraffic" class="stat-val">0 B / 0 B</span>
                        </div>
                    </div>
                </div>

                <div class="topo-card">
                    <div class="topo-header">
                        <span class="topo-title" data-i18n="topo-map-title">Network Topology</span>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--primary); margin-right:5px;"></span>Server
                            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:var(--success); margin-left:15px; margin-right:5px;"></span>Active Peer
                        </div>
                    </div>
                    <div class="topo-body" id="topoBody">
                        <svg class="topo-svg" id="topoSvg"></svg>
                        <div id="topoEmptyText" style="color: var(--text-muted); font-size: 0.95rem;" data-i18n="topo-no-nodes">No nodes connected. WSS relay is empty.</div>
                    </div>
                </div>

                <!-- EasyTier Config Files Section -->
                <div class="table-card" style="margin-top: 2rem;">
                    <div class="table-header-row">
                        <span class="table-title" data-i18n="easytier-configs-title">EasyTier Config Files</span>
                        <button class="btn-create" onclick="openEasyTierConfigModal()">
                            <i data-lucide="plus"></i>
                            <span data-i18n="btn-add-easytier-config">Add Config File</span>
                        </button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th data-i18n="th-config-name">Config Name</th>
                                    <th data-i18n="th-network-name">Network Name</th>
                                    <th data-i18n="th-virtual-ip">Virtual IP (IPv4)</th>
                                    <th data-i18n="th-peers">Peers</th>
                                    <th data-i18n="th-created">Created At</th>
                                    <th data-i18n="th-actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="easyTierConfigsTableBody">
                                <!-- Dynamic -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


                <!-- WSS Connection Test -->
                <div class="table-card" style="margin-top: 2rem;">
                    <div class="table-header-row">
                        <span class="table-title" data-i18n="wss-test-title">WSS Connection Test</span>
                        <button class="btn-action" onclick="testWssConnection()" id="wssTestBtn">
                            <i data-lucide="plug-2"></i>
                            <span data-i18n="wss-test-btn">Test Connection</span>
                        </button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div id="wssTestUrl" style="color: var(--text-secondary); font-family: monospace; font-size: 0.85rem; word-break: break-all;"></div>
                        <div id="wssTestStatus" style="font-weight: 600;" data-i18n="wss-test-not-tested">Click "Test Connection" to verify WSS relay</div>
                    </div>
                </div>
        </main>
    </div>

    <!-- MODAL: CREATE EASYTIER CONFIG -->
    <div id="easyTierConfigModal" class="modal">
        <div class="modal-card" style="max-width: 720px; width: 90%;">
            <h3 class="modal-title" data-i18n="easytier-config-modal-title">Add EasyTier Config</h3>
            <form onsubmit="handleCreateEasyTierConfig(event)">
                <input type="hidden" id="easyTierConfigId">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <!-- Column 1: Network settings -->
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <h4 style="color: var(--primary); border-bottom: 1px solid var(--glass-border); padding-bottom: 0.3rem;" data-i18n="section-net-identity">Network Identity</h4>
                        <div class="form-group">
                            <label for="easyTierConfigInstanceName" data-i18n="label-instance-name">Instance Name</label>
                            <input type="text" id="easyTierConfigInstanceName" class="form-control" data-i18n-placeholder="placeholder-instance-name">
                        </div>
                        <div class="form-group">
                            <label for="easyTierConfigNetworkName" data-i18n="easytier-config-network-name">Network Name</label>
                            <input type="text" id="easyTierConfigNetworkName" class="form-control" data-i18n-placeholder="placeholder-network-name" required>
                        </div>
                        <div class="form-group">
                            <label for="easyTierConfigNetworkSecret" data-i18n="easytier-config-network-secret">Network Secret</label>
                            <input type="password" id="easyTierConfigNetworkSecret" class="form-control" data-i18n-placeholder="placeholder-network-secret" required>
                        </div>
                        
                        <h4 style="color: var(--primary); border-bottom: 1px solid var(--glass-border); padding-bottom: 0.3rem; margin-top: 0.5rem;" data-i18n="section-ip-settings">IP & DHCP</h4>
                        <div class="form-group">
                            <label for="easyTierConfigIpv4" data-i18n="label-ipv4">Virtual IPv4</label>
                            <input type="text" id="easyTierConfigIpv4" class="form-control" data-i18n-placeholder="placeholder-ipv4">
                        </div>
                        <div class="switch-control" style="margin-top: 0.5rem;">
                            <span style="font-size: 0.9rem; font-weight: 500;" data-i18n="label-dhcp">Enable DHCP</span>
                            <label class="switch">
                                <input type="checkbox" id="easyTierConfigDhcp">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>

                    <!-- Column 2: Connection & Flags -->
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <h4 style="color: var(--primary); border-bottom: 1px solid var(--glass-border); padding-bottom: 0.3rem;" data-i18n="section-connections">Connections</h4>
                        <div class="form-group">
                            <label for="easyTierConfigPeers" data-i18n="label-peers">P2P Peers (one per line)</label>
                            <textarea id="easyTierConfigPeers" class="form-control" rows="3" data-i18n-placeholder="placeholder-peers"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="easyTierConfigRpcPortal" data-i18n="label-rpc-portal">RPC Portal Address</label>
                            <input type="text" id="easyTierConfigRpcPortal" class="form-control" value="127.0.0.1:15888">
                        </div>
                    </div>
                </div>

                <!-- Advanced flags section -->
                <h4 style="color: var(--primary); border-bottom: 1px solid var(--glass-border); padding-bottom: 0.3rem; margin-bottom: 0.8rem;" data-i18n="section-flags">Options & Flags</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <div class="form-group">
                            <label for="easyTierConfigProtocol" data-i18n="label-protocol">Default Protocol</label>
                            <select id="easyTierConfigProtocol" class="form-control" style="background: var(--input-bg); color: var(--text-color); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem 0.8rem;">
                                <option value="tcp" data-i18n="option-tcp">TCP</option>
                                <option value="udp" data-i18n="option-udp">UDP</option>
                                <option value="ws" data-i18n="option-ws">WebSocket (WS)</option>
                                <option value="wss" data-i18n="option-wss">WebSocket Secure (WSS)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="easyTierConfigDevName" data-i18n="label-dev-name">TUN Device Name</label>
                            <input type="text" id="easyTierConfigDevName" class="form-control" value="tun0">
                        </div>
                        <div class="form-group">
                            <label for="easyTierConfigMtu" data-i18n="label-mtu">MTU</label>
                            <input type="number" id="easyTierConfigMtu" class="form-control" value="1380">
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <div class="form-group">
                            <label for="easyTierConfigProxyNetworks" data-i18n="label-proxy-networks">Proxy Subnets (one per line)</label>
                            <textarea id="easyTierConfigProxyNetworks" class="form-control" rows="2" data-i18n-placeholder="placeholder-proxy-networks"></textarea>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem;">
                            <div class="switch-control">
                                <span style="font-size: 0.9rem; font-weight: 500;" data-i18n="label-encryption">Enable Encryption</span>
                                <label class="switch">
                                    <input type="checkbox" id="easyTierConfigEncryption" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="switch-control">
                                <span style="font-size: 0.9rem; font-weight: 500;" data-i18n="label-ipv6">Enable IPv6</span>
                                <label class="switch">
                                    <input type="checkbox" id="easyTierConfigIpv6" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="switch-control">
                                <span style="font-size: 0.9rem; font-weight: 500;" data-i18n="label-latency-first">Latency First</span>
                                <label class="switch">
                                    <input type="checkbox" id="easyTierConfigLatencyFirst">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label for="easyTierConfigNotes" data-i18n="easytier-config-notes">Notes</label>
                    <textarea id="easyTierConfigNotes" class="form-control" rows="2" data-i18n-placeholder="placeholder-notes"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="closeEasyTierConfigModal()" data-i18n="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-submit" style="width: auto; padding: 0.6rem 1.5rem;" data-i18n="btn-confirm">Save Configuration</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Translations: src/admin_i18n/locales/*.js -->
    <script>
${buildAdminI18nScript()}

        function safeCreateIcons() {
            try {
                if (typeof lucide !== 'undefined' && lucide.createIcons) {
                    lucide.createIcons();
                }
            } catch (e) {
                console.warn('Lucide icons failed to load:', e);
            }
        }

        function getTableLabels() {
            const t = translations[currentLang] || translations.en;
            return {
                roomsTableBody: {
                    0: t['th-room-name'],
                    1: t['th-peer-count'],
                    2: t['th-actions']
                },
                peersTableBody: {
                    0: t['th-peer-id'],
                    1: t['th-virtual-ip'],
                    2: t['th-hostname'],
                    3: t['th-version'],
                    4: t['th-rx-tx'],
                    5: t['th-conn-time'],
                    6: t['th-actions']
                },
                tokensTableBody: {
                    0: t['th-token'],
                    1: t['th-desc'],
                    2: t['th-created'],
                    3: t['th-actions']
                },
                easyTierConfigsTableBody: {
                    0: t['th-config-name'],
                    1: t['th-network-name'],
                    2: t['th-virtual-ip'],
                    3: t['th-peers'],
                    4: t['th-created'],
                    5: t['th-actions']
                }
            };
        }

        function refreshTableLabels() {
            const tableLabels = getTableLabels();
            for (const table in tableLabels) {
                const tbody = document.getElementById(table);
                if (!tbody) continue;
                const rows = tbody.querySelectorAll('tr');
                rows.forEach((row) => {
                    const tds = row.querySelectorAll('td');
                    tds.forEach((td, index) => {
                        if (tableLabels[table][index]) {
                            td.setAttribute('data-label', tableLabels[table][index]);
                        }
                    });
                });
            }
        }

        window.refreshTableLabels = refreshTableLabels;

        // Add data-label attributes to table cells for mobile card view
        function setupTableLabels() {
            const observer = new MutationObserver(function() {
                refreshTableLabels();
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
            refreshTableLabels();
        }
        </script>
    <script src="/assets/admin/shared.js" defer></script>
    <script src="/assets/admin/auth.js" defer></script>
    <script src="/assets/admin/dashboard.js" defer></script>
    <script src="/assets/admin/tokens-settings.js" defer></script>
    <script src="/assets/admin/boot.js" defer></script>
    <script>
        // Initialize mobile features after all scripts are loaded
        document.addEventListener('DOMContentLoaded', function() {
            setupTableLabels();
            // Show relay WSS URL in test card
            var urlDisplay = document.getElementById('wssTestUrl');
            if (urlDisplay && window.EasyTierAdmin && EasyTierAdmin.buildClientWsUrl) {
                urlDisplay.textContent = 'Relay: ' + EasyTierAdmin.buildClientWsUrl('default', '');
            }
        });
    
        // WSS Connection Test
        window.testWssConnection = function() {
            const btn = document.getElementById('wssTestBtn');
            const status = document.getElementById('wssTestStatus');
            const urlDisplay = document.getElementById('wssTestUrl');
            if (!btn || !status || !urlDisplay) return;
            
            btn.disabled = true;
            btn.style.opacity = '0.5';
            status.textContent = EasyTierAdmin.t('wss-test-testing', 'Testing...');
            status.style.color = 'var(--warning)';
            
            try {
                const wsUrl = EasyTierAdmin.buildClientWsUrl('wss-test');
                urlDisplay.textContent = wsUrl;
                
                const ws = new WebSocket(wsUrl);
                const timeout = setTimeout(() => {
                    ws.close();
                    status.textContent = EasyTierAdmin.t('wss-test-timeout', 'Timeout - no response from relay');
                    status.style.color = 'var(--danger)';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }, 8000);
                
                ws.onopen = function() {
                    clearTimeout(timeout);
                    status.textContent = EasyTierAdmin.t('wss-test-success', 'Connected! Relay is reachable via WSS');
                    status.style.color = 'var(--success)';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    ws.close();
                };
                
                ws.onerror = function() {
                    clearTimeout(timeout);
                    status.textContent = EasyTierAdmin.t('wss-test-failed', 'Connection failed - relay unreachable');
                    status.style.color = 'var(--danger)';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                };
            } catch(e) {
                status.textContent = EasyTierAdmin.t('wss-test-error', 'Error') + ': ' + e.message;
                status.style.color = 'var(--danger)';
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        };
        </script>
</body>
</html>
`;
