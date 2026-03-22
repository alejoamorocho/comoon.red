/**
 * Caching Service using Cloudflare KV
 *
 * Provides typed get/set/delete operations with TTL support.
 * Used for caching frequently-read, rarely-changed data like
 * leader tags, department lists, and public profiles.
 */

interface CacheOptions {
  /** Time-to-live in seconds. Default: 300 (5 minutes) */
  ttl?: number;
}

export class CacheService {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.kv.get(key, 'json');
    return value as T | null;
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 300; // default 5 minutes
    await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  /**
   * Get a cached value, or fetch and cache it if not present.
   * Avoids repeated DB queries for data that changes infrequently.
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await fetcher();
    await this.set(key, value, options);
    return value;
  }
}

/** Well-known cache keys used across the application */
export const CACHE_KEYS = {
  leaderTags: 'leader-tags',
  departments: 'departments',
  leaderProfile: (id: number) => `leader:${id}`,
  feedDepartments: 'feed-departments',
} as const;
