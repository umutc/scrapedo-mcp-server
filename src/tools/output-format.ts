import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ScrapedoClient, ScrapeOptionsSchema } from '../scrapedo-client.js';

export const scrapeToMarkdownTool: Tool = {
  name: 'scrape_to_markdown',
  description: 'Scrape and convert to markdown format',
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
      render: {
        type: 'boolean',
        description: 'Enable JavaScript rendering',
      },
      super: {
        type: 'boolean',
        description: 'Use residential proxy',
      },
      geoCode: {
        type: 'string',
        description: 'Country code for proxy',
      },
      regionalGeoCode: {
        type: 'string',
        description: 'Regional proxy location (europe, asia, etc.)',
      },
      sessionId: {
        type: 'number',
        description: 'Sticky session ID (0-1000000)',
      },
      customHeaders: {
        type: 'boolean',
        description: 'Let Scrape.do inject default headers',
      },
      extraHeaders: {
        type: 'boolean',
        description: 'Forward extra upstream headers',
      },
      forwardHeaders: {
        type: 'boolean',
        description: 'Forward tool consumer headers to target',
      },
      setCookies: {
        type: 'string',
        description: 'Send cookies to the target (JSON or header format)',
      },
      pureCookies: {
        type: 'boolean',
        description: 'Return cookies as provided by the target',
      },
      device: {
        type: 'string',
        enum: ['desktop', 'mobile', 'tablet'],
        description: 'Device to emulate',
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
        description: 'Disable automatic retry',
      },
      disableRedirection: {
        type: 'boolean',
        description: 'Disable auto redirect following',
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
        description: 'Webhook URL for async delivery (url-encoded)',
      },
      playWithBrowser: {
        type: 'string',
        description: 'JSON-encoded Play-with-Browser script to run before conversion',
      },
    },
    required: ['url'],
  },
};

export async function handleScrapeToMarkdown(client: ScrapedoClient, args: any) {
  const options = ScrapeOptionsSchema.parse({
    ...args,
    output: 'markdown',
  });
  
  const result = await client.scrape(options);
  const content = [
    {
      type: 'text',
      text: result.markdown || result.text || '',
    },
  ];

  if (args?.callback) {
    content.push({
      type: 'text',
      text: `Callback registered: Scrape.do will POST the markdown payload to ${args.callback}`,
    });
  }

  return { content };
}
