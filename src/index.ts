#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ScrapedoClient } from './scrapedo-client.js';
import * as tools from './tools/index.js';
import { logger } from './logger.js';

const API_KEY = process.env.SCRAPEDO_API_KEY;

if (!API_KEY) {
  logger.error('SCRAPEDO_API_KEY environment variable is required');
  console.error('Error: SCRAPEDO_API_KEY environment variable is required');
  process.exit(1);
}

logger.info('Initializing Scrapedo client', { 
  apiKeyPresent: !!API_KEY,
  apiKeyLength: API_KEY.length 
});

const client = new ScrapedoClient(API_KEY);

const server = new Server(
  {
    name: 'scrapedo-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const availableTools: Tool[] = [
  tools.scrapeTool,
  tools.scrapeWithJsTool,
  tools.scrapeWithProxyTool,
  tools.takeScreenshotTool,
  tools.scrapeToMarkdownTool,
  tools.getUsageStatsTool,
  tools.generateProxyConfigTool,
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug('Listing available tools', { count: availableTools.length });
  return { tools: availableTools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();
  
  logger.logRequest(name, args);

  try {
    let result;
    switch (name) {
      case 'scrape':
        result = await tools.handleScrape(client, args);
        break;
      case 'scrape_with_js':
        result = await tools.handleScrapeWithJs(client, args);
        break;
      case 'scrape_with_proxy':
        result = await tools.handleScrapeWithProxy(client, args);
        break;
      case 'take_screenshot':
        result = await tools.handleTakeScreenshot(client, args);
        break;
      case 'scrape_to_markdown':
        result = await tools.handleScrapeToMarkdown(client, args);
        break;
      case 'get_usage_stats':
        result = await tools.handleGetUsageStats(client, args);
        break;
      case 'generate_proxy_config':
        result = await tools.handleGenerateProxyConfig(client, args);
        break;
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
    
    const duration = Date.now() - startTime;
    logger.logResponse(name, result, duration);
    return result;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logError(name, error, duration);
    if (error instanceof McpError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new McpError(ErrorCode.InternalError, message);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  
  logger.info('Connecting MCP server to stdio transport');
  await server.connect(transport);
  
  logger.info('Scrapedo MCP server is running', {
    tools: availableTools.map(t => t.name),
    transport: 'stdio'
  });
  
  console.error('Scrapedo MCP server running on stdio');
}

main().catch((error) => {
  logger.error('Fatal error during startup', error);
  console.error('Fatal error:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  logger.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  logger.close();
  process.exit(0);
});