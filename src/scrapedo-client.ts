import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { z } from 'zod';
import { logger } from './logger.js';

const API_URL = 'https://api.scrape.do';
const PROXY_URL = 'proxy.scrape.do';
const PROXY_PORT = 8080;
const STATS_URL = 'https://api.scrape.do/info';

export const ScrapeOptionsSchema = z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'HEAD']).optional(),
  body: z.string().optional(),
  render: z.boolean().optional(),
  super: z.boolean().optional(),
  geoCode: z.string().optional(),
  regionalGeoCode: z.string().optional(),
  sessionId: z.number().min(0).max(1000000).optional(),
  customHeaders: z.boolean().optional(),
  extraHeaders: z.boolean().optional(),
  forwardHeaders: z.boolean().optional(),
  setCookies: z.string().optional(),
  pureCookies: z.boolean().optional(),
  device: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  waitUntil: z.enum(['domcontentloaded', 'networkidle0', 'networkidle2', 'load']).optional(),
  customWait: z.number().optional(),
  waitSelector: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  blockResources: z.boolean().optional(),
  blockAds: z.boolean().optional(),
  screenShot: z.boolean().optional(),
  fullScreenShot: z.boolean().optional(),
  particularScreenShot: z.string().optional(),
  disableRedirection: z.boolean().optional(),
  callback: z.string().optional(),
  timeout: z.number().min(5000).max(120000).optional(),
  retryTimeout: z.number().min(5000).max(55000).optional(),
  disableRetry: z.boolean().optional(),
  output: z.enum(['raw', 'markdown']).optional(),
  transparentResponse: z.boolean().optional(),
  returnJSON: z.boolean().optional(),
  showFrames: z.boolean().optional(),
  showWebsocketRequests: z.boolean().optional(),
  playWithBrowser: z.union([z.string(), z.array(z.any())]).optional(),
});

export type ScrapeOptions = z.infer<typeof ScrapeOptionsSchema>;

export interface ScrapeResult {
  success: boolean;
  statusCode: number;
  url: string;
  finalUrl?: string;
  html?: string;
  text?: string;
  markdown?: string;
  screenshot?: string;
  headers?: Record<string, string>;
  cookies?: string[];
  error?: string;
  networkData?: any;
  frames?: any[];
  websockets?: any[];
  metadata?: {
    executionTime?: number;
    creditsUsed?: number;
    proxyUsed?: {
      type: string;
      location?: string;
    };
  };
}

export interface UsageStats {
  remainingCredits: number;
  usedCredits: number;
  concurrencyLimit: number;
  requestsToday: number;
}

export class ScrapedoError extends Error {
  constructor(
    public statusCode: number,
    public errorType: 'rate_limit' | 'auth' | 'timeout' | 'client_canceled' | 'target_error' | 'unknown',
    public consumedCredits: boolean,
    public retryable: boolean,
    public details?: any
  ) {
    super(`Scrapedo error ${statusCode}: ${errorType}`);
  }
}

export class ScrapedoClient {
  constructor(private apiKey: string) {}

  private buildApiUrl(params: ScrapeOptions): string {
    const queryParams = new URLSearchParams();
    queryParams.append('token', this.apiKey);
    queryParams.append('url', params.url);
    
    // Only add Scrapedo-specific parameters, not generic ones like 'method'
    const scrapedoParams = ['render', 'super', 'geoCode', 'regionalGeoCode', 'sessionId', 
      'customHeaders', 'extraHeaders', 'forwardHeaders', 'setCookies', 'pureCookies',
      'device', 'waitUntil', 'customWait', 'waitSelector', 'width', 'height',
      'blockResources', 'blockAds', 'screenShot', 'fullScreenShot', 'particularScreenShot',
      'disableRedirection', 'callback', 'timeout', 'retryTimeout', 'disableRetry',
      'output', 'transparentResponse', 'returnJSON', 'showFrames', 'showWebsocketRequests',
      'playWithBrowser'];
    
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'url' && scrapedoParams.includes(key) && value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          queryParams.append(key, value.toString());
        } else if (typeof value === 'object') {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    return `${API_URL}?${queryParams.toString()}`;
  }

