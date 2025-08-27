import { createClient } from "redis";
import config from "../constant/config";

export const client = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
  password: (config.redis.password as string) || undefined,
  socket: {
    keepAlive: true,
    reconnectStrategy: (retries) => Math.min(1000 * 2 ** retries, 30_000),
  },
});

client.on("error", (err) => console.error("[Redis] error:", err));
