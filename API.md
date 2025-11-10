# API Documentation

## Tool Reference

This document provides detailed information about each tool available in the Scrapedo MCP Server.

## Table of Contents

- [Credit Usage](#credit-usage)
- [Core Scraping Tools](#core-scraping-tools)
  - [scrape](#scrape)
  - [scrape_with_js](#scrape_with_js)
  - [take_screenshot](#take_screenshot)
  - [scrape_to_markdown](#scrape_to_markdown)
- [Utility Tools](#utility-tools)
  - [get_usage_stats](#get_usage_stats)

---

## Credit Usage

| Features | Credits Usage |
|----------|---------------|
| Normal Request (Datacenter) | 1 |
| Datacenter + Headless Browser (JS Render) | 5 |
| Residential & Mobile Request (`super: true`) | 10 |
| Residential & Mobile Request + Headless Browser | 25 |

Set `super: true` together with optional `geoCode`, `regionalGeoCode`, or `sessionId` parameters to run Super requests from residential or mobile pools. Combine `super: true` with the `scrape_with_js` tool to reach the 25-credit tier.

---

## Core Scraping Tools

### scrape

Basic web scraping without JavaScript rendering. Fast and efficient for static content.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| url | string | ✅ | - | The URL to scrape |
| device | string | ❌ | "desktop" | Device type: "desktop", "mobile", "tablet" |
| customHeaders | boolean | ❌ | true | Allow Scrape.do to inject its default headers |
| extraHeaders | boolean | ❌ | false | Forward extra upstream headers to the target |
| forwardHeaders | boolean | ❌ | false | Forward MCP client headers to the target |
| setCookies | string | ❌ | null | Cookies to send (JSON string or cookie header) |
| pureCookies | boolean | ❌ | false | Return cookies exactly as sent by the target |
| super | boolean | ❌ | false | Enable residential & mobile proxy network ("Super" requests) |
| geoCode | string | ❌ | null | Country code for geo-targeting (defaults to "us" when `super: true` and no region provided) |
| regionalGeoCode | string | ❌ | null | Regional pool hint (europe, asia, africa, oceania, northamerica, southamerica) |
| sessionId | number | ❌ | null | Sticky session ID (0-1000000) |
| disableRedirection | boolean | ❌ | false | Disable automatic redirects |
| timeout | number | ❌ | 30000 | Request timeout in milliseconds |
| retryTimeout | number | ❌ | 10000 | Retry timeout window (5000-55000 ms) |
| disableRetry | boolean | ❌ | false | Disable Scrape.do retry logic |
| blockResources | boolean | ❌ | false | Block images, fonts, CSS to speed up responses |
| blockAds | boolean | ❌ | false | Block advertisements |
| callback | string | ❌ | null | URL-encoded webhook for asynchronous delivery |
| output | string | ❌ | "raw" | Output mode: "raw" (HTML/text) or "markdown" |
| transparentResponse | boolean | ❌ | false | Return target response unmodified |
| returnJSON | boolean | ❌ | false | Return Scrape.do JSON (required for screenshots/frames) |
| showFrames | boolean | ❌ | false | Include iframe/frame metadata (needs `returnJSON`) |
| showWebsocketRequests | boolean | ❌ | false | Include websocket request/response log (needs `returnJSON`) |
| playWithBrowser | string | ❌ | null | JSON-encoded action list for Play-with-Browser automation |
| screenShot | boolean | ❌ | false | Capture viewport screenshot (forces `render` + `returnJSON`) |
| fullScreenShot | boolean | ❌ | false | Capture full-page screenshot (mutually exclusive with others) |
| particularScreenShot | string | ❌ | null | Capture selector screenshot (selector must be URL-encoded) |

**Example:**
```javascript
{
  "tool": "scrape",
  "arguments": {
    "url": "https://example.com",
    "device": "mobile",
    "super": true,
    "geoCode": "us",
    "customHeaders": true
  }
}
```

**Response:**
```javascript
{
  "url": "https://example.com",
  "status": 200,
  "headers": { /* response headers */ },
  "data": "<html>...</html>",
  "costCredits": 1,
  "remainingCredits": 99999
}
```

> **Screenshot rules:** enable at most one of `screenShot`, `fullScreenShot`, or `particularScreenShot`. The MCP server will automatically force `render=true`, `returnJSON=true`, and `blockResources=false` whenever a screenshot flag is set.
>
> **Play-with-Browser:** pass a JSON-encoded array (or DSL string) in `playWithBrowser`. Screenshot flags cannot be combined with Play-with-Browser actions per Scrape.do limitations.
>
> **Callbacks:** when `callback` is provided, Scrape.do returns immediately over MCP and later POSTs the final payload to the supplied webhook URL.

---

### scrape_with_js

Scrape JavaScript-rendered pages using a headless browser. Essential for modern SPAs and dynamic content.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| url | string | ✅ | - | The URL to scrape |
| device | string | ❌ | "desktop" | Device type: "desktop", "mobile", "tablet" |
| width | number | ❌ | 1920 | Viewport width |
| height | number | ❌ | 1080 | Viewport height |
| waitUntil | string | ❌ | "load" | Wait condition: "load", "domcontentloaded", "networkidle0", "networkidle2" |
| waitSelector | string | ❌ | null | CSS selector to wait for |
| timeout | number | ❌ | 30000 | Maximum wait time in milliseconds |
| blockResources | boolean | ❌ | false | Block images, CSS, fonts |
| blockAds | boolean | ❌ | true | Block advertisements |
| customHeaders | boolean | ❌ | true | Allow Scrape.do to inject default headers |
| extraHeaders | boolean | ❌ | false | Forward extra upstream headers |
| forwardHeaders | boolean | ❌ | false | Forward MCP client headers to target |
| setCookies | string | ❌ | null | Cookies to send (JSON string or cookie header) |
| pureCookies | boolean | ❌ | false | Return cookies exactly as sent by the target |
| super | boolean | ❌ | false | Enable residential & mobile proxy network ("Super" requests) |
| geoCode | string | ❌ | null | Country code for Super requests (defaults to "us" when unspecified) |
| regionalGeoCode | string | ❌ | null | Regional pool hint (europe, asia, africa, oceania, northamerica, southamerica) |
| sessionId | number | ❌ | null | Sticky session ID (0-1000000) |
| callback | string | ❌ | null | URL-encoded webhook for async delivery |
| transparentResponse | boolean | ❌ | false | Return origin response unmodified |
| returnJSON | boolean | ❌ | false | Return Scrape.do JSON payload (required for screenshots/frames) |
| showFrames | boolean | ❌ | false | Include iframe/frame metadata (requires JSON) |
| showWebsocketRequests | boolean | ❌ | false | Include websocket request log (requires JSON) |
| playWithBrowser | string | ❌ | null | JSON-encoded Play-with-Browser action list |
| screenShot | boolean | ❌ | false | Capture viewport screenshot |
| fullScreenShot | boolean | ❌ | false | Capture full-page screenshot |
| particularScreenShot | string | ❌ | null | Capture element screenshot (URL-encoded selector) |
| extractRules | object | ❌ | null | CSS/XPath extraction rules |
| executeJs | string | ❌ | null | JavaScript code to execute |
| retryCount | number | ❌ | 3 | Number of retry attempts |

**Example:**
```javascript
{
  "tool": "scrape_with_js",
  "arguments": {
    "url": "https://example.com",
    "super": true,
    "geoCode": "de",
    "waitSelector": ".content-loaded",
    "waitUntil": "networkidle0",
    "blockResources": true,
    "scrollToBottom": true,
    "extractRules": {
      "title": "h1",
      "price": ".price-tag"
    }
  }
}
```

**Response:**
```javascript
{
  "url": "https://example.com",
  "status": 200,
  "data": "<html>...</html>",
  "extractedData": {
    "title": "Product Name",
    "price": "$99.99"
  },
  "costCredits": 5,
  "remainingCredits": 99994
}
```

> Screenshots enforce `render=true`, `returnJSON=true`, and `blockResources=false`. Combine at most one of the screenshot flags with `playWithBrowser` disabled.

---

### take_screenshot

Capture screenshots of webpages, either full page or specific elements.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| url | string | ✅ | - | The URL to screenshot |
| super | boolean | ❌ | false | Use residential & mobile proxy network |
| geoCode | string | ❌ | null | Country code (defaults to "us" for Super requests) |
| regionalGeoCode | string | ❌ | null | Regional pool hint |
| sessionId | number | ❌ | null | Sticky session ID (0-1000000) |
| customHeaders | boolean | ❌ | true | Allow Scrape.do to inject default headers |
| extraHeaders | boolean | ❌ | false | Forward extra upstream headers |
| forwardHeaders | boolean | ❌ | false | Forward MCP client headers to the target |
| setCookies | string | ❌ | null | Cookies to send (JSON string or cookie header) |
| pureCookies | boolean | ❌ | false | Return cookies exactly as sent by the target |
| fullPage | boolean | ❌ | false | Capture full page |
| selector | string | ❌ | null | CSS selector for specific element |
| device | string | ❌ | "desktop" | Device type |
| width | number | ❌ | 1920 | Viewport width |
| height | number | ❌ | 1080 | Viewport height |
| waitUntil | string | ❌ | "load" | Wait condition |
| waitSelector | string | ❌ | null | Wait for specific element |
| customWait | number | ❌ | null | Additional wait time before capture |
| blockAds | boolean | ❌ | true | Block advertisements |
| timeout | number | ❌ | 30000 | Maximum wait time |
| retryTimeout | number | ❌ | 10000 | Retry timeout window |
| disableRetry | boolean | ❌ | false | Disable Scrape.do retry logic |
| disableRedirection | boolean | ❌ | false | Disable automatic redirects |
| callback | string | ❌ | null | URL-encoded webhook for async delivery |

> Choose either `fullPage` or `selector` (not both). Screenshot requests automatically set `render=true`, `returnJSON=true`, and `blockResources=false`.

**Example:**
```javascript
{
  "tool": "take_screenshot",
  "arguments": {
    "url": "https://example.com",
    "fullPage": true,
    "device": "mobile",
    "waitSelector": ".main-content"
  }
}
```

**Response:**
```javascript
{
  "url": "https://example.com",
  "screenshotUrl": "https://api.scrape.do/screenshot/abc123.png",
  "fullPage": true,
  "dimensions": {
    "width": 375,
    "height": 2400
  },
  "costCredits": 5,
  "remainingCredits": 99964
}
```

---

### scrape_to_markdown

Convert webpage content to clean, formatted markdown. Perfect for content extraction and analysis.

**Parameters:**  
Inherits every option from [`scrape`](#scrape) (headers, proxies, callbacks, screenshots, Play-with-Browser, etc.) plus the following markdown-specific toggles:

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| url | string | ✅ | - | The URL to convert |
| render | boolean | ❌ | false | Enable JavaScript rendering before conversion |

**Example:**
```javascript
{
  "tool": "scrape_to_markdown",
  "arguments": {
    "url": "https://example.com/article",
    "render": true,
    "includeImages": false
  }
}
```

**Response:**
```javascript
{
  "url": "https://example.com/article",
  "markdown": "# Article Title\n\nContent in markdown format...",
  "wordCount": 1234,
  "costCredits": 1,
  "remainingCredits": 99963
}
```

---

## Utility Tools

### get_usage_stats

Check your current API usage and remaining credits. No cost for this operation.

**Parameters:**
None required.

**Example:**
```javascript
{
  "tool": "get_usage_stats",
  "arguments": {}
}
```

**Response:**
```javascript
{
  "remainingCredits": 99963,
  "monthlyLimit": 100000,
  "usedCredits": 37,
  "percentageUsed": 0.037,
  "resetDate": "2025-02-01T00:00:00Z"
}
```

---

## Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 401 | Unauthorized | Check API key |
| 402 | Insufficient credits | Purchase more credits |
| 403 | Forbidden | Check domain permissions |
| 404 | Not found | Verify URL |
| 429 | Rate limited | Implement backoff |
| 500 | Server error | Retry with exponential backoff |
| 503 | Service unavailable | Wait and retry |

### Retry Strategy

The server implements automatic retry with exponential backoff:
1. First retry: 1 second delay
2. Second retry: 2 seconds delay
3. Third retry: 4 seconds delay

You can customize retry behavior using the `retryCount` parameter.

---

## Best Practices

### Performance Optimization
1. **Use appropriate tools**: Don't use JavaScript rendering if not needed
2. **Block unnecessary resources**: Use `blockResources` to speed up rendering
3. **Set reasonable timeouts**: Balance between reliability and speed
4. **Use selectors wisely**: Specific selectors reduce processing time

### Reliability
1. **Always handle errors**: Implement proper error handling in your code
2. **Use retry logic**: The server has built-in retry, but implement your own as well
3. **Monitor usage**: Regularly check credits with `get_usage_stats`
4. **Test thoroughly**: Test with different scenarios and edge cases

### Security
1. **Protect your API key**: Never expose it in client-side code
2. **Use environment variables**: Store sensitive data securely
3. **Validate inputs**: Always validate URLs and parameters
4. **Review logs**: Check logs regularly for suspicious activity

---

## Rate Limits

- **Requests per second**: 10 (burst up to 20)
- **Concurrent requests**: 5
- **Daily request limit**: Based on your plan
- **Monthly credit limit**: Based on your plan

The server implements automatic rate limiting and will queue requests if limits are exceeded.

---

## Support

For additional help:
- 📖 [Scrapedo Documentation](https://scrape.do/documentation)
- 💬 [GitHub Issues](https://github.com/umutc/scrapedo-mcp-server/issues)
- 📧 [Contact Support](https://scrape.do/contact)
