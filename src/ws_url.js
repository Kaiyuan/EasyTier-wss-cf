/**
 * 构建 EasyTier 客户端使用的对等节点地址。
 *
 * 重要约束：EasyTier 客户端的 peer URL 只支持 scheme://host[:port]
 * - 显式端口会被原样拨号（":0" 会连接端口 0 导致失败），协议默认端口必须省略（ws→80, wss→443）
 * - path 与 query 不会到达服务端：tokio-websockets 的握手请求只发送 uri.path()
 *   （query 被丢弃），部分旧版本连自定义 path 都不支持。
 *   因此房间与令牌无法通过 URL 参数传递给真实客户端。
 */

export function normalizeWsPath(wsPath) {
  const raw = String(wsPath ?? 'ws').trim().replace(/^\/+/, '').replace(/\/+$/, '');
  return raw || 'ws';
}

/**
 * @param {string} originOrBase - 完整 URL 或 host（如 https://example.com 或 wss://example.com/ws）
 *   多余的 path/query/hash 会被剥离，只保留 scheme://host[:port]。
 */
export function buildEasyTierWsUrl(originOrBase, _options = {}) {
  const base = String(originOrBase ?? '').trim();
  if (!base) {
    throw new Error('originOrBase is required');
  }
  let url;
  if (base.includes('://')) {
    url = new URL(base);
  } else {
    url = new URL(`wss://${base.replace(/^\/+/, '')}`);
  }

  let protocol = url.protocol;
  if (protocol === 'http:') protocol = 'ws:';
  else if (protocol === 'https:') protocol = 'wss:';

  // 省略协议默认端口；其他端口保留显式形式（客户端会原样拨号）
  const isDefaultPort =
    (protocol === 'ws:' && url.port === '80') ||
    (protocol === 'wss:' && url.port === '443');
  const port = url.port && !isDefaultPort ? `:${url.port}` : '';

  return `${protocol}//${url.hostname}${port}`;
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
 * 从已有 WSS URL 中提取裸地址（scheme://host[:port]），丢弃 path/query/hash。
 * 兼容旧格式地址（含 room/token 参数）的迁移场景。
 */
export function mergeEasyTierWsUrl(existingUrl, _overrides = {}) {
  return buildEasyTierWsUrl(existingUrl);
}
