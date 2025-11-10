import { ErrorCode, McpError, Tool } from '@modelcontextprotocol/sdk/types.js';
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
      super: {
        type: 'boolean',
        description: 'Use residential & mobile proxy network',
      },
      geoCode: {
        type: 'string',
        description: 'Country code for proxy routing (defaults to "us" if omitted in Super mode)',
      },
      regionalGeoCode: {
        type: 'string',
        enum: ['europe', 'asia', 'africa', 'oceania', 'northamerica', 'southamerica'],
        description: 'Regional proxy location',
      },
      sessionId: {
        type: 'number',
        description: 'Sticky session ID (0-1000000)',
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
        description: 'Forward tool consumer headers to the target',
      },
      setCookies: {
        type: 'string',
        description: 'Send cookies to the target (JSON or header format)',
      },
      pureCookies: {
        type: 'boolean',
        description: 'Return cookies exactly as target provided',
      },
      fullPage: {
        type: 'boolean',
        description: 'Capture full page screenshot',
      },
      selector: {
        type: 'string',
        description: 'CSS selector of specific element to capture',
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
        description: 'Disable automatic redirect following',
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
      waitUntil: {
        type: 'string',
        enum: ['domcontentloaded', 'networkidle0', 'networkidle2', 'load'],
        description: 'Wait condition for render completion',
      },
      waitSelector: {
        type: 'string',
        description: 'CSS selector to wait for before shooting',
      },
      customWait: {
        type: 'number',
        description: 'Additional wait time in milliseconds',
      },
      blockAds: {
        type: 'boolean',
        description: 'Block advertisements',
      },
      callback: {
        type: 'string',
        description: 'Webhook URL for async delivery (url-encoded)',
      },
    },
    required: ['url'],
  },
};

export async function handleTakeScreenshot(client: ScrapedoClient, args: any) {
  if (args.fullPage && args.selector) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Please choose either fullPage or selector screenshot mode, not both'
    );
  }

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
  
  const content = [
    {
      type: 'text',
      text: JSON.stringify(result, null, 2),
    },
  ];

  if (args?.callback) {
    content.push({
      type: 'text',
      text: `Callback registered: Scrape.do will POST the screenshot payload to ${args.callback}`,
    });
  }

  return { content };
}
