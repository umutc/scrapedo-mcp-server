import { jest } from '@jest/globals';
import {
  takeScreenshotTool,
  handleTakeScreenshot,
} from '../tools/screenshot.js';
import { ScrapedoClient, ScrapeResult } from '../scrapedo-client.js';

describe('Screenshot Tool', () => {
  let mockClient: jest.Mocked<ScrapedoClient>;
  let mockResult: ScrapeResult;

  beforeEach(() => {
    mockResult = {
      success: true,
      statusCode: 200,
      url: 'https://example.com',
      screenshot: 'base64-encoded-image-data',
      networkData: {
        screenshot: 'base64-encoded-image-data',
      },
    };

    mockClient = {
      scrape: jest.fn().mockResolvedValue(mockResult),
      getUsageStats: jest.fn(),
      calculateCredits: jest.fn(),
    } as any;
  });

  describe('takeScreenshotTool definition', () => {
    it('should have correct name', () => {
      expect(takeScreenshotTool.name).toBe('take_screenshot');
    });

    it('should have description mentioning screenshots', () => {
      expect(takeScreenshotTool.description).toContain('screenshot');
    });

    it('should require url parameter', () => {
      expect(takeScreenshotTool.inputSchema.required).toContain('url');
    });

    it('should have fullPage parameter', () => {
      const props = takeScreenshotTool.inputSchema.properties as any;
      expect(props.fullPage).toBeDefined();
      expect(props.fullPage.type).toBe('boolean');
    });

    it('should have selector parameter', () => {
      const props = takeScreenshotTool.inputSchema.properties as any;
      expect(props.selector).toBeDefined();
      expect(props.selector.description).toContain('CSS selector');
    });

    it('should have width and height parameters', () => {
      const props = takeScreenshotTool.inputSchema.properties as any;
      expect(props.width).toBeDefined();
      expect(props.height).toBeDefined();
    });

    it('should have device parameter with correct values', () => {
      const props = takeScreenshotTool.inputSchema.properties as any;
      const device = props.device;
      expect(device.enum).toContain('desktop');
      expect(device.enum).toContain('mobile');
      expect(device.enum).toContain('tablet');
    });

    it('should expose proxy, header, and callback controls', () => {
      const props = takeScreenshotTool.inputSchema.properties as any;
      expect(props.super).toBeDefined();
      expect(props.geoCode).toBeDefined();
      expect(props.customHeaders).toBeDefined();
      expect(props.setCookies).toBeDefined();
      expect(props.callback).toBeDefined();
    });
  });

  describe('handleTakeScreenshot', () => {
    it('should enable render and returnJSON for screenshots', async () => {
      const args = { url: 'https://example.com' };

      await handleTakeScreenshot(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          render: true,
          returnJSON: true,
        })
      );
    });

    it('should capture regular screenshot by default', async () => {
      const args = { url: 'https://example.com' };

      await handleTakeScreenshot(mockClient, args);

      const callArgs = mockClient.scrape.mock.calls[0][0];
      expect(callArgs.screenShot).toBe(true);
      expect(callArgs.render).toBe(true);
      expect(callArgs.returnJSON).toBe(true);
    });

    it('should capture full page screenshot when fullPage is true', async () => {
      const args = {
        url: 'https://example.com',
        fullPage: true,
      };

      await handleTakeScreenshot(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          screenShot: false,
          fullScreenShot: true,
        })
      );
    });

    it('should capture specific element when selector is provided', async () => {
      const args = {
        url: 'https://example.com',
        selector: '.main-content',
      };

      await handleTakeScreenshot(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          screenShot: false,
          particularScreenShot: '.main-content',
        })
      );
    });

    it('should not block resources for screenshots', async () => {
      const args = { url: 'https://example.com' };

      await handleTakeScreenshot(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          blockResources: false,
        })
      );
    });

    it('should pass viewport dimensions', async () => {
      const args = {
        url: 'https://example.com',
        width: 1280,
        height: 720,
      };

      await handleTakeScreenshot(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 1280,
          height: 720,
        })
      );
    });

    it('should pass device type', async () => {
      const args = {
        url: 'https://example.com',
        device: 'mobile',
      };

      await handleTakeScreenshot(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          device: 'mobile',
        })
      );
    });

    it('should return screenshot data in MCP format', async () => {
      const args = { url: 'https://example.com' };

      const result = await handleTakeScreenshot(mockClient, args);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.success).toBe(true);
      expect(parsed.screenshot).toBe('base64-encoded-image-data');
    });

    it('should include networkData in response', async () => {
      const args = { url: 'https://example.com' };

      const result = await handleTakeScreenshot(mockClient, args);

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.networkData).toBeDefined();
    });

    it('should throw error for invalid URL', async () => {
      const args = { url: 'not-a-valid-url' };

      await expect(handleTakeScreenshot(mockClient, args)).rejects.toThrow();
    });

    it('should handle mobile device screenshots', async () => {
      const args = {
        url: 'https://example.com',
        device: 'mobile',
        width: 375,
        height: 667,
      };

      await handleTakeScreenshot(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          device: 'mobile',
          width: 375,
          height: 667,
          render: true,
          returnJSON: true,
        })
      );
    });

    it('should handle tablet device screenshots', async () => {
      const args = {
        url: 'https://example.com',
        device: 'tablet',
        width: 768,
        height: 1024,
      };

      await handleTakeScreenshot(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          device: 'tablet',
          width: 768,
          height: 1024,
        })
      );
    });

    it('should reject when both fullPage and selector provided', async () => {
      const args = {
        url: 'https://example.com',
        fullPage: true,
        selector: '.header',
      };

      await expect(handleTakeScreenshot(mockClient, args)).rejects.toThrow(
        'either fullPage or selector'
      );
    });

    it('should include callback note when callback present', async () => {
      const args = { url: 'https://example.com', callback: 'https://hook.test' };

      const result = await handleTakeScreenshot(mockClient, args);

      expect(result.content).toHaveLength(2);
      expect(result.content[1].text).toContain('Callback registered');
      expect(result.content[1].text).toContain('https://hook.test');
    });
  });
});
