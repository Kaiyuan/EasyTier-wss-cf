import { buildEasyTierWsUrl } from "./ws_url.js";

const textEncoder = new TextEncoder();

export const STATE_KEY = "state";

export function createEmptyState() {
  return {
    routes: [],
    apiKeys: [],
    events: [],
    summary: {
      activeConnections: 0,
      totalConnections: 0,
      updatedAt: null,
      apiKeyCount: 0,
    },
  };
}

function normalizeText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function randomToken(size = 24) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashApiKey(value) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(String(value)));
  return toHex(new Uint8Array(digest));
}

function ensureStats(stats) {
  return {
    activeConnections: Number(stats?.activeConnections ?? 0),
    totalConnections: Number(stats?.totalConnections ?? 0),
    lastSeenAt: stats?.lastSeenAt ?? null,
    lastError: stats?.lastError ?? null,
  };
}

export function normalizeRouteInput(input, existing = null) {
  const now = new Date().toISOString();
  const route = existing ?? {};
  return {
    id: normalizeText(input.id ?? route.id ?? crypto.randomUUID()),
    name: normalizeText(input.name ?? route.name ?? "Unnamed route") || "Unnamed route",
    networkName: normalizeText(input.networkName ?? route.networkName),
    networkSecret: normalizeText(input.networkSecret ?? route.networkSecret),
    clientToken: normalizeText(input.clientToken ?? route.clientToken ?? randomToken(24)),
    enabled: input.enabled ?? route.enabled ?? true,
    notes: normalizeText(input.notes ?? route.notes),
    createdAt: input.createdAt ?? route.createdAt ?? now,
    updatedAt: input.updatedAt ?? route.updatedAt ?? now,
    stats: ensureStats(route.stats),
  };
}

export function buildPublicWsUrl(origin, _routeId, _clientToken, _wsPath = "ws") {
  // EasyTier 客户端仅支持 scheme://host[:port]；房间/令牌无法通过 URL 携带。
  return buildEasyTierWsUrl(origin);
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\"'\"'`)}'`;
}

export function toRouteView(route, origin) {
  const publicWsUrl = buildPublicWsUrl(origin, route.id, route.clientToken);
  return {
    ...route,
    publicWsUrl,
    easyTierCommand: [
      "sudo easytier-core -d",
      `--network-name ${shellQuote(route.networkName || "<network-name>")}`,
      `--network-secret ${shellQuote(route.networkSecret || "<network-secret>")}`,
      `-p ${shellQuote(publicWsUrl)}`,
    ].join(" "),
  };
}

export function toRouteViews(routes, origin) {
  return routes.map((route) => toRouteView(route, origin));
}

function ensureStateShape(value) {
  const state = value && typeof value === "object" ? value : createEmptyState();
  return {
    routes: Array.isArray(state.routes) ? state.routes.map((route) => normalizeRouteInput(route, route)) : [],
    apiKeys: Array.isArray(state.apiKeys) ? state.apiKeys : [],
    events: Array.isArray(state.events) ? state.events : [],
    summary: state.summary ?? createEmptyState().summary,
  };
}

async function loadState(storage) {
  return ensureStateShape(await storage.get(STATE_KEY));
}

async function saveState(storage, state) {
  await storage.put(STATE_KEY, ensureStateShape(state));
}

function refreshSummary(state) {
  const totals = state.routes.reduce(
    (accumulator, route) => {
      const stats = ensureStats(route.stats);
      accumulator.activeConnections += stats.activeConnections;
      accumulator.totalConnections += stats.totalConnections;
      return accumulator;
    },
    { activeConnections: 0, totalConnections: 0 },
  );

  state.summary = {
    activeConnections: totals.activeConnections,
    totalConnections: totals.totalConnections,
    updatedAt: new Date().toISOString(),
    apiKeyCount: state.apiKeys.filter((entry) => entry.enabled !== false && !entry.revokedAt).length,
  };
}

function stripApiKeyRecord(record) {
  return {
    id: record.id,
    name: record.name,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastUsedAt: record.lastUsedAt,
    revokedAt: record.revokedAt,
    enabled: record.enabled,
  };
}

function normalizeApiKeyRecord(input, existing = null) {
  const now = new Date().toISOString();
  const source = existing ?? {};
  return {
    id: normalizeText(input.id ?? source.id ?? crypto.randomUUID()),
    name: normalizeText(input.name ?? source.name ?? "Unnamed key") || "Unnamed key",
    notes: normalizeText(input.notes ?? source.notes),
    keyHash: normalizeText(input.keyHash ?? source.keyHash),
    createdAt: input.createdAt ?? source.createdAt ?? now,
    updatedAt: input.updatedAt ?? source.updatedAt ?? now,
    lastUsedAt: input.lastUsedAt ?? source.lastUsedAt ?? null,
    revokedAt: input.revokedAt ?? source.revokedAt ?? null,
    enabled: input.enabled ?? source.enabled ?? true,
  };
}

export async function listApiKeys(storage) {
  const state = await loadState(storage);
  return state.apiKeys.map((apiKey) => stripApiKeyRecord(normalizeApiKeyRecord(apiKey, apiKey)));
}

export async function createApiKey(storage, input = {}) {
  const state = await loadState(storage);
  const key = randomToken(32);
  const apiKey = normalizeApiKeyRecord({
    ...input,
    keyHash: await hashApiKey(key),
    enabled: true,
  });
  state.apiKeys.unshift(apiKey);
  refreshSummary(state);
  await saveState(storage, state);
  return { key, apiKey: stripApiKeyRecord(apiKey) };
}

export async function revokeApiKey(storage, apiKeyId) {
  const state = await loadState(storage);
  const index = state.apiKeys.findIndex((entry) => entry.id === apiKeyId);
  if (index < 0) return null;
  const current = normalizeApiKeyRecord(state.apiKeys[index], state.apiKeys[index]);
  current.enabled = false;
  current.revokedAt = new Date().toISOString();
  current.updatedAt = current.revokedAt;
  state.apiKeys[index] = current;
  refreshSummary(state);
  await saveState(storage, state);
  return stripApiKeyRecord(current);
}

export async function verifyApiKey(storage, providedKey) {
  const state = await loadState(storage);
  const keyHash = await hashApiKey(providedKey);
  const index = state.apiKeys.findIndex(
    (entry) => entry.enabled !== false && !entry.revokedAt && entry.keyHash === keyHash,
  );
  if (index < 0) return null;
  const matched = normalizeApiKeyRecord(state.apiKeys[index], state.apiKeys[index]);
  matched.lastUsedAt = new Date().toISOString();
  matched.updatedAt = matched.lastUsedAt;
  state.apiKeys[index] = matched;
  refreshSummary(state);
  await saveState(storage, state);
  return stripApiKeyRecord(matched);
}
