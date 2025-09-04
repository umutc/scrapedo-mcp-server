import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ScrapedoClient, ScrapeOptionsSchema } from '../scrapedo-client.js';

export const takeScreenshotTool: Tool = {
  name: 'take_screenshot',
  description: 'Capture webpage screenshots',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to capture',
      },
      fullPage: {
        type: 'boolean',
        description: 'Capture full page screenshot',
      },
      selector: {
        type: 'string',
        description: 'CSS selector of specific element to capture',
      },
      width: {
        type: 'number',
        description: 'Viewport width (default: 1920)',
      },
      height: {
        type: 'number',
        description: 'Viewport height (default: 1080)',
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

export async function handleTakeScreenshot(client: ScrapedoClient, args: any) {
  const options = ScrapeOptionsSchema.parse({
    ...args,
    render: true,
    returnJSON: true,
    blockResources: false,
    screenShot: !args.fullPage && !args.selector,
    fullScreenShot: args.fullPage,
    particularScreenShot: args.selector,
  });
  
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