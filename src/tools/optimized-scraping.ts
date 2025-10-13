import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ScrapedoClient, ScrapeOptionsSchema } from '../scrapedo-client.js';
import { ResponseOptimizer } from '../utils/response-optimizer.js';
import { contentProcessor } from '../utils/content-processor.js';

export const scrapeOptimizedTool: Tool = {
  name: 'scrape_optimized',
  description: 'Agent-optimized web scraping with automatic content management to prevent token limit issues',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to scrape',
      },
      maxLength: {
        type: 'number',
        description: 'Maximum content length to return (default: 50000)',
        default: 50000,
      },
      format: {
        type: 'string',
        enum: ['html', 'text', 'markdown', 'structured'],
        description: 'Output format - structured is best for agents (default: structured)',
        default: 'structured',
      },
      render: {
        type: 'boolean',
        description: 'Enable JavaScript rendering if needed',
        default: false,
      },
      device: {
        type: 'string',
        enum: ['desktop', 'mobile', 'tablet'],
        description: 'Device type to emulate',
      },
      waitSelector: {
        type: 'string',
        description: 'CSS selector to wait for before capturing (JS rendering)',
      },
      enableChunking: {
        type: 'boolean',
        description: 'Enable chunking for large content',
        default: false,
      },
      chunkSize: {
        type: 'number',
        description: 'Size of each chunk if chunking enabled (default: 30000)',
        default: 30000,
      }
    },
    required: ['url'],
  },
};

export const scrapeSmartTool: Tool = {
  name: 'scrape_smart',
  description: 'AI-optimized scraping that extracts only essential data based on intent',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to scrape',
      },
      intent: {
        type: 'string',
        enum: ['article', 'product', 'navigation', 'data', 'contact'],
        description: 'What type of content you are looking for',
      },
      render: {
        type: 'boolean',
        description: 'Enable JavaScript rendering if needed',
        default: false,
      }
    },
    required: ['url', 'intent'],
  },
};

export const scrapeStructuredTool: Tool = {
  name: 'scrape_structured',
  description: 'Extract structured data (title, headings, links, images, JSON-LD) from a webpage',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to scrape',
      },
      maxContentLength: {
        type: 'number',
        description: 'Maximum length of main content to extract (default: 10000)',
        default: 10000,
      },
      render: {
        type: 'boolean',
        description: 'Enable JavaScript rendering',
        default: false,
      }
    },
    required: ['url'],
  },
};

export async function handleScrapeOptimized(client: ScrapedoClient, args: any) {
  // Prepare scraping options
  const scrapeOptions = {
    url: args.url,
    render: args.render || false,
    device: args.device,
    waitSelector: args.waitSelector,
    maxHtmlLength: args.maxLength || 50000,
    cleanHtml: true,
    optimizeForAgent: true
  };

  // Scrape the page
  const result = await client.scrape(scrapeOptions);

  // Optimize the response based on requested format
  const optimized = await ResponseOptimizer.optimizeResponse(result, {
    format: args.format || 'structured',
    maxLength: args.maxLength || 50000,
    cleanHtml: true,
    chunking: args.enableChunking ? {
      enabled: true,
      chunkSize: args.chunkSize || 30000,
      overlap: 500
    } : undefined
  });

  // Return optimized content
  if (optimized.type === 'chunked' && optimized.chunks) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            type: 'chunked',
            totalChunks: optimized.chunks.length,
            firstChunk: optimized.chunks[0],
            metadata: optimized.metadata,
            message: `Content split into ${optimized.chunks.length} chunks. Use fetch_chunk tool to get additional chunks.`
          }, null, 2)
        }
      ]
    };
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          data: optimized.data,
          metadata: optimized.metadata
        }, null, 2)
      }
    ]
  };
}

export async function handleScrapeSmart(client: ScrapedoClient, args: any) {
  // Scrape the page
  const result = await client.scrape({
    url: args.url,
    render: args.render || false
  });

  // Extract data based on intent
  const optimized = await ResponseOptimizer.optimizeByIntent(result, args.intent);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(optimized.data, null, 2)
      }
    ]
  };
}

export async function handleScrapeStructured(client: ScrapedoClient, args: any) {
  // Scrape the page
  const result = await client.scrape({
    url: args.url,
    render: args.render || false
  });

  if (!result.html) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'No HTML content received',
            url: args.url,
            statusCode: result.statusCode
          }, null, 2)
        }
      ]
    };
  }

  // Extract structured data
  const structured = contentProcessor.extractStructuredData(
    result.html,
    args.maxContentLength || 10000
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          url: result.url,
          statusCode: result.statusCode,
          data: structured,
          metadata: {
            originalLength: result.html.length,
            extractedAt: new Date().toISOString()
          }
        }, null, 2)
      }
    ]
  };
}
