# Scrapedo MCP Server - Complete Agentic Implementation Plan

## Overview
This document provides a comprehensive implementation plan for building a Scrapedo MCP server that exposes ALL features documented at https://scrape.do/documentation/. The plan is designed for concurrent development by multiple AI agents.

## Project Structure

```
scrapedo-mcp-server/
├── package.json              # Node.js project configuration
├── tsconfig.json            # TypeScript configuration
├── README.md               # Setup and usage documentation
├── .env.example            # Example: SCRAPEDO_API_TOKEN=your_token_here
├── .gitignore             # Ignore node_modules, .env, dist/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── config.ts          # Configuration management
│   ├── types/
│   │   ├── scrapedo.ts    # All Scrapedo parameter types
│   │   ├── responses.ts   # Response type definitions
│   │   └── browser.ts     # Browser automation types
│   ├── tools/
│   │   ├── scraping/
│   │   │   ├── basic.ts           # Basic GET/POST scraping
│   │   │   ├── browser-render.ts  # JS rendering with browser
│   │   │   ├── proxy-super.ts     # Residential/Mobile proxy
│   │   │   └── geolocation.ts     # Geographic targeting
│   │   ├── browser/
│   │   │   ├── automate.ts        # playWithBrowser actions
│   │   │   ├── screenshot.ts      # Screenshot capture
│   │   │   └── viewport.ts        # Viewport control
│   │   ├── headers/
│   │   │   ├── custom-headers.ts  # Header management
│   │   │   ├── cookies.ts         # Cookie management
│   │   │   └── forward-headers.ts # Header forwarding
│   │   ├── advanced/
│   │   │   ├── webhook.ts         # Callback/webhook scraping
│   │   │   ├── session.ts         # Session management
│   │   │   ├── batch.ts           # Batch URL processing
│   │   │   └── output-format.ts   # Output format control
│   │   └── utility/
│   │       ├── usage-stats.ts     # API usage statistics
│   │       └── extract-data.ts    # Data extraction helpers
│   ├── services/
│   │   ├── scrapedo-client.ts     # Main API client
│   │   ├── api-mode.ts            # Direct API implementation
│   │   ├── proxy-mode.ts          # Proxy mode implementation
│   │   └── request-builder.ts     # Request construction
│   ├── utils/
│   │   ├── validation.ts          # Parameter validation
│   │   ├── url-encoder.ts         # URL encoding utilities
│   │   ├── errors.ts              # Error handling
│   │   ├── rate-limiter.ts        # Rate limit management
│   │   └── credit-calculator.ts   # Credit cost calculation
│   └── constants/
│       ├── parameters.ts          # Parameter constants
│       ├── geo-codes.ts           # Geographic codes
│       └── status-codes.ts        # Status code mappings
├── tests/
│   ├── unit/                      # Unit tests for each module
│   ├── integration/               # Integration tests
│   └── mocks/                     # Mock responses
└── examples/
    ├── basic-scraping.js          # Simple examples
    ├── browser-automation.js      # Complex automation
    ├── geo-targeting.js           # Geographic examples
    └── batch-processing.js        # Batch operations
```

## Parallel Development Tracks for AI Agents

### Track 1: Core Infrastructure & Types
**Agent: infrastructure-agent**

#### Responsibilities
1. **Package Setup** (`package.json`, `tsconfig.json`)
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "axios": "^1.6.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  }
}
```

2. **Type Definitions** (`src/types/scrapedo.ts`)
```typescript
interface ScrapedoBaseParams {
  token: string;
  url: string;
}

interface ScrapedoProxyParams {
  super?: boolean;
  geoCode?: GeoCode;
  regionalGeoCode?: RegionalCode;
  sessionId?: number; // 0..1_000_000, auto-closes after 5 minutes idle
}

interface ScrapedoHeaderParams {
  customHeaders?: boolean;
  extraHeaders?: boolean;
  forwardHeaders?: boolean;
  setCookies?: string;
  pureCookies?: boolean;
}

