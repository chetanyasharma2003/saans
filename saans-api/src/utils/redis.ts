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

    client.on('error', (err: any) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    // Connect to Redis
    await client.connect();
    redisClient = client;
    return client;
  } catch (error: any) {
    console.warn('⚠️ Redis connection failed:', error.message);
    console.warn('Running without Redis - job scheduling will not work');
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
