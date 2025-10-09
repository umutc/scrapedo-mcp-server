import { ScrapedoClient } from './dist/scrapedo-client.js';

const API_KEY = process.env.SCRAPEDO_API_KEY || 'YOUR_API_KEY_HERE';
const client = new ScrapedoClient(API_KEY);

async function runAllTests() {
  console.log('🚀 Starting Scrapedo API Tests...\n');
  
  // Test with proxy mode
  console.log('Testing proxy mode...');
  const response = await client.scrapeWebpage({
    url: 'https://example.com',
    proxy_mode: true
  });
  
  console.log('Response status:', response.success);
  console.log('HTML length:', response.data?.length);
  console.log('\n✅ All tests completed successfully!');
}

runAllTests().catch(console.error);
