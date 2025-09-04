import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ScrapedoClient, ScrapeOptionsSchema } from '../scrapedo-client.js';

export const scrapeTool: Tool = {
  name: 'scrape',
  description: 'Basic web scraping without JavaScript rendering',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to scrape',
      },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
        description: 'HTTP method (default: GET)',
      },
      body: {
        type: 'string',
        description: 'Request body for POST/PUT',
      },
      device: {
        type: 'string',
        enum: ['desktop', 'mobile', 'tablet'],
        description: 'Device type to emulate',
      },
      timeout: {
        type: 'number',
        description: 'Request timeout in milliseconds (5000-120000)',
      },
      disableRetry: {
        type: 'boolean',
        description: 'Disable automatic retry on failure',
      },
    },
    required: ['url'],
  },
};

export const scrapeWithJsTool: Tool = {
  name: 'scrape_with_js',
  description: 'Scrape JavaScript-rendered pages using headless browser',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to scrape',
      },
      render: {
        type: 'boolean',
        description: 'Enable JavaScript rendering (default: true)',
        default: true,
      },
      waitUntil: {
        type: 'string',
        enum: ['domcontentloaded', 'networkidle0', 'networkidle2', 'load'],
        description: 'Wait condition for page load',
      },
      waitSelector: {
        type: 'string',
        description: 'CSS selector to wait for before capturing',
      },
      customWait: {
        type: 'number',
        description: 'Additional wait time in milliseconds',
      },
      width: {
        type: 'number',
        description: 'Browser viewport width (default: 1920)',
        default: 1920,
      },
      height: {
        type: 'number',
        description: 'Browser viewport height (default: 1080)',
        default: 1080,
      },
      blockResources: {
        type: 'boolean',
        description: 'Block images, CSS, fonts to speed up loading (default: true)',
        default: true,
      },
      blockAds: {
        type: 'boolean',
        description: 'Block advertisements',
      },
      device: {
        type: 'string',
        enum: ['desktop', 'mobile', 'tablet'],
        description: 'Device type to emulate',
      },
    },
    required: ['url'],
  },
};

export const scrapeWithProxyTool: Tool = {
  name: 'scrape_with_proxy',
  description: 'Use residential/mobile proxy networks for scraping',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to scrape',
      },
      super: {
        type: 'boolean',
        description: 'Enable residential/mobile proxy (default: true)',
        default: true,
      },
      geoCode: {
        type: 'string',
        description: 'Country code for proxy location (e.g., us, uk, de, fr)',
      },
      regionalGeoCode: {
        type: 'string',
        enum: ['europe', 'asia', 'africa', 'oceania', 'northamerica', 'southamerica'],
        description: 'Regional proxy location',
      },
      sessionId: {
        type: 'number',
        description: 'Sticky session ID (0-1000000) for maintaining the same IP',
      },
      render: {
        type: 'boolean',
        description: 'Enable JavaScript rendering',
      },
    },
    required: ['url'],
  },
};

export async function handleScrape(client: ScrapedoClient, args: any) {
  const options = ScrapeOptionsSchema.parse(args);
  const result = await client.scrape(options);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

export async function handleScrapeWithJs(client: ScrapedoClient, args: any) {
  const options = ScrapeOptionsSchema.parse({ ...args, render: true });
  const result = await client.scrape(options);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

export async function handleScrapeWithProxy(client: ScrapedoClient, args: any) {
  const options = ScrapeOptionsSchema.parse({ ...args, super: true });
  const result = await client.scrape(options, true);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}