interface ScrapedoBrowserParams {
  device?: 'desktop' | 'mobile' | 'tablet';
  render?: boolean;
  waitUntil?: 'domcontentloaded' | 'networkidle0' | 'networkidle2' | 'load';
  customWait?: number;
  waitSelector?: string;
  width?: number;  // default: 1920
  height?: number; // default: 1080
  blockResources?: boolean; // default: true
  blockAds?: boolean; // default: false
}

interface ScrapedoScreenshotParams {
  screenShot?: boolean;
  fullScreenShot?: boolean;
  particularScreenShot?: string;
}

interface ScrapedoControlParams {
  disableRedirection?: boolean;
  callback?: string;
  timeout?: number; // 5000-120000, default: 60000
  retryTimeout?: number; // 5000-55000, default: 15000
  disableRetry?: boolean;
}

interface ScrapedoOutputParams {
  output?: 'raw' | 'markdown';
  transparentResponse?: boolean;
  returnJSON?: boolean;
  showFrames?: boolean; // requires render=true
  showWebsocketRequests?: boolean; // requires render=true
}

type BrowserAction = 
  | { Action: 'Click'; Selector: string }
  | { Action: 'Wait'; Timeout: number }
  | { Action: 'WaitSelector'; WaitSelector: string; Timeout?: number }
  | { Action: 'ScrollX'; Value: number }
  | { Action: 'ScrollY'; Value: number }
  | { Action: 'ScrollTo'; Selector: string }
  | { Action: 'Execute'; Execute: string }
  | { Action: 'WaitForRequestCompletion'; UrlPattern: string; Timeout?: number };

interface PlayWithBrowserParams {
  playWithBrowser: string | BrowserAction[];
}
```

2b. **Response Shapes** (`src/types/responses.ts`)
```typescript
export interface ResponseMetadata {
  requestedUrl: string;
  finalUrl?: string;
  redirected?: boolean;
  creditsEstimated?: number;
  creditsBilled?: number;
  proxyType?: 'datacenter' | 'residential' | 'mobile';
  geo?: string; // geoCode or regionalGeoCode
  timingMs?: number;
}

export interface ScrapedoResponse {
  statusCode: number;
  headers: Record<string, string>;
  contentType?: string;
  // Use exactly one of the following depending on response
  bodyText?: string;              // text/html, application/json, markdown
  bodyBinaryBase64?: string;      // images/screenshots
  networkJSON?: any;              // when returnJSON=true
  metadata?: ResponseMetadata;
}

export interface ScreenshotResult {
  imageBase64: string;
  format: 'png' | 'jpeg';
  fullPage?: boolean;
  selector?: string;
}

export interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  startedAt?: string; // ISO time
  endedAt?: string;   // ISO time
  bodySize?: number;
}
```

3. **Configuration** (`src/config.ts`)
```typescript
export const config = {
  apiToken: process.env.SCRAPEDO_API_TOKEN || '',
  apiUrl: 'https://api.scrape.do',
  proxyUrl: 'proxy.scrape.do',
  proxyPort: 8080,
  statsUrl: 'https://api.scrape.do/info',
  defaultTimeout: 60000,
  maxRetries: 3
};
```

Note: Pin library versions before implementation to avoid breaking changes (avoid `latest`).

---

### Track 2: Scrapedo Client Services
**Agent: client-services-agent**

#### Module: Core Client (`src/services/scrapedo-client.ts`)
```typescript
class ScrapedoClient {
  // API Mode
  async scrapeAPI(params: ScrapedoParams): Promise<ScrapedoResponse>;
  
  // Proxy Mode
  async scrapeProxy(params: ScrapedoParams): Promise<ScrapedoResponse>;
  
  // Usage Statistics
  async getUsageStats(): Promise<UsageStats>;
  
  // Credit Calculation
  calculateCredits(params: ScrapedoParams): number;
  
  // Request Building
  private buildAPIRequest(params: ScrapedoParams): AxiosRequestConfig;
  private buildProxyRequest(params: ScrapedoParams): AxiosRequestConfig;
  
