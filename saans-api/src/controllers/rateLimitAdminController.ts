// @ts-nocheck

import { Request, Response } from 'express';
import rateLimitManager from '../utils/rateLimitManager.js';

/**
 * Admin Controller for Rate Limit Management
 * These endpoints should be protected by admin authentication
 */

class RateLimitAdminController {
  /**
   * GET /admin/rate-limits/dashboard
   * Get rate limit dashboard summary
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const summary = await rateLimitManager.getDashboardSummary();

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error getting rate limit dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard',
      });
    }
  }

  /**
   * GET /admin/rate-limits/report
   * Get detailed rate limit report
   */
  async getReport(req: Request, res: Response): Promise<void> {
    try {
      const report = await rateLimitManager.generateReport();

      res.status(200).type('text/plain').send(report);
    } catch (error) {
      console.error('Error generating rate limit report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate report',
      });
    }
  }

  /**
   * GET /admin/rate-limits/configs
   * Get all rate limit configurations
   */
  async getConfigs(req: Request, res: Response): Promise<void> {
    try {
      const configs = rateLimitManager.getAllConfigs();

      res.status(200).json({
        success: true,
        data: configs,
      });
    } catch (error) {
      console.error('Error getting rate limit configs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get configurations',
      });
    }
  }

  /**
   * GET /admin/rate-limits/limited-clients
   * Get all currently rate-limited clients
   */
  async getLimitedClients(req: Request, res: Response): Promise<void> {
    try {
      const clients = await rateLimitManager.getRateLimitedClients();

      res.status(200).json({
        success: true,
        count: clients.length,
        data: clients,
      });
    } catch (error) {
      console.error('Error getting limited clients:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get limited clients',
      });
    }
  }

  /**
   * GET /admin/rate-limits/status/:key
   * Get status for a specific rate limit key
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { type = 'standard', limit } = req.query;

      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Key parameter required',
        });
        return;
      }

      const limitValue = limit ? parseInt(limit as string, 10) : 100;
      const status = await rateLimitManager.getStatusForKey(
        key,
        type as string,
        limitValue
      );

      if (!status) {
        res.status(404).json({
          success: false,
          error: 'Rate limit status not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get status',
      });
    }
  }

  /**
   * GET /admin/rate-limits/search
   * Search for rate limit keys matching a pattern
   */
  async searchKeys(req: Request, res: Response): Promise<void> {
    try {
      const { pattern, type = 'standard' } = req.query;

      if (!pattern) {
        res.status(400).json({
          success: false,
          error: 'Pattern query parameter required',
        });
        return;
      }

      const keys = await rateLimitManager.getKeysMatchingPattern(
        pattern as string,
        type as string
      );

      res.status(200).json({
        success: true,
        count: keys.length,
        data: keys,
      });
    } catch (error) {
      console.error('Error searching rate limit keys:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search keys',
      });
    }
  }

  /**
   * POST /admin/rate-limits/:key/reset
   * Reset rate limit for a specific key
   */
  async resetKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { type = 'standard' } = req.query;

      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Key parameter required',
        });
        return;
      }

      const success = await rateLimitManager.resetKey(key, type as string);

      if (!success) {
        res.status(500).json({
          success: false,
          error: 'Failed to reset rate limit',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Rate limit for key '${key}' has been reset`,
        key,
      });
    } catch (error) {
      console.error('Error resetting rate limit:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset rate limit',
      });
    }
  }

  /**
   * POST /admin/rate-limits/reset-many
   * Reset rate limits for multiple keys
   */
  async resetMany(req: Request, res: Response): Promise<void> {
    try {
      const { keys } = req.body;
      const { type = 'standard' } = req.query;

      if (!Array.isArray(keys) || keys.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Keys array required in request body',
        });
        return;
      }

      const count = await rateLimitManager.resetKeys(keys, type as string);

      res.status(200).json({
        success: true,
        message: `Reset ${count} rate limits`,
        resetCount: count,
        totalRequested: keys.length,
      });
    } catch (error) {
      console.error('Error resetting multiple rate limits:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset rate limits',
      });
    }
  }

  /**
   * POST /admin/rate-limits/:key/whitelist
   * Add key to whitelist
   */
  async whitelistKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { expiryHours = 1 } = req.body;

      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Key parameter required',
        });
        return;
      }

      const expiryMs = expiryHours * 60 * 60 * 1000;
      const success = await rateLimitManager.addToWhitelist(key, expiryMs);

      if (!success) {
        res.status(500).json({
          success: false,
          error: 'Failed to whitelist key',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Key '${key}' whitelisted for ${expiryHours} hour(s)`,
        key,
        expiryHours,
      });
    } catch (error) {
      console.error('Error whitelisting key:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to whitelist key',
      });
    }
  }

  /**
   * DELETE /admin/rate-limits/:key/whitelist
   * Remove key from whitelist
   */
  async removeFromWhitelist(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;

      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Key parameter required',
        });
        return;
      }

      const success = await rateLimitManager.removeFromWhitelist(key);

      if (!success) {
        res.status(500).json({
          success: false,
          error: 'Failed to remove from whitelist',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Key '${key}' removed from whitelist`,
        key,
      });
    } catch (error) {
      console.error('Error removing from whitelist:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove from whitelist',
      });
    }
  }

  /**
   * GET /admin/rate-limits/whitelist
   * Get all whitelisted keys
   */
  async getWhitelist(req: Request, res: Response): Promise<void> {
    try {
      const keys = await rateLimitManager.getWhitelistKeys();

      res.status(200).json({
        success: true,
        count: keys.length,
        data: keys,
      });
    } catch (error) {
      console.error('Error getting whitelist:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get whitelist',
      });
    }
  }

  /**
   * GET /admin/rate-limits/stats
   * Get statistics by type
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { type = 'standard' } = req.query;

      const stats = await rateLimitManager.getStatsByType(type as string);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting rate limit stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get statistics',
      });
    }
  }
}

export default new RateLimitAdminController();
