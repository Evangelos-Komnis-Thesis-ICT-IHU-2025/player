export interface PlayerConfig {
  port: number;
  engineBaseUrl: string;
  commitIntervalMs: number;
  cacheDir: string;
}

export function loadConfig(): PlayerConfig {
  return {
    port: Number(process.env.PORT ?? "3000"),
    engineBaseUrl: process.env.PLAYER_ENGINE_BASE_URL ?? "http://localhost:8080",
    commitIntervalMs: Number(process.env.COMMIT_INTERVAL_MS ?? "15000"),
    cacheDir: process.env.PLAYER_CACHE_DIR ?? "/data/packages"
  };
}