  // Response Processing
  private processResponse(response: AxiosResponse): ScrapedoResponse;
  private extractMetadata(headers: Record<string, string>): ResponseMetadata;
}
```

#### MCP Tool Output Envelope
All tools return a consistent envelope for easy consumption by MCP clients.
```typescript
type ToolSuccess = { ok: true; result: ScrapedoResponse };
type ToolFailure = { ok: false; error: { message: string; statusCode?: number; type?: string } };
export type ToolResult = ToolSuccess | ToolFailure;
```

Transparent response handling:
- When `transparentResponse=true`, do not interpret or transform status codes or bodies; pass through the target response. Credits may still be consumed for certain non-2xx (e.g., 404). Include raw headers where possible.

Proxy Mode note (agent setup example):
```typescript
// Build `password` part from parameters, e.g. 'render=true&waitUntil=domcontentloaded'
const paramStr = new URLSearchParams(proxyParams).toString();
const proxyAuth = `${token}:${paramStr}`;
const proxyUrl = `http://${proxyAuth}@${config.proxyUrl}:${config.proxyPort}`;

// With http(s)-proxy-agent (or similar)
const httpsAgent = new (require('https-proxy-agent'))(proxyUrl);
const req: AxiosRequestConfig = { url, method: 'GET', httpsAgent, proxy: false };
```

#### Credit Cost Logic
```typescript
function calculateCredits(params: ScrapedoParams): number {
  const domain = extractDomain(params.url);
  // Explicit branching to match Scrape.do pricing exactly
  // Datacenter: 1, Datacenter+Browser: 5, Residential/Mobile: 10, Residential/Mobile+Browser: 25
  let credits: number;
  if (params.super && params.render) credits = 25;
  else if (params.super) credits = 10;
  else if (params.render) credits = 5;
  else credits = 1;
  
  // Special domain pricing
  if (domain.includes('google.')) credits = Math.max(credits, 10);
  if (domain.includes('linkedin.com')) credits = Math.max(credits, 30);
  // ... other special domains
  
  return credits;
}
```

---

### Track 3: Basic Scraping Tools
**Agent: basic-scraping-agent**

#### Tool: scrape
**File**: `src/tools/scraping/basic.ts`
```typescript
{
  name: 'scrape',
  description: 'Basic web scraping without JavaScript rendering',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL to scrape' },
      method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'] },
      body: { type: 'string', description: 'Request body for POST/PUT' },
      headers: { type: 'object', description: 'Custom headers' },
      timeout: { type: 'number', minimum: 5000, maximum: 120000 },
      device: { type: 'string', enum: ['desktop', 'mobile', 'tablet'] },
      disableRetry: { type: 'boolean' }
    },
    required: ['url']
  }
}
```

#### Tool: scrape_with_js
**File**: `src/tools/scraping/browser-render.ts`
```typescript
{
  name: 'scrape_with_js',
  description: 'Scrape JavaScript-rendered pages using headless browser',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      waitUntil: { type: 'string', enum: ['domcontentloaded', 'networkidle0', 'networkidle2', 'load'] },
      waitSelector: { type: 'string', description: 'CSS selector to wait for' },
      customWait: { type: 'number', description: 'Additional wait time in ms' },
      blockResources: { type: 'boolean', default: true },
      width: { type: 'number', default: 1920 },
      height: { type: 'number', default: 1080 }
    },
    required: ['url']
  }
}
```

---

### Track 4: Browser Automation Tools
**Agent: browser-automation-agent**

#### Tool: browser_automate
**File**: `src/tools/browser/automate.ts`
```typescript
{
  name: 'browser_automate',
  description: 'Automate browser actions like click, type, scroll',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      actions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['click', 'type', 'wait', 'scroll', 'execute'] },
            selector: { type: 'string' },
            value: { type: ['string', 'number'] },
            timeout: { type: 'number' }
          }
        }
      }
    },
    required: ['url', 'actions']
  }
}
```

Implementation converts user-friendly actions to Scrapedo's playWithBrowser format:
```typescript
function convertActions(actions: UserAction[]): BrowserAction[] {
  const toJSString = (s: string) => JSON.stringify(String(s));
  return actions.flatMap(action => {
    switch(action.action) {
      case 'click':
        return { Action: 'Click', Selector: action.selector };
      case 'type': {
        const selector = toJSString(action.selector);
        const value = toJSString(String(action.value ?? ''));
        return [
          { Action: 'Click', Selector: action.selector },
          { Action: 'Execute', Execute: `(() => { const el = document.querySelector(${selector}); if (!el) return; el.focus(); el.value = ${value}; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); })();` }
        ];
      }
      case 'wait':
        return { Action: 'Wait', Timeout: action.timeout };
      case 'scroll':
        return { Action: 'ScrollY', Value: Number(action.value) };
      // ... more conversions
    }
  });
}
```

#### Tool: take_screenshot
**File**: `src/tools/browser/screenshot.ts`
```typescript
{
  name: 'take_screenshot',
  description: 'Capture webpage screenshots',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      fullPage: { type: 'boolean', description: 'Capture full page' },
      selector: { type: 'string', description: 'Specific element to capture' },
      // Scrape.do requires both of these for any screenshot feature
      render: { type: 'boolean', const: true },
      returnJSON: { type: 'boolean', const: true },
      viewport: {
        type: 'object',
        properties: {
          width: { type: 'number' },
          height: { type: 'number' }
        }
      }
    },
    required: ['url']
  }
}
// Handler must coerce `blockResources=false` for correctness per Scrape.do docs.
```

---

### Track 5: Proxy & Geographic Tools
**Agent: proxy-geo-agent**

#### Proxy parameters in core tools
**Status**: Complete

Residential & mobile proxy controls (`super`, `geoCode`, `regionalGeoCode`, `sessionId`) now live directly on the standard `scrape` and `scrape_with_js` tools so clients can request Super traffic without a separate MCP tool. This keeps the surface area small while still advertising the parameters via the shared JSON schema.

#### Advanced scrape controls (headers/screenshots/callbacks)
**Status**: Complete

Tool schemas now surface Scrape.do’s advanced flags: header/cookie toggles (`customHeaders`, `extraHeaders`, `forwardHeaders`, `setCookies`, `pureCookies`), asynchronous `callback` delivery, Play-with-Browser scripts, screenshot modes (`screenShot`, `fullScreenShot`, `particularScreenShot`), and JSON/transparent output selectors. MCP validates the documented constraints (single screenshot flag, no screenshot + Play-with-Browser, screenshot prerequisite flags) before requests leave the server.

#### Tool: scrape_with_location
**File**: `src/tools/scraping/geolocation.ts`
```typescript
{
  name: 'scrape_with_location',
  description: 'Scrape from specific geographic locations',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      geoCode: { type: 'string', description: 'Country code (us, uk, etc.)' },
      regionalGeoCode: { 
        type: 'string',
        enum: ['europe', 'asia', 'africa', 'oceania', 'northamerica', 'southamerica']
      }
    },
    oneOf: [
      { required: ['url', 'geoCode'] },
      { required: ['url', 'regionalGeoCode'] }
    ]
  }
}
```

---

### Track 6: Header & Cookie Management Tools
**Agent: headers-cookies-agent**

#### Tool: scrape_with_headers
**File**: `src/tools/headers/custom-headers.ts`
```typescript
{
  name: 'scrape_with_headers',
  description: 'Scrape with custom headers and user agent',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      headers: { type: 'object', description: 'Custom headers to send' },
      userAgent: { type: 'string' },
      customHeaders: { type: 'boolean', default: false },
      extraHeaders: { type: 'boolean', default: false },
      forwardHeaders: { type: 'boolean', default: false }
    },
    required: ['url', 'headers']
  }
}
```

#### Tool: scrape_with_cookies
**File**: `src/tools/headers/cookies.ts`
```typescript
{
  name: 'scrape_with_cookies',
  description: 'Scrape with specific cookies',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      cookies: { 
        type: 'object',
        description: 'Cookies as key-value pairs'
      },
      pureCookies: { type: 'boolean', description: 'Return original Set-Cookie headers' }
    },
    required: ['url', 'cookies']
  }
}
```

---

### Track 7: Advanced Features Tools
**Agent: advanced-features-agent**

#### Tool: scrape_async
**File**: `src/tools/advanced/webhook.ts`
```typescript
{
  name: 'scrape_async',
  description: 'Asynchronous scraping with webhook callback',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      callbackUrl: { type: 'string', description: 'Webhook URL for results' },
      options: { type: 'object', description: 'Additional scraping parameters' }
    },
    required: ['url', 'callbackUrl']
  }
}
```

#### Tool: scrape_batch
**File**: `src/tools/advanced/batch.ts`
```typescript
{
  name: 'scrape_batch',
  description: 'Scrape multiple URLs concurrently',
  inputSchema: {
    type: 'object',
    properties: {
      urls: { 
        type: 'array',
        items: { type: 'string' },
        description: 'List of URLs to scrape'
      },
      concurrency: { type: 'number', default: 5, maximum: 40 },
      options: { type: 'object', description: 'Common parameters for all requests' }
    },
    required: ['urls']
  }
}
```

#### Tool: scrape_with_session
**File**: `src/tools/advanced/session.ts`
```typescript
{
  name: 'scrape_with_session',
  description: 'Maintain session across multiple requests',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      sessionId: { type: 'number', description: 'Session ID for sticky session' },
      createNew: { type: 'boolean', description: 'Create new session' }
    },
    required: ['url']
  }
}
```

---

### Track 8: Output & Data Tools
**Agent: output-data-agent**

#### Tool: scrape_to_markdown
**File**: `src/tools/advanced/output-format.ts`
```typescript
{
  name: 'scrape_to_markdown',
  description: 'Scrape and convert to markdown format',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      includeLinks: { type: 'boolean' },
      includeImages: { type: 'boolean' }
    },
    required: ['url']
  }
}
```

#### Tool: scrape_network_data
**File**: `src/tools/advanced/network-data.ts`
```typescript
{
  name: 'scrape_network_data',
  description: 'Get all network requests made by page',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string' },
      includeFrames: { type: 'boolean', description: 'Include iframe content' },
      includeWebsockets: { type: 'boolean', description: 'Include WebSocket data' }
    },
    required: ['url']
  }
}
```

---

### Track 9: Utility Tools
**Agent: utility-tools-agent**

#### Tool: get_usage_stats
**File**: `src/tools/utility/usage-stats.ts`
```typescript
{
  name: 'get_usage_stats',
  description: 'Get API usage statistics and remaining credits',
  inputSchema: {
    type: 'object',
    properties: {}
  }
}
```

Implementation:
```typescript
async function handler(): Promise<UsageStats> {
  const response = await axios.get(`${config.statsUrl}/?token=${config.apiToken}`);
  return {
    remainingCredits: response.data.remaining_credits,
    usedCredits: response.data.used_credits,
    concurrencyLimit: response.data.concurrency_limit,
    requestsToday: response.data.requests_today
  };
}
```

#### Tool: generate_proxy_config
**File**: `src/tools/utility/generate-proxy-config.ts`
> _Update_: The standalone `generate_proxy_config` helper has been removed. Proxy-mode URLs are no longer exposed over MCP since clients can hit the Scrape.do API directly with `super` parameters. This simplifies maintenance and keeps credentials within the standard scraping tools.

---

### Track 10: Error Handling & Utilities
**Agent: error-utilities-agent**

#### Module: Error Handler (`src/utils/errors.ts`)
```typescript
class ScrapedoError extends Error {
  constructor(
    public statusCode: number,
    public errorType: 'rate_limit' | 'auth' | 'timeout' | 'client_canceled' | 'target_error' | 'unknown',
    public consumedCredits: boolean,
    public retryable: boolean,
    public details?: any
  ) {
    super(getErrorMessage(statusCode));
  }
}

