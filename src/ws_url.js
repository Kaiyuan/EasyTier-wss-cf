/**
 * 构建 EasyTier 客户端使用的 WSS 对等节点地址。
 * 协议约定：路径为 /{WS_PATH}，查询参数 room、token（或 client_token）。
 */

export function normalizeWsPath(wsPath) {
  const raw = String(wsPath ?? 'ws').trim().replace(/^\/+/, '').replace(/\/+$/, '');
  return raw || 'ws';
}

/**
 * @param {string} originOrBase - 完整 URL 或 host（如 https://example.com 或 wss://example.com/ws）
 * @param {{ room?: string, token?: string, clientToken?: string, wsPath?: string }} options
 */
export function buildEasyTierWsUrl(originOrBase, options = {}) {
  const roomId = String(options.room ?? '').trim() || 'default';
  const token = String(options.token ?? options.clientToken ?? '').trim();
  const wsPath = normalizeWsPath(options.wsPath);

  let url;
  const base = String(originOrBase ?? '').trim();
  if (!base) {
    throw new Error('originOrBase is required');
  }
  if (base.includes('://')) {
    url = new URL(base);
  } else {
    url = new URL(`wss://${base.replace(/^\/+/, '')}`);
  }

  if (url.protocol === 'http:') url.protocol = 'ws:';
  else if (url.protocol === 'https:') url.protocol = 'wss:';

  url.pathname = `/${wsPath}`;
  url.search = '';
  url.hash = '';

  url.searchParams.set('room', roomId);
  if (token) {
    url.searchParams.set('token', token);
  }

  // 注意：不要写显式端口（尤其不能写 :0）。
  // EasyTier v2.x 对显式端口原样拨号（dns.rs 回归测试确认 ":0" 会连接端口 0 导致失败），
  // 省略端口时客户端才使用协议默认端口（ws→80, wss→443）。

  return url.toString();
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\"'\"'`)}'`;
}

/**
 * 生成 easytier-core 连接示例命令（需用户自行替换网络名/密钥）。
 */
export function buildEasyTierCoreCommand(peerUrl, networkName, networkSecret) {
  const parts = ['easytier-core'];
  const netName = String(networkName ?? '').trim();
  const netSecret = String(networkSecret ?? '').trim();
  if (netName) {
    parts.push(`--network-name ${shellQuote(netName)}`);
  }
  if (netSecret) {
    parts.push(`--network-secret ${shellQuote(netSecret)}`);
  }
  parts.push(`-p ${shellQuote(peerUrl)}`);
  return parts.join(' ');
}

/**
 * 从已有 WSS URL 解析 room / token，并与新参数合并后重新生成。
 */
export function mergeEasyTierWsUrl(existingUrl, overrides = {}) {
  const url = new URL(existingUrl);
  const wsPath = normalizeWsPath(url.pathname.replace(/^\//, ''));
  const room = overrides.room ?? url.searchParams.get('room') ?? 'default';
  const token =
    overrides.token ??
    overrides.clientToken ??
    url.searchParams.get('token') ??
    url.searchParams.get('client_token') ??
    '';
  const origin = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
  return buildEasyTierWsUrl(origin, { room, token, clientToken: token, wsPath });
}
