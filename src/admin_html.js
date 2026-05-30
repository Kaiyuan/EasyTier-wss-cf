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
    <style>
        :root {
            --bg-color: #080c14;
            --card-bg: rgba(17, 24, 39, 0.7);
            --sidebar-bg: rgba(15, 23, 42, 0.95);
            --border-color: rgba(255, 255, 255, 0.08);
            --text-primary: #f3f4f6;
            --text-secondary: #9ca3af;
            --text-muted: #6b7280;
            --primary: #6366f1;
            --primary-hover: #4f46e5;
            --secondary: #8b5cf6;
            --success: #10b981;
            --danger: #ef4444;
            --warning: #f59e0b;
            --font-outfit: 'Outfit', sans-serif;
            --font-inter: 'Inter', sans-serif;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-inter);
            background-color: var(--bg-color);
            color: var(--text-primary);
            overflow: hidden;
            height: 100vh;
            background-image: 
                radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 45%),
                radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.12) 0%, transparent 45%);
        }

        /* Utility classes */
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .align-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 0.5rem; }
        .gap-4 { gap: 1rem; }

        /* Login Screen */
        #loginScreen {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 100;
            background-color: var(--bg-color);
        }

        .login-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 3rem;
            width: 100%;
            max-width: 450px;
            backdrop-filter: blur(20px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            text-align: center;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .login-logo {
            font-family: var(--font-outfit);
            font-size: 2rem;
            font-weight: 800;
            background: linear-gradient(135deg, #a78bfa, #6366f1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 2rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }

        .form-group label {
            display: block;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        .form-control {
            width: 100%;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            padding: 0.75rem 1rem;
            color: var(--text-primary);
            font-family: var(--font-inter);
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.3s;
        }

        .form-control:focus {
            border-color: var(--primary);
        }

        .btn-submit {
            width: 100%;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: #ffffff;
            border: none;
            border-radius: 10px;
            padding: 0.75rem;
            font-family: var(--font-outfit);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            transition: all 0.3s;
        }

        .btn-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        }

        .login-error {
            color: var(--danger);
            font-size: 0.85rem;
            margin-top: 1rem;
            display: none;
        }

        /* App Layout */
        #appLayout {
            display: flex;
            height: 100vh;
            width: 100vw;
            opacity: 0;
            transition: opacity 0.5s ease;
        }

        /* Sidebar */
        aside {
            width: 260px;
            background: var(--sidebar-bg);
            border-right: 1px solid var(--border-color);
            padding: 2rem 1.5rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            flex-shrink: 0;
            z-index: 10;
        }

        .brand {
            font-family: var(--font-outfit);
            font-size: 1.35rem;
            font-weight: 700;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 3rem;
        }

        .menu-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex-grow: 1;
        }

        .menu-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            color: var(--text-secondary);
            text-decoration: none;
            border-radius: 10px;
            font-weight: 500;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .menu-item:hover, .menu-item.active {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.05);
        }

        .menu-item.active {
            border-left: 3px solid var(--primary);
            background: rgba(99, 102, 241, 0.1);
        }

        .sidebar-footer {
            border-top: 1px solid var(--border-color);
            padding-top: 1.5rem;
            margin-top: auto;
        }

        .user-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .logout-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            transition: color 0.2s;
        }

        .logout-btn:hover {
            color: var(--danger);
        }

        /* Main Content Container */
        main {
            flex-grow: 1;
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            height: 100vh;
        }

        /* Top Header */
        .top-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .page-title {
            font-family: var(--font-outfit);
            font-size: 1.75rem;
            font-weight: 700;
        }

        .refresh-indicator {
            font-size: 0.8rem;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.03);
            padding: 0.4rem 0.8rem;
            border-radius: 9999px;
            border: 1px solid var(--border-color);
        }

        .refresh-spinner {
            width: 12px;
            height: 12px;
            border: 2px solid var(--text-muted);
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: none;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Dashboard Overview Content */
        .tab-content {
            display: none;
            flex-direction: column;
            gap: 2rem;
            animation: fadeIn 0.4s ease;
        }

        .tab-content.active {
            display: flex;
        }

        /* Cards Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
        }

        .stat-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            backdrop-filter: blur(15px);
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            gap: 1.25rem;
        }

        .stat-icon {
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stat-data {
            display: flex;
            flex-direction: column;
        }

        .stat-label {
            font-size: 0.8rem;
            color: var(--text-secondary);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .stat-val {
            font-family: var(--font-outfit);
            font-size: 1.6rem;
            font-weight: 700;
            margin-top: 0.25rem;
        }

        /* Topology Card */
        .topo-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 1.5rem;
            min-height: 400px;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(15px);
        }

        .topo-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .topo-title {
            font-family: var(--font-outfit);
            font-size: 1.15rem;
            font-weight: 600;
        }

        .topo-body {
            flex-grow: 1;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            position: relative;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 350px;
        }

        .topo-svg {
            width: 100%;
            height: 100%;
            min-height: 350px;
            position: absolute;
            top: 0;
            left: 0;
        }

        /* Tables & Lists */
        .table-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 1.5rem;
            backdrop-filter: blur(15px);
        }

        .table-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .table-title {
            font-family: var(--font-outfit);
            font-size: 1.2rem;
            font-weight: 700;
        }

        .table-container {
            width: 100%;
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        th {
            padding: 1rem;
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 0.85rem;
            border-bottom: 1px solid var(--border-color);
            text-transform: uppercase;
        }

        td {
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
            font-size: 0.9rem;
            vertical-align: middle;
        }

        tr:hover td {
            background: rgba(255, 255, 255, 0.01);
        }

        .badge-status {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.25rem 0.6rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .badge-success { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .badge-danger { background: rgba(239, 68, 68, 0.15); color: var(--danger); }
        .badge-warning { background: rgba(245, 158, 11, 0.15); color: var(--warning); }

        .btn-action {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 0.4rem 0.8rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.8rem;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            transition: all 0.2s;
        }

        .btn-action:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: var(--primary);
        }

        .btn-danger-action {
            background: rgba(239, 68, 68, 0.05);
            border-color: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
        }

        .btn-danger-action:hover {
            background: rgba(239, 68, 68, 0.15);
            border-color: var(--danger);
            color: #ffffff;
        }

        .btn-create {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border: none;
            color: #ffffff;
            padding: 0.6rem 1.25rem;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);
            transition: all 0.2s;
        }

        .btn-create:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
        }

        /* Language switcher */
        .header-controls {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .top-lang-wrapper {
            position: relative;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-color);
            padding: 0.4rem 1.5rem 0.4rem 0.8rem;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            gap: 0.35rem;
            cursor: pointer;
        }

        .top-lang-select {
            background: transparent;
            color: var(--text-primary);
            border: none;
            outline: none;
            font-size: 0.8rem;
            font-weight: 500;
            appearance: none;
            cursor: pointer;
        }

        .top-lang-arrow {
            position: absolute;
            right: 0.6rem;
            color: var(--text-muted);
            pointer-events: none;
            width: 12px;
            height: 12px;
        }

        /* Settings CSS */
        .settings-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 2rem;
            backdrop-filter: blur(15px);
            max-width: 700px;
        }

        .settings-title {
            font-family: var(--font-outfit);
            font-size: 1.35rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.75rem;
        }

        .settings-group {
            margin-bottom: 2rem;
        }

        .switch-control {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .switch-label h4 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .switch-label p {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        /* Toggle switch */
        .switch {
            position: relative;
            display: inline-block;
            width: 52px;
            height: 28px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.1);
            transition: .4s;
            border-radius: 34px;
            border: 1px solid var(--border-color);
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: var(--primary);
        }

        input:checked + .slider:before {
            transform: translateX(24px);
        }

        /* Modal styling */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 200;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(5px);
        }

        .modal-card {
            background: var(--sidebar-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 2.5rem;
            width: 100%;
            max-width: 500px;
            animation: slideUp 0.3s ease;
        }

        .modal-title {
            font-family: var(--font-outfit);
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
        }

        .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 2rem;
        }

        .btn-cancel {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            padding: 0.6rem 1.25rem;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
        }

        .btn-cancel:hover {
            background: rgba(255, 255, 255, 0.03);
            color: #ffffff;
        }

        /* Custom Alert Banner */
        .alert-banner {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.2);
            color: #fcd34d;
            padding: 1rem;
            border-radius: 12px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 2rem;
        }
    </style>
