# API Documentation

## Tool Reference

This document provides detailed information about each tool available in the Scrapedo MCP Server.

## Table of Contents

- [Core Scraping Tools](#core-scraping-tools)
  - [scrape](#scrape)
  - [scrape_with_js](#scrape_with_js)
  - [scrape_with_proxy](#scrape_with_proxy)
  - [take_screenshot](#take_screenshot)
  - [scrape_to_markdown](#scrape_to_markdown)
- [Utility Tools](#utility-tools)
  - [get_usage_stats](#get_usage_stats)
  - [generate_proxy_config](#generate_proxy_config)

---

## Core Scraping Tools

### scrape

Basic web scraping without JavaScript rendering. Fast and efficient for static content.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| url | string | ✅ | - | The URL to scrape |
| device | string | ❌ | "desktop" | Device type: "desktop", "mobile", "tablet" |
| customHeaders | object | ❌ | {} | Custom HTTP headers |
| cookies | array | ❌ | [] | Cookie objects with name, value, domain |
| geoCode | string | ❌ | null | Country code for geo-targeting |
| disableRedirect | boolean | ❌ | false | Disable automatic redirects |
| timeout | number | ❌ | 30000 | Request timeout in milliseconds |
| retryCount | number | ❌ | 3 | Number of retry attempts |

**Example:**
```javascript
{
  "tool": "scrape",
  "arguments": {
    "url": "https://example.com",
    "device": "mobile",
    "customHeaders": {
      "Accept-Language": "en-US"
    }
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
| scrollToBottom | boolean | ❌ | false | Auto-scroll to page bottom |
| javascriptEnabled | boolean | ❌ | true | Enable JavaScript execution |
| cookies | array | ❌ | [] | Browser cookies |
| customHeaders | object | ❌ | {} | Custom HTTP headers |
| extractRules | object | ❌ | null | CSS/XPath extraction rules |
| executeJs | string | ❌ | null | JavaScript code to execute |
| retryCount | number | ❌ | 3 | Number of retry attempts |

**Example:**
```javascript
{
  "tool": "scrape_with_js",
  "arguments": {
    "url": "https://example.com",
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

---

### scrape_with_proxy

Scrape using residential or mobile proxies with geographic targeting. Ideal for accessing geo-restricted content.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| url | string | ✅ | - | The URL to scrape |
| geoCode | string | ❌ | null | Country code (e.g., "us", "gb", "de") |
| regionalGeoCode | string | ❌ | null | City or region code |
| sessionId | number | ❌ | null | Session ID for sticky sessions |
| render | boolean | ❌ | false | Enable JavaScript rendering |
| device | string | ❌ | "desktop" | Device type |
| customHeaders | object | ❌ | {} | Custom HTTP headers |
| timeout | number | ❌ | 30000 | Request timeout |
| retryCount | number | ❌ | 3 | Number of retry attempts |

**Example:**
```javascript
{
  "tool": "scrape_with_proxy",
  "arguments": {
    "url": "https://example.com",
    "geoCode": "us",
    "regionalGeoCode": "ny",
    "sessionId": 123456,
    "render": true
  }
}
```

**Response:**
```javascript
{
  "url": "https://example.com",
  "status": 200,
  "data": "<html>...</html>",
  "proxyUsed": "residential",
  "location": "United States, New York",
  "costCredits": 25,
  "remainingCredits": 99969
}
```

---

### take_screenshot

Capture screenshots of webpages, either full page or specific elements.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| url | string | ✅ | - | The URL to screenshot |
| fullPage | boolean | ❌ | false | Capture full page |
| selector | string | ❌ | null | CSS selector for specific element |
| device | string | ❌ | "desktop" | Device type |
| width | number | ❌ | 1920 | Viewport width |
| height | number | ❌ | 1080 | Viewport height |
| waitUntil | string | ❌ | "load" | Wait condition |
| waitSelector | string | ❌ | null | Wait for specific element |
| blockAds | boolean | ❌ | true | Block advertisements |
| timeout | number | ❌ | 30000 | Maximum wait time |
| retryCount | number | ❌ | 3 | Number of retry attempts |

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
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| url | string | ✅ | - | The URL to convert |
| render | boolean | ❌ | false | Use JavaScript rendering |
| includeImages | boolean | ❌ | true | Include image references |
| includeLinks | boolean | ❌ | true | Include hyperlinks |
| device | string | ❌ | "desktop" | Device type |
| timeout | number | ❌ | 30000 | Request timeout |
| retryCount | number | ❌ | 3 | Number of retry attempts |

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

### generate_proxy_config

Generate proxy configuration URLs for use with external tools and libraries.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| geoCode | string | ❌ | null | Country code for proxy location |
| sessionId | number | ❌ | null | Session ID for sticky sessions |
| format | string | ❌ | "url" | Output format: "url", "curl", "python" |

**Example:**
```javascript
{
  "tool": "generate_proxy_config",
  "arguments": {
    "geoCode": "us",
    "sessionId": 789,
    "format": "curl"
  }
}
```

**Response:**
```javascript
{
  "proxyUrl": "http://token:render=false&geoCode=us&sessionId=789@proxy.scrape.do:8080",
  "curlCommand": "curl -x 'http://token:...' 'https://target.com'",
  "configuration": {
    "host": "proxy.scrape.do",
    "port": 8080,
    "auth": "token:render=false&geoCode=us&sessionId=789"
  }
}
```

---

## Credit Costs

### Base Costs
- **Basic HTTP request**: 1 credit
- **JavaScript rendering**: +4 credits (5 total)
- **Residential/Mobile proxy**: +9 credits (10 total)
- **Residential/Mobile + JavaScript**: 25 credits

### Special Domains
Some domains have minimum credit requirements:
- **Google domains**: Minimum 10 credits
- **LinkedIn**: Minimum 30 credits
- **Instagram**: Minimum 25 credits
- **Facebook**: Minimum 25 credits

### Cost Optimization Tips
1. Use basic scraping when JavaScript isn't needed
2. Enable `blockResources` to reduce rendering time and costs
3. Use specific selectors instead of full page content
4. Cache results when possible
5. Batch similar requests to reuse sessions

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