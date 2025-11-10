import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ScrapedoClient } from '../scrapedo-client.js';

export const getUsageStatsTool: Tool = {
  name: 'get_usage_stats',
  description: 'Get API usage statistics and remaining credits',
  inputSchema: {
    type: 'object',
    properties: {},
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
