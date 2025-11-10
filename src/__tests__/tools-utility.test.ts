import { jest } from '@jest/globals';
import {
  getUsageStatsTool,
  handleGetUsageStats,
} from '../tools/utility.js';
import { ScrapedoClient, UsageStats } from '../scrapedo-client.js';

describe('Utility Tools', () => {
  let mockClient: jest.Mocked<ScrapedoClient>;

  beforeEach(() => {
    mockClient = {
      scrape: jest.fn(),
      getUsageStats: jest.fn(),
      calculateCredits: jest.fn(),
    } as any;
  });

  describe('getUsageStatsTool definition', () => {
    it('should have correct name', () => {
      expect(getUsageStatsTool.name).toBe('get_usage_stats');
    });

    it('should have description mentioning usage and credits', () => {
      expect(getUsageStatsTool.description).toContain('usage');
      expect(getUsageStatsTool.description).toContain('credits');
    });

    it('should have empty properties (no required params)', () => {
      expect(Object.keys(getUsageStatsTool.inputSchema.properties || {})).toHaveLength(0);
    });
  });

  describe('handleGetUsageStats', () => {
    it('should call client.getUsageStats', async () => {
      const mockStats: UsageStats = {
        remainingCredits: 1000,
        usedCredits: 500,
        concurrencyLimit: 10,
        requestsToday: 50,
      };
      mockClient.getUsageStats.mockResolvedValue(mockStats);

      await handleGetUsageStats(mockClient, {});

      expect(mockClient.getUsageStats).toHaveBeenCalled();
    });

    it('should return formatted statistics', async () => {
      const mockStats: UsageStats = {
        remainingCredits: 1000,
        usedCredits: 500,
        concurrencyLimit: 10,
        requestsToday: 50,
      };
      mockClient.getUsageStats.mockResolvedValue(mockStats);

      const result = await handleGetUsageStats(mockClient, {});

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const parsedStats = JSON.parse(result.content[0].text);
      expect(parsedStats.remainingCredits).toBe(1000);
      expect(parsedStats.usedCredits).toBe(500);
      expect(parsedStats.concurrencyLimit).toBe(10);
      expect(parsedStats.requestsToday).toBe(50);
    });

    it('should return MCP content format', async () => {
      const mockStats: UsageStats = {
        remainingCredits: 100,
        usedCredits: 50,
        concurrencyLimit: 5,
        requestsToday: 10,
      };
      mockClient.getUsageStats.mockResolvedValue(mockStats);

      const result = await handleGetUsageStats(mockClient, {});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should propagate errors from client', async () => {
      mockClient.getUsageStats.mockRejectedValue(new Error('API Error'));

      await expect(handleGetUsageStats(mockClient, {})).rejects.toThrow('API Error');
    });
  });

});
