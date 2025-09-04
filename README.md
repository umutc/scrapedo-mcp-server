# Scrapedo MCP Server

[![npm version](https://img.shields.io/npm/v/scrapedo-mcp-server)](https://www.npmjs.com/package/scrapedo-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Version](https://img.shields.io/badge/MCP-1.0.0-green)](https://modelcontextprotocol.io)

Enable Claude Desktop to scrape websites using the Scrapedo API. Simple setup, powerful features.

## What is this?

This is an MCP (Model Context Protocol) server that gives Claude Desktop the ability to:
- Scrape any website (with or without JavaScript)
- Take screenshots
- Use proxies from different countries
- Convert web pages to markdown

## Quick Start (2 minutes)

### 1. Get your Scrapedo API key
Sign up at [scrape.do](https://scrape.do) to get your free API key.

### 2. Setup Claude Desktop

Run this command:
```bash
npx scrapedo-mcp-server init
```

That's it! The tool will automatically configure Claude Desktop for you.

### 3. Start using it in Claude

Just ask Claude to scrape any website:
```
"Can you scrape the latest news from https://example.com?"
"Take a screenshot of the Google homepage"
"Get the product prices from this e-commerce site using a US proxy"
```

## Manual Installation Options

<details>
<summary>Install globally with npm</summary>

```bash
npm install -g scrapedo-mcp-server
scrapedo-mcp init
```
</details>

<details>
<summary>Install from source</summary>

```bash
git clone https://github.com/umutc/scrapedo-mcp-server.git
cd scrapedo-mcp-server
npm install
npm run build
```
</details>

<details>
<summary>Manual Claude Desktop configuration</summary>

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "scrapedo": {
      "command": "npx",
      "args": ["scrapedo-mcp-server", "start"],
      "env": {
        "SCRAPEDO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```
</details>

## What Can It Do?

### Basic Web Scraping
```javascript
// Claude can now do this:
scrape("https://example.com")
```

### JavaScript-Rendered Pages
```javascript
// For modern SPAs and dynamic content:
scrape_with_js("https://app.example.com", {
  waitSelector: ".content-loaded"
})
```

### Screenshots
```javascript
// Capture any webpage:
take_screenshot("https://example.com", {
  fullPage: true
})
```

### Use Proxies
```javascript
// Scrape from different locations:
scrape_with_proxy("https://example.com", {
  geoCode: "us"  // Use US proxy
})
```

### Convert to Markdown
```javascript
// Get clean, readable content:
scrape_to_markdown("https://blog.example.com/article")
```

## Project Structure

```
scrapedo-mcp-server/
├── src/              # TypeScript source code
│   ├── index.ts      # MCP server entry point
│   ├── cli.ts        # CLI tool for setup
│   └── tools/        # Scraping tool implementations
├── dist/             # Compiled JavaScript (generated)
├── package.json      # Project configuration
└── README.md         # You are here
```

## API Costs

Scrapedo uses a credit system:
- **Basic scraping**: 1 credit
- **JavaScript rendering**: 5 credits
- **Residential proxy**: 10 credits
- **Residential + JS**: 25 credits

Check your usage anytime by asking Claude: "Check my Scrapedo usage stats"

## Common Use Cases

- **Price Monitoring**: Track product prices across e-commerce sites
- **News Aggregation**: Collect articles from multiple sources
- **Data Research**: Gather public information for analysis
- **Content Migration**: Export content from websites
- **SEO Analysis**: Check how pages render for search engines
- **Competitive Analysis**: Monitor competitor websites

## FAQ

**Q: Do I need to install anything?**  
A: Just Node.js 18+. Everything else is handled by npx.

**Q: How do I update?**  
A: Run `npx scrapedo-mcp-server@latest init` to get the newest version.

**Q: Is this free?**  
A: The MCP server is free. Scrapedo offers a free tier with limited credits.

**Q: Can I use this with other MCP clients?**  
A: Yes! This works with any MCP-compatible client, not just Claude Desktop.

**Q: How do I see debug logs?**  
A: Set `LOG_LEVEL=DEBUG` in your environment or configuration.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Tool not found" | Restart Claude Desktop |
| "401 Unauthorized" | Check your API key is correct |
| "Insufficient credits" | Check usage with `get_usage_stats` |
| "Empty response" | The site might need JavaScript rendering |

## Need Help?

- 📖 [Full API Documentation](./API.md)
- 💬 [Report Issues](https://github.com/umutc/scrapedo-mcp-server/issues)
- 📧 [Scrapedo Support](https://scrape.do/contact)

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](./LICENSE) file

---

Built with ❤️ to make web scraping easy in Claude Desktop