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
  
  return {
    content: [
      {
        type: 'text',
        text: result.markdown || result.text || '',
      },
    ],
  };
}