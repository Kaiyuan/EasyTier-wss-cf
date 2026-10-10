import { buildAdminI18nScript } from "./admin_i18n/index.js";

export const serveAdminDashboard = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EasyTier Relay Admin</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
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
            <div class="login-copy" style="margin: 0.5rem 0 1.5rem;">
                <h1 id="loginTitle" data-i18n="login-title">Sign in to continue</h1>
                <p id="loginHint" data-i18n="login-hint">Use the admin password configured in Cloudflare Workers to unlock the dashboard.</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 1.75rem;">
                <div class="top-lang-wrapper" onclick="document.getElementById('loginLang').focus()">
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
                    <div class="password-input-wrapper">
                        <input type="password" id="passwordInput" class="form-control" data-i18n-placeholder="password-placeholder" placeholder="Enter admin password" required>
                        <button type="button" class="password-toggle-btn" onclick="toggleSecretVisibility('passwordInput', this)" title="Show/Hide Password">
                            <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>
                <button type="submit" class="btn-submit" data-i18n="login-btn">
                    <i data-lucide="log-in" style="width: 16px; height: 16px;"></i>
                    <span>Sign In</span>
                </button>
            </form>
            <p id="loginError" class="login-error" style="color: var(--danger); font-size: 0.85rem; margin-top: 1rem; display: none;" data-i18n="login-error">Incorrect password. Please try again.</p>
        </div>
    </div>

    <!-- APP LAYOUT -->
    <div id="appLayout">
        <!-- Mobile Header Bar -->
        <div class="mobile-header">
            <button type="button" class="mobile-hamburger" onclick="toggleMobileSidebar()" title="Toggle Menu">
                <i data-lucide="menu" style="width: 22px; height: 22px;"></i>
            </button>
            <div style="display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-outfit); font-weight: 700; color: #ffffff;">
                <i data-lucide="network" style="width: 20px; height: 20px; color: var(--primary);"></i>
                <span>EasyTier</span>
            </div>
            <div class="status-online-dot"></div>
        </div>

        <!-- Mobile Drawer Overlay -->
        <div class="mobile-overlay" onclick="closeMobileSidebar()"></div>

        <!-- SIDEBAR -->
        <aside class="sidebar">
            <div>
                <div class="sidebar-brand">
                    <div class="sidebar-brand-icon">
                        <i data-lucide="network" style="width: 20px; height: 20px;"></i>
                    </div>
                    <div class="sidebar-brand-text">EasyTier Relay</div>
                    <span class="sidebar-brand-badge">EDGE</span>
                </div>

                <ul class="sidebar-nav">
                    <li class="menu-item active" data-tab="overview" onclick="switchTab('overview', this); closeMobileSidebar();">
                        <i data-lucide="layout-dashboard"></i>
                        <span data-i18n="menu-overview">Overview</span>
                    </li>
                    <li class="menu-item" data-tab="configs" onclick="switchTab('configs', this); closeMobileSidebar();">
                        <i data-lucide="folder-code"></i>
                        <span data-i18n="menu-configs">Configurations</span>
                    </li>
                    <li class="menu-item" data-tab="rooms" onclick="switchTab('rooms', this); closeMobileSidebar();">
                        <i data-lucide="network"></i>
                        <span data-i18n="menu-rooms">Rooms & Peers</span>
                    </li>
                    <li class="menu-item" data-tab="tools" onclick="switchTab('tools', this); closeMobileSidebar();">
                        <i data-lucide="cpu"></i>
                        <span data-i18n="menu-tools">Relay & Tools</span>
                    </li>
                    <li class="menu-item" data-tab="settings" onclick="switchTab('settings', this); closeMobileSidebar();">
                        <i data-lucide="sliders"></i>
                        <span data-i18n="menu-settings">Settings</span>
                    </li>
                </ul>
            </div>

            <div class="sidebar-footer">
                <div class="sidebar-user">
                    <div class="sidebar-user-info">
                        <div class="sidebar-avatar">A</div>
                        <span class="sidebar-user-name" data-i18n="role-admin">Administrator</span>
                    </div>
                    <button type="button" class="btn-icon-logout" onclick="handleLogout()" title="Logout">
                        <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </div>
        </aside>

        <!-- MAIN CONTENT AREA -->
        <main class="main-content">
            <!-- Top Navigation Bar -->
            <div class="top-nav">
                <div class="page-header-group">
                    <h2 id="pageTitle" data-i18n="menu-overview">Overview</h2>
                    <p id="pageSubtitle" class="page-subtitle" data-i18n="tab-overview-desc">Real-time network traffic, active nodes, and topology monitor</p>
                </div>

                <div class="header-controls">
                    <!-- Quick Relay URL Pill -->
                    <div class="endpoint-pill" onclick="copyRelayUrl()" title="Click to copy relay WSS endpoint">
                        <i data-lucide="link"></i>
                        <span id="topRelayUrl">wss://...</span>
                        <i data-lucide="copy"></i>
                    </div>

                    <!-- Auto-refresh Pill with Pause/Play and Manual Refresh -->
                    <div class="refresh-pill">
                        <div id="refreshSpinner" class="refresh-spinner"></div>
                        <i data-lucide="clock" id="clockIcon" style="width: 14px; height: 14px;"></i>
                        <span id="refreshText">Auto-refresh in 5s</span>
                        <button type="button" id="refreshToggleBtn" class="btn-pill-action" onclick="togglePolling()" title="Pause/Resume">
                            <i data-lucide="pause" style="width: 13px; height: 13px;"></i>
                        </button>
                        <button type="button" id="manualRefreshBtn" class="btn-pill-action" onclick="manualRefresh()" title="Refresh Now">
                            <i data-lucide="refresh-cw" style="width: 13px; height: 13px;"></i>
                        </button>
                    </div>

                    <!-- Language Switcher -->
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

                    <!-- Header Logout Button -->
                    <button type="button" class="btn-action" onclick="handleLogout()" title="Logout" style="padding: 0.45rem 0.75rem;">
                        <i data-lucide="log-out" style="width: 14px; height: 14px;"></i>
                        <span data-i18n="btn-logout">Sign Out</span>
                    </button>
                </div>
            </div>

            <!-- TAB 1: OVERVIEW -->
            <div id="tabOverview" class="tab-content active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i data-lucide="activity"></i></div>
                        <div class="stat-data">
                            <span class="stat-label" data-i18n="stat-status">Server Status</span>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span class="status-online-dot"></span>
                                <span class="stat-val" style="color: var(--success); font-size: 1.4rem;" data-i18n="stat-online">Online</span>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i data-lucide="radio"></i></div>
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
                            <span id="statTotalTraffic" class="stat-val" style="font-size: 1.25rem;">0 B / 0 B</span>
                        </div>
                    </div>
                </div>

                <!-- Live Network Topology Card -->
                <div class="topo-card">
                    <div class="topo-header">
                        <span class="topo-title">
                            <i data-lucide="git-branch" style="color: var(--primary);"></i>
                            <span data-i18n="topo-map-title">Network Topology Map</span>
                        </span>
                        <div class="topo-legend">
                            <div><span class="legend-dot" style="background: var(--primary); box-shadow: 0 0 6px var(--primary-glow);"></span>Cloudflare Relay</div>
                            <div><span class="legend-dot" style="background: var(--success); box-shadow: 0 0 6px var(--success-glow);"></span>Active Peer</div>
                        </div>
                    </div>
                    <div class="topo-body" id="topoBody">
                        <svg class="topo-svg" id="topoSvg"></svg>
                        <div id="topoEmptyState" class="radar-empty-state">
                            <div class="radar-scan-box">
                                <i data-lucide="radar"></i>
                            </div>
                            <div data-i18n="topo-no-nodes" style="font-size: 0.95rem;">No nodes connected. WSS relay is empty.</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 2: CONFIGURATIONS (项目/配置管理核心页面) -->
            <div id="tabConfigs" class="tab-content">
                <div class="table-card">
                    <div class="table-header-row">
                        <div class="table-title">
                            <i data-lucide="folder-code" style="color: var(--primary);"></i>
                            <span data-i18n="easytier-configs-title">EasyTier Config Files</span>
                        </div>
                        <div class="toolbar-controls">
                            <div class="search-wrapper">
                                <i data-lucide="search"></i>
                                <input type="text" class="search-input" data-i18n-placeholder="search-placeholder" placeholder="Search configs by name, network or IP..." oninput="filterEasyTierConfigs(this.value)">
                            </div>
                            <button type="button" class="btn-primary" onclick="openEasyTierConfigModal()">
                                <i data-lucide="plus"></i>
                                <span data-i18n="btn-add-easytier-config">Add Config File</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Stats summary bar -->
                    <div class="config-stats-bar">
                        <div class="config-stat-item">
                            <span data-i18n="stat-total-configs">Total Configs</span>: <strong id="statTotalConfigsVal">0</strong>
                        </div>
                        <div style="opacity: 0.3;">|</div>
                        <div class="config-stat-item">
                            <span>DHCP</span>: <strong id="statDhcpConfigsVal">0</strong>
                        </div>
                        <div style="opacity: 0.3;">|</div>
                        <div class="config-stat-item">
                            <span>Encrypted</span>: <strong id="statEncConfigsVal">0</strong>
                        </div>
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
                                <!-- Dynamic Rows -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- TAB 3: ROOMS & PEERS -->
            <div id="tabRooms" class="tab-content">
                <div class="table-card">
                    <div class="table-header-row">
                        <div class="table-title">
                            <i data-lucide="network" style="color: var(--primary);"></i>
                            <span data-i18n="rooms-list-title">Active Relay Rooms</span>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th data-i18n="th-room-name">Room ID</th>
                                    <th data-i18n="th-peer-count">Active Peers</th>
                                    <th data-i18n="th-actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="roomsTableBody">
                                <!-- Dynamic Rooms -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Room Peers Detail Box -->
                <div id="roomPeersCard" class="table-card" style="display: none;">
                    <div class="table-header-row">
                        <div class="table-title">
                            <i data-lucide="users" style="color: var(--cyan);"></i>
                            <span id="roomPeersTitle">Room Peers</span>
                        </div>
                        <button type="button" class="btn-action" onclick="closeRoomPeers()">
                            <i data-lucide="x"></i>
                            <span data-i18n="btn-close">Close</span>
                        </button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th data-i18n="th-peer-id">Peer ID</th>
                                    <th data-i18n="th-virtual-ip">Virtual IP</th>
                                    <th data-i18n="th-hostname">Hostname</th>
                                    <th data-i18n="th-version">Version</th>
                                    <th data-i18n="th-rx-tx">Rx / Tx Traffic</th>
                                    <th data-i18n="th-conn-time">Connected Time</th>
                                    <th data-i18n="th-actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="peersTableBody">
                                <!-- Dynamic Peers -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- TAB 4: RELAY TOOLS & DIAGNOSTICS -->
            <div id="tabTools" class="tab-content">
                <!-- WSS Connection Test -->
                <div class="table-card">
                    <div class="table-header-row">
                        <div class="table-title">
                            <i data-lucide="plug-2" style="color: var(--primary);"></i>
                            <span data-i18n="wss-test-title">WSS Connection Test</span>
                        </div>
                        <button type="button" class="btn-primary" onclick="testWssConnection()" id="wssTestBtn">
                            <i data-lucide="play"></i>
                            <span data-i18n="wss-test-btn">Test Connection</span>
                        </button>
                    </div>
                    <div style="padding: 1.5rem 1.75rem;">
                        <div class="diagnostic-result-box">
                            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
                                <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;" data-i18n="relay-endpoint">Relay Endpoint</div>
                                <button type="button" class="btn-action" onclick="copyRelayUrl()">
                                    <i data-lucide="copy" style="width: 13px; height: 13px;"></i>
                                    <span data-i18n="action-copy-wss">Copy WSS</span>
                                </button>
                            </div>
                            <div id="wssTestUrl" style="color: #ffffff; font-family: var(--font-mono); font-size: 0.9rem; word-break: break-all;"></div>
                            <div id="wssTestStatus" style="font-weight: 600; margin-top: 0.5rem;" data-i18n="wss-test-not-tested">Click "Test Connection" to verify WSS relay</div>
                        </div>
                    </div>
                </div>

                <!-- Client Quick Start Guide -->
                <div class="table-card">
                    <div class="table-header-row">
                        <div class="table-title">
                            <i data-lucide="terminal" style="color: var(--secondary);"></i>
                            <span>EasyTier Client Quick Start</span>
                        </div>
                    </div>
                    <div style="padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 1.25rem;">
                        <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;">
                            Connect your nodes to this Cloudflare Worker WebSocket relay using the official EasyTier client. EasyTier automatically negotiates P2P direct tunnels while utilizing this relay as a fallback switch.
                        </p>
                        
                        <div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--text-primary);">1. Command Line (CLI)</h4>
                            <div class="code-preview-block" style="padding: 1rem; position: relative;">