function handleScrapedoError(error: AxiosError): never {
  const status = error.response?.status;
  const retryAfter = error.response?.headers?.['retry-after'];
  
  switch(status) {
    case 429:
      throw new ScrapedoError(429, 'rate_limit', false, true, { retryAfter });
    case 401:
      throw new ScrapedoError(401, 'auth', false, false);
    case 404:
      // Target not found consumes credits; not retryable
      throw new ScrapedoError(404, 'target_error', true, false);
    case 400:
      // Check if Scrape.do error or target error
      const isScrapedoError = error.response?.data?.includes('Scrape.do');
      throw new ScrapedoError(400, 'target_error', !isScrapedoError, false);
    case 502:
      throw new ScrapedoError(502, 'unknown', false, true);
    case 510:
      throw new ScrapedoError(510, 'client_canceled', false, false);
    default:
      throw new ScrapedoError(status || 500, 'unknown', true, false);
  }
}

// Note: transport-level timeouts (e.g., ECONNABORTED) should be mapped by caller to:
// throw new ScrapedoError(0, 'timeout', false, true)
```

#### Module: Rate Limiter (`src/utils/rate-limiter.ts`)
```typescript
class RateLimiter {
  private requests: number = 0;
  private resetTime: number = Date.now() + 60000;
  private readonly maxRequests = 10; // for stats API
  
