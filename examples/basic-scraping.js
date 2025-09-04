import { ScrapedoClient } from '../dist/scrapedo-client.js';

const API_KEY = process.env.SCRAPEDO_API_KEY || 'b1bc959fc23b4681a7328f78a081024e38c1e8cbddc';
const client = new ScrapedoClient(API_KEY);

async function basicScrapingExample() {
  try {
    console.log('1. Basic scraping without JavaScript:');
    const basicResult = await client.scrape({
      url: 'https://example.com',
      render_js: false,
    });
    console.log('Status:', basicResult.status_code);
    console.log('Content length:', basicResult.html?.length);
    console.log('---\n');

    console.log('2. Scraping with JavaScript rendering:');
    const jsResult = await client.scrapeAdvanced({
      url: 'https://example.com',
      render_js: true,
      wait_for: 'body',
      screenshot: true,
    });
    console.log('Status:', jsResult.status_code);
    console.log('Screenshot captured:', !!jsResult.screenshot);
    console.log('---\n');

    console.log('3. Scraping with proxy:');
    const proxyResult = await client.scrape({
      url: 'https://httpbin.org/ip',
      proxy_type: 'datacenter',
      proxy_country: 'US',
    });
    console.log('Response:', JSON.parse(proxyResult.text || '{}'));
    console.log('Proxy used:', proxyResult.proxy_used);
    console.log('---\n');

    console.log('4. Scraping with custom headers and cookies:');
    const customResult = await client.scrapeAdvanced({
      url: 'https://httpbin.org/headers',
      custom_headers: {
        'User-Agent': 'Scrapedo Bot 1.0',
        'Accept-Language': 'en-US',
      },
      cookies: [
        {
          name: 'session',
          value: 'test123',
          domain: 'httpbin.org',
        },
      ],
    });
    console.log('Headers sent:', JSON.parse(customResult.text || '{}').headers);
    console.log('---\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

basicScrapingExample();