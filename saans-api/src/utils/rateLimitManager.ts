import { getRedisClient } from './redis.js';

// ==================== TYPES ====================

interface RateLimitStats {
  key: string;
  type: string;
  hits: number;
  limit: number;
  remaining: number;
  resetTime: number;
  resetTimeFormatted: string;
  percentageUsed: number;
  isRateLimited: boolean;
  backoffInfo?: {
    backoffUntil: number;
    backoffUntilFormatted: string;
    remainingSeconds: number;
    multiplier: number;
    attemptCount: number;
  };
}

interface RateLimitConfig {
  name: string;
  windowMs: number;
  max: number;
  description: string;
}

// ==================== RATE LIMIT CONFIGS ====================

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    name: 'Login Rate Limit',
    windowMs: 60 * 1000,
    max: 5,
    description: '5 attempts per minute per IP',
  },
  registration: {
    name: 'Registration Rate Limit',
    windowMs: 60 * 60 * 1000,
    max: 3,
    description: '3 attempts per hour per IP',
  },
  passwordChange: {
    name: 'Password Change Rate Limit',
    windowMs: 24 * 60 * 60 * 1000,
    max: 3,
    description: '3 attempts per 24 hours per user',
  },
  api: {
    name: 'General API Rate Limit',
    windowMs: 60 * 1000,
    max: 100,
    description: '100 requests per minute per user/IP',
  },
  strictApi: {
    name: 'Strict API Rate Limit',
    windowMs: 60 * 1000,
    max: 30,
    description: '30 requests per minute per IP',
  },
  crisis: {
    name: 'Crisis Endpoint Rate Limit',
    windowMs: 60 * 1000,
    max: 10,
    description: '10 requests per minute per IP',
  },
  payment: {
    name: 'Payment Endpoint Rate Limit',
    windowMs: 60 * 1000,
    max: 20,
    description: '20 requests per minute per user',
  },
};

// ==================== FUNCTIONS ====================

/**
 * Get formatted date string from timestamp
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Get rate limit status for a specific key
 */
export async function getStatusForKey(
  key: string,
  type: string = 'standard',
  limit: number = 100
): Promise<RateLimitStats | null> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      console.warn('Redis unavailable for rate limit status check');
      return null;
    }

    const redisKey = `ratelimit:${type}:${key}`;
    const backoffKey = `ratelimit:backoff:${key}`;

    // Get rate limit data
    const rateLimitData = await redisClient.get(redisKey);
    const backoffData = await redisClient.get(backoffKey);

    if (!rateLimitData) {
      return {
        key,
        type,
        hits: 0,
        limit,
        remaining: limit,
        resetTime: 0,
        resetTimeFormatted: 'N/A',
        percentageUsed: 0,
        isRateLimited: false,
      };
    }

    const limitStore = JSON.parse(rateLimitData);
    const hits = limitStore.hits;
    const remaining = Math.max(0, limit - hits);
    const isRateLimited = hits > limit;
    const percentageUsed = Math.round((hits / limit) * 100);

    const stats: RateLimitStats = {
      key,
      type,
      hits,
      limit,
      remaining,
      resetTime: limitStore.resetTime,
      resetTimeFormatted: formatDate(limitStore.resetTime),
      percentageUsed,
      isRateLimited,
    };

    // Add backoff info if available
    if (backoffData) {
      const backoffInfo = JSON.parse(backoffData);
      stats.backoffInfo = {
        backoffUntil: backoffInfo.backoffUntil,
        backoffUntilFormatted: formatDate(backoffInfo.backoffUntil),
        remainingSeconds: Math.ceil((backoffInfo.backoffUntil - Date.now()) / 1000),
        multiplier: backoffInfo.multiplier,
        attemptCount: backoffInfo.attemptCount,
      };
    }

    return stats;
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return null;
  }
}

/**
 * Get status for multiple keys
 */
