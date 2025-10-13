import { jest } from '@jest/globals';
import {
  getUsageStatsTool,
  generateProxyConfigTool,
  handleGetUsageStats,
  handleGenerateProxyConfig,
} from '../tools/utility.js';
import { ScrapedoClient, UsageStats } from '../scrapedo-client.js';

describe('Utility Tools', () => {
  let mockClient: jest.Mocked<ScrapedoClient>;

  beforeEach(() => {
    mockClient = {
      scrape: jest.fn(),
      getUsageStats: jest.fn(),
      calculateCredits: jest.fn(),
      generateProxyConfig: jest.fn(),
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

  describe('generateProxyConfigTool definition', () => {
    it('should have correct name', () => {
      expect(generateProxyConfigTool.name).toBe('generate_proxy_config');
    });

    it('should have description mentioning proxy URL', () => {
      expect(generateProxyConfigTool.description).toContain('Proxy');
    });

    it('should have render parameter', () => {
      const props = generateProxyConfigTool.inputSchema.properties as any;
      expect(props.render).toBeDefined();
      expect(props.render.type).toBe('boolean');
    });

    it('should have super parameter', () => {
      const props = generateProxyConfigTool.inputSchema.properties as any;
      expect(props.super).toBeDefined();
    });

    it('should have geoCode parameter', () => {
      const props = generateProxyConfigTool.inputSchema.properties as any;
      expect(props.geoCode).toBeDefined();
    });

    it('should have sessionId parameter', () => {
      const props = generateProxyConfigTool.inputSchema.properties as any;
      expect(props.sessionId).toBeDefined();
    });

    it('should have waitUntil parameter with correct values', () => {
      const props = generateProxyConfigTool.inputSchema.properties as any;
      const waitUntil = props.waitUntil;
      expect(waitUntil.enum).toContain('domcontentloaded');
      expect(waitUntil.enum).toContain('networkidle0');
    });

    it('should have device parameter with correct values', () => {
      const props = generateProxyConfigTool.inputSchema.properties as any;
      const device = props.device;
      expect(device.enum).toContain('desktop');
      expect(device.enum).toContain('mobile');
      expect(device.enum).toContain('tablet');
    });
  });

  describe('handleGenerateProxyConfig', () => {
    it('should call client.generateProxyConfig with args', async () => {
      const args = { render: true, geoCode: 'us' };
      mockClient.generateProxyConfig.mockReturnValue(
        'http://apikey:render=true&geoCode=us@proxy.scrape.do:8080'
      );

      await handleGenerateProxyConfig(mockClient, args);

      expect(mockClient.generateProxyConfig).toHaveBeenCalledWith(args);
    });

    it('should return proxy URL in MCP format', async () => {
      const args = { render: true };
      const expectedUrl = 'http://apikey:render=true@proxy.scrape.do:8080';
      mockClient.generateProxyConfig.mockReturnValue(expectedUrl);

      const result = await handleGenerateProxyConfig(mockClient, args);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.proxyUrl).toBe(expectedUrl);
    });

    it('should handle empty args', async () => {
      const expectedUrl = 'http://apikey@proxy.scrape.do:8080';
      mockClient.generateProxyConfig.mockReturnValue(expectedUrl);

      const result = await handleGenerateProxyConfig(mockClient, {});

      expect(mockClient.generateProxyConfig).toHaveBeenCalledWith({});
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.proxyUrl).toBe(expectedUrl);
    });

    it('should handle multiple parameters', async () => {
      const args = {
        render: true,
        super: true,
        geoCode: 'uk',
        sessionId: 12345,
        device: 'mobile',
      };
      const expectedUrl = 'http://apikey:params@proxy.scrape.do:8080';
      mockClient.generateProxyConfig.mockReturnValue(expectedUrl);

      await handleGenerateProxyConfig(mockClient, args);

      expect(mockClient.generateProxyConfig).toHaveBeenCalledWith(args);
    });

    it('should return proper JSON structure', async () => {
      const expectedUrl = 'http://test@proxy.scrape.do:8080';
      mockClient.generateProxyConfig.mockReturnValue(expectedUrl);

      const result = await handleGenerateProxyConfig(mockClient, {});

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed).toHaveProperty('proxyUrl');
      expect(typeof parsed.proxyUrl).toBe('string');
    });
  });
});
