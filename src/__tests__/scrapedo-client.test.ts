import { jest } from '@jest/globals';

// Create mock functions before importing
const mockAxios = jest.fn();
const mockAxiosGet = jest.fn();
const mockIsAxiosError = jest.fn();

// Mock axios module using unstable_mockModule
jest.unstable_mockModule('axios', () => ({
  default: Object.assign(mockAxios, {
    get: mockAxiosGet,
    isAxiosError: mockIsAxiosError,
  }),
}));

// Import after mocking
const { ScrapedoClient, ScrapedoError, ScrapeOptionsSchema } = await import('../scrapedo-client.js');

describe('ScrapedoClient', () => {
  let client: ScrapedoClient;
  const mockApiKey = 'test-api-key-1234567890';

  beforeEach(() => {
    client = new ScrapedoClient(mockApiKey);

    // Clear all mocks
    mockAxios.mockClear();
    mockAxiosGet.mockClear();
    mockIsAxiosError.mockClear();

    // Setup default return value for isAxiosError
    mockIsAxiosError.mockReturnValue(false);
  });

  describe('constructor', () => {
    it('should create a client with the provided API key', () => {
      expect(client).toBeInstanceOf(ScrapedoClient);
    });
  });

  describe('scrape', () => {
    it('should successfully scrape a basic URL', async () => {
      const mockResponse = {
        status: 200,
        data: '<html><body>Test content</body></html>',
        headers: { 'content-type': 'text/html' },
      };

      mockAxios.mockResolvedValue(mockResponse);

      const result = await client.scrape({ url: 'https://example.com' });

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.html).toContain('Test content');
      expect(result.text).toContain('Test content');
    });

    it('should handle JavaScript rendering', async () => {
      const mockResponse = {
        status: 200,
        data: '<html><body>JS rendered content</body></html>',
        headers: {},
      };

      mockAxios.mockResolvedValue(mockResponse);

      const result = await client.scrape({
        url: 'https://example.com',
        render: true,
      });

      expect(result.success).toBe(true);
      expect(result.html).toContain('JS rendered content');
    });

    it('should handle markdown output', async () => {
      const mockResponse = {
        status: 200,
        data: '# Heading\n\nParagraph text',
        headers: {},
      };

      mockAxios.mockResolvedValue(mockResponse);

      const result = await client.scrape({
        url: 'https://example.com',
        output: 'markdown',
      });

      expect(result.success).toBe(true);
      expect(result.markdown).toContain('# Heading');
      expect(result.html).toBeUndefined();
    });

    it('should handle transparentResponse option', async () => {
      const mockResponse = {
        status: 200,
        data: '<html>Raw HTML</html>',
        headers: {},
      };

      mockAxios.mockResolvedValue(mockResponse);

      const result = await client.scrape({
        url: 'https://example.com',
        transparentResponse: true,
      });

      expect(result.success).toBe(true);
      expect(result.html).toBe('<html>Raw HTML</html>');
      expect(result.text).toBeUndefined();
    });

    it('should handle returnJSON option', async () => {
      const mockResponse = {
        status: 200,
        data: {
          screenshot: 'base64data',
          frames: [{ url: 'frame1' }],
          websockets: [{ url: 'ws://test' }],
        },
        headers: {},
      };

      mockAxios.mockResolvedValue(mockResponse);

      const result = await client.scrape({
        url: 'https://example.com',
        returnJSON: true,
      });

      expect(result.success).toBe(true);
      expect(result.networkData).toBeDefined();
      expect(result.screenshot).toBe('base64data');
      expect(result.frames).toHaveLength(1);
      expect(result.websockets).toHaveLength(1);
    });

    it('should handle cookies with pureCookies option', async () => {
      const mockResponse = {
        status: 200,
        data: '<html>Test</html>',
        headers: {
          'set-cookie': ['cookie1=value1', 'cookie2=value2'],
        },
      };

      mockAxios.mockResolvedValue(mockResponse);

      const result = await client.scrape({
        url: 'https://example.com',
        pureCookies: true,
      });

      expect(result.success).toBe(true);
      expect(result.cookies).toHaveLength(2);
      expect(result.cookies).toContain('cookie1=value1');
    });

    it('should use proxy mode when useProxy is true', async () => {
      const mockResponse = {
        status: 200,
        data: '<html>Proxied content</html>',
        headers: {},
      };

      mockAxios.mockResolvedValue(mockResponse);

      const result = await client.scrape(
        {
          url: 'https://example.com',
          super: true,
        },
        true
      );

      expect(result.success).toBe(true);
      expect(mockAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          proxy: expect.objectContaining({
            host: 'proxy.scrape.do',
            port: 8080,
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle 429 rate limit errors', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 429,
          headers: { 'retry-after': '60' },
        },
      };

      mockAxios.mockRejectedValue(mockError);
      mockIsAxiosError.mockReturnValue(true);

      try {
        await client.scrape({ url: 'https://example.com' });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as ScrapedoError).statusCode).toBe(429);
        expect((error as ScrapedoError).errorType).toBe('rate_limit');
        expect((error as ScrapedoError).retryable).toBe(true);
      }
    });

    it('should handle 401 authentication errors', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 401,
        },
      };

      mockAxios.mockRejectedValue(mockError);
      mockIsAxiosError.mockReturnValue(true);

      try {
        await client.scrape({ url: 'https://example.com' });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as ScrapedoError).statusCode).toBe(401);
        expect((error as ScrapedoError).errorType).toBe('auth');
        expect((error as ScrapedoError).retryable).toBe(false);
      }
    });

    it('should handle 404 target errors', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 404,
        },
      };

      mockAxios.mockRejectedValue(mockError);
      mockIsAxiosError.mockReturnValue(true);

      try {
        await client.scrape({ url: 'https://example.com' });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as ScrapedoError).statusCode).toBe(404);
        expect((error as ScrapedoError).errorType).toBe('target_error');
        expect((error as ScrapedoError).consumedCredits).toBe(true);
      }
    });

    it('should handle timeout errors', async () => {
      const mockError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
      };

      mockAxios.mockRejectedValue(mockError);
      mockIsAxiosError.mockReturnValue(true);

      try {
        await client.scrape({ url: 'https://example.com' });
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as ScrapedoError).errorType).toBe('timeout');
        expect((error as ScrapedoError).retryable).toBe(true);
      }
    });
  });

  describe('getUsageStats', () => {
    it('should fetch usage statistics successfully', async () => {
      const mockResponse = {
        status: 200,
        data: {
          remaining_credits: 1000,
          used_credits: 500,
          concurrency_limit: 10,
          requests_today: 50,
        },
      };

      mockAxiosGet.mockResolvedValue(mockResponse);

      const stats = await client.getUsageStats();

      expect(stats.remainingCredits).toBe(1000);
      expect(stats.usedCredits).toBe(500);
      expect(stats.concurrencyLimit).toBe(10);
      expect(stats.requestsToday).toBe(50);
    });

    it('should handle errors when fetching usage stats', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          status: 401,
        },
      };

      mockAxiosGet.mockRejectedValue(mockError);
      mockIsAxiosError.mockReturnValue(true);

      await expect(client.getUsageStats()).rejects.toThrow(ScrapedoError);
    });
  });

  describe('calculateCredits', () => {
    it('should calculate 1 credit for basic scraping', () => {
      const credits = client.calculateCredits({ url: 'https://example.com' });
      expect(credits).toBe(1);
    });

    it('should calculate 5 credits for JavaScript rendering', () => {
      const credits = client.calculateCredits({
        url: 'https://example.com',
        render: true,
      });
      expect(credits).toBe(5);
    });

    it('should calculate 10 credits for proxy usage', () => {
      const credits = client.calculateCredits({
        url: 'https://example.com',
        super: true,
      });
      expect(credits).toBe(10);
    });

    it('should calculate 25 credits for both JS rendering and proxy', () => {
      const credits = client.calculateCredits({
        url: 'https://example.com',
        render: true,
        super: true,
      });
      expect(credits).toBe(25);
    });

    it('should calculate at least 10 credits for Google URLs', () => {
      const credits = client.calculateCredits({
        url: 'https://www.google.com/search?q=test',
      });
      expect(credits).toBe(10);
    });

    it('should calculate at least 30 credits for LinkedIn URLs', () => {
      const credits = client.calculateCredits({
        url: 'https://www.linkedin.com/in/someone',
      });
      expect(credits).toBe(30);
    });

    it('should calculate 30 credits for LinkedIn with render and proxy', () => {
      const credits = client.calculateCredits({
        url: 'https://www.linkedin.com/in/someone',
        render: true,
        super: true,
      });
      expect(credits).toBe(30); // LinkedIn minimum is 30, which is higher than 25
    });
  });

  describe('generateProxyConfig', () => {
    it('should generate proxy config without parameters', () => {
      const proxyUrl = client.generateProxyConfig({});
      expect(proxyUrl).toContain('proxy.scrape.do:8080');
      expect(proxyUrl).toContain(mockApiKey);
    });

    it('should generate proxy config with render parameter', () => {
      const proxyUrl = client.generateProxyConfig({ render: true });
      expect(proxyUrl).toContain('render=true');
    });

    it('should generate proxy config with multiple parameters', () => {
      const proxyUrl = client.generateProxyConfig({
        render: true,
        geoCode: 'us',
        device: 'mobile',
      });
      expect(proxyUrl).toContain('render=true');
      expect(proxyUrl).toContain('geoCode=us');
      expect(proxyUrl).toContain('device=mobile');
    });

    it('should handle playWithBrowser object parameter', () => {
      const proxyUrl = client.generateProxyConfig({
        playWithBrowser: [{ action: 'click', selector: '#button' }],
      });
      expect(proxyUrl).toContain('playWithBrowser');
      expect(proxyUrl).toContain('click');
    });
  });

  describe('ScrapeOptionsSchema validation', () => {
    it('should accept valid URL', () => {
      expect(() =>
        ScrapeOptionsSchema.parse({ url: 'https://example.com' })
      ).not.toThrow();
    });

    it('should reject invalid URL', () => {
      expect(() => ScrapeOptionsSchema.parse({ url: 'not-a-url' })).toThrow();
    });

    it('should accept valid HTTP methods', () => {
      expect(() =>
        ScrapeOptionsSchema.parse({ url: 'https://example.com', method: 'POST' })
      ).not.toThrow();
    });

    it('should reject invalid HTTP method', () => {
      expect(() =>
        ScrapeOptionsSchema.parse({ url: 'https://example.com', method: 'INVALID' })
      ).toThrow();
    });

    it('should accept valid device types', () => {
      expect(() =>
        ScrapeOptionsSchema.parse({ url: 'https://example.com', device: 'mobile' })
      ).not.toThrow();
    });

    it('should validate sessionId range', () => {
      expect(() =>
        ScrapeOptionsSchema.parse({ url: 'https://example.com', sessionId: 500000 })
      ).not.toThrow();

      expect(() =>
        ScrapeOptionsSchema.parse({ url: 'https://example.com', sessionId: -1 })
      ).toThrow();

      expect(() =>
        ScrapeOptionsSchema.parse({ url: 'https://example.com', sessionId: 1000001 })
      ).toThrow();
    });

    it('should validate timeout range', () => {
      expect(() =>
        ScrapeOptionsSchema.parse({ url: 'https://example.com', timeout: 30000 })
      ).not.toThrow();

      expect(() =>
        ScrapeOptionsSchema.parse({ url: 'https://example.com', timeout: 4999 })
      ).toThrow();

      expect(() =>
        ScrapeOptionsSchema.parse({ url: 'https://example.com', timeout: 120001 })
      ).toThrow();
    });
  });
});
