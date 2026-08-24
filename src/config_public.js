/** 管理 API 返回前脱敏配置（不暴露网络密钥等敏感字段） */

export function sanitizeConfigForPublic(config) {
  if (!config || typeof config !== 'object') {
    return { easyTierConfigs: [], requireToken: false };
  }
  const safe = {
    requireToken: !!config.requireToken,
    wsPath: config.wsPath,
    easyTierConfigs: [],
  };
  if (Array.isArray(config.easyTierConfigs)) {
    safe.easyTierConfigs = config.easyTierConfigs.map((entry) => {
      const { network_secret, networkSecret, ...rest } = entry;
      return {
        ...rest,
        hasNetworkSecret: Boolean(network_secret || networkSecret),
      };
    });
  }
  return safe;
}