</head>
<body>

    <!-- LOGIN SCREEN -->
    <div id="loginScreen">
        <div class="login-card">
            <div class="login-logo">
                <i data-lucide="network"></i>
                <span>EasyTier Admin</span>
            </div>
            
            <div class="form-group" style="text-align: center; margin-bottom: 2rem;">
                <div class="top-lang-wrapper" style="display: inline-flex;" onclick="document.getElementById('loginLang').focus()">
                    <i data-lucide="languages" style="width: 14px; height: 14px;"></i>
                    <select id="loginLang" class="top-lang-select" onchange="switchLanguage(this.value)">
                        <option value="en">English</option>
                        <option value="zh-CN">绠€浣撲腑锟?/option>
                        <option value="zh-TW">绻侀珨涓枃</option>
                        <option value="ja">鏃ユ湰锟?/option>
                        <option value="ko">頃滉淡锟?/option>
                    </select>
                    <i data-lucide="chevron-down" class="top-lang-arrow"></i>
                </div>
            </div>

            <form onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label for="passwordInput" data-i18n="login-label">Admin Password</label>
                    <input type="password" id="passwordInput" class="form-control" placeholder="鈥⑩€⑩€⑩€⑩€⑩€⑩€拷? required>
                </div>
                <button type="submit" class="btn-submit" data-i18n="login-btn">Sign In</button>
            </form>
            <p id="loginError" class="login-error" data-i18n="login-error">Incorrect password. Please try again.</p>
        </div>
    </div>

    <!-- APP LAYOUT -->
    <div id="appLayout">
        <!-- Sidebar -->
        <aside>
            <div class="flex-col">
                <div class="brand">
                    <i data-lucide="network" style="color: var(--primary);"></i>
                    <span>EasyTier Relay</span>
                </div>
                <ul class="menu-list">
                    <li class="menu-item active" onclick="switchTab('overview', this)">
                        <i data-lucide="layout-dashboard"></i>
                        <span data-i18n="menu-overview">Overview</span>
                    </li>
                    <li class="menu-item" onclick="switchTab('rooms', this)">
                        <i data-lucide="folder-tree"></i>
                        <span data-i18n="menu-rooms">Rooms & Peers</span>
                    </li>
                    <li class="menu-item" onclick="switchTab('tokens', this)">
                        <i data-lucide="key-round"></i>
                        <span data-i18n="menu-tokens">Client Tokens</span>
                    </li>
                    <li class="menu-item" onclick="switchTab('settings', this)">
                        <i data-lucide="settings"></i>
                        <span data-i18n="menu-settings">Settings</span>
                    </li>
                </ul>
            </div>
            <div class="sidebar-footer">
                <div class="user-info">
                    <span id="adminText" data-i18n="role-admin">Administrator</span>
                    <button class="logout-btn" onclick="handleLogout()" title="Logout">
                        <i data-lucide="log-out" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
            </div>
        </aside>

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
                            <option value="zh-CN">绠€浣撲腑锟?/option>
                            <option value="zh-TW">绻侀珨涓枃</option>
                            <option value="ja">鏃ユ湰锟?/option>
                            <option value="ko">頃滉淡锟?/option>
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
            </div>

            <!-- TAB: ROOMS -->
            <div id="tabRooms" class="tab-content">
                <div class="table-card">
                    <div class="table-header-row">
                        <span class="table-title" data-i18n="rooms-list-title">Relay Rooms</span>
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
                                <!-- Dynamic -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Dynamic Room Peers Detail Box -->
                <div id="roomPeersCard" class="table-card" style="display: none;">
                    <div class="table-header-row">
                        <span id="roomPeersTitle" class="table-title">Room Peers</span>
                        <button class="btn-action" onclick="closeRoomPeers()"><i data-lucide="x"></i><span data-i18n="btn-close">Close</span></button>
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
                                <!-- Dynamic -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- TAB: TOKENS -->
            <div id="tabTokens" class="tab-content">
                <div class="table-card">
                    <div class="table-header-row">
                        <span class="table-title" data-i18n="tokens-title">Client Connection Tokens</span>
                        <button class="btn-create" onclick="openCreateTokenModal()">
                            <i data-lucide="plus"></i>
                            <span data-i18n="btn-gen-token">Generate Token</span>
                        </button>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th data-i18n="th-token">Token</th>
                                    <th data-i18n="th-desc">Description</th>
                                    <th data-i18n="th-created">Created At</th>
                                    <th data-i18n="th-actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="tokensTableBody">
                                <!-- Dynamic -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- TAB: SETTINGS -->
            <div id="tabSettings" class="tab-content">
                <div class="settings-card">
                    <div class="settings-title" data-i18n="settings-general">General Configuration</div>
                    <div class="settings-group">
                        <div class="switch-control">
                            <div class="switch-label">
                                <h4 data-i18n="set-req-token-title">Require Client Connection Token</h4>
                                <p data-i18n="set-req-token-desc">Reject EasyTier clients connection unless they present a valid token via query parameters.</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="requireTokenToggle" onchange="handleToggleRequireToken(this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="settings-title" data-i18n="settings-admin-pass">Admin Password</div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6;" data-i18n="set-pass-env-note">The admin password is configured via the <code style="background:rgba(255,255,255,0.08);padding:0.1em 0.4em;border-radius:4px;">ADMIN_PASSWORD</code> environment variable in the Cloudflare Workers dashboard. Changes take effect after redeployment.</p>
                </div>
            </div>
        </main>
    </div>

    <!-- MODAL: CREATE TOKEN -->
    <div id="createTokenModal" class="modal">
        <div class="modal-card">
            <h3 class="modal-title" data-i18n="btn-gen-token">Generate Token</h3>
            <form onsubmit="handleCreateToken(event)">
                <div class="form-group">
                    <label for="tokenDescInput" data-i18n="th-desc">Description</label>
                    <input type="text" id="tokenDescInput" class="form-control" placeholder="e.g. Home Node, Office VPS" required>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="closeCreateTokenModal()" data-i18n="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-submit" style="width: auto; padding: 0.6rem 1.5rem;" data-i18n="btn-confirm">Generate</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Translations & Dashboard JS Logic -->
    <script>
        const translations = {
            en: {
                "login-label": "Admin Password",
                "login-btn": "Sign In",
                "login-error": "Incorrect password. Please try again.",
                "menu-overview": "Overview",
                "menu-rooms": "Rooms & Peers",
                "menu-tokens": "Client Tokens",
                "menu-settings": "Settings",
                "role-admin": "Administrator",
                "stat-status": "Server Status",
                "stat-online": "Online",
                "stat-active-rooms": "Active Rooms",
                "stat-connected-peers": "Total Peers",
                "stat-total-traffic": "Traffic (Rx/Tx)",
                "topo-map-title": "Network Topology Map",
                "topo-no-nodes": "No nodes connected. WSS relay is empty.",
                "rooms-list-title": "Active Relay Rooms",
                "th-room-name": "Room ID",
                "th-peer-count": "Active Peers",
                "th-actions": "Actions",
                "btn-close": "Close",
                "th-peer-id": "Peer ID",
                "th-virtual-ip": "Virtual IP",
                "th-hostname": "Hostname",
                "th-version": "Version",
                "th-rx-tx": "Rx / Tx Traffic",
                "th-conn-time": "Connected Time",
                "tokens-title": "Client Connection Tokens",
                "btn-gen-token": "Generate Token",
                "th-token": "Token",
                "th-desc": "Description",
                "th-created": "Created At",
                "settings-general": "General Configuration",
                "set-req-token-title": "Require Connection Token",
                "set-req-token-desc": "Enforce EasyTier clients to connect with a valid token parameter.",
                "settings-admin-pass": "Change Admin Password",
                "set-new-pass": "New Password",
                "btn-save": "Save Password",
                "btn-cancel": "Cancel",
                "btn-confirm": "Confirm",
                "alert-security-title": "Security Warning: ",
                "alert-security-desc": "You are using the default admin password 'admin'. Please change it immediately.",
                "action-view": "View Peers",
                "action-kick": "Kick",
                "action-ban": "Ban",
                "action-delete": "Delete",
                "msg-changed-pass": "Admin password updated successfully!",
                "msg-gen-success": "Token generated successfully!",
                "msg-kicked-success": "Peer kicked successfully!",
                "msg-deleted-success": "Token deleted successfully!",
                "set-pass-env-note": "The admin password is configured via the ADMIN_PASSWORD environment variable in the Cloudflare Workers dashboard. Changes take effect after redeployment."
            },
            "zh-CN": {
                "login-label": "绠＄悊鍛樺瘑锟?,
                "login-btn": "鐧诲綍",
                "login-error": "瀵嗙爜閿欒锛岃閲嶈瘯锟?,
                "menu-overview": "绯荤粺姒傝",
                "menu-rooms": "鎴块棿涓庤妭锟?,
                "menu-tokens": "杩炴帴浠ょ墝",
                "menu-settings": "閰嶇疆涓績",
                "role-admin": "绯荤粺绠＄悊锟?,
                "stat-status": "杩愯鐘讹拷?,
                "stat-online": "姝ｅ父杩愯",
                "stat-active-rooms": "娲昏穬鎴块棿锟?,
                "stat-connected-peers": "鎬诲湪绾胯妭锟?,
                "stat-total-traffic": "浼犺緭娴侀噺 (鎺ユ敹/鍙戯拷?",
                "topo-map-title": "缃戠粶鎷撴墤缁撴瀯锟?,
                "topo-no-nodes": "鏆傛棤鑺傜偣杩炴帴锛屼腑缁ф湇鍔″櫒绌洪棽涓拷?,
                "rooms-list-title": "娲昏穬涓户鎴块棿鍒楄〃",
                "th-room-name": "鎴块棿 ID",
                "th-peer-count": "鍦ㄧ嚎鑺傜偣锟?,
                "th-actions": "鎿嶄綔",
                "btn-close": "鍏抽棴",
                "th-peer-id": "鑺傜偣 ID",
                "th-virtual-ip": "铏氭嫙 IP (EasyTier)",
                "th-hostname": "涓绘満锟?,
                "th-version": "EasyTier 鐗堟湰",
                "th-rx-tx": "鎺ユ敹 / 鍙戦€佹祦锟?,
                "th-conn-time": "宸茶繛鎺ユ椂锟?,
                "tokens-title": "瀹㈡埛绔繛鎺ヨ闂护锟?(Tokens)",
                "btn-gen-token": "鍒涘缓鏂颁护锟?,
                "th-token": "浠ょ墝绉橀挜",
                "th-desc": "浠ょ墝鐢ㄩ€旀弿锟?,
                "th-created": "鍒涘缓鏃堕棿",
                "settings-general": "鍏ㄥ眬涓户閰嶇疆",
                "set-req-token-title": "鍚敤瀹㈡埛绔繛鎺ヤ护鐗屾牎锟?,
                "set-req-token-desc": "寮哄埗 EasyTier 瀹㈡埛绔湪杩炴帴鏃跺繀椤绘惡甯﹀悎娉曠殑 token 鏌ヨ鍙傛暟锛屽惁鍒欐嫆缁濊繛鎺ワ拷?,
                "settings-admin-pass": "淇敼绠＄悊鍛樼櫥褰曞瘑锟?,
                "set-new-pass": "杈撳叆鏂板瘑锟?,
                "btn-save": "淇濆瓨淇敼",
                "btn-cancel": "鍙栨秷",
                "btn-confirm": "鐢熸垚",
                "alert-security-title": "瀹夊叏璀﹀憡: ",
                "alert-security-desc": "鎮ㄥ綋鍓嶆鍦ㄤ娇鐢ㄩ粯璁ゅ瘑锟?'admin' 鐧诲綍锛屼负浜嗗畨鍏紝璇风珛鍗充慨鏀瑰瘑鐮侊紒",
                "action-view": "鏌ョ湅鑺傜偣",
                "action-kick": "韪㈠嚭",
                "action-ban": "鍔犲叆榛戝悕锟?,
                "action-delete": "娉ㄩ攢",
                "msg-changed-pass": "绠＄悊鍛樺瘑鐮佷慨鏀规垚鍔燂紒",
                "msg-gen-success": "浠ょ墝鐢熸垚鎴愬姛锟?,
                "msg-kicked-success": "鑺傜偣宸叉垚鍔熻涪鍑猴紒",
                "msg-deleted-success": "浠ょ墝宸叉垚鍔熸敞閿€锟?,
                "set-pass-env-note": "绠＄悊鍛樺瘑鐮侀€氳繃 Cloudflare Workers 鎺у埗鍙颁腑锟?ADMIN_PASSWORD 鐜鍙橀噺杩涜閰嶇疆锛屼慨鏀瑰悗閲嶆柊閮ㄧ讲鍗冲彲鐢熸晥锟?
            },
            "zh-TW": {
                "login-label": "绠＄悊鍝″瘑锟?,
                "login-btn": "鐧诲叆",
                "login-error": "瀵嗙⒓閷锛岃珛閲嶈│锟?,
                "menu-overview": "绯荤当姒傝",
                "menu-rooms": "鎴块枔鑸囩瘈锟?,
                "menu-tokens": "閫ｇ窔娆婃瑠锟?,
                "menu-settings": "閰嶇疆涓績",
                "role-admin": "绯荤当绠＄悊锟?,
                "stat-status": "閬嬭鐙€锟?,
                "stat-online": "姝ｅ父閬嬭",
                "stat-active-rooms": "娲昏簫鎴块枔锟?,
                "stat-connected-peers": "绺界窔涓婄瘈锟?,
                "stat-total-traffic": "鍌宠几娴侀噺 (鎺ユ敹/鐧硷拷?",
                "topo-map-title": "缍茶矾鎷撴挷绲愭锟?,
                "topo-no-nodes": "鏆劇绡€榛為€ｇ窔锛屼腑绻间己鏈嶅櫒绌洪枓涓拷?,
                "rooms-list-title": "娲昏簫涓辜鎴块枔娓呭柈",
                "th-room-name": "鎴块枔 ID",
                "th-peer-count": "绶氫笂绡€榛炴暩",
                "th-actions": "鎿嶄綔",
                "btn-close": "闂滈枆",
                "th-peer-id": "绡€锟?ID",
                "th-virtual-ip": "铏涙摤 IP (EasyTier)",
                "th-hostname": "涓绘锟?,
                "th-version": "EasyTier 鐗堟湰",
                "th-rx-tx": "鎺ユ敹 / 鐧奸€佹祦锟?,
                "th-conn-time": "宸查€ｇ窔鏅傞枔",
                "tokens-title": "鐢ㄦ埗绔€ｇ窔瀛樺彇娆婃潠 (Tokens)",
                "btn-gen-token": "鍓靛缓鏂版瑠锟?,
                "th-token": "娆婃潠瀵嗛懓",
                "th-desc": "娆婃潠鐢ㄩ€旀弿锟?,
                "th-created": "鍓靛缓鏅傞枔",
                "settings-general": "鍏ㄥ眬涓辜閰嶇疆",
                "set-req-token-title": "鍟熺敤鐢ㄦ埗绔€ｇ窔娆婃瑠鏉栨牎锟?,
                "set-req-token-desc": "寮峰埗 EasyTier 鐢ㄦ埗绔湪閫ｇ窔鏅傚繀闋堟敎甯跺悎娉曠殑 token 鏌ヨ鍙冩暩锛屽惁鍓囨嫆绲曢€ｇ窔锟?,
                "settings-admin-pass": "淇敼绠＄悊鍝＄櫥鍏ュ瘑锟?,
                "set-new-pass": "杓稿叆鏂板瘑锟?,
                "btn-save": "鍎插瓨淇敼",
                "btn-cancel": "鍙栨秷",
                "btn-confirm": "鐢熸垚",
                "alert-security-title": "瀹夊叏璀﹀憡: ",
                "alert-security-desc": "鎮ㄧ洰鍓嶆鍦ㄤ娇鐢ㄩ爯瑷瘑锟?'admin' 鐧诲叆锛岀偤浜嗗畨鍏紝璜嬬珛鍗充慨鏀瑰瘑纰硷紒",
                "action-view": "鏌ョ湅绡€锟?,
                "action-kick": "韪㈠嚭",
                "action-ban": "鍔犲叆榛戝悕锟?,
                "action-delete": "瑷婚姺",
                "msg-changed-pass": "绠＄悊鍝″瘑纰间慨鏀规垚鍔燂紒",
                "msg-gen-success": "娆婃潠鐢熸垚鎴愬姛锟?,
                "msg-kicked-success": "绡€榛炲凡鎴愬姛韪㈠嚭锟?,
                "msg-deleted-success": "娆婃潠宸叉垚鍔熻ɑ閵凤紒",
                "set-pass-env-note": "绠＄悊鍝″瘑纰奸€忛亷 Cloudflare Workers 鎺у埗鍙颁腑锟?ADMIN_PASSWORD 鐠板璁婃暩閫茶瑷畾锛屼慨鏀瑰緦閲嶆柊閮ㄧ讲鍗冲彲鐢熸晥锟?
            },
            ja: {
                "login-label": "绠＄悊鑰呫儜銈广儻銉笺儔",
                "login-btn": "銉偘銈ゃ兂",
                "login-error": "銉戙偣銉兗銉夈亴姝ｃ仐銇忋亗銈娿伨銇涖倱銆傚啀瑭﹁銇椼仸銇忋仩銇曘亜锟?,
                "menu-overview": "銈枫偣銉嗐儬姒傝",
                "menu-rooms": "閮ㄥ眿銇ㄣ儙銉笺儔",
                "menu-tokens": "鎺ョ稓銉堛兗銈兂",
                "menu-settings": "瑷畾銈汇兂銈裤兗",
                "role-admin": "銈枫偣銉嗐儬绠＄悊锟?,
                "stat-status": "绋煎儘鐘舵厠",
                "stat-online": "銈兂銉┿偆锟?,
                "stat-active-rooms": "銈偗銉嗐偅銉栥仾閮ㄥ眿",
                "stat-connected-peers": "鎺ョ稓涓儙銉笺儔锟?,
                "stat-total-traffic": "杌㈤€侀噺 (鍙椾俊/閫佷俊)",
                "topo-map-title": "銉嶃儍銉堛儻銉笺偗銉堛儩銉偢銉笺優銉冦儣",
                "topo-no-nodes": "鎺ョ稓銇曘倢銇︺亜銈嬨儙銉笺儔銇亗銈娿伨銇涖倱銆備腑缍欍偟銉笺儛銉笺伅绌恒亜銇︺亜銇俱仚锟?,
                "rooms-list-title": "銈偗銉嗐偅銉栥仾閮ㄥ眿銇竴锟?,
                "th-room-name": "閮ㄥ眿 ID",
                "th-peer-count": "鎺ョ稓锟?,
                "th-actions": "鎿嶄綔",
                "btn-close": "闁夈仒锟?,
                "th-peer-id": "銉庛兗锟?ID",
                "th-virtual-ip": "浠兂 IP",
                "th-hostname": "銉涖偣銉堝悕",
                "th-version": "銉愩兗銈搞儳锟?,
                "th-rx-tx": "鍙椾俊 / 閫佷俊",
                "th-conn-time": "鎺ョ稓鏅傞枔",
                "tokens-title": "銈儵銈ゃ偄銉炽儓鎺ョ稓鐢ㄣ儓銉笺偗锟?,
                "btn-gen-token": "銉堛兗銈兂銇敓锟?,
                "th-token": "銉堛兗銈兂",
                "th-desc": "瑾槑",
                "th-created": "浣滄垚鏃ユ檪",
                "settings-general": "涓€鑸ō锟?,
                "set-req-token-title": "鎺ョ稓銉堛兗銈兂銇瑷笺倰寮峰埗",
                "set-req-token-desc": "銈儵銈ゃ偄銉炽儓銇屾湁鍔广仾 token 銉戙儵銉°兗銈裤倰鎸併仯銇︽帴缍氥仚銈嬨亾銇ㄣ倰寮峰埗銇椼伨銇欙拷?,
                "settings-admin-pass": "绠＄悊鑰呫儜銈广儻銉笺儔銇锟?,
                "set-new-pass": "鏂般仐銇勩儜銈广儻銉笺儔",
                "btn-save": "銉戙偣銉兗銉夈倰淇濆瓨",
                "btn-cancel": "銈儯銉炽偦锟?,
                "btn-confirm": "纰鸿獚",
                "alert-security-title": "銈汇偔銉ャ儶銉嗐偅璀﹀憡: ",
                "alert-security-desc": "銉囥儠銈┿儷銉堛伄銉戙偣銉兗锟?'admin' 銈掍娇鐢ㄣ仐銇︺亜銇俱仚銆傘仚銇愩伀澶夋洿銇椼仸銇忋仩銇曘亜锟?,
                "action-view": "瑭崇窗琛ㄧず",
                "action-kick": "銈儍锟?,
                "action-ban": "绂佹銉偣銉堛伕",
                "action-delete": "鍓婇櫎",
                "msg-changed-pass": "绠＄悊鑰呫儜銈广儻銉笺儔銇屾洿鏂般仌銈屻伨銇椼仧锟?,
                "msg-gen-success": "銉堛兗銈兂銇岀敓鎴愩仌銈屻伨銇椼仧锟?,
                "msg-kicked-success": "銉庛兗銉夈倰銈儍銈仐銇俱仐銇燂紒",
                "msg-deleted-success": "銉堛兗銈兂銈掑墛闄ゃ仐銇俱仐銇燂紒",
                "set-pass-env-note": "绠＄悊鑰呫儜銈广儻銉笺儔锟?Cloudflare Workers 銉€銉冦偡銉ャ儨銉笺儔锟?ADMIN_PASSWORD 鐠板澶夋暟銇цō瀹氥仐銇俱仚銆傚鏇淬伅鍐嶃儑銉椼儹銈ゅ緦銇湁鍔广伀銇倞銇俱仚锟?
            },
            ko: {
                "login-label": "甏€毽瀽 牍勲皜氩堩樃",
                "login-btn": "搿滉犯锟?,
                "login-error": "牍勲皜氩堩樃臧€ 鞛橂霅橃棃鞀惦媹锟? 雼れ嫓 鞁滊弰頃橃嫮鞁滌槫.",
                "menu-overview": "鞁滌姢锟?臧滌殧",
                "menu-rooms": "锟?锟?頂检柎",
                "menu-tokens": "鞐瓣舶 韱犿伆",
                "menu-settings": "靹れ爼 靹柬劙",
                "role-admin": "鞁滌姢锟?甏€毽瀽",
                "stat-status": "靹滊矂 靸來儨",
                "stat-online": "鞛戨彊 锟?,
                "stat-active-rooms": "頇滌劚頇旊悳 锟?,
                "stat-connected-peers": "锟?鞐瓣舶 頂检柎",
                "stat-total-traffic": "韸鸽灅锟?(靾橃嫚/靻§嫚)",
                "topo-map-title": "雱ろ姼鞗岉伂 韱犿彺搿滌",
                "topo-no-nodes": "鞐瓣舶锟?雲鸽摐臧€ 鞐嗢姷雼堧嫟. WSS 毽措爤锟?靹滊矂臧€ 牍勳柎 鞛堨姷雼堧嫟.",
                "rooms-list-title": "頇滌劚 毽措爤锟?锟?氇╇",
                "th-room-name": "锟?ID",
                "th-peer-count": "鞐瓣舶 頂检柎 锟?,
                "th-actions": "鞛戩梾",
                "btn-close": "雼赴",
                "th-peer-id": "頂检柎 ID",
                "th-virtual-ip": "臧€锟?IP",
                "th-hostname": "順胳姢锟?鞚措",
                "th-version": "氩勳爠",
                "th-rx-tx": "靾橃嫚 / 靻§嫚 韸鸽灅锟?,
                "th-conn-time": "鞐瓣舶 鞁滉皠",
                "tokens-title": "韥措澕鞚挫柛锟?鞐瓣舶 韱犿伆",
                "btn-gen-token": "韱犿伆 靸濎劚",
                "th-token": "韱犿伆",
                "th-desc": "靹る獏",
                "th-created": "靸濎劚锟?,
                "settings-general": "鞚茧皹 靹れ爼",
                "set-req-token-title": "鞐瓣舶 韱犿伆 頃勳垬 瓴€锟?,
                "set-req-token-desc": "EasyTier 韥措澕鞚挫柛韸戈皜 鞐瓣舶锟?锟?鞙犿毃锟?token 毵り皽氤€靾橂ゼ 鞝勳啞頃橂弰锟?臧曥牅頃╇媹锟?",
                "settings-admin-pass": "甏€毽瀽 牍勲皜氩堩樃 氤€锟?,
                "set-new-pass": "锟?牍勲皜氩堩樃",
                "btn-save": "牍勲皜氩堩樃 鞝€锟?,
                "btn-cancel": "旆唽",
                "btn-confirm": "頇曥澑",
                "alert-security-title": "氤挫晥 瓴疥碃: ",
                "alert-security-desc": "旮半掣 甏€毽瀽 牍勲皜氩堩樃 'admin'锟?靷毄頃橁碃 鞛堨姷雼堧嫟. 歆€锟?氚旊 氤€瓴巾晿鞁嫓锟?",
                "action-view": "頂检柎 氇╇",
                "action-kick": "於旊癌",
                "action-ban": "彀嫧 氇╇",
                "action-delete": "靷牅",
                "msg-changed-pass": "牍勲皜氩堩樃臧€ 靹标车鞝侅溂锟?氤€瓴诫悩鞐堨姷雼堧嫟!",
                "msg-gen-success": "韱犿伆锟?靸濎劚霅橃棃鞀惦媹锟?",
                "msg-kicked-success": "頂检柎臧€ 靹标车鞝侅溂锟?於旊癌霅橃棃鞀惦媹锟?",
                "msg-deleted-success": "韱犿伆锟?靷牅霅橃棃鞀惦媹锟?",
                "set-pass-env-note": "甏€毽瀽 牍勲皜氩堩樃锟?Cloudflare Workers 雽€鞁滊炒霌滌潣 ADMIN_PASSWORD 頇橁步 氤€靾橂 靹れ爼頃╇媹锟? 氤€锟?靷暛鞚€ 鞛鞍锟?锟?鞝侅毄霅╇媹锟?"
            }
        };

        let currentLang = 'en';
        const supportedLangs = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko'];
        let token = localStorage.getItem('easytier_admin_token') || '';
        let statsInterval = null;
        let countdown = 5;
        let globalStats = { rooms: [], totalPeers: 0, totalRx: 0, totalTx: 0 };
        let activeSelectedRoomId = null;

        // Detect language
        const browserLang = navigator.language;
        if (browserLang) {
            if (browserLang.startsWith('zh-CN') || browserLang.startsWith('zh-Hans')) {
                currentLang = 'zh-CN';
            } else if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-HK') || browserLang.startsWith('zh-Hant')) {
                currentLang = 'zh-TW';
            } else if (browserLang.startsWith('ja')) {
                currentLang = 'ja';
            } else if (browserLang.startsWith('ko')) {
                currentLang = 'ko';
            }
        }
        
        const savedLang = localStorage.getItem('easytier_admin_lang');
        if (savedLang && supportedLangs.includes(savedLang)) {
            currentLang = savedLang;
        }

        document.getElementById('loginLang').value = currentLang;
        document.getElementById('dashboardLang').value = currentLang;
        updateUI();

        // Check if already authenticated
        if (token) {
            await verifyToken();
        } else {
            showLogin();
        }

        function switchLanguage(lang) {
            currentLang = lang;
            localStorage.setItem('easytier_admin_lang', lang);
            document.getElementById('loginLang').value = lang;
            document.getElementById('dashboardLang').value = lang;
            updateUI();
        }

        function updateUI() {
            const t = translations[currentLang];
            document.title = t["menu-overview"] + " - EasyTier Admin";
            
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (t[key]) {
                    if (el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'P' || el.tagName === 'LABEL' || el.tagName === 'STRONG' || el.tagName === 'TH' || el.tagName === 'H4') {
                        el.innerText = t[key];
                    } else if (el.tagName === 'BUTTON') {
                        // Keep inner icons
                        const icon = el.querySelector('i');
                        el.innerText = '';
                        if (icon) el.appendChild(icon);
                        el.appendChild(document.createTextNode(' ' + t[key]));
                    }
                }
            });

            // Update page title if tab active
            const activeMenu = document.querySelector('.menu-item.active');
            if (activeMenu) {
                const span = activeMenu.querySelector('span');
                document.getElementById('pageTitle').innerText = span.innerText;
            }
            updateCountdownText();
        }

        function showLogin() {
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('appLayout').style.display = 'none';
            document.getElementById('appLayout').style.opacity = 0;
            clearInterval(statsInterval);
        }

        function showDashboard() {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('appLayout').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('appLayout').style.opacity = 1;
            }, 50);
            
            // Start metrics loading & polling
            loadStats();
            startPolling();
        }

        async function verifyToken() {
            try {
                const res = await fetch('/api/auth/verify', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (res.ok) {
                    showDashboard();
                } else {
                    showLogin();
                }
            } catch (e) {
                showLogin();
            }
        }

        async function handleLogin(e) {
            e.preventDefault();
            const password = document.getElementById('passwordInput').value;
            try {
                const res = await fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await res.json();
                if (res.ok && data.token) {
                    token = data.token;
                    localStorage.setItem('easytier_admin_token', token);
                    document.getElementById('passwordInput').value = '';
                    document.getElementById('loginError').style.display = 'none';
                    await verifyToken();
                } else {
                    document.getElementById('loginError').style.display = 'block';
                }
            } catch (err) {
                document.getElementById('loginError').style.display = 'block';
            }
        }

        function handleLogout() {
            token = '';
            localStorage.removeItem('easytier_admin_token');
            showLogin();
        }

        function switchTab(tabId, el) {
            document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
            el.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            const title = el.querySelector('span').innerText;
            document.getElementById('pageTitle').innerText = title;

            if (tabId === 'overview') {
                document.getElementById('tabOverview').classList.add('active');
            } else if (tabId === 'rooms') {
                document.getElementById('tabRooms').classList.add('active');
                loadRooms();
            } else if (tabId === 'tokens') {
                document.getElementById('tabTokens').classList.add('active');
                loadTokens();
            } else if (tabId === 'settings') {
                document.getElementById('tabSettings').classList.add('active');
                loadSettings();
            }
        }

        function startPolling() {
            clearInterval(statsInterval);
            countdown = 5;
            statsInterval = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                    countdown = 5;
                    loadStats();
                }
                updateCountdownText();
            }, 1000);
        }

        function updateCountdownText() {
            const refreshText = document.getElementById('refreshText');
            if (currentLang === 'zh-CN') {
                refreshText.innerText = \`鑷姩鍒锋柊锟?\${countdown} 绉掑唴\`;
            } else if (currentLang === 'zh-TW') {
                refreshText.innerText = \`鑷嫊閲嶆柊鏁寸悊锟?\${countdown} 绉掑収\`;
            } else if (currentLang === 'ja') {
                refreshText.innerText = \`\${countdown}绉掋仹鑷嫊鏇存柊\`;
            } else if (currentLang === 'ko') {
                refreshText.innerText = \`\${countdown}锟?锟?鞛愲彊 靸堧瓿犾龚\`;
            } else {
                refreshText.innerText = \`Auto-refresh in \${countdown}s\`;
            }
        }

        function formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        async function loadStats() {
            const spinner = document.getElementById('refreshSpinner');
            const clock = document.getElementById('clockIcon');
            spinner.style.display = 'block';
            clock.style.display = 'none';

            try {
                // Fetch rooms list & active peers
                const res = await fetch('/api/rooms', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (!res.ok) {
                    if (res.status === 401) {
                        handleLogout();
                        return;
                    }
                    throw new Error('API failure');
                }
                const data = await res.json();
                
                globalStats.rooms = data.rooms || [];
                globalStats.totalPeers = 0;
                globalStats.totalRx = 0;
                globalStats.totalTx = 0;
                
                // Fetch detailed stats for each room to aggregate metrics
                const roomPromises = globalStats.rooms.map(async (room) => {
                    try {
                        const rRes = await fetch(\`/api/rooms/\${encodeURIComponent(room.roomId)}/stats\`, {
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                        if (rRes.ok) {
                            const rData = await rRes.json();
                            return rData;
                        }
                    } catch (_) {}
                    return null;
                });

                const roomDetails = await Promise.all(roomPromises);
                
                // Aggregate stats
                const allPeers = [];
                roomDetails.forEach((details) => {
                    if (details) {
                        globalStats.totalPeers += details.peers ? details.peers.length : 0;
                        if (details.peers) {
                            details.peers.forEach(peer => {
                                globalStats.totalRx += peer.rxBytes || 0;
                                globalStats.totalTx += peer.txBytes || 0;
                                allPeers.push(peer);
                            });
                        }
                    }
                });

                document.getElementById('statActiveRooms').innerText = globalStats.rooms.length;
                document.getElementById('statConnectedPeers').innerText = globalStats.totalPeers;
                document.getElementById('statTotalTraffic').innerText = 
                    formatBytes(globalStats.totalRx) + ' / ' + formatBytes(globalStats.totalTx);

                // Update layout active tabs
                if (document.getElementById('tabOverview').classList.contains('active')) {
                    renderTopology(allPeers);
                } else if (document.getElementById('tabRooms').classList.contains('active')) {
                    renderRoomsTable();
                    if (activeSelectedRoomId) {
                        const activeDetails = roomDetails.find(r => r && r.roomId === activeSelectedRoomId);
                        if (activeDetails) {
                            renderPeersTable(activeDetails.peers);
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to load stats', err);
            } finally {
                spinner.style.display = 'none';
                clock.style.display = 'block';
            }
        }

        // Render Topology Graph
        function renderTopology(peers) {
            const svg = document.getElementById('topoSvg');
            const emptyText = document.getElementById('topoEmptyText');
            
            // Clear previous elements
            svg.innerHTML = '';
            
            if (peers.length === 0) {
                emptyText.style.display = 'block';
                return;
            }
            emptyText.style.display = 'none';

            // SVG size
            const width = svg.clientWidth || 800;
            const height = svg.clientHeight || 350;
            const centerX = width / 2;
            const centerY = height / 2;

            // Draw Server node in the center
            const serverNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            serverNode.setAttribute('cx', centerX);
            serverNode.setAttribute('cy', centerY);
            serverNode.setAttribute('r', '16');
            serverNode.setAttribute('fill', 'url(#serverGradient)');
            serverNode.setAttribute('style', 'cursor: pointer; filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.6));');
            
            // Define Gradient & Definitions
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            
            // Server gradient
            const sGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            sGradient.setAttribute('id', 'serverGradient');
            sGradient.setAttribute('x1', '0%');
            sGradient.setAttribute('y1', '0%');
            sGradient.setAttribute('x2', '100%');
            sGradient.setAttribute('y2', '100%');
            sGradient.innerHTML = \`<stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#6366f1"/>\`;
            defs.appendChild(sGradient);

            // Peer gradient
            const pGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            pGradient.setAttribute('id', 'peerGradient');
            pGradient.innerHTML = \`<stop offset="0%" stop-color="#10b981"/><stop offset="100%" stop-color="#059669"/>\`;
            defs.appendChild(pGradient);
            
            svg.appendChild(defs);

            // Spacing peer nodes in a circle
            const radius = Math.min(width, height) * 0.35;
            const angleStep = (2 * Math.PI) / peers.length;

            peers.forEach((peer, i) => {
                const angle = i * angleStep;
                const peerX = centerX + radius * Math.cos(angle);
                const peerY = centerY + radius * Math.sin(angle);

                // Draw line between server and peer
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', centerX);
                line.setAttribute('y1', centerY);
                line.setAttribute('x2', peerX);
                line.setAttribute('y2', peerY);
                line.setAttribute('stroke', 'rgba(99, 102, 241, 0.2)');
                line.setAttribute('stroke-width', '1.5');
                svg.appendChild(line);

                // Draw animated pulse along line
                const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                pulse.setAttribute('cx', centerX);
                pulse.setAttribute('cy', centerY);
                pulse.setAttribute('r', '3');
                pulse.setAttribute('fill', '#818cf8');
                
                const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                anim.setAttribute('attributeName', 'cx');
                anim.setAttribute('from', centerX);
                anim.setAttribute('to', peerX);
                anim.setAttribute('dur', '1.5s');
                anim.setAttribute('repeatCount', 'indefinite');
                pulse.appendChild(anim);

                const animY = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                animY.setAttribute('attributeName', 'cy');
                animY.setAttribute('from', centerY);
                animY.setAttribute('to', peerY);
                animY.setAttribute('dur', '1.5s');
                animY.setAttribute('repeatCount', 'indefinite');
                pulse.appendChild(animY);

                svg.appendChild(pulse);

                // Draw Peer circle
                const peerNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                peerNode.setAttribute('cx', peerX);
                peerNode.setAttribute('cy', peerY);
                peerNode.setAttribute('r', '10');
                peerNode.setAttribute('fill', 'url(#peerGradient)');
                peerNode.setAttribute('style', 'cursor: pointer; filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.5));');
                
                // Mouseover details
                const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
                title.textContent = \`Peer ID: \${peer.peerId}\\nHostname: \${peer.hostname || 'N/A'}\\nIP: \${peer.ipv4Addr || 'N/A'}\`;
                peerNode.appendChild(title);
                svg.appendChild(peerNode);

                // Label Text
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', peerX);
                label.setAttribute('y', peerY + 22);
                label.setAttribute('fill', '#9ca3af');
                label.setAttribute('font-size', '10px');
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('font-family', 'var(--font-inter)');
                label.textContent = peer.hostname || peer.peerId.substring(0, 8);
                svg.appendChild(label);
            });

            // Append center server node after lines so it sits on top
            const centerLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            centerLabel.setAttribute('x', centerX);
            centerLabel.setAttribute('y', centerY - 22);
            centerLabel.setAttribute('fill', '#ffffff');
            centerLabel.setAttribute('font-size', '11px');
            centerLabel.setAttribute('font-weight', '600');
            centerLabel.setAttribute('text-anchor', 'middle');
            centerLabel.setAttribute('font-family', 'var(--font-outfit)');
            centerLabel.textContent = 'WSS RELAY';
            
            svg.appendChild(serverNode);
            svg.appendChild(centerLabel);
            
            lucide.createIcons();
        }

        // Render Rooms
        function loadRooms() {
            renderRoomsTable();
        }

        function renderRoomsTable() {
            const body = document.getElementById('roomsTableBody');
            body.innerHTML = '';
            
            if (globalStats.rooms.length === 0) {
                body.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">No active rooms. Connect a client to start.</td></tr>';
                return;
            }

            globalStats.rooms.forEach(room => {
                const tr = document.createElement('tr');
                tr.innerHTML =
                    '<td style="font-weight: 600; color: #ffffff;">' + room.roomId + '</td>' +
                    '<td><span class="badge-status badge-success">' + room.peerCount + '</span></td>' +
                    '<td>' +
                        '<button class="btn-action" onclick="viewRoomPeers(\'' + room.roomId + '\')">' +
                            '<i data-lucide="eye" style="width: 14px; height: 14px;"></i> ' + translations[currentLang]['action-view'] +
                        '</button>' +
                    '</td>';
                body.appendChild(tr);
            });
            lucide.createIcons();
        }

        async function viewRoomPeers(roomId) {
            activeSelectedRoomId = roomId;
            document.getElementById('roomPeersCard').style.display = 'block';
            document.getElementById('roomPeersTitle').innerText = \`Room Peers - \${roomId}\`;
            
            // Quick load from local cache first
            const body = document.getElementById('peersTableBody');
            body.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">Loading...</td></tr>';
            
            // Force load
            loadStats();
        }

        function closeRoomPeers() {
            activeSelectedRoomId = null;
            document.getElementById('roomPeersCard').style.display = 'none';
        }

        function renderPeersTable(peers) {
            const body = document.getElementById('peersTableBody');
            body.innerHTML = '';
            
            if (!peers || peers.length === 0) {
                body.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No peers in this room.</td></tr>';
                return;
            }

            peers.forEach(peer => {
                const duration = Math.floor((Date.now() - peer.connectedAt) / 1000);
                const hours = Math.floor(duration / 3600);
                const minutes = Math.floor((duration % 3600) / 60);
                const seconds = duration % 60;
                const timeString = (hours > 0 ? hours + 'h ' : '') + minutes + 'm ' + seconds + 's';

                const tr = document.createElement('tr');
                tr.innerHTML =
                    '<td style="font-family: monospace; font-weight: 500;">' + peer.peerId + '</td>' +
                    '<td style="color: var(--success); font-weight: 600;">' + (peer.ipv4Addr || 'Pending') + '</td>' +
                    '<td>' + (peer.hostname || 'N/A') + '</td>' +
                    '<td><span class="badge-status badge-warning" style="font-size: 0.75rem;">' + (peer.easytierVersion || 'N/A') + '</span></td>' +
                    '<td style="font-size: 0.85rem;">' + formatBytes(peer.rxBytes) + ' / ' + formatBytes(peer.txBytes) + '</td>' +
                    '<td>' + timeString + '</td>' +
                    '<td>' +
                            '<button class="btn-action btn-danger-action" onclick="kickPeer(\'' + peer.peerId + '\')">' +
                            '<i data-lucide="user-minus" style="width: 14px; height: 14px;"></i> ' + translations[currentLang]['action-kick'] +
                        '</button>' +
                    '</td>';
                body.appendChild(tr);
            });
            lucide.createIcons();
        }

        async function kickPeer(peerId) {
            if (!confirm('Are you sure you want to kick peer ' + peerId + '?')) return;
            try {
                const res = await fetch('/api/rooms/' + encodeURIComponent(activeSelectedRoomId) + '/kick?peerId=' + encodeURIComponent(peerId), {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (res.ok) {
                    alert(translations[currentLang]['msg-kicked-success']);
                    loadStats();
                }
            } catch (err) {
                console.error(err);
            }
        }

        // Token tab APIs
        async function loadTokens() {
            try {
                const res = await fetch('/api/tokens', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (!res.ok) throw new Error('API failed');
                const data = await res.json();
                
                const body = document.getElementById('tokensTableBody');
                body.innerHTML = '';
                
                const tokens = data.tokens || [];
                if (tokens.length === 0) {
                    body.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No tokens generated yet. Click "Generate Token" to create one.</td></tr>';
                    return;
                }

                tokens.forEach(tok => {
                    const date = new Date(tok.createdAt).toLocaleString();
                    const tr = document.createElement('tr');
                    tr.innerHTML =
                        '<td style="font-family: monospace; font-weight: 600; color: #a78bfa;">' + tok.token + '</td>' +
                        '<td>' + (tok.description || '') + '</td>' +
                        '<td style="color: var(--text-secondary);">' + date + '</td>' +
                        '<td>' +
                            '<button class="btn-action btn-danger-action" onclick="deleteToken(\'' + tok.token + '\')">' +
                                '<i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> ' + translations[currentLang]['action-delete'] +
                            '</button>' +
                        '</td>';
                    body.appendChild(tr);
                });
                lucide.createIcons();
            } catch (err) {
                console.error(err);
            }
        }

        function openCreateTokenModal() {
            document.getElementById('createTokenModal').style.display = 'flex';
        }

        function closeCreateTokenModal() {
            document.getElementById('createTokenModal').style.display = 'none';
            document.getElementById('tokenDescInput').value = '';
        }

        async function handleCreateToken(e) {
            e.preventDefault();
            const description = document.getElementById('tokenDescInput').value;
            try {
                const res = await fetch('/api/tokens', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ description })
                });
                if (res.ok) {
                    alert(translations[currentLang]['msg-gen-success']);
                    closeCreateTokenModal();
                    loadTokens();
                }
            } catch (err) {
                console.error(err);
            }
        }

        async function deleteToken(tokenVal) {
            if (!confirm('Are you sure you want to delete this token?')) return;
            try {
                const res = await fetch(\`/api/tokens?token=\${encodeURIComponent(tokenVal)}\`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (res.ok) {
                    alert(translations[currentLang]['msg-deleted-success']);
                    loadTokens();
                }
            } catch (err) {
                console.error(err);
            }
        }

        // Settings tab APIs
        async function loadSettings() {
            try {
                const res = await fetch('/api/config', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (res.ok) {
                    const data = await res.json();
                    document.getElementById('requireTokenToggle').checked = !!data.requireToken;
                }
            } catch (err) {
                console.error(err);
            }
        }

        async function handleToggleRequireToken(checked) {
            try {
                await fetch('/api/config', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ requireToken: checked })
                });
            } catch (err) {
                console.error(err);
            }
        }

        async function handleChangePassword(e) {
            e.preventDefault();
            const newPassword = document.getElementById('newPassInput').value;
            try {
                const res = await fetch('/api/config', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ adminPassword: newPassword })
                });
                if (res.ok) {
                    alert(translations[currentLang]['msg-changed-pass']);
                    document.getElementById('newPassInput').value = '';
                    
                    // Reauth token is regenerated by server
                    const data = await res.json();
                    if (data.token) {
                        token = data.token;
                        localStorage.setItem('easytier_admin_token', token);
                    }
                    
                    document.getElementById('defaultPasswordAlert').style.display = 'none';
                }
            } catch (err) {
                console.error(err);
            }
        }

        // Initialize Lucide Icons on start
        lucide.createIcons();
    </script>
</body>
</html>
`;






