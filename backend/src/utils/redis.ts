import { Redis } from "@upstash/redis";

// If UPSTASH env is set and looks like a valid REST URL (https), use Upstash client.
// Otherwise fall back to an in-memory map to avoid crashing during local dev.
let redis: any;
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";

if (upstashUrl.startsWith("https://")) {
  try {
    redis = new Redis({ url: upstashUrl, token: upstashToken });
  } catch (e) {
    // fallback to in-memory if construction fails
    redis = null;
  }
}

if (!redis) {
  const store = new Map<string, any>();
  redis = {
    get: async (key: string) => {
      const v = store.get(key);
      return v === undefined ? null : v;
    },
    set: async (key: string, value: any, opts?: any) => {
      // ignore TTL in fallback
      store.set(key, value);
      return "OK";
    },
    del: async (key: string) => {
      return store.delete(key) ? 1 : 0;
    },
  };
}

/**
 * Get value from cache by key
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data as T | null;
  } catch (e) {
    return null;
  }
}

/**
 * Set value in cache with TTL (seconds)
 */
export async function setCache(
  key: string,
  value: any,
  ttl = 60
): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttl });
  } catch (e) {}
}

/**
 * Delete cache by key
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (e) {}
}

export default redis;
