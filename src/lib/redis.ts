import { Redis } from "@upstash/redis";

// Create Redis Client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CacheOptions {
  tags?: string[];
  revalidate?: number;
}

export async function cache<T>(
  key: string[],
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cacheKey = key.join(":");
  const cached = await redis.get<T>(cacheKey);

  if (cached) {
    return cached;
  }

  const fresh = await fn();
  await redis.set(cacheKey, fresh, {
    ex: options.revalidate ?? 60, // Default 60 seconds
  });

  // Store tags for cache invalidation
  if (options.tags?.length) {
    await Promise.all(
      options.tags.map(async (tag) => {
        await redis.sadd(`tag:${tag}`, cacheKey);
      })
    );
  }

  return fresh;
}

export async function revalidateTag(tag: string): Promise<void> {
  const keys = await redis.smembers(`tag:${tag}`);
  if (keys.length) {
    // Delete each key individually since redis.del expects a single key
    await Promise.all([
      ...keys.map(key => redis.del(key)),
      redis.del(`tag:${tag}`),
    ]);
  }
} 