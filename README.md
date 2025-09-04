# Scrapedo MCP Server

[![MCP](https://img.shields.io/badge/MCP-1.0.0-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive MCP (Model Context Protocol) server that provides web scraping capabilities through the [Scrapedo API](https://scrape.do). This server enables Claude Desktop and other MCP clients to perform advanced web scraping operations with proxy support, JavaScript rendering, and intelligent content extraction.

## 🌟 Features

### Core Capabilities
- **🌐 Web Scraping**: Basic HTTP requests and JavaScript-rendered page scraping
- **🔒 Proxy Support**: Datacenter and residential/mobile proxy networks with geo-targeting
- **📸 Screenshots**: Capture full page or element-specific screenshots
- **📝 Output Formats**: HTML, text, or markdown output
- **🤖 Browser Automation**: Click, scroll, type, and execute JavaScript
- **📊 Usage Monitoring**: Track API credits and usage statistics
- **💰 Credit Calculation**: Automatic credit cost calculation for requests

### Advanced Features
- **🔄 Retry Logic**: Automatic retry with exponential backoff for failed requests
- **🛡️ Error Handling**: Comprehensive error handling with detailed logging
- **🌍 Geo-targeting**: Select proxy locations by country or city
- **🍪 Cookie Management**: Handle cookies and sessions
- **📱 Device Emulation**: Desktop, mobile, and tablet user agents
- **⏰ Wait Conditions**: Wait for selectors, navigation, or network idle
- **🚫 Resource Blocking**: Block images, CSS, fonts for faster scraping

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Scrapedo API key ([Get one here](https://scrape.do))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/umutc/scrapedo-mcp-server.git
cd scrapedo-mcp-server

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Set your API key
export SCRAPEDO_API_KEY="your_api_key_here"

# Test the server
npm test
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SCRAPEDO_API_KEY` | Your Scrapedo API token | - | ✅ |
| `LOG_LEVEL` | Logging level (DEBUG, INFO, WARN, ERROR) | INFO | ❌ |
| `NODE_ENV` | Environment (development, production) | development | ❌ |

### API Key Setup

1. **Get your API key**: Sign up at [scrape.do](https://scrape.do) 
2. **Set the environment variable**:
   ```bash
   export SCRAPEDO_API_KEY="your_api_key_here"
   ```
3. **Or use a `.env` file** (for development):
   ```bash
   echo "SCRAPEDO_API_KEY=your_api_key_here" > .env
   ```

### 📝 Logging Configuration

The server includes comprehensive logging for debugging and monitoring:

```bash
# Set log level
export LOG_LEVEL="DEBUG"  # DEBUG | INFO | WARN | ERROR

# Logs are automatically saved to: logs/scrapedo-mcp.log
```

#### Log Levels
| Level | Description | Use Case |
|-------|-------------|----------|
| `DEBUG` | All logs including API calls and responses | Development & troubleshooting |
| `INFO` | General information and tool responses | Production monitoring |
| `WARN` | Warnings and potential issues | Issue detection |
| `ERROR` | Errors only | Critical issues |

#### Log Features
- ✅ Automatic API token masking in logs
- ✅ Request/response tracking with timing
- ✅ Error stack traces for debugging
- ✅ Tool usage analytics
- ✅ Rotating log files in `logs/` directory
- ✅ Structured JSON logging for parsing

## 🤖 Usage with Claude Desktop

### macOS Configuration
Add to your Claude Desktop configuration:

**File location**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "scrapedo": {
      "command": "node",
      "args": ["/absolute/path/to/scrapedo-mcp-server/dist/index.js"],
      "env": {
        "SCRAPEDO_API_KEY": "your_api_key_here",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

### Windows Configuration
**File location**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "scrapedo": {
      "command": "node",
      "args": ["C:\\path\\to\\scrapedo-mcp-server\\dist\\index.js"],
      "env": {
        "SCRAPEDO_API_KEY": "your_api_key_here",
        "LOG_LEVEL": "INFO"
      }
    }
  }
}
```

After updating the configuration, restart Claude Desktop for the changes to take effect.

## 🛠️ Available Tools

### Core Scraping Tools

| Tool | Description | Credit Cost |
|------|-------------|-------------|
| `scrape` | Basic web scraping without JavaScript rendering | 1 credit |
| `scrape_with_js` | Scrape JavaScript-rendered pages with headless browser | 5 credits |
| `scrape_with_proxy` | Use residential/mobile proxies with geographic targeting | 10-25 credits |
| `take_screenshot` | Capture webpage screenshots (full page or specific elements) | 5 credits |
| `scrape_to_markdown` | Convert webpages to markdown format | 1-5 credits |

### Utility Tools

| Tool | Description | Credit Cost |
|------|-------------|-------------|
| `get_usage_stats` | Check remaining credits and API usage | 0 credits |
| `generate_proxy_config` | Generate proxy configuration URLs for external use | 0 credits |

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

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **401 Unauthorized** | Check that your API key is valid and properly set |
| **429 Too Many Requests** | Rate limit exceeded, wait and retry |
| **Insufficient Credits** | Use `get_usage_stats` to check remaining credits |
| **Proxy Connection Failed** | Ensure you have the https-proxy-agent package installed |
| **Tool Not Found** | Restart Claude Desktop after configuration changes |
| **Empty Response** | Check if the site requires JavaScript rendering |
| **Timeout Errors** | Increase timeout or use simpler selectors |

### Debug Mode

Enable debug logging to troubleshoot issues:

```bash
export LOG_LEVEL="DEBUG"
tail -f logs/scrapedo-mcp.log
```

### Getting Help

- 📖 [API Documentation](https://scrape.do/documentation)
- 💬 [GitHub Issues](https://github.com/umutc/scrapedo-mcp-server/issues)
- 📧 [Support](https://scrape.do/contact)

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Scrapedo](https://scrape.do) for providing the web scraping API
- [Anthropic](https://anthropic.com) for the MCP protocol
- The open-source community for various dependencies

---

Made with ❤️ by [umutc](https://github.com/umutc)