export async function getStatusForKeys(
  keys: string[],
  type: string = 'standard',
  limit: number = 100
): Promise<RateLimitStats[]> {
  const results: RateLimitStats[] = [];

  for (const key of keys) {
    const status = await getStatusForKey(key, type, limit);
    if (status) {
      results.push(status);
    }
  }

  return results;
}

/**
 * Reset rate limit for a specific key
 */
export async function resetKey(key: string, type: string = 'standard'): Promise<boolean> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      console.warn('Redis unavailable for reset');
      return false;
    }

    const redisKey = `ratelimit:${type}:${key}`;
    const backoffKey = `ratelimit:backoff:${key}`;

    await redisClient.del(redisKey);
    await redisClient.del(backoffKey);

    return true;
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return false;
  }
}

/**
 * Reset rate limits for multiple keys
 */
export async function resetKeys(keys: string[], type: string = 'standard'): Promise<number> {
  let count = 0;

  for (const key of keys) {
    const success = await resetKey(key, type);
    if (success) {
      count++;
    }
  }

  return count;
}

/**
 * Get all rate limit keys matching a pattern
 */
export async function getKeysMatchingPattern(
  pattern: string,
  type: string = 'standard'
): Promise<string[]> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      console.warn('Redis unavailable for pattern search');
      return [];
    }

    const searchPattern = `ratelimit:${type}:${pattern}`;
    const keys = await redisClient.keys(searchPattern);

    return keys.map((key: string) => key.replace(`ratelimit:${type}:`, ''));
  } catch (error) {
    console.error('Error getting keys matching pattern:', error);
    return [];
  }
}

/**
 * Get all rate limited clients (those currently in backoff)
 */
export async function getRateLimitedClients(type: string = 'backoff'): Promise<string[]> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      console.warn('Redis unavailable');
      return [];
    }

    const pattern = `ratelimit:${type}:*`;
    const keys = await redisClient.keys(pattern);

    return keys.map((key: string) => key.replace(`ratelimit:${type}:`, ''));
  } catch (error) {
    console.error('Error getting rate limited clients:', error);
    return [];
  }
}

/**
 * Get rate limit statistics by type
 */
export async function getStatsByType(type: string): Promise<{
  type: string;
  totalLimited: number;
  stats: RateLimitStats[];
}> {
  const rateLimitedKeys = await getRateLimitedClients('backoff');
  const stats = await getStatusForKeys(rateLimitedKeys, type);

  return {
    type,
    totalLimited: stats.filter((s) => s.isRateLimited).length,
    stats,
  };
}

/**
 * Get dashboard summary of all rate limits
 */
export async function getDashboardSummary(): Promise<{
  timestamp: string;
  summary: Record<string, { limited: number; total: number }>;
  allLimitedKeys: Record<string, string[]>;
}> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return {
        timestamp: new Date().toISOString(),
        summary: {},
        allLimitedKeys: {},
      };
    }

    const summary: Record<string, { limited: number; total: number }> = {};
    const allLimitedKeys: Record<string, string[]> = {};

    // Check each type
    for (const [, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
      const limitedKeys = await getRateLimitedClients('backoff');
      const stats = await getStatusForKeys(limitedKeys, 'standard', config.max);

      const limited = stats.filter((s) => s.isRateLimited).length;
      summary[config.name] = {
        limited,
        total: limitedKeys.length,
      };

      allLimitedKeys[config.name] = limitedKeys;
    }

    return {
      timestamp: new Date().toISOString(),
      summary,
      allLimitedKeys,
    };
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    return {
      timestamp: new Date().toISOString(),
      summary: {},
      allLimitedKeys: {},
    };
  }
}

/**
 * Whitelist/blacklist management - temporarily exempt IPs/users from rate limiting
 * This would typically be used with a separate mechanism
 */
