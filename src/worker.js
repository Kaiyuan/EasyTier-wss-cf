// Cloudflare Worker entry for EasyTier WebSocket relay backed by Durable Object
// Module syntax is required for Durable Objects.
import { RelayRoom } from './worker/relay_room.js';
import { serveAdminDashboard } from './admin_html.js';
import { signAdminToken, verifyAdminToken } from './auth.js';
import { getAdminAsset } from './admin_assets/index.js';

export { RelayRoom };
export class AdminStore extends RelayRoom {}

// JWT-like signing secret derived from ADMIN_PASSWORD
function getSecret(env) {
  return (env.ADMIN_PASSWORD || 'changeme') + '_jwt_secret';
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // 0. Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 1. Health check
    if (pathname === '/healthz') {
      return new Response('ok', { status: 200 });
    }

    // 2. Admin dashboard frontend static asset
    if (pathname === '/panel' || pathname === '/panel/') {
      return new Response(serveAdminDashboard, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    if (pathname === '/admin' || pathname === '/admin/') {
      return Response.redirect(url.origin + '/panel', 301);
    }

    if (pathname.startsWith('/assets/admin/')) {
      const assetName = pathname.slice('/assets/admin/'.length);
      const asset = getAdminAsset(assetName);
      if (!asset) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response(asset, {
        headers: {
          'Content-Type': assetName.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // 3a. Auth endpoint — verify admin password, return signed token
    if (pathname === '/api/auth' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return jsonError('Invalid JSON', 400); }
      const adminPassword = env.ADMIN_PASSWORD || 'changeme';
      if (body.password !== adminPassword) {
        return jsonError('Unauthorized', 401);
      }
      const token = await signAdminToken(getSecret(env), { role: 'admin' });
      return jsonOk({ token });
    }

    // 3b. Token verification endpoint (used on page load to check stored token)
    if (pathname === '/api/auth/verify' && request.method === 'GET') {
      const token = getBearerToken(request);
      const payload = token ? await verifyAdminToken(getSecret(env), token) : null;
      if (!payload) return jsonError('Unauthorized', 401);
      return jsonOk({ ok: true });
    }


    // 4. Admin API routing (all proxied to the central __directory__ Durable Object)
    if (pathname.startsWith('/api/')) {
      // Verify admin token before forwarding
      const token = getBearerToken(request);
      const payload = token ? await verifyAdminToken(getSecret(env), token) : null;
      if (!payload) return jsonError('Unauthorized', 401);

      const dirStub = env.RELAY_ROOM.get(env.RELAY_ROOM.idFromName('__directory__'));
      return dirStub.fetch(request);
    }

    // 5. WebSocket routing to EasyTier peer rooms
    // EasyTier 客户端的 peer URL 只支持 scheme://host[:port]：path 与 query
    // 都不会到达服务端（tokio-websockets 握手只发送 uri.path()）。
    // 因此任何路径上的 WebSocket 升级都转发给房间 DO（房间由 ?room= 指定，
    // 真实客户端缺省落在 default 房间）；非升级请求按常规页面处理。
    const isWsUpgrade = (request.headers.get('Upgrade') || '').toLowerCase() === 'websocket';
    if (!isWsUpgrade) {
      if (pathname === '/') {
        return Response.redirect(url.origin + '/panel', 302);
      }
      return new Response('Not found', { status: 404 });
    }

    const roomId = url.searchParams.get('room') || 'default';

    // Prevent clients from connecting directly to the directory room as a peer
    if (roomId === '__directory__') {
      return new Response('Invalid room name', { status: 400 });
    }

    const options = env.LOCATION_HINT ? { locationHint: env.LOCATION_HINT } : {};
    const roomStub = env.RELAY_ROOM.get(env.RELAY_ROOM.idFromName(roomId), options);
    return roomStub.fetch(request);

    // 6. Fallback 404
    return new Response('Not found', { status: 404 });
  },
};

function getBearerToken(request) {
  const auth = request.headers.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return request.headers.get('X-Admin-Token')?.trim() || '';
}

function jsonOk(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
