import { Redis } from 'ioredis';

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

function getTimeUntil6PMPH(): number {
  const now = new Date();
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  
  const sixPMToday = new Date(phTime);
  sixPMToday.setHours(18, 0, 0, 0);
  
  if (phTime.getTime() >= sixPMToday.getTime()) {
    sixPMToday.setDate(sixPMToday.getDate() + 1);
  }
  
  return Math.floor((sixPMToday.getTime() - phTime.getTime()) / 1000);
}

export async function getFromCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  
  try {
    const data = await redis.get(key);
    if (!data) return null;
    
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Redis cache get error:', error);
    try {
      await redis.del(key);
    } catch {
      // Ignore any errors when deleting a potentially corrupted key
    }
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttl?: number): Promise<void> {
  if (!redis) return;
  
  try {
    const jsonData = JSON.stringify(data);

    if (key === 'unit_level' || key === 'master:unit_level') {
      await redis.set(key, jsonData);
    } else {
      const expirySeconds = ttl ?? getTimeUntil6PMPH();
      await redis.setex(key, expirySeconds, jsonData);
    }
  } catch (error) {
    console.error(`Redis cache set error for key ${key}:`, error);
    try {
      await redis.del(key);
    } catch {
      // Ignore any errors when deleting a potentially corrupted key
    }
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis cache invalidation error:', error);
  }
}

export async function getMasterCache<T>(collectionKey: string): Promise<T | null> {
  if (!redis) return null;
  const masterKey = `master:${collectionKey}`;
  return getFromCache<T>(masterKey);
}

export async function setMasterCache<T>(collectionKey: string, data: T): Promise<void> {
  if (!redis) return;
  const masterKey = `master:${collectionKey}`;
  return setCache<T>(masterKey, data);
}