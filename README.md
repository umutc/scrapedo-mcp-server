# Scrapedo MCP Server

A comprehensive MCP (Model Context Protocol) server that provides web scraping capabilities through the Scrapedo API (https://scrape.do).

## Features

- **Web Scraping**: Basic HTTP requests and JavaScript-rendered page scraping
- **Proxy Support**: Datacenter and residential/mobile proxy networks with geo-targeting
- **Screenshots**: Capture full page or element-specific screenshots
- **Output Formats**: HTML, text, or markdown output
- **Browser Automation**: Click, scroll, type, and execute JavaScript
- **Usage Monitoring**: Track API credits and usage statistics
- **Credit Calculation**: Automatic credit cost calculation for requests

## Installation

```bash
npm install
npm run build
```

## Configuration

### API Key
Set your Scrapedo API key as an environment variable:

```bash
export SCRAPEDO_API_KEY="your_api_key_here"
```

### Logging
The server includes comprehensive logging for debugging:

```bash
# Set log level (DEBUG, INFO, WARN, ERROR)
export LOG_LEVEL="DEBUG"

# Logs are saved to: logs/scrapedo-mcp.log
```

**Log Levels:**
- `DEBUG`: All logs including API calls and responses
- `INFO`: General information and tool responses (default)
- `WARN`: Warnings only
- `ERROR`: Errors only

**Log Features:**
- Automatic API token masking in logs
- Request/response tracking with timing
- Error stack traces for debugging
- Tool usage analytics
- Rotating log files in `logs/` directory

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "scrapedo": {
      "command": "node",
      "args": ["/path/to/scrapedo-mcp-server2/dist/index.js"],
      "env": {
        "SCRAPEDO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### Core Scraping Tools

- `scrape`: Basic web scraping without JavaScript rendering
- `scrape_with_js`: Scrape JavaScript-rendered pages with headless browser
- `scrape_with_proxy`: Use residential/mobile proxies with geographic targeting
- `take_screenshot`: Capture webpage screenshots (full page or specific elements)
- `scrape_to_markdown`: Convert webpages to markdown format

### Utility Tools

- `get_usage_stats`: Check remaining credits and API usage
- `generate_proxy_config`: Generate proxy configuration URLs for external use

## Example Usage

### Basic Scraping

```javascript
// Simple webpage scraping
{
  "tool": "scrape",
  "arguments": {
    "url": "https://example.com",
    "device": "desktop"
  }
}
```

### JavaScript-Rendered Pages

```javascript
// Scrape with JavaScript rendering
{
  "tool": "scrape_with_js",
  "arguments": {
    "url": "https://example.com",
    "waitUntil": "networkidle0",
    "waitSelector": ".content-loaded",
    "blockResources": false,
    "width": 1920,
    "height": 1080
  }
}
```

### Using Proxies

```javascript
// Scrape with residential proxy from specific location
{
  "tool": "scrape_with_proxy",
  "arguments": {
    "url": "https://example.com",
    "geoCode": "us",
    "sessionId": 123456,
    "render": true
  }
}
```

### Taking Screenshots

```javascript
// Capture full page screenshot
{
  "tool": "take_screenshot",
  "arguments": {
    "url": "https://example.com",
    "fullPage": true,
    "device": "mobile"
  }
}
```

### Convert to Markdown

```javascript
// Get webpage content as markdown
{
  "tool": "scrape_to_markdown",
  "arguments": {
    "url": "https://example.com",
    "render": true
  }
}
```

## Credit Costs

- **Basic request**: 1 credit
- **With JavaScript rendering**: 5 credits  
- **Residential/mobile proxy**: 10 credits
- **Residential/mobile + JavaScript**: 25 credits
- **Special domains**: Google (min 10), LinkedIn (min 30)

## API Modes

### API Mode (Default)
Direct API calls using GET requests with parameters in the URL.

### Proxy Mode
Route requests through Scrapedo's proxy servers for enhanced compatibility.

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Test the implementation
node test-final.js
```

## Troubleshooting

- **401 Error**: Check that your API key is valid
- **429 Error**: Rate limit exceeded, wait and retry
- **Credit Issues**: Use `get_usage_stats` to check remaining credits
- **Proxy Issues**: Ensure you have the https-proxy-agent package installed

## License

MIT