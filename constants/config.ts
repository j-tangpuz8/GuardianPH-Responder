export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
  SOCKET_URL: process.env.EXPO_PUBLIC_API_URL,
  STREAM_KEY: process.env.EXPO_PUBLIC_STREAM_ACCESS_KEY,

  WEBSOCKET: {
    RECONNECT_ATTEMPTS: 500,
    RECONNECT_DELAY: 0,
    RECONNECT_DELAY_MAX: 1000,
    HEARTBEAT_INTERVAL: 30000,
    RESPONSE_TIMEOUT: 1000,
    ROOM_JOIN_TIMEOUT: 2000,
  },

  // logging configs
  LOGGING: {
    DEFAULT_LEVEL: "INFO",
    MAX_LOGS: 1000,
  },

  SOUND: {
    VOLUME: 1.0,
    LOOP: false,
  },

  LOCATION: {
    ACCURACY: "high",
    TIMEOUT: 10000,
    MAX_AGE: 60000,
  },
} as const;

export const validateConfig = () => {
  const required = ["API_URL"];
  const missing = required.filter((key) => !CONFIG[key as keyof typeof CONFIG]);

  if (missing.length > 0) {
    console.warn("Missing required environment variables:", missing);
  }

  return missing.length === 0;
};

export const API_URL = CONFIG.API_URL;
export const SOCKET_URL = CONFIG.SOCKET_URL;
export const STREAM_KEY = CONFIG.STREAM_KEY;
