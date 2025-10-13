import { jest } from '@jest/globals';
import {
  scrapeTool,
  scrapeWithJsTool,
  scrapeWithProxyTool,
  handleScrape,
  handleScrapeWithJs,
  handleScrapeWithProxy,
} from '../tools/scraping.js';
import { ScrapedoClient, ScrapeResult } from '../scrapedo-client.js';

describe('Scraping Tools', () => {
  let mockClient: jest.Mocked<ScrapedoClient>;
  let mockResult: ScrapeResult;

  beforeEach(() => {
    mockResult = {
      success: true,
      statusCode: 200,
      url: 'https://example.com',
      html: '<html><body>Test content</body></html>',
      text: 'Test content',
    };

    mockClient = {
      scrape: jest.fn().mockResolvedValue(mockResult),
      getUsageStats: jest.fn(),
      calculateCredits: jest.fn(),
      generateProxyConfig: jest.fn(),
    } as any;
  });

  describe('scrapeTool definition', () => {
    it('should have correct name', () => {
      expect(scrapeTool.name).toBe('scrape');
    });

    it('should have correct description', () => {
      expect(scrapeTool.description).toContain('Basic web scraping');
    });

    it('should require url parameter', () => {
      expect(scrapeTool.inputSchema.required).toContain('url');
    });

    it('should have optional method parameter', () => {
      const props = scrapeTool.inputSchema.properties as any;
      expect(props.method).toBeDefined();
      expect(props.method.enum).toContain('GET');
      expect(props.method.enum).toContain('POST');
    });

    it('should have device parameter with correct values', () => {
      const props = scrapeTool.inputSchema.properties as any;
      expect(props.device.enum).toContain('desktop');
      expect(props.device.enum).toContain('mobile');
      expect(props.device.enum).toContain('tablet');
    });
  });

  describe('handleScrape', () => {
    it('should call client.scrape with parsed options', async () => {
      const args = { url: 'https://example.com' };

      await handleScrape(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(args);
    });

    it('should return formatted MCP response', async () => {
      const args = { url: 'https://example.com' };

      const result = await handleScrape(mockClient, args);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('success');
      expect(result.content[0].text).toContain('200');
    });

    it('should handle POST requests with body', async () => {
      const args = {
        url: 'https://example.com',
        method: 'POST',
        body: 'test data',
      };

      await handleScrape(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(args);
    });

    it('should handle device parameter', async () => {
      const args = {
        url: 'https://example.com',
        device: 'mobile',
      };

      await handleScrape(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({ device: 'mobile' })
      );
    });

    it('should throw error for invalid URL', async () => {
      const args = { url: 'not-a-valid-url' };

      await expect(handleScrape(mockClient, args)).rejects.toThrow();
    });
  });

  describe('scrapeWithJsTool definition', () => {
    it('should have correct name', () => {
      expect(scrapeWithJsTool.name).toBe('scrape_with_js');
    });

    it('should have description mentioning JavaScript rendering', () => {
      expect(scrapeWithJsTool.description).toContain('JavaScript');
      expect(scrapeWithJsTool.description).toContain('headless browser');
    });

    it('should have waitUntil parameter with correct options', () => {
      const props = scrapeWithJsTool.inputSchema.properties as any;
      const waitUntil = props.waitUntil;
      expect(waitUntil.enum).toContain('domcontentloaded');
      expect(waitUntil.enum).toContain('networkidle0');
      expect(waitUntil.enum).toContain('networkidle2');
      expect(waitUntil.enum).toContain('load');
    });

    it('should have viewport width and height parameters', () => {
      const props = scrapeWithJsTool.inputSchema.properties as any;
      expect(props.width).toBeDefined();
      expect(props.height).toBeDefined();
    });

    it('should have blockResources parameter', () => {
      const props = scrapeWithJsTool.inputSchema.properties as any;
      expect(props.blockResources).toBeDefined();
    });
  });

  describe('handleScrapeWithJs', () => {
    it('should enable JavaScript rendering', async () => {
      const args = { url: 'https://example.com' };

      await handleScrapeWithJs(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({ render: true })
      );
    });

    it('should pass waitSelector parameter', async () => {
      const args = {
        url: 'https://example.com',
        waitSelector: '.loaded',
      };

      await handleScrapeWithJs(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          render: true,
          waitSelector: '.loaded',
        })
      );
    });

    it('should pass viewport dimensions', async () => {
      const args = {
        url: 'https://example.com',
        width: 1280,
        height: 720,
      };

      await handleScrapeWithJs(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          render: true,
          width: 1280,
          height: 720,
        })
      );
    });

    it('should pass blockResources parameter', async () => {
      const args = {
        url: 'https://example.com',
        blockResources: true,
      };

      await handleScrapeWithJs(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          render: true,
          blockResources: true,
        })
      );
    });

    it('should return formatted MCP response', async () => {
      const args = { url: 'https://example.com' };

      const result = await handleScrapeWithJs(mockClient, args);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(JSON.parse(result.content[0].text)).toHaveProperty('success', true);
    });
  });

  describe('scrapeWithProxyTool definition', () => {
    it('should have correct name', () => {
      expect(scrapeWithProxyTool.name).toBe('scrape_with_proxy');
    });

    it('should have description mentioning proxy', () => {
      expect(scrapeWithProxyTool.description).toContain('proxy');
    });

    it('should have super parameter', () => {
      const props = scrapeWithProxyTool.inputSchema.properties as any;
      expect(props.super).toBeDefined();
    });

    it('should have geoCode parameter', () => {
      const props = scrapeWithProxyTool.inputSchema.properties as any;
      expect(props.geoCode).toBeDefined();
    });

    it('should have regionalGeoCode parameter with valid regions', () => {
      const props = scrapeWithProxyTool.inputSchema.properties as any;
      const regional = props.regionalGeoCode;
      expect(regional.enum).toContain('europe');
      expect(regional.enum).toContain('asia');
      expect(regional.enum).toContain('northamerica');
    });

    it('should have sessionId parameter', () => {
      const props = scrapeWithProxyTool.inputSchema.properties as any;
      expect(props.sessionId).toBeDefined();
    });
  });

  describe('handleScrapeWithProxy', () => {
    it('should enable proxy mode', async () => {
      const args = { url: 'https://example.com' };

      await handleScrapeWithProxy(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({ super: true }),
        true // useProxy flag
      );
    });

    it('should pass geoCode parameter', async () => {
      const args = {
        url: 'https://example.com',
        geoCode: 'us',
      };

      await handleScrapeWithProxy(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          super: true,
          geoCode: 'us',
        }),
        true
      );
    });

    it('should pass sessionId for sticky sessions', async () => {
      const args = {
        url: 'https://example.com',
        sessionId: 12345,
      };

      await handleScrapeWithProxy(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          super: true,
          sessionId: 12345,
        }),
        true
      );
    });

    it('should allow combining proxy with JavaScript rendering', async () => {
      const args = {
        url: 'https://example.com',
        render: true,
      };

      await handleScrapeWithProxy(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          super: true,
          render: true,
        }),
        true
      );
    });

    it('should return formatted MCP response', async () => {
      const args = { url: 'https://example.com' };

      const result = await handleScrapeWithProxy(mockClient, args);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(JSON.parse(result.content[0].text)).toHaveProperty('success', true);
    });
  });
});
