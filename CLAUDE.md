# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that enables AI assistants like Claude Desktop to scrape websites using the Scrapedo API. Built with TypeScript and Node.js ES modules, it provides tools for web scraping (with/without JavaScript rendering), screenshots, proxy usage, and markdown conversion.

## Essential Commands

### Development
```bash
npm run build          # Compile TypeScript to dist/
npm run dev           # Development mode with hot reload (using tsx)
npm start             # Run the compiled MCP server
```

### Testing
```bash
npm test              # Run quick test (examples/quick-test.js)
npm run test:jest     # Run Jest test suite
```

### Publishing
```bash
npm run prepare       # Pre-publish build hook
npm run prepublishOnly # Build before publishing to npm
```

### CLI Usage
The built CLI (`dist/cli.js`) provides initialization commands:
```bash
npx scrapedo-mcp-server init     # Configure Claude Desktop/Codex/Gemini
npx scrapedo-mcp-server start    # Start MCP server
npx scrapedo-mcp-server config   # Show configuration status
```

## Code Architecture

### Entry Points
- **`src/index.ts`** - MCP server that registers tools and handles requests via stdio transport
- **`src/cli.ts`** - CLI for initializing configuration files for Claude Desktop, Codex, and Gemini

### Core Components

#### ScrapedoClient (`src/scrapedo-client.ts`)
The API client supports two modes:
1. **API Mode** - Direct requests to `https://api.scrape.do` with token in query params
2. **Proxy Mode** - Requests through `proxy.scrape.do:8080` with credentials in proxy auth

Key methods:
- `scrape(options, useProxy)` - Main scraping method
- `getUsageStats()` - Fetch credit usage from API
- `calculateCredits(params)` - Estimate cost (1-30 credits depending on features)
- `generateProxyConfig(params)` - Build proxy URL for external use

Error handling distinguishes between:
- Rate limits (429) - retryable
- Auth errors (401) - not retryable
- Timeouts (ECONNABORTED) - retryable
- Target errors (404, 400) - not retryable

#### Logger (`src/logger.ts`)
Singleton logger that writes to both `logs/scrapedo-mcp.log` and stderr (for MCP protocol compliance).

Features:
- Log level filtering (DEBUG, INFO, WARN, ERROR, NONE) via `LOG_LEVEL` env var (`NONE` disables logging)
- Automatic sanitization of sensitive data (tokens, API keys)
- Specialized methods: `logRequest()`, `logResponse()`, `logError()`, `logApiCall()`
- Truncates long strings (>1000 chars) to prevent log bloat

#### Tools (`src/tools/`)
Each tool exports:
1. Tool definition with JSON schema (`scrapeTool`, `scrapeWithJsTool`, etc.)
2. Handler function (`handleScrape`, `handleScrapeWithJs`, etc.)

All tools are imported and registered in `src/index.ts` via:
```typescript
import * as tools from './tools/index.js';
```

Tool files:
- `scraping.ts` - Basic scrape, JS rendering, proxy scraping
- `screenshot.ts` - Screenshot capture
- `output-format.ts` - Markdown conversion
- `utility.ts` - Usage stats, proxy config generation

### MCP Protocol Integration

The server uses `@modelcontextprotocol/sdk`:
- `StdioServerTransport` - Communicates via stdin/stdout
- `ListToolsRequestSchema` - Returns available tools
- `CallToolRequestSchema` - Executes tool with validation

All responses follow MCP format:
```typescript
return {
  content: [{
    type: 'text',
    text: JSON.stringify(result, null, 2)
  }]
};
```

## Configuration Management

The CLI tool (`src/cli.ts`) manages configuration for multiple platforms:

### Claude Desktop
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Codex
- **All platforms**: `~/.codex/config.toml` (TOML format)

### Gemini
- **All platforms**: `~/.gemini/settings.json`

