import { Redis } from 'ioredis';

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
  console.log('Redis client initialized');
} else {
  console.log('No REDIS_URL found, caching disabled');
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
    }
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttl?: number): Promise<void> {
  if (!redis) return;
  
  try {
    const jsonData = JSON.stringify(data);
    const expirySeconds = ttl ?? getTimeUntil6PMPH();
    
    await redis.setex(key, expirySeconds, jsonData);
    console.log(`Successfully cached data for key: ${key}, TTL: ${expirySeconds}s`);
  } catch (error) {
    console.error(`Redis cache set error for key ${key}:`, error);
    try {
      await redis.del(key);
    } catch {
    }
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Invalidated ${keys.length} keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Redis cache invalidation error:', error);
  }
}