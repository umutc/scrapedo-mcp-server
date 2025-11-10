import { ErrorCode, McpError, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ScrapedoClient, ScrapeOptionsSchema } from '../scrapedo-client.js';

const regionalGeoEnum = ['europe', 'asia', 'africa', 'oceania', 'northamerica', 'southamerica'] as const;

const sharedScrapeProperties = {
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
  retryTimeout: {
    type: 'number',
    description: 'Retry timeout in milliseconds (5000-55000)',
  },
  disableRetry: {
    type: 'boolean',
    description: 'Disable automatic retry on failure',
  },
  disableRedirection: {
    type: 'boolean',
    description: 'Disable following redirects',
  },
  super: {
    type: 'boolean',
    description: 'Use residential & mobile proxy network (Super requests)',
  },
  geoCode: {
    type: 'string',
    description: 'Country code for proxy location (defaults to "us" when Super and region unspecified)',
  },
  regionalGeoCode: {
    type: 'string',
    enum: regionalGeoEnum,
    description: 'Regional proxy location',
  },
  sessionId: {
    type: 'number',
    description: 'Sticky session ID (0-1000000) for maintaining the same IP',
  },
  customHeaders: {
    type: 'boolean',
    description: 'Let Scrape.do add default headers automatically',
  },
  extraHeaders: {
    type: 'boolean',
    description: 'Forward extra upstream headers',
  },
  forwardHeaders: {
    type: 'boolean',
    description: 'Forward client headers to the target site',
  },
  setCookies: {
    type: 'string',
    description: 'Send cookies to the target site (use JSON string or cookie header)',
  },
  pureCookies: {
    type: 'boolean',
    description: 'Return cookies exactly as sent by the target',
  },
  blockResources: {
    type: 'boolean',
    description: 'Block images, CSS, fonts to speed up loading',
  },
  blockAds: {
    type: 'boolean',
    description: 'Block advertisements',
  },
  callback: {
    type: 'string',
    description: 'Webhook URL for asynchronous delivery (url-encoded)',
  },
  output: {
    type: 'string',
    enum: ['raw', 'markdown'],
    description: 'Output format (raw HTML/text or markdown)',
  },
  transparentResponse: {
    type: 'boolean',
    description: 'Return the origin response body directly with no parsing',
  },
  returnJSON: {
    type: 'boolean',
    description: 'Return Scrape.do JSON payload (required for screenshots/frames data)',
  },
  showFrames: {
    type: 'boolean',
    description: 'Return iframe/frame metadata (requires returnJSON)',
  },
  showWebsocketRequests: {
    type: 'boolean',
    description: 'Return websocket request/response logs (requires returnJSON)',
  },
  playWithBrowser: {
    type: 'string',
    description: 'JSON-encoded Play-with-Browser action list (array or DSL string)',
  },
  screenShot: {
    type: 'boolean',
    description: 'Capture default viewport screenshot (requires render & returnJSON)',
  },
  fullScreenShot: {
    type: 'boolean',
    description: 'Capture full-page screenshot (requires render & returnJSON)',
  },
  particularScreenShot: {
    type: 'string',
    description: 'Capture CSS selector screenshot (selector must be URL-encoded)',
  },
} satisfies Record<string, any>;

function buildScrapeInputSchema(extraProps: Record<string, any> = {}) {
  return {
    type: 'object' as const,
    properties: {
      url: {
        type: 'string',
        description: 'URL to scrape',
      },
      ...sharedScrapeProperties,
      ...extraProps,
    },
    required: ['url'],
  };
}

export const scrapeTool: Tool = {
  name: 'scrape',
  description: 'Basic web scraping without JavaScript rendering',
  inputSchema: buildScrapeInputSchema(),
};

export const scrapeWithJsTool: Tool = {
  name: 'scrape_with_js',
  description: 'Scrape JavaScript-rendered pages using headless browser',
  inputSchema: buildScrapeInputSchema({
    render: {
      type: 'boolean',
      description: 'Enable JavaScript rendering (forced true)',
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
  }),
};

export async function handleScrape(client: ScrapedoClient, args: any) {
  const prepared = prepareScrapeArgs(args);
  const options = ScrapeOptionsSchema.parse(prepared);
  const result = await client.scrape(options);
  
  return formatScrapeResponse(result, args?.callback);
}

export async function handleScrapeWithJs(client: ScrapedoClient, args: any) {
  const prepared = prepareScrapeArgs(args, { render: true });
  const options = ScrapeOptionsSchema.parse(prepared);
  const result = await client.scrape(options);
  
  return formatScrapeResponse(result, args?.callback);
}

function prepareScrapeArgs(args: any, overrides: Record<string, any> = {}) {
  const merged = { ...args, ...overrides };
  enforceScreenshotRules(merged);
  return merged;
}

const screenshotKeys: Array<keyof typeof sharedScrapeProperties> = [
  'screenShot',
  'fullScreenShot',
  'particularScreenShot',
] as const;

function enforceScreenshotRules(options: any) {
  const active = screenshotKeys.filter((key) => !!options[key]);
  if (active.length > 1) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Only one of screenShot, fullScreenShot, or particularScreenShot can be enabled at a time'
    );
  }

  if (active.length > 0) {
    if (options.playWithBrowser) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'playWithBrowser actions cannot be combined with screenshot capture flags'
      );
    }
    options.render = true;
    options.returnJSON = true;
    if (options.blockResources === undefined) {
      options.blockResources = false;
    }
  }
}

function formatScrapeResponse(result: any, callback?: string) {
  const content = [
    {
      type: 'text',
      text: JSON.stringify(result, null, 2),
    },
  ];

  if (callback) {
    content.push({
      type: 'text',
      text: `Callback registered: Scrape.do will POST the final payload to ${callback}`,
    });
  }

  return { content };
}