  async throttle(): Promise<void> {
    if (Date.now() > this.resetTime) {
      this.requests = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    if (this.requests >= this.maxRequests) {
      const waitTime = this.resetTime - Date.now();
      await sleep(waitTime);
      this.requests = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    this.requests++;
  }
}
```

Notes:
- Respect `Retry-After` headers on 429 responses and apply jittered backoff.
- Add a token-scoped concurrency gate to stay within the account's concurrent request limits; queue excess work and release permits on completion.

---

### Track 11: Testing Infrastructure
**Agent: testing-agent**

#### Test Structure
```typescript
// tests/unit/tools/scrape.test.ts
describe('scrape tool', () => {
  it('should handle basic GET request', async () => {
    mockScrapedoResponse(200, '<html>...</html>');
    const result = await scrape({ url: 'https://example.com' });
    expect(result.statusCode).toBe(200);
  });
  
  it('should calculate credits correctly', () => {
    expect(calculateCredits({ url: 'https://example.com' })).toBe(1);
    expect(calculateCredits({ url: 'https://example.com', render: true })).toBe(5);
    expect(calculateCredits({ url: 'https://google.com', super: true })).toBe(10);
  });
  
  it('should handle rate limiting', async () => {
    mockScrapedoResponse(429, '', { 'Retry-After': '60' });
    await expect(scrape({ url: 'https://example.com' }))
      .rejects.toThrow(ScrapedoError);
  });
  
  it('should enforce screenshot deps', async () => {
    await expect(take_screenshot({ url: 'https://example.com' }))
      .rejects.toThrow(/render=true and returnJSON=true/);
  });
  
  it('should map 510 as client_canceled', () => {
    const err = new ScrapedoError(510, 'client_canceled', false, false);
    expect(err.errorType).toBe('client_canceled');
  });
});
```

---

### Track 12: Documentation & Examples
**Agent: documentation-agent**

#### README.md Structure
```markdown
# Scrapedo MCP Server

## Installation
\`\`\`bash
npm install
cp .env.example .env
# Add your token: SCRAPEDO_API_TOKEN=YOUR_TOKEN_HERE
\`\`\`

## Available Tools

### Basic Scraping
- `scrape` - Simple HTTP requests
- `scrape_with_js` - JavaScript rendering

### Browser Automation
- `browser_automate` - Click, type, scroll
- `take_screenshot` - Capture screenshots

### Advanced Features
- `scrape` + `super: true` - Residential/mobile proxies
- `scrape_with_location` - Geographic targeting
- `scrape_batch` - Multiple URLs
- `scrape_async` - Webhook callbacks

## Usage Examples
[Include working examples for each tool]

## Credit Costs
- Basic request: 1 credit
- With JS rendering: 5 credits
- Residential proxy: 10 credits
- Residential + JS: 25 credits

### Proxy Mode Defaults
- Super requests (`super: true`) enable Scrape.do's residential/mobile pool. Adjust `customHeaders` explicitly if you need to override the API defaults.

### Cookies
- `setCookies` accepts URL-encoded cookies. The `scrape_with_cookies` tool converts `{k:v}` to the required header string and can set `pureCookies=true` to return original `Set-Cookie` headers.
```

---

## Implementation Validation Checklist

### Core Parameters ✓
- [ ] token (required)
- [ ] url (required)

### Proxy Parameters ✓
- [ ] super
- [ ] geoCode (30+ country codes)
- [ ] regionalGeoCode (6 regions)
- [ ] sessionId

### Header Parameters ✓
- [ ] customHeaders
- [ ] extraHeaders
- [ ] forwardHeaders
- [ ] setCookies
- [ ] pureCookies

### Browser Parameters ✓
- [ ] device (desktop/mobile/tablet)
- [ ] render
- [ ] waitUntil (4 options)
- [ ] customWait
- [ ] waitSelector
- [ ] width/height
- [ ] blockResources
- [ ] blockAds

### Screenshot Parameters ✓
- [ ] screenShot
- [ ] fullScreenShot
- [ ] particularScreenShot

### Control Parameters ✓
- [ ] disableRedirection
- [ ] callback
- [ ] timeout
- [ ] retryTimeout
- [ ] disableRetry

### Output Parameters ✓
- [ ] output (raw/markdown)
- [ ] transparentResponse
- [ ] returnJSON
- [ ] showFrames
- [ ] showWebsocketRequests

### Browser Automation ✓
- [ ] Click
- [ ] Wait
- [ ] WaitSelector
- [ ] ScrollX/ScrollY
- [ ] ScrollTo
- [ ] Execute
- [ ] WaitForRequestCompletion

### Error Handling ✓
- [ ] 429 rate limiting
- [ ] 401 authentication
- [ ] Credit consumption logic
- [ ] Retry mechanism

### Special Features ✓
- [ ] Usage statistics API
- [ ] Credit calculation
- [ ] Special domain pricing
- [ ] Both API and Proxy modes

## Agent Coordination Protocol

1. **Start Conditions**: Each track can begin when dependencies are met
2. **Dependency Graph**:
   - Track 1 (Infrastructure) → No dependencies
   - Track 2 (Client) → Requires Track 1
   - Tracks 3-9 (Tools) → Require Tracks 1 & 2
   - Track 10 (Errors) → Requires Track 1
   - Track 11 (Testing) → Can start with mocks
   - Track 12 (Docs) → Can start with templates

3. **Communication**: Use stub implementations when waiting for dependencies
4. **Testing**: Each agent must include tests with their implementation
5. **Documentation**: Update as features are completed

## Success Metrics
- All 40+ Scrapedo parameters exposed through MCP tools
- 100% feature parity with Scrapedo documentation
- Comprehensive error handling for all status codes
- Credit calculation matching Scrapedo pricing
- Full test coverage with mocks
- Complete documentation with examples
- Support for both API and Proxy modes
- Rate limiting compliance

## Notes on Proxy Mode Implementation
- For Proxy Mode (`TOKEN:params@proxy.scrape.do:8080`), configure an HTTP/HTTPS proxy agent (e.g., `http-proxy-agent`/`https-proxy-agent`) instead of relying on axios defaults. Build the proxy password string from Scrape.do parameters (e.g., `render=true&waitUntil=domcontentloaded`).
- If full in-process proxying is out of scope for the MCP server, rely on the `super` parameters within `scrape`/`scrape_with_js` instead of a dedicated `generate_proxy_config` tool (now deprecated).
