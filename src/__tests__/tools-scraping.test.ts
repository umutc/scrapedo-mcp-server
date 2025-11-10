import { jest } from '@jest/globals';
import {
  scrapeTool,
  scrapeWithJsTool,
  handleScrape,
  handleScrapeWithJs,
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

    it('should expose proxy configuration options', () => {
      const props = scrapeTool.inputSchema.properties as any;
      expect(props.super).toBeDefined();
      expect(props.geoCode).toBeDefined();
      expect(props.regionalGeoCode.enum).toContain('europe');
      expect(props.sessionId).toBeDefined();
    });

    it('should expose advanced header and callback flags', () => {
      const props = scrapeTool.inputSchema.properties as any;
      expect(props.customHeaders).toBeDefined();
      expect(props.extraHeaders).toBeDefined();
      expect(props.setCookies).toBeDefined();
      expect(props.callback).toBeDefined();
      expect(props.screenShot).toBeDefined();
      expect(props.playWithBrowser).toBeDefined();
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

    it('should enforce screenshot prerequisites and defaults', async () => {
      const args = {
        url: 'https://example.com',
        screenShot: true,
      };

      await handleScrape(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          screenShot: true,
          render: true,
          returnJSON: true,
          blockResources: false,
        })
      );
    });

    it('should reject multiple screenshot flags', async () => {
      const args = {
        url: 'https://example.com',
        screenShot: true,
        fullScreenShot: true,
      };

      await expect(handleScrape(mockClient, args)).rejects.toThrow(
        'Only one of screenShot'
      );
    });

    it('should reject playWithBrowser combined with screenshot', async () => {
      const args = {
        url: 'https://example.com',
        screenShot: true,
        playWithBrowser: '[{"click":"button"}]',
      };

      await expect(handleScrape(mockClient, args)).rejects.toThrow(
        'playWithBrowser actions cannot be combined'
      );
    });

    it('should append callback note in response', async () => {
      const args = {
        url: 'https://example.com',
        callback: 'https://webhook.test',
      };

      const result = await handleScrape(mockClient, args);

      expect(result.content[1].text).toContain('Callback registered');
      expect(result.content[1].text).toContain('https://webhook.test');
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

    it('should expose playWithBrowser parameter', () => {
      const props = scrapeWithJsTool.inputSchema.properties as any;
      expect(props.playWithBrowser).toBeDefined();
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

    it('should include proxy parameters in schema', () => {
      const props = scrapeWithJsTool.inputSchema.properties as any;
      expect(props.super).toBeDefined();
      expect(props.geoCode).toBeDefined();
      expect(props.sessionId).toBeDefined();
    });
  });

  describe('Proxy options via scrape', () => {
    it('should enable residential mode when super flag passed', async () => {
      const args = { url: 'https://example.com', super: true };

      await handleScrape(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({ super: true })
      );
    });

    it('should forward geoCode and sessionId settings', async () => {
      const args = {
        url: 'https://example.com',
        super: true,
        geoCode: 'us',
        sessionId: 42,
      };

      await handleScrape(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          super: true,
          geoCode: 'us',
          sessionId: 42,
        })
      );
    });

    it('should allow proxy + render mode through scrape_with_js', async () => {
      const args = {
        url: 'https://example.com',
        super: true,
      };

      await handleScrapeWithJs(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          super: true,
          render: true,
        })
      );
    });
  });
});
