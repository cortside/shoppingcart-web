export interface AppConfig {
  catalogApi: {
    url: string;
  };
  shoppingCartApi: {
    url: string;
  };
  identity: {
    authority: string;
    clientId: string;
    scope: string;
  };
}

let config: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  if (config) {
    return config;
  }

  // Load base config
  const baseResponse = await fetch('/config.json');
  const baseConfig = await baseResponse.json();

  // Try to load local overrides (may not exist)
  try {
    const localResponse = await fetch('/config.local.json');
    const localConfig = await localResponse.json();
    config = { ...baseConfig, ...localConfig };
  } catch {
    // config.local.json doesn't exist, use base config
    config = baseConfig;
  }

  return config as AppConfig;
}

export function getConfig(): AppConfig {
  if (!config) {
    throw new Error('Config not loaded. Call loadConfig() first.');
  }
  return config;
}
