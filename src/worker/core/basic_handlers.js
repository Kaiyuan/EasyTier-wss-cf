import { MAGIC, VERSION, MY_PEER_ID, PacketType } from './constants.js';
import { createHeader } from './packet.js';
import { getPeerManager } from './peer_manager.js';
import { wrapPacket, randomU64String } from './crypto.js';
import { persistWebSocketAttachment } from './ws_attachment.js';

const WS_OPEN = (typeof WebSocket !== 'undefined' && WebSocket.OPEN) ? WebSocket.OPEN : 1;

// In-memory registry: first peer in a network establishes the expected digest for that session.
// Subsequent peers joining the same network name must supply the same digest.
const networkDigestRegistry = new Map();

export async function handleHandshake(ws, header, payload, types, env) {
  try {
    const req = types.HandshakeRequest.decode(payload);

    if (req.magic !== MAGIC) {
      console.error('Invalid magic');
      ws.close();
      return;
    }

    const clientNetworkName = req.networkName || '';
    const clientDigest = req.networkSecretDigrest ? Buffer.from(req.networkSecretDigrest) : Buffer.alloc(0);
    const digestHex = clientDigest.toString('hex');

    // --- Admin-configured network verification ---
    // Ask the directory DO if this network+digest is allowed.
    if (env && env.RELAY_ROOM) {
      try {
        const dirStub = env.RELAY_ROOM.get(env.RELAY_ROOM.idFromName('__directory__'));
        const verifyUrl = `http://localhost/api/internal/verify-network?name=${encodeURIComponent(clientNetworkName)}&digest=${encodeURIComponent(digestHex)}`;
        const res = await dirStub.fetch(new Request(verifyUrl));
        if (!res.ok) {
          const msg = await res.text().catch(() => res.status.toString());
          console.error(`Rejecting handshake from ${req.myPeerId}: directory rejected network "${clientNetworkName}" — ${msg}`);
          ws.close();
          return;
        }
      } catch (verifyErr) {
        // If the directory is unreachable, fall through and allow (public relay behaviour)
        console.warn(`verify-network call failed (falling through): ${verifyErr.message}`);
      }
    }

    // Fast-path per-session consistency check: all peers in the same network name
    // must use the same digest within this DO instance's lifetime.
    const existingDigest = networkDigestRegistry.get(clientNetworkName);
    if (existingDigest && existingDigest !== digestHex) {
      console.error(`Rejecting handshake from ${req.myPeerId}: digest mismatch for network "${clientNetworkName}" (existing=${existingDigest}, incoming=${digestHex})`);
      ws.close();
      return;
    }
    if (!existingDigest) {
      networkDigestRegistry.set(clientNetworkName, digestHex);
    }
    const groupDigest = networkDigestRegistry.get(clientNetworkName) || '';
    const groupKey = `${clientNetworkName}:${groupDigest}`;
    const serverNetworkName = process.env.EASYTIER_PUBLIC_SERVER_NETWORK_NAME || 'public_server';
    const digest = new Uint8Array(32);

    ws.domainName = clientNetworkName;

    const respPayload = {
      magic: MAGIC,
      myPeerId: MY_PEER_ID,
      version: VERSION,
      features: ["node-server-v1"],
      networkName: serverNetworkName,
      networkSecretDigrest: digest
    };

    ws.groupKey = groupKey;
    ws.peerId = req.myPeerId;
    const pm = getPeerManager();
    pm.addPeer(req.myPeerId, ws);
    pm.updatePeerInfo(ws.groupKey, req.myPeerId, {
      peerId: req.myPeerId,
      version: 1,
      lastUpdate: { seconds: Math.floor(Date.now() / 1000), nanos: 0 },
      instId: { part1: 0, part2: 0, part3: 0, part4: 0 },
      networkLength: Number(process.env.EASYTIER_NETWORK_LENGTH || 24),
    });
    pm.setPublicServerFlag(true);
    ws.crypto = { enabled: false };

    const respBuffer = types.HandshakeRequest.encode(respPayload).finish();
    const respHeader = createHeader(MY_PEER_ID, req.myPeerId, PacketType.HandShake, respBuffer.length);
    ws.send(Buffer.concat([respHeader, Buffer.from(respBuffer)]));
    if (!ws.serverSessionId) {
      ws.serverSessionId = randomU64String();
    }
    if (ws.weAreInitiator === undefined) {
      ws.weAreInitiator = false;
    }
    persistWebSocketAttachment(ws);

    setTimeout(() => {
      try {
        if (ws.readyState === WS_OPEN) {
          const pm = getPeerManager();
          pm.pushRouteUpdateTo(req.myPeerId, ws, types, { forceFull: true });
          pm.broadcastRouteUpdate(types, ws.groupKey, req.myPeerId, { forceFull: true });
        }
      } catch (e) {
        console.error(`Failed to push initial route update to ${req.myPeerId}:`, e.message);
      }
    }, 50);

  } catch (e) {
    console.error('Handshake error:', e);
    ws.close();
  }
}

export function handlePing(ws, header, payload) {
  const msg = wrapPacket(createHeader, MY_PEER_ID, header.fromPeerId, PacketType.Pong, payload, ws);
  ws.send(msg);
}

export function handleForwarding(sourceWs, header, fullMessage, types) {
  const targetPeerId = header.toPeerId;
  const pm = getPeerManager();
  const targetWs = pm.getPeerWs(targetPeerId, sourceWs && sourceWs.groupKey);

  if (targetWs && targetWs.readyState === WS_OPEN) {
    const srcGroup = sourceWs && sourceWs.groupKey;
    const dstGroup = targetWs && targetWs.groupKey;
    if (srcGroup && dstGroup && srcGroup !== dstGroup) {
      return;
    }
    try {
      targetWs.send(fullMessage);
    } catch (e) {
      console.error(`Forward to ${targetPeerId} failed: ${e.message}`);
      pm.removePeer(targetWs);
      try {
        pm.broadcastRouteUpdate(types, srcGroup);
      } catch (err) {
        console.error(`Broadcast after forward failure failed: ${err.message}`);
      }
    }
  } else {
  }
}