<span style="color:#60a5fa;">sudo easytier-core</span> -d \\
  --network-name <span style="color:#34d399;">"mynet"</span> \\
  --network-secret <span style="color:#34d399;">"mypassword"</span> \\
  -p <span style="color:#f472b6;" id="cliExampleUrl">wss://your-relay-domain</span></div>
                        </div>

                        <div>
                            <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--text-primary);">2. Configuration File (.toml)</h4>
                            <div class="code-preview-block" style="padding: 1rem;">
<span style="color:#94a3b8;"># Generate and download a tailored .toml config file from the Configurations tab!</span>
<span style="color:#60a5fa;">easytier-core</span> -c /path/to/node.toml</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 5: SETTINGS -->
            <div id="tabSettings" class="tab-content">
                <div class="table-card">
                    <div class="table-header-row">
                        <div class="table-title">
                            <i data-lucide="shield" style="color: var(--primary);"></i>
                            <span data-i18n="settings-admin-pass">Admin Password & Security</span>
                        </div>
                    </div>
                    <div style="padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 1.25rem;">
                        <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.7;" data-i18n="set-pass-env-note">
                            The admin password is configured via the ADMIN_PASSWORD environment variable in the Cloudflare Workers dashboard. Changes take effect after redeployment.
                        </p>
                        
                        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
                            <h4 style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.5rem;">How to change your password:</h4>
                            <ol style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.8; margin-left: 1.25rem;">
                                <li>Open your <strong style="color: #ffffff;">Cloudflare Dashboard</strong> &rarr; Workers &amp; Pages.</li>
                                <li>Select your EasyTier Worker &rarr; <strong style="color: #ffffff;">Settings</strong> &rarr; <strong style="color: #ffffff;">Variables and Secrets</strong>.</li>
                                <li>Edit or add <code style="background: rgba(99,102,241,0.2); color: #c7d2fe; padding: 0.1em 0.4em; border-radius: 4px;">ADMIN_PASSWORD</code> with your desired password.</li>
                                <li>Save and deploy.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- MODAL 1: ADD / EDIT EASYTIER CONFIG -->
    <div id="easyTierConfigModal" class="modal">
        <div class="modal-card">
            <div class="modal-header">
                <div class="modal-title">
                    <i data-lucide="sliders" style="color: var(--primary);"></i>
                    <span data-i18n="easytier-config-modal-title">Add EasyTier Config</span>
                </div>
                <button type="button" class="modal-close-btn" onclick="closeEasyTierConfigModal()" title="Close">
                    <i data-lucide="x" style="width: 20px; height: 20px;"></i>
                </button>
            </div>

            <form onsubmit="handleCreateEasyTierConfig(event)">
                <input type="hidden" id="easyTierConfigId">
                
                <!-- Group 1: Network Identity -->
                <div class="modal-section-title">
                    <i data-lucide="globe"></i>
                    <span data-i18n="section-net-identity">Network Identity</span>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label for="easyTierConfigInstanceName" data-i18n="label-instance-name">Instance Name</label>
                        <input type="text" id="easyTierConfigInstanceName" class="form-control" data-i18n-placeholder="placeholder-instance-name" placeholder="e.g. Home-Node">
                    </div>
                    <div class="form-group">
                        <label for="easyTierConfigNetworkName" data-i18n="easytier-config-network-name">Network Name *</label>
                        <input type="text" id="easyTierConfigNetworkName" class="form-control" data-i18n-placeholder="placeholder-network-name" placeholder="e.g. mynet" required>
                    </div>
                </div>
                <div class="form-group" style="margin-top: -0.5rem; margin-bottom: 1.5rem;">
                    <label for="easyTierConfigNetworkSecret" data-i18n="easytier-config-network-secret">Network Secret *</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="easyTierConfigNetworkSecret" class="form-control" data-i18n-placeholder="placeholder-network-secret" placeholder="Enter network password" required>
                        <button type="button" class="password-toggle-btn" onclick="toggleSecretVisibility('easyTierConfigNetworkSecret', this)" title="Show/Hide Secret">
                            <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>

                <!-- Group 2: IP & DHCP -->
                <div class="modal-section-title">
                    <i data-lucide="binary"></i>
                    <span data-i18n="section-ip-settings">IP & DHCP</span>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label for="easyTierConfigIpv4" data-i18n="label-ipv4">Virtual IPv4</label>
                        <input type="text" id="easyTierConfigIpv4" class="form-control" data-i18n-placeholder="placeholder-ipv4" placeholder="e.g. 10.14.14.1/24">
                    </div>
                    <div class="switch-control" style="align-self: flex-end; margin-bottom: 1rem;">
                        <span style="font-size: 0.9rem; font-weight: 500;" data-i18n="label-dhcp">Enable DHCP</span>
                        <label class="switch">
                            <input type="checkbox" id="easyTierConfigDhcp">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>

                <!-- Group 3: Connections -->
                <div class="modal-section-title">
                    <i data-lucide="share-2"></i>
                    <span data-i18n="section-connections">Connections & Relay</span>
                </div>
                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                        <label for="easyTierConfigPeers" data-i18n="label-peers">P2P Peers (one per line)</label>
                        <button type="button" class="btn-action" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="fillCurrentRelayIntoPeers()">
                            <i data-lucide="plus" style="width: 12px; height: 12px;"></i>
                            <span data-i18n="fill-current-relay">Fill Current Relay</span>
                        </button>
                    </div>
                    <textarea id="easyTierConfigPeers" class="form-control" rows="3" data-i18n-placeholder="placeholder-peers" placeholder="wss://your-domain:443 (one per line)"></textarea>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label for="easyTierConfigRpcPortal" data-i18n="label-rpc-portal">RPC Portal Address</label>
                        <input type="text" id="easyTierConfigRpcPortal" class="form-control" value="127.0.0.1:15888">
                    </div>
                    <div class="form-group">
                        <label for="easyTierConfigProxyNetworks" data-i18n="label-proxy-networks">Proxy Subnets (CIDR)</label>
                        <textarea id="easyTierConfigProxyNetworks" class="form-control" rows="1" data-i18n-placeholder="placeholder-proxy-networks" placeholder="e.g. 192.168.1.0/24"></textarea>
                    </div>
                </div>

                <!-- Group 4: Options & Flags -->
                <div class="modal-section-title">
                    <i data-lucide="settings-2"></i>
                    <span data-i18n="section-flags">Options & Flags</span>
                </div>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label for="easyTierConfigProtocol" data-i18n="label-protocol">Default Protocol</label>
                        <select id="easyTierConfigProtocol" class="form-control">
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
                </div>

                <div class="form-grid-2" style="align-items: center;">
                    <div class="form-group">
                        <label for="easyTierConfigMtu" data-i18n="label-mtu">MTU</label>
                        <input type="number" id="easyTierConfigMtu" class="form-control" value="1380">
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div class="switch-control">
                            <span style="font-size: 0.88rem; font-weight: 500;" data-i18n="label-encryption">Enable Encryption</span>
                            <label class="switch">
                                <input type="checkbox" id="easyTierConfigEncryption" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="switch-control">
                            <span style="font-size: 0.88rem; font-weight: 500;" data-i18n="label-ipv6">Enable IPv6</span>
                            <label class="switch">
                                <input type="checkbox" id="easyTierConfigIpv6" checked>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="switch-control">
                            <span style="font-size: 0.88rem; font-weight: 500;" data-i18n="label-latency-first">Latency First</span>
                            <label class="switch">
                                <input type="checkbox" id="easyTierConfigLatencyFirst">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Group 5: Notes -->
                <div class="form-group" style="margin-top: 0.5rem;">
                    <label for="easyTierConfigNotes" data-i18n="easytier-config-notes">Notes</label>
                    <textarea id="easyTierConfigNotes" class="form-control" rows="2" data-i18n-placeholder="placeholder-notes" placeholder="Optional notes"></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="closeEasyTierConfigModal()" data-i18n="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-primary" data-i18n="btn-confirm">Save Configuration</button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL 2: TOML QUICK PREVIEW -->
    <div id="easyTierPreviewModal" class="modal">
        <div class="modal-card" style="max-width: 680px;">
            <div class="modal-header">
                <div class="modal-title">
                    <i data-lucide="file-text" style="color: var(--cyan);"></i>
                    <span id="previewModalTitle" data-i18n="preview-modal-title">EasyTier Config Preview</span>
                </div>
                <button type="button" class="modal-close-btn" onclick="closeEasyTierPreviewModal()" title="Close">
                    <i data-lucide="x" style="width: 20px; height: 20px;"></i>
                </button>
            </div>
            
            <pre class="code-preview-block" id="previewTomlCode"></pre>

            <div class="modal-actions">
                <button type="button" class="btn-secondary" onclick="copyPreviewToml()">
                    <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
                    <span data-i18n="action-copy-cmd">Copy</span>
                </button>
                <button type="button" class="btn-primary" onclick="downloadPreviewToml()">
                    <i data-lucide="download" style="width: 14px; height: 14px;"></i>
                    <span data-i18n="action-download-toml">Download TOML</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Embedded Scripts -->
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
                        if (tableLabels[table] && tableLabels[table][index]) {
                            td.setAttribute('data-label', tableLabels[table][index]);
                        }
                    });
                });
            }
        }

        window.refreshTableLabels = refreshTableLabels;

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
        document.addEventListener('DOMContentLoaded', function() {
            setupTableLabels();
            setTimeout(function() {
                if (window.EasyTierAdmin && EasyTierAdmin.buildClientWsUrl) {
                    const relayUrl = EasyTierAdmin.buildClientWsUrl();
                    const topRelayDisplay = document.getElementById('topRelayUrl');
                    const wssTestUrl = document.getElementById('wssTestUrl');
                    const cliExampleUrl = document.getElementById('cliExampleUrl');
                    if (topRelayDisplay) topRelayDisplay.textContent = relayUrl;
                    if (wssTestUrl) wssTestUrl.textContent = 'Relay: ' + relayUrl;
                    if (cliExampleUrl) cliExampleUrl.textContent = relayUrl;
                }
            }, 100);
        });

        // WSS Connection Test with Latency Measurement
        window.testWssConnection = function() {
            const btn = document.getElementById('wssTestBtn');
            const status = document.getElementById('wssTestStatus');
            const urlDisplay = document.getElementById('wssTestUrl');
            if (!btn || !status || !urlDisplay) return;
            
            btn.disabled = true;
            btn.style.opacity = '0.5';
            status.textContent = EasyTierAdmin.t('wss-test-testing', 'Testing connection...');
            status.style.color = 'var(--warning)';
            
            try {
                const wsUrl = EasyTierAdmin.buildTestWsUrl('wss-test');
                urlDisplay.textContent = wsUrl;
                const startTime = performance.now();
                
                const ws = new WebSocket(wsUrl);
                const timeout = setTimeout(() => {
                    try { ws.close(); } catch(_) {}
                    status.textContent = EasyTierAdmin.t('wss-test-timeout', 'Timeout - no response from relay (8000ms)');
                    status.style.color = 'var(--danger)';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }, 8000);
                
                ws.onopen = function() {
                    clearTimeout(timeout);
                    const rtt = Math.round(performance.now() - startTime);
                    status.textContent = EasyTierAdmin.t('wss-test-success', 'Connected! Relay is reachable via WSS') + ' (' + rtt + 'ms)';
                    status.style.color = 'var(--success)';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    try { ws.close(); } catch(_) {}
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