Config format (Claude Desktop/Gemini):
```json
{
  "mcpServers": {
    "scrapedo": {
      "command": "node",
      "args": ["path/to/dist/index.js"],
      "env": {
        "SCRAPEDO_API_KEY": "your_key",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

## TypeScript Configuration

Uses ES2022 target with Node16 module resolution:
- **Output**: `dist/` directory
- **Source maps**: Enabled for debugging
- **Strict mode**: Enabled
- **Module system**: ES modules (`.js` extensions required in imports)

When adding new files, remember:
- Use `.js` extensions in import statements (e.g., `from './foo.js'`)
- Mark files as executable with shebang: `#!/usr/bin/env node`
- Export types and interfaces for external use

## Scrapedo API Integration

### Credit Costs
Calculated in `ScrapedoClient.calculateCredits()`:
- Basic scraping: 1 credit
- JavaScript rendering (`render: true`): 5 credits
- Residential proxy (`super: true`): 10 credits
- Both JS + proxy: 25 credits
- Special sites (Google: 10+, LinkedIn: 30+)

### Proxy Mode vs API Mode
**Use proxy mode when:**
- `super: true` (residential/mobile proxies needed)
- External proxy configuration required

**Use API mode for:**
- Standard scraping
- JavaScript rendering without proxy
- Lower credit cost operations

The client automatically uses native HTTPS agent with `rejectUnauthorized: false` for proxy requests to handle SSL verification issues.

## Key Parameters & Options

Defined in `ScrapeOptionsSchema` (src/scrapedo-client.ts):

### Essential
- `url` - Target URL (required)
- `render` - Enable JavaScript (default: false)
- `super` - Use residential proxy (default: false)
- `geoCode` - Country code (us, uk, de, etc.)

### Advanced
- `waitSelector` - CSS selector to wait for before capture
- `sessionId` - Sticky session (0-1000000) for IP persistence
- `device` - Emulate desktop/mobile/tablet
- `blockResources` - Block images/CSS/fonts for speed
- `output` - 'raw' or 'markdown'
- `transparentResponse` - Return raw HTML without processing

## Testing Guidelines

The project currently uses example scripts for testing. When adding new features:

1. **Add example scripts** to `examples/` directory showing typical usage
2. **Test both modes**: API mode and proxy mode
3. **Validate Zod schemas**: Ensure parameters pass `ScrapeOptionsSchema.parse()`
4. **Check logs**: Verify sensitive data is sanitized in `logs/scrapedo-mcp.log`

## Common Development Patterns

### Adding a New Tool

1. Create tool definition in appropriate file under `src/tools/`:
```typescript
export const myNewTool: Tool = {
  name: 'my_new_tool',
  description: 'What it does',
  inputSchema: {
    type: 'object',
    properties: { /* ... */ },
    required: ['url']
  }
};
```

2. Create handler function:
```typescript
export async function handleMyNewTool(client: ScrapedoClient, args: any) {
  const options = ScrapeOptionsSchema.parse(args);
  const result = await client.scrape(options);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}
```

3. Export from `src/tools/index.ts`

4. Register in `src/index.ts`:
   - Add to `availableTools` array
   - Add case to switch statement in `CallToolRequestSchema` handler

### Debugging MCP Communication

- MCP uses **stdio** for communication (stdout/stdin)
- All logging goes to **stderr** (via `console.error`)
- Check `logs/scrapedo-mcp.log` for detailed request/response logs
- Set `LOG_LEVEL=DEBUG` to see API calls and responses

### Error Handling

Always use the `ScrapedoError` class for API errors. It includes:
- `statusCode` - HTTP status
- `errorType` - Categorized error type
- `consumedCredits` - Whether credits were charged
- `retryable` - Whether the operation can be retried

MCP errors use `McpError` from the SDK:
```typescript
throw new McpError(ErrorCode.InvalidParams, 'Validation failed');
```

## Environment Variables

- `SCRAPEDO_API_KEY` - Required for all operations (get from scrape.do)
- `LOG_LEVEL` - DEBUG | INFO | WARN | ERROR | NONE (default: INFO, set to `NONE` to disable logging)

## Important Notes

- **ES Modules**: All imports must include `.js` extension
- **Binary files**: `dist/cli.js` and `dist/index.js` must be executable
- **No secrets in code**: API keys only via environment variables
- **Logging**: Never log full API keys (logger auto-sanitizes)
- **Proxy auth format**: `username:password@host:port` where password contains URL-encoded params
