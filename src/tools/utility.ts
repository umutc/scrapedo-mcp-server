import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ScrapedoClient } from '../scrapedo-client.js';

export const getUsageStatsTool: Tool = {
  name: 'get_usage_stats',
  description: 'Get API usage statistics and remaining credits',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export const generateProxyConfigTool: Tool = {
  name: 'generate_proxy_config',
  description: 'Generate a ready-to-use Proxy Mode URL with embedded parameters',
  inputSchema: {
    type: 'object',
    properties: {
      render: {
        type: 'boolean',
        description: 'Enable JavaScript rendering',
      },
      super: {
        type: 'boolean',
        description: 'Use residential/mobile proxy',
      },
      geoCode: {
        type: 'string',
        description: 'Country code for proxy',
      },
      sessionId: {
        type: 'number',
        description: 'Sticky session ID',
      },
      waitUntil: {
        type: 'string',
        enum: ['domcontentloaded', 'networkidle0', 'networkidle2', 'load'],
        description: 'Wait condition for page load',
      },
      device: {
        type: 'string',
        enum: ['desktop', 'mobile', 'tablet'],
        description: 'Device to emulate',
      },
    },
  },
};

export async function handleGetUsageStats(client: ScrapedoClient, args: any) {
  const stats = await client.getUsageStats();
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(stats, null, 2),
      },
    ],
  };
}

export async function handleGenerateProxyConfig(client: ScrapedoClient, args: any) {
  const proxyUrl = client.generateProxyConfig(args);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ proxyUrl }, null, 2),
      },
    ],
  };
}