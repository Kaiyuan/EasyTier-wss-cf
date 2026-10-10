export const dashboardCss = `
:root {
    --bg-color: #070b14;
    --bg-secondary: #0d1424;
    --card-bg: rgba(13, 20, 36, 0.75);
    --card-bg-hover: rgba(20, 30, 52, 0.85);
    --card-bg-elevated: rgba(22, 33, 58, 0.9);
    --sidebar-bg: rgba(9, 14, 26, 0.95);
    --border-color: rgba(255, 255, 255, 0.08);
    --border-highlight: rgba(99, 102, 241, 0.3);
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --primary: #6366f1;
    --primary-hover: #4f46e5;
    --primary-glow: rgba(99, 102, 241, 0.35);
    --secondary: #8b5cf6;
    --cyan: #06b6d4;
    --success: #10b981;
    --success-glow: rgba(16, 185, 129, 0.3);
    --danger: #ef4444;
    --danger-hover: #dc2626;
    --warning: #f59e0b;
    --font-outfit: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-inter: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
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
        radial-gradient(circle at 5% 10%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 95% 90%, rgba(139, 92, 246, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 60%);
    -webkit-font-smoothing: antialiased;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
}

/* Utilities */
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }

/* Toast Notification */
.admin-toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--card-bg-elevated);
    border: 1px solid var(--border-highlight);
    color: #ffffff;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px var(--primary-glow);
    font-size: 0.9rem;
    font-weight: 500;
    z-index: 9999;
    opacity: 0;
    transform: translateY(15px);
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(12px);
}
.admin-toast.visible {
    opacity: 1;
    transform: translateY(0);
}

/* LOGIN SCREEN */
#loginScreen {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    background-color: var(--bg-color);
    background-image: 
        radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 45%),
        radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 45%);
}

.login-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    padding: 3rem 2.5rem;
    width: 100%;
    max-width: 420px;
    backdrop-filter: blur(24px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 25px rgba(99, 102, 241, 0.15);
    text-align: center;
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
}

.login-logo {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    font-family: var(--font-outfit);
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, #a78bfa, #6366f1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.75rem;
}
.login-logo i {
    width: 32px;
    height: 32px;
    color: var(--primary);
    -webkit-text-fill-color: initial;
}

.login-copy h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}
.login-copy p {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
}

.password-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}
.password-input-wrapper input {
    padding-right: 2.75rem;
}
.password-toggle-btn {
    position: absolute;
    right: 0.75rem;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    transition: color 0.2s;
}
.password-toggle-btn:hover {
    color: var(--text-primary);
}

/* APP LAYOUT */
#appLayout {
    display: flex;
    height: 100vh;
    width: 100vw;
    opacity: 0;
    transition: opacity 0.4s ease;
}

/* Mobile Header */
.mobile-header {
    display: none;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1.25rem;
    background: var(--sidebar-bg);
    border-bottom: 1px solid var(--border-color);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 40;
    backdrop-filter: blur(16px);
}
.mobile-hamburger {
    background: transparent;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    display: flex;
    padding: 0.4rem;
}
.mobile-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    z-index: 45;
}
.mobile-overlay.active {
    display: block;
}

/* SIDEBAR */
.sidebar {
    width: 260px;
    flex-shrink: 0;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.5rem 1rem;
    z-index: 50;
    transition: transform 0.3s ease;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    margin-bottom: 1.5rem;
}
.sidebar-brand-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    box-shadow: 0 4px 14px var(--primary-glow);
}
.sidebar-brand-text {
    font-family: var(--font-outfit);
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
}
.sidebar-brand-badge {
    font-size: 0.65rem;
    background: rgba(99, 102, 241, 0.2);
    color: var(--primary);
    border: 1px solid rgba(99, 102, 241, 0.4);
    padding: 0.15rem 0.4rem;
    border-radius: 9999px;
    font-weight: 600;
    margin-left: auto;
}

.sidebar-nav {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    flex-grow: 1;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.75rem 1rem;
    color: var(--text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    font-size: 0.92rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}
.menu-item i {
    width: 18px;
    height: 18px;
    transition: color 0.2s;
}
.menu-item:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.04);
}
.menu-item.active {
    color: #ffffff;
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.3);
    font-weight: 600;
    box-shadow: 0 0 16px rgba(99, 102, 241, 0.12);
}
.menu-item.active i {
    color: var(--primary);
}

.sidebar-footer {
    border-top: 1px solid var(--border-color);
    padding-top: 1.25rem;
    margin-top: 1rem;
}
.sidebar-user {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
}
.sidebar-user-info {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}
.sidebar-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--cyan), var(--primary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: #ffffff;
}
.sidebar-user-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
}
.btn-icon-logout {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    border-radius: var(--radius-sm);
    transition: all 0.2s;
}
.btn-icon-logout:hover {
    color: var(--danger);
    background: rgba(239, 68, 68, 0.1);
}

/* MAIN CONTENT */
.main-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: 100vh;
    padding: 2rem 2.5rem;
}

/* TOP NAV HEADER */
.top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}
.page-header-group h2 {
    font-family: var(--font-outfit);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
}
.page-subtitle {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
}

.header-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

/* Endpoint Pill */
.endpoint-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.25);
    padding: 0.45rem 0.85rem;
    border-radius: 9999px;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: #c7d2fe;
    cursor: pointer;
    transition: all 0.2s;
}
.endpoint-pill:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.4);
}
.endpoint-pill i {
    width: 14px;
    height: 14px;
    color: var(--primary);
}

/* Refresh Control Pill */
.refresh-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    padding: 0.45rem 0.85rem;
    border-radius: 9999px;
    font-size: 0.8rem;
    color: var(--text-secondary);
}
.refresh-spinner {
    width: 12px;
    height: 12px;
    border: 2px solid var(--text-muted);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: none;
}
@keyframes spin {
    to { transform: rotate(360deg); }
}
.btn-pill-action {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0.15rem;
    transition: color 0.2s;
}
.btn-pill-action:hover {
    color: var(--text-primary);
}

/* Language Dropdown */
.top-lang-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--border-color);
    padding: 0.45rem 0.85rem;
    border-radius: 9999px;
    font-size: 0.8rem;
    color: var(--text-secondary);
    cursor: pointer;
    transition: border-color 0.2s;
}
.top-lang-wrapper:hover {
    border-color: rgba(255, 255, 255, 0.2);
}
.top-lang-select {
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 0.8rem;
    outline: none;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    padding-right: 1rem;
}
.top-lang-select option {
    background: var(--bg-secondary);
    color: var(--text-primary);
}
.top-lang-arrow {
    position: absolute;
    right: 0.75rem;
    pointer-events: none;
    width: 12px;
    height: 12px;
    color: var(--text-muted);
}

/* TAB CONTENTS */
.tab-content {
    display: none;
    flex-direction: column;
    gap: 1.75rem;
    animation: fadeIn 0.35s ease;
}
.tab-content.active {
    display: flex;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
}

/* STATS GRID */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 1.25rem;
}

.stat-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 1.35rem 1.5rem;
    backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    gap: 1.25rem;
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
}
.stat-card:hover {
    transform: translateY(-2px);
    border-color: var(--border-highlight);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}
.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background: rgba(99, 102, 241, 0.12);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.stat-icon i {
    width: 24px;
    height: 24px;
}
.stat-data {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}
.stat-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.stat-val {
    font-family: var(--font-outfit);
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--text-primary);
}

.status-online-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success);
    display: inline-block;
    box-shadow: 0 0 10px var(--success-glow);
    animation: pulse 2s infinite;
}
@keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* TOPOLOGY CARD */
.topo-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    backdrop-filter: blur(16px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.topo-header {
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
}
.topo-title {
    font-family: var(--font-outfit);
    font-size: 1.15rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.topo-legend {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
}
.legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 0.35rem;
}
.topo-body {
    height: 420px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
.topo-svg {
    width: 100%;
    height: 100%;
}

.radar-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: var(--text-secondary);
    text-align: center;
}
.radar-scan-box {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    border: 2px dashed rgba(99, 102, 241, 0.4);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: spin 12s linear infinite;
}
.radar-scan-box i {
    width: 32px;
    height: 32px;
    color: var(--primary);
    animation: spin 12s linear infinite reverse;
}

/* SECTION TABLE CARDS */
.table-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    backdrop-filter: blur(16px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.table-header-row {
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}
.table-title {
    font-family: var(--font-outfit);
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* TOOLBAR & SEARCH */
.toolbar-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}
.search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}
.search-wrapper i {
    position: absolute;
    left: 0.85rem;
    width: 16px;
    height: 16px;
    color: var(--text-muted);
    pointer-events: none;
}
.search-input {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0.55rem 1rem 0.55rem 2.4rem;
    color: var(--text-primary);
    font-size: 0.85rem;
    outline: none;
    transition: all 0.2s;
    min-width: 240px;
}
.search-input:focus {
    border-color: var(--primary);
    background: rgba(0, 0, 0, 0.4);
    box-shadow: 0 0 10px var(--primary-glow);
}

/* Quick Stats Bar in Config Tab */
.config-stats-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem 1.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--border-color);
    font-size: 0.82rem;
    color: var(--text-secondary);
}
.config-stat-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
}
.config-stat-item strong {
    color: var(--text-primary);
    font-weight: 600;
}

/* DATA TABLE */
.table-container {
    width: 100%;
    overflow-x: auto;
}
table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
}
thead tr {
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--border-color);
}
th {
    padding: 0.9rem 1.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
tbody tr {
    border-bottom: 1px solid var(--border-color);
    transition: background 0.15s ease;
}
tbody tr:last-child {
    border-bottom: none;
}
tbody tr:hover {
    background: rgba(255, 255, 255, 0.03);
}
td {
    padding: 1rem 1.25rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
    vertical-align: middle;
}

/* BADGES */
.badge-status {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.02em;
}
.badge-success {
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
}
.badge-warning {
    background: rgba(245, 158, 11, 0.15);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.3);
}
.badge-secondary {
    background: rgba(148, 163, 184, 0.12);
    color: #cbd5e1;
    border: 1px solid rgba(148, 163, 184, 0.25);
}
.badge-info {
    background: rgba(6, 182, 212, 0.15);
    color: #22d3ee;
    border: 1px solid rgba(6, 182, 212, 0.3);
}
.badge-network {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: var(--radius-sm);
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.3);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    font-weight: 600;
}

/* BUTTONS */
.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: #ffffff;
    border: none;
    border-radius: var(--radius-md);
    padding: 0.6rem 1.25rem;
    font-family: var(--font-inter);
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px var(--primary-glow);
    transition: all 0.2s ease;
}
.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
}

.btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0.6rem 1.25rem;
    font-size: 0.88rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}
.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
}

.btn-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: #ffffff;
    border: none;
    border-radius: var(--radius-md);
    padding: 0.75rem 1.5rem;
    font-family: var(--font-outfit);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px var(--primary-glow);
    transition: all 0.2s;
    width: 100%;
}
.btn-submit:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}

.action-btn-group {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}
.btn-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 0.4rem 0.65rem;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
}
.btn-action:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.2);
}
.btn-primary-action {
    background: rgba(99, 102, 241, 0.15);
    color: #a5b4fc;
    border-color: rgba(99, 102, 241, 0.3);
}
.btn-primary-action:hover {
    background: rgba(99, 102, 241, 0.25);
    color: #ffffff;
}
.btn-danger-action {
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.25);
}
.btn-danger-action:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #fecaca;
    border-color: rgba(239, 68, 68, 0.4);
}

/* FORMS & MODALS */
.modal {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
}
.modal-card {
    background: var(--card-bg-elevated);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    padding: 2rem 2.25rem;
    width: 100%;
    max-width: 760px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 25px rgba(99, 102, 241, 0.15);
    animation: modalScale 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
}
@keyframes modalScale {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}
.modal-title {
    font-family: var(--font-outfit);
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.6rem;
}
.modal-close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.4rem;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
}
.modal-close-btn:hover {
    color: var(--text-primary);
}

.modal-section-title {
    color: var(--primary);
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid var(--border-color);
}

.form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
}
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
    text-align: left;
}
.form-group label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-secondary);
}
.form-control {
    width: 100%;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 0.65rem 0.9rem;
    color: var(--text-primary);
    font-family: var(--font-inter);
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s;
}
.form-control:focus {
    border-color: var(--primary);
    background: rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 10px var(--primary-glow);
}
textarea.form-control {
    font-family: var(--font-mono);
    font-size: 0.85rem;
    resize: vertical;
}

/* Switch Slider */
.switch-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
}
.switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
}
.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}
.slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: rgba(255, 255, 255, 0.15);
    transition: .25s;
    border-radius: 9999px;
}
.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: #ffffff;
    transition: .25s;
    border-radius: 50%;
}
input:checked + .slider {
    background-color: var(--primary);
}
input:checked + .slider:before {
    transform: translateX(20px);
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border-color);
}

/* TOML Code Preview Box */
.code-preview-block {
    background: #050811;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    font-family: var(--font-mono);
    font-size: 0.85rem;
    color: #e2e8f0;
    line-height: 1.6;
    overflow-x: auto;
    max-height: 480px;
    white-space: pre;
}

/* DIAGNOSTICS & TOOLS */
.diagnostic-result-box {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.25);
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
}

/* RESPONSIVE DESIGN */
@media (max-width: 900px) {
    .sidebar {
        position: fixed;
        left: -280px;
        top: 0;
        bottom: 0;
        width: 260px;
        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.7);
    }
    .sidebar.open {
        transform: translateX(280px);
    }
    .mobile-header {
        display: flex;
    }
    .main-content {
        padding: 5rem 1.25rem 2rem;
    }
    .form-grid-2 {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .main-content {
        padding: 4.5rem 1rem 1.5rem;
    }
    .stats-grid {
        grid-template-columns: 1fr;
    }
    .search-input {
        min-width: 100%;
    }
    .toolbar-controls {
        width: 100%;
    }
    .toolbar-controls .search-wrapper {
        width: 100%;
    }
    .modal-card {
        padding: 1.25rem;
    }
}
`;
