import { createClient } from 'redis';

let redisClient: any = null;

/**
 * Initialize Redis client for caching and job queues
 */
export async function initializeRedis(): Promise<any> {
  try {
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
      password: process.env.REDIS_PASSWORD,
      database: parseInt(process.env.REDIS_DB || '0', 10),
    });

    // Suppress error logging for Redis (it's optional)
    client.on('error', () => {
      // Silently ignore - Redis is optional
    });

    client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    // Connect to Redis with timeout
    try {
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 3000))
      ]);
      redisClient = client;
      return client;
    } catch {
      // Redis failed - continue without it
      return null;
    }
  } catch (error: any) {
    console.log('⚠️ Redis unavailable - continuing without caching/job scheduling');
    return null;
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient(): any {
  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export { redisClient };
