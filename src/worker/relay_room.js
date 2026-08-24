import { Buffer } from 'buffer';
import { parseHeader } from './core/packet.js';
import { PacketType, HEADER_SIZE, MY_PEER_ID } from './core/constants.js';
import { loadProtos } from './core/protos.js';
import { handleHandshake, handlePing, handleForwarding } from './core/basic_handlers.js';
import { handleRpcReq, handleRpcResp } from './core/rpc_handler.js';
import { getPeerManager } from './core/peer_manager.js';
import { randomU64String, generateDigestFromStr } from './core/crypto.js';
import { persistWebSocketAttachment } from './core/ws_attachment.js';
import {
  buildEasyTierWsUrl,
  buildEasyTierCoreCommand,
  mergeEasyTierWsUrl,
} from '../ws_url.js';
import { sanitizeConfigForPublic } from '../config_public.js';

function requestPublicOrigin(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function u32ToIp(u32) {
  if (typeof u32 !== 'number') return '';
  return [
    (u32 >>> 24) & 0xff,
    (u32 >>> 16) & 0xff,
    (u32 >>> 8) & 0xff,
    u32 & 0xff
  ].join('.');
}

export class RelayRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.types = loadProtos();
    this.peerManager = getPeerManager();
    this.peerManager.setTypes(this.types);

    // Restore sockets after hibernation to keep metadata
    this.state.getWebSockets().forEach((ws) => this._restoreSocket(ws));
  }

  async fetch(request) {
    const url = new URL(request.url);

    // 1. Directory API handling
    if (url.pathname.startsWith('/api/__directory__')) {
      return await this._handleDirectoryApi(request);
    }

    // 2. Internal DO-to-DO API helpers
    if (url.pathname === '/api/internal/peer-count') {
      // Count websockets that have completed handshake (have a peerId)
      const count = this.state.getWebSockets().filter(ws => ws.peerId).length;
      return new Response(JSON.stringify({ count }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Return active network groups and their peer counts (used by admin API)
    if (url.pathname === '/api/internal/rooms') {
      const pm = this.peerManager;
      const rooms = [];
      for (const [groupKey, peersMap] of pm.peersByGroup.entries()) {
        // groupKey format: "networkName:digestHex"
        const colonIdx = groupKey.indexOf(':');
        const networkName = colonIdx >= 0 ? groupKey.slice(0, colonIdx) : groupKey;
        const count = peersMap ? peersMap.size : 0;
        rooms.push({ roomId: networkName, peerCount: count });
      }
      return new Response(JSON.stringify({ rooms }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Return peers for a specific network name (used by admin stats API)
    const internalStatsMatch = url.pathname.match(/^\/api\/internal\/rooms\/([^/]+)\/stats$/);
    if (internalStatsMatch && request.method === 'GET') {
      const networkName = decodeURIComponent(internalStatsMatch[1]);
      const pm = this.peerManager;
      const peers = [];
      for (const [groupKey, peersMap] of pm.peersByGroup.entries()) {
        const colonIdx = groupKey.indexOf(':');
        const gkName = colonIdx >= 0 ? groupKey.slice(0, colonIdx) : groupKey;
        if (gkName !== networkName) continue;
        for (const [peerId, ws] of peersMap.entries()) {
          const peerInfo = pm._getPeerInfosMap(groupKey)?.get(peerId);
          const ipv4Addr = peerInfo && peerInfo.ipv4Addr && typeof peerInfo.ipv4Addr.addr === 'number'
            ? u32ToIp(peerInfo.ipv4Addr.addr)
            : null;
          peers.push({
            peerId: ws.peerId || 'Unknown',
            ipv4Addr: ipv4Addr || 'Pending',
            hostname: ws.domainName || (peerInfo && peerInfo.hostname) || 'N/A',
            easytierVersion: (peerInfo && peerInfo.easytierVersion) || 'cf-ws-relay',
            rxBytes: ws.rxBytes || 0,
            txBytes: ws.txBytes || 0,
            connectedAt: ws.connectedAt || Date.now()
          });
        }
      }
      return new Response(JSON.stringify({ roomId: networkName, peers }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Kick a peer in a specific network (used by admin kick API)
    const internalKickMatch = url.pathname.match(/^\/api\/internal\/rooms\/([^/]+)\/kick$/);
    if (internalKickMatch && request.method === 'POST') {
      const networkName = decodeURIComponent(internalKickMatch[1]);
      const peerId = url.searchParams.get('peerId');
      if (!peerId) {
        return new Response('peerId required', { status: 400 });
      }
      const pm = this.peerManager;
      for (const [groupKey, peersMap] of pm.peersByGroup.entries()) {
        const colonIdx = groupKey.indexOf(':');
        const gkName = colonIdx >= 0 ? groupKey.slice(0, colonIdx) : groupKey;
        if (gkName !== networkName) continue;
        const targetWs = peersMap.get(peerId);
        if (targetWs) {
          targetWs.close(1000, 'Kicked by administrator');
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }
      return new Response(JSON.stringify({ error: 'Peer not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/internal/verify-token') {
      const config = (await this.state.storage.get('config')) ?? { requireToken: false };
      if (!config.requireToken) {
        return new Response('OK', { status: 200 });
      }

      const clientToken = url.searchParams.get('token') || '';
      const tokens = (await this.state.storage.get('tokens')) ?? [];
      const isValid = tokens.some(t => t.token === clientToken);
      if (isValid) {
        return new Response('OK', { status: 200 });
      }
      return new Response('Unauthorized', { status: 401 });
    }

    // Verify EasyTier network handshake: checks networkName + digest against configured easyTierConfigs.
    // If no configs are configured, defaults to public relay mode (allow all).
    if (url.pathname === '/api/internal/verify-network') {
      const networkName = url.searchParams.get('name') || '';
      const digestHex = url.searchParams.get('digest') || '';
      const config = (await this.state.storage.get('config')) ?? {};
      const configs = Array.isArray(config.easyTierConfigs) ? config.easyTierConfigs : [];
      // Public relay mode: no configured networks, allow all
      if (configs.length === 0) {
        return new Response('OK', { status: 200 });
      }
      // Find the configured network with matching name
      const matched = configs.find(c => c.network_name === networkName);
      if (!matched) {
        // Network name not in admin configuration — reject
        return new Response('Network not configured', { status: 403 });
      }
      // Compute expected digest using EasyTier's algorithm
      const expectedDigest = generateDigestFromStr(networkName, matched.network_secret || '').toString('hex');
      if (expectedDigest === digestHex) {
        return new Response('OK', { status: 200 });
      }
      return new Response('Digest mismatch', { status: 401 });
    }

    // Internal stats (connections + bytes) for this DO instance
    if (url.pathname === '/api/internal/stats') {
      const [connections, bytesIn] = await Promise.all([
        this.state.storage.get('connections').catch(() => 0),
        this.state.storage.get('bytesIn').catch(() => 0),
      ]);
      return new Response(JSON.stringify({ connections: connections ?? 0, bytesIn: bytesIn ?? 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Admin API endpoints (when handled by directory DO)
    if (url.pathname.startsWith('/api/')) {
      return await this._handleAdminApi(request);
    }

    // 5. WebSocket upgrade handling
    const wsPath = '/' + (this.env.WS_PATH || 'ws');
    if (url.pathname !== wsPath && url.pathname !== wsPath + '/') {
      return new Response('Not found', { status: 404 });
    }
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected websocket', { status: 400 });
    }

    // Client connection verification
    const roomId = url.searchParams.get('room') || 'default';
    if (roomId !== '__directory__') {
      const clientToken = url.searchParams.get('token') || url.searchParams.get('client_token') || '';
      const dirStub = this.env.RELAY_ROOM.get(this.env.RELAY_ROOM.idFromName('__directory__'));
      // Always verify: the directory DO allows everyone when requireToken is off,
      // and rejects empty/invalid tokens when enforcement is enabled.
      const verifyRes = await dirStub.fetch(new Request(`http://localhost/api/internal/verify-token?token=${encodeURIComponent(clientToken)}`));
      if (!verifyRes.ok) {
        return new Response('Unauthorized: connection token required or invalid', { status: 401 });
      }

      // Register room in directory
      this.state.waitUntil(
        dirStub.fetch(new Request('http://localhost/api/__directory__/room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, token: 'active' })
        })).catch(() => {})
      );
    }

    const pair = new WebSocketPair();
    const server = pair[1];
    const client = pair[0];
    await this.handleSession(server, roomId);

    return new Response(null, { status: 101, webSocket: client });
  }

  async handleSession(webSocket, roomId) {
    this.state.acceptWebSocket(webSocket);
    // Increment active connection count
    const conn = await this.state.storage.get('connections') ?? 0;
    await this.state.storage.put('connections', conn + 1);
    this._initSocket(webSocket, { roomId });
  }

  async webSocketMessage(ws, message) {
    try {
      let buffer = null;
      if (message instanceof ArrayBuffer) {
        buffer = Buffer.from(message);
      } else if (message instanceof Uint8Array) {
        buffer = Buffer.from(message);
      } else if (ArrayBuffer.isView(message) && message.buffer) {
        buffer = Buffer.from(message.buffer);
      } else {
        console.warn('[ws] unsupported message type', typeof message);
        return;
      }
      ws.rxBytes = (ws.rxBytes || 0) + (buffer.length || 0);
      console.log(`[ws] recv len=${buffer.length}`);
      ws.lastSeen = Date.now();
      const header = parseHeader(buffer);
      if (!header) {
        console.error('[ws] parseHeader failed, raw hex=', buffer.toString('hex'));
        return;
      }
      console.log(`[ws] header from=${header.fromPeerId} to=${header.toPeerId} type=${header.packetType} len=${header.len}`);
      const payload = buffer.subarray(HEADER_SIZE);
      switch (header.packetType) {
        case PacketType.HandShake:
          console.log(`[ws] -> handleHandshake payload hex=${payload.toString('hex')}`);
          await handleHandshake(ws, header, payload, this.types, this.env);
          break;
        case PacketType.Ping:
          handlePing(ws, header, payload);
          break;
        case PacketType.RpcReq:
          if (header.toPeerId === undefined || header.toPeerId === null || header.toPeerId === MY_PEER_ID) {
            handleRpcReq(ws, header, payload, this.types);
          } else {
            handleForwarding(ws, header, buffer, this.types);
          }
          break;
        case PacketType.RpcResp:
          if (header.toPeerId === undefined || header.toPeerId === null || header.toPeerId === MY_PEER_ID) {
            handleRpcResp(ws, header, payload, this.types);
            break;
          }
          // If toPeerId is not MY_PEER_ID, forward to the target peer
          if (header.packetType !== PacketType.Data) {
            console.log(`[ws] -> forward RpcResp type=${header.packetType} from=${header.fromPeerId} to=${header.toPeerId} len=${payload.length}`);
          }
          handleForwarding(ws, header, buffer, this.types);
          break;
        case PacketType.Data:
        default:
          if (header.packetType !== PacketType.Data) {
            console.log(`[ws] -> forward type=${header.packetType} len=${payload.length}`);
          }
          // Update inbound byte counter
          const inbound = await this.state.storage.get('bytesIn') ?? 0;
          await this.state.storage.put('bytesIn', inbound + buffer.length);
          handleForwarding(ws, header, buffer, this.types);
      }
    } catch (e) {
      console.error('relay_room message handling error:', e);
      try { ws.close(1011, 'internal error'); } catch (_) { }
    }
  }

  async webSocketClose(ws) {
    if (ws.peerId) {
      const groupKey = ws.groupKey;
      const removed = this.peerManager.removePeer(ws);
      if (removed) {
        try {
          this.peerManager.broadcastRouteUpdate(this.types, groupKey);
        } catch (_) { }
      }
    }
    // Decrement connection count
    const conn = await this.state.storage.get('connections') ?? 0;
    await this.state.storage.put('connections', Math.max(0, conn - 1));

    // Automatically deregister empty room from the directory DO
    const activeCount = this.state.getWebSockets().filter(w => w.peerId).length;
    if (activeCount === 0) {
      const roomId = ws.roomId || 'default';
      if (roomId !== '__directory__') {
        const dirStub = this.env.RELAY_ROOM.get(this.env.RELAY_ROOM.idFromName('__directory__'));
        this.state.waitUntil(
          dirStub.fetch(new Request(`http://localhost/api/__directory__/deregister?roomId=${encodeURIComponent(roomId)}`, {
            method: 'POST'
          })).catch(() => {})
        );
      }
    }
  }

  async webSocketError(ws) {
    await this.webSocketClose(ws);
  }

  _initSocket(ws, meta = {}) {
    ws.peerId = meta.peerId || null;
    ws.groupKey = meta.groupKey || null;
    ws.domainName = meta.domainName || null;
    ws.lastSeen = Date.now();
    ws.serverSessionId = meta.serverSessionId || randomU64String();
    ws.weAreInitiator = false;
    ws.crypto = { enabled: false };

    // Track stats and custom metadata
    ws.roomId = meta.roomId || ws.roomId || null;
    ws.connectedAt = meta.connectedAt || ws.connectedAt || Date.now();
    ws.rxBytes = meta.rxBytes || ws.rxBytes || 0;
    ws.txBytes = meta.txBytes || ws.txBytes || 0;

    // Dynamic interception of send to track outgoing traffic
    const originalSend = ws.send;
    ws.send = function (data) {
      ws.txBytes = (ws.txBytes || 0) + (data.byteLength || data.length || 0);
      return originalSend.call(this, data);
    };

    persistWebSocketAttachment(ws);
  }

  _restoreSocket(ws) {
    const meta = ws.deserializeAttachment ? (ws.deserializeAttachment() || {}) : {};
    this._initSocket(ws, meta);
    
    if (ws.peerId && ws.groupKey) {
      this.peerManager.addPeer(ws.peerId, ws);
    }
  }
  // Directory API implementation
  async _handleDirectoryApi(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/__directory__/, '');
    const tokenHeader = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    const storage = this.state.storage;
    // Helper to load directory map
    const getDir = async () => (await storage.get('directory')) ?? {};
    const setDir = async (dir) => await storage.put('directory', dir);

    if (path === '/list' && request.method === 'GET') {
      const dir = await getDir();
      return new Response(JSON.stringify(Object.keys(dir)), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (path === '/room' && request.method === 'POST') {
      const body = await request.json();
      const { roomId, token, meta } = body;
      if (!roomId || !token) {
        return new Response('roomId and token required', { status: 400 });
      }
      const dir = await getDir();
      dir[roomId] = { token, meta: meta ?? {} };
      await setDir(dir);
      return new Response('OK', { status: 200 });
    }

    if (path === '/deregister' && request.method === 'POST') {
      const roomId = url.searchParams.get('roomId');
      if (roomId) {
        const dir = await getDir();
        delete dir[roomId];
        await setDir(dir);
      }
      return new Response('OK', { status: 200 });
    }

    if (path === '/stats' && request.method === 'GET') {
      const [connections, bytesIn] = await Promise.all([
        storage.get('connections') ?? 0,
        storage.get('bytesIn') ?? 0,
      ]);
      const stats = { connections, bytesIn };
      return new Response(JSON.stringify(stats), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Token verification for other routes
    if (tokenHeader) {
      const dir = await getDir();
      const match = Object.values(dir).some(entry => entry.token === tokenHeader);
      if (!match) {
        return new Response('Invalid token', { status: 401 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }

  // Admin API implementation (called on the __directory__ central Durable Object)
  async _handleAdminApi(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const storage = this.state.storage;

    const getTokens = async () => (await storage.get('tokens')) ?? [];
    const saveTokens = async (tokens) => await storage.put('tokens', tokens);
    const getConfig = async () => {
      const config = (await storage.get('config')) ?? {};
      if (!Array.isArray(config.easyTierConfigs)) {
        config.easyTierConfigs = [];
      }
      if (config.requireToken === undefined) {
        config.requireToken = false;
      }
      return config;
    };
    const saveConfig = async (config) => await storage.put('config', config);
    const getDir = async () => (await storage.get('directory')) ?? {};

    // 1. GET /api/rooms -> return active networks from the `default` DO (all EasyTier peers)
    if (path === '/api/rooms' && method === 'GET') {
      try {
        const defaultStub = this.env.RELAY_ROOM.get(this.env.RELAY_ROOM.idFromName('default'));
        const res = await defaultStub.fetch(new Request('http://localhost/api/internal/rooms'));
        if (res.ok) {
          return res;
        }
      } catch (_) {}
      return new Response(JSON.stringify({ rooms: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. GET /api/rooms/:networkName/stats -> get peers in network from `default` DO
    const statsMatch = path.match(/^\/api\/rooms\/([^/]+)\/stats$/);
    if (statsMatch && method === 'GET') {
      const networkName = decodeURIComponent(statsMatch[1]);
      const defaultStub = this.env.RELAY_ROOM.get(this.env.RELAY_ROOM.idFromName('default'));
      return defaultStub.fetch(
        new Request(`http://localhost/api/internal/rooms/${encodeURIComponent(networkName)}/stats`)
      );
    }

    // 3. POST /api/rooms/:networkName/kick -> kick a peer in network via `default` DO
    const kickMatch = path.match(/^\/api\/rooms\/([^/]+)\/kick$/);
    if (kickMatch && method === 'POST') {
      const networkName = decodeURIComponent(kickMatch[1]);
      const peerId = url.searchParams.get('peerId');
      const defaultStub = this.env.RELAY_ROOM.get(this.env.RELAY_ROOM.idFromName('default'));
      return defaultStub.fetch(
        new Request(`http://localhost/api/internal/rooms/${encodeURIComponent(networkName)}/kick?peerId=${encodeURIComponent(peerId || '')}`, {
          method: 'POST'
        })
      );
    }

    // 4. GET /api/tokens -> return client tokens
    if (path === '/api/tokens' && method === 'GET') {
      const tokens = await getTokens();
      return new Response(JSON.stringify({ tokens }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. POST /api/tokens -> generate client token
    if (path === '/api/tokens' && method === 'POST') {
      let body = { description: '' };
      try {
        body = await request.json();
      } catch (_) {}
      const { description, room: roomParam } = body;
      const roomId = String(roomParam || '').trim() || 'default';
      const tokens = await getTokens();

      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

      const newToken = {
        token,
        description: description || '',
        roomId,
        createdAt: new Date().toISOString()
      };
      tokens.push(newToken);
      await saveTokens(tokens);

      let wssUrl = null;
      try {
        wssUrl = buildEasyTierWsUrl(requestPublicOrigin(request), {
          room: roomId,
          token,
          wsPath: this.env.WS_PATH || 'ws',
        });
      } catch (_) {}

      return new Response(JSON.stringify({ ...newToken, wssUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 6. DELETE /api/tokens -> delete a client token
    if (path === '/api/tokens' && method === 'DELETE') {
      const tokenVal = url.searchParams.get('token');
      if (!tokenVal) {
        return new Response('Token required', { status: 400 });
      }
      let tokens = await getTokens();
      tokens = tokens.filter(t => t.token !== tokenVal);
      await saveTokens(tokens);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 7. GET /api/ws-url -> build client WSS URL (admin)
    if (path === '/api/ws-url' && method === 'GET') {
      const origin = url.searchParams.get('origin') || '';
      const room = url.searchParams.get('room') || 'default';
      const token = url.searchParams.get('token') || '';
      const wsPath = this.env.WS_PATH || 'ws';
      if (!origin) {
        return new Response(JSON.stringify({ error: 'origin query parameter is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      try {
        const wssUrl = buildEasyTierWsUrl(origin, { room, token, wsPath });
        const networkName = url.searchParams.get('networkName') || '';
        const networkSecret = url.searchParams.get('networkSecret') || '';
        const payload = { wssUrl, wsPath };
        if (networkName || networkSecret) {
          payload.easyTierCommand = buildEasyTierCoreCommand(wssUrl, networkName, networkSecret);
        }
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message || 'invalid origin' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 8. GET /api/config -> get configuration
    if (path === '/api/config' && method === 'GET') {
      const config = await getConfig();
      config.wsPath = this.env.WS_PATH || 'ws';
      return new Response(JSON.stringify(sanitizeConfigForPublic(config)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 9. POST /api/config -> update configuration
    if (path === '/api/config' && method === 'POST') {
      let body = {};
      try {
        body = await request.json();
      } catch (_) {}
      const config = await getConfig();
      config.wsPath = this.env.WS_PATH || 'ws';
      if (body.requireToken !== undefined) {
        config.requireToken = !!body.requireToken;
      }
      if (body.deleteEasyTierConfigId) {
        const id = String(body.deleteEasyTierConfigId);
        config.easyTierConfigs = config.easyTierConfigs.filter((entry) => entry.id !== id);
      }
      if (body.easyTierConfig && typeof body.easyTierConfig === 'object') {
        const input = body.easyTierConfig;
        // When editing, preserve the existing network_secret if the new value is empty
        let networkSecret = String(input.network_secret || "").trim();
        if (!networkSecret && input.id) {
          const existing = (config.easyTierConfigs || []).find((entry) => entry.id === input.id);
          if (existing && existing.network_secret) {
            networkSecret = existing.network_secret;
          }
        }
        const nextConfig = {
          id: input.id || crypto.randomUUID(),
          instance_name: String(input.instance_name || '').trim(),
          network_name: String(input.network_name || '').trim(),
          network_secret: networkSecret,
          ipv4: String(input.ipv4 || '').trim(),
          dhcp: !!input.dhcp,
          listeners: String(input.listeners || '').trim(),
          rpc_portal: String(input.rpc_portal || '').trim(),
          peers: String(input.peers || '').trim(),
          proxy_networks: String(input.proxy_networks || '').trim(),
          default_protocol: String(input.default_protocol || 'tcp').trim(),
          dev_name: String(input.dev_name || 'tun0').trim(),
          mtu: Number(input.mtu) || 1380,
          enable_encryption: input.enable_encryption !== false,
          enable_ipv6: input.enable_ipv6 !== false,
          latency_first: !!input.latency_first,
          notes: String(input.notes || '').trim(),
          createdAt: input.createdAt || new Date().toISOString(),
        };
        if (!nextConfig.network_name) {
          return new Response(JSON.stringify({ error: 'network_name is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        config.easyTierConfigs = (config.easyTierConfigs || []).filter((entry) => entry.id !== nextConfig.id);
        config.easyTierConfigs.unshift(nextConfig);
      }
      await saveConfig(config);
      const publicConfig = sanitizeConfigForPublic(config);
      publicConfig.wsPath = this.env.WS_PATH || 'ws';
      return new Response(JSON.stringify({ ok: true, config: publicConfig }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}