export async function addToWhitelist(key: string, expiryMs: number = 3600000): Promise<boolean> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return false;
    }

    const whitelistKey = `ratelimit:whitelist:${key}`;
    const ttl = Math.ceil(expiryMs / 1000);
    await redisClient.setEx(whitelistKey, ttl, 'true');

    return true;
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    return false;
  }
}

/**
 * Check if key is whitelisted
 */
export async function isWhitelisted(key: string): Promise<boolean> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return false;
    }

    const whitelistKey = `ratelimit:whitelist:${key}`;
    const exists = await redisClient.exists(whitelistKey);

    return exists === 1;
  } catch (error) {
    console.error('Error checking whitelist:', error);
    return false;
  }
}

/**
 * Remove from whitelist
 */
export async function removeFromWhitelist(key: string): Promise<boolean> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return false;
    }

    const whitelistKey = `ratelimit:whitelist:${key}`;
    await redisClient.del(whitelistKey);

    return true;
  } catch (error) {
    console.error('Error removing from whitelist:', error);
    return false;
  }
}

/**
 * Get all whitelisted keys
 */
export async function getWhitelistKeys(): Promise<string[]> {
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return [];
    }

    const keys = await redisClient.keys('ratelimit:whitelist:*');
    return keys.map((key: string) => key.replace('ratelimit:whitelist:', ''));
  } catch (error) {
    console.error('Error getting whitelist keys:', error);
    return [];
  }
}

/**
 * Get rate limit config
 */
export function getConfigFor(limitType: string): RateLimitConfig | undefined {
  return RATE_LIMIT_CONFIGS[limitType];
}

/**
 * Get all rate limit configs
 */
export function getAllConfigs(): Record<string, RateLimitConfig> {
  return RATE_LIMIT_CONFIGS;
}

/**
 * Generate rate limit report
 */
export async function generateReport(): Promise<string> {
  const summary = await getDashboardSummary();
  const whitelist = await getWhitelistKeys();

  let report = `
╔════════════════════════════════════════════════════════════════════╗
║                  RATE LIMIT DASHBOARD REPORT                       ║
╚════════════════════════════════════════════════════════════════════╝

Timestamp: ${summary.timestamp}

──────────────────────────────────────────────────────────────────────
RATE LIMIT SUMMARY
──────────────────────────────────────────────────────────────────────
`;

  for (const [limitType, stats] of Object.entries(summary.summary)) {
    const limitConfig = Object.values(RATE_LIMIT_CONFIGS).find((c) => c.name === limitType);
    report += `
${limitType}
  Configuration: ${limitConfig?.description || 'Unknown'}
  Currently Limited: ${stats.limited}/${stats.total} clients
  Status: ${stats.limited > 0 ? '⚠️  CLIENTS LIMITED' : '✅ OK'}
`;
  }

  if (whitelist.length > 0) {
    report += `
──────────────────────────────────────────────────────────────────────
WHITELISTED KEYS (${whitelist.length})
──────────────────────────────────────────────────────────────────────
${whitelist.slice(0, 10).join('\n')}
${whitelist.length > 10 ? `... and ${whitelist.length - 10} more` : ''}
`;
  }

  report += `
──────────────────────────────────────────────────────────────────────
RATE LIMIT CONFIGURATIONS
──────────────────────────────────────────────────────────────────────
`;

  for (const [key, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    report += `
${config.name} (${key})
  Max Requests: ${config.max}
  Window: ${config.windowMs / 1000}s
  Description: ${config.description}
`;
  }

  report += `
╚════════════════════════════════════════════════════════════════════╝
`;

  return report;
}

export default {
  getStatusForKey,
  getStatusForKeys,
  resetKey,
  resetKeys,
  getKeysMatchingPattern,
  getRateLimitedClients,
  getStatsByType,
  getDashboardSummary,
  addToWhitelist,
  isWhitelisted,
  removeFromWhitelist,
  getWhitelistKeys,
  getConfigFor,
  getAllConfigs,
  generateReport,
};