  private buildProxyUrl(params: ScrapeOptions): { url: string; proxyUrl: string } {
    const proxyParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'url' && value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          proxyParams.append(key, value.toString());
        } else if (key === 'playWithBrowser' && typeof value === 'object') {
          proxyParams.append(key, JSON.stringify(value));
        } else {
          proxyParams.append(key, String(value));
        }
      }
    });

    const proxyAuth = proxyParams.toString() ? `${this.apiKey}:${proxyParams.toString()}` : this.apiKey;
    return {
      url: params.url,
      proxyUrl: `http://${proxyAuth}@${PROXY_URL}:${PROXY_PORT}`
    };
  }

  async scrape(options: ScrapeOptions, useProxy = false): Promise<ScrapeResult> {
    logger.debug('Starting scrape request', {
      url: options.url,
      useProxy,
      render: options.render,
      super: options.super,
      device: options.device
    });

    try {
      let response;
      
      if (useProxy) {
        const { url, proxyUrl } = this.buildProxyUrl(options);
        logger.debug('Using proxy mode', { targetUrl: url, proxyUrl: proxyUrl.replace(/:[^:]+@/, ':***@') });

        const agent = new HttpsProxyAgent(proxyUrl, {
          rejectUnauthorized: false,
          strictSSL: false
        } as any);
        
        const config: AxiosRequestConfig = {
          method: options.method || 'GET',
          url,
          httpsAgent: agent,
          proxy: false,
          headers: {},
          timeout: options.timeout || 60000,
          maxRedirects: options.disableRedirection ? 0 : 5,
        };

        if (options.body) {
          config.data = options.body;
        }

        logger.logApiCall(config.method || 'GET', url, { proxy: 'configured' });
        response = await axios(config);
        logger.logApiResponse(config.method || 'GET', url, response.status, { 
          headers: response.headers,
          dataLength: response.data?.length 
        });
      } else {
        const url = this.buildApiUrl(options);
        logger.debug('Using API mode', { url: url.replace(/token=[^&]+/, 'token=***') });
        
        const config = {
          method: options.method || 'GET',
          url,
          data: options.body,
          timeout: options.timeout || 60000,
          maxRedirects: options.disableRedirection ? 0 : 5,
        };
        
        logger.logApiCall(config.method, url, { body: options.body });
        response = await axios(config);
        logger.logApiResponse(config.method, url, response.status, {
          headers: response.headers,
          dataLength: response.data?.length
        });
      }

      const result = this.processResponse(response, options);
      logger.debug('Scrape completed successfully', {
        statusCode: result.statusCode,
        hasHtml: !!result.html,
        hasMarkdown: !!result.markdown,
        hasScreenshot: !!result.screenshot
      });
      
      return result;
    } catch (error) {
      logger.error('Scrape request failed', error);
      if (axios.isAxiosError(error)) {
        throw this.handleError(error);
      }
      throw error;
    }
  }

  private processResponse(response: any, options: ScrapeOptions): ScrapeResult {
    const result: ScrapeResult = {
      success: true,
      statusCode: response.status,
      url: options.url,
      headers: response.headers,
    };

    if (options.transparentResponse) {
      result.html = response.data;
      return result;
    }

    if (options.returnJSON) {
      result.networkData = response.data;
      if (response.data.screenshot) {
        result.screenshot = response.data.screenshot;
      }
      if (response.data.frames) {
        result.frames = response.data.frames;
      }
      if (response.data.websockets) {
        result.websockets = response.data.websockets;
      }
    } else if (options.output === 'markdown') {
      result.markdown = response.data;
    } else {
      result.html = response.data;
      result.text = this.extractText(response.data);
    }

    if (options.pureCookies && response.headers['set-cookie']) {
      result.cookies = Array.isArray(response.headers['set-cookie']) 
        ? response.headers['set-cookie'] 
        : [response.headers['set-cookie']];
    }

    return result;
  }

  private extractText(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private handleError(error: AxiosError): ScrapedoError {
    const status = error.response?.status;
    const retryAfter = error.response?.headers?.['retry-after'];
    
    switch(status) {
      case 429:
        return new ScrapedoError(429, 'rate_limit', false, true, { retryAfter });
      case 401:
        return new ScrapedoError(401, 'auth', false, false);
      case 404:
        return new ScrapedoError(404, 'target_error', true, false);
      case 400:
        return new ScrapedoError(400, 'target_error', false, false);
      case 502:
        return new ScrapedoError(502, 'unknown', false, true);
      case 510:
        return new ScrapedoError(510, 'client_canceled', false, false);
      default:
        if (error.code === 'ECONNABORTED') {
          return new ScrapedoError(0, 'timeout', false, true);
        }
        return new ScrapedoError(status || 500, 'unknown', true, false);
    }
  }

  async getUsageStats(): Promise<UsageStats> {
    logger.debug('Fetching usage statistics');
    
    try {
      const url = `${STATS_URL}/?token=${this.apiKey}`;
      logger.logApiCall('GET', url, {});
      
      const response = await axios.get(url);
      logger.logApiResponse('GET', url, response.status, response.data);
      
      const stats = {
        remainingCredits: response.data.remaining_credits || 0,
        usedCredits: response.data.used_credits || 0,
        concurrencyLimit: response.data.concurrency_limit || 10,
        requestsToday: response.data.requests_today || 0,
      };
      
      logger.info('Usage statistics retrieved', stats);
      return stats;
    } catch (error) {
      logger.error('Failed to get usage stats', error);
      if (axios.isAxiosError(error)) {
        throw this.handleError(error);
      }
      throw error;
    }
  }

  calculateCredits(params: ScrapeOptions): number {
    let credits = 1;
    
    if (params.super && params.render) {
      credits = 25;
    } else if (params.super) {
      credits = 10;
    } else if (params.render) {
      credits = 5;
    }
    
    const url = params.url.toLowerCase();
    if (url.includes('google.')) {
      credits = Math.max(credits, 10);
    }
    if (url.includes('linkedin.com')) {
      credits = Math.max(credits, 30);
    }
    
    return credits;
  }

  generateProxyConfig(params: Omit<ScrapeOptions, 'url'>): string {
    const proxyParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          proxyParams.append(key, value.toString());
        } else if (key === 'playWithBrowser' && typeof value === 'object') {
          proxyParams.append(key, JSON.stringify(value));
        } else {
          proxyParams.append(key, String(value));
        }
      }
    });

    const proxyAuth = proxyParams.toString() ? `${this.apiKey}:${proxyParams.toString()}` : this.apiKey;
    return `http://${proxyAuth}@${PROXY_URL}:${PROXY_PORT}`;
  }
}