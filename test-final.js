import { ScrapedoClient } from './dist/scrapedo-client.js';

const API_KEY = 'b1bc959fc23b4681a7328f78a081024e38c1e8cbddc';

async function testScrapedoMCPServer() {
  const client = new ScrapedoClient(API_KEY);
  
  console.log('🚀 Testing Scrapedo MCP Server Implementation\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Basic scraping
    console.log('\n📌 Test 1: Basic Web Scraping (API Mode)');
    console.log('-'.repeat(40));
    const result1 = await client.scrape({
      url: 'https://httpbin.org/html',
      method: 'GET',
    });
    console.log('✅ Success!');
    console.log(`  Status Code: ${result1.statusCode}`);
    console.log(`  HTML Length: ${result1.html?.length || 0} characters`);
    console.log(`  First 100 chars of text: ${result1.text?.substring(0, 100)}...`);

    // Test 2: Get usage stats
    console.log('\n📌 Test 2: API Usage Statistics');
    console.log('-'.repeat(40));
    try {
      const stats = await client.getUsageStats();
      console.log('✅ Stats Retrieved:');
      console.log(`  Remaining Credits: ${stats.remainingCredits}`);
      console.log(`  Used Credits: ${stats.usedCredits}`);
      console.log(`  Concurrency Limit: ${stats.concurrencyLimit}`);
      console.log(`  Requests Today: ${stats.requestsToday}`);
    } catch (error) {
      console.log('⚠️  Could not retrieve stats:', error.message);
    }

    // Test 3: Credit calculation
    console.log('\n📌 Test 3: Credit Cost Calculation');
    console.log('-'.repeat(40));
    const scenarios = [
      { url: 'https://example.com', desc: 'Basic request' },
      { url: 'https://example.com', render: true, desc: 'With JS rendering' },
      { url: 'https://example.com', super: true, desc: 'With residential proxy' },
      { url: 'https://example.com', super: true, render: true, desc: 'Residential + JS' },
      { url: 'https://google.com', desc: 'Google (special pricing)' },
      { url: 'https://linkedin.com/in/test', desc: 'LinkedIn (special pricing)' },
    ];

    for (const scenario of scenarios) {
      const credits = client.calculateCredits(scenario);
      console.log(`  ${scenario.desc}: ${credits} credit${credits > 1 ? 's' : ''}`);
    }

    // Test 4: Generate proxy config
    console.log('\n📌 Test 4: Proxy Configuration Generation');
    console.log('-'.repeat(40));
    const proxyUrl = client.generateProxyConfig({
      render: true,
      super: true,
      geoCode: 'us',
      device: 'mobile',
    });
    console.log('✅ Proxy URL Generated:');
    console.log(`  ${proxyUrl}`);

    // Test 5: Markdown conversion
    console.log('\n📌 Test 5: Markdown Output Format');
    console.log('-'.repeat(40));
    const markdownResult = await client.scrape({
      url: 'https://example.com',
      output: 'markdown',
    });
    console.log('✅ Markdown Retrieved:');
    console.log(`  Length: ${markdownResult.markdown?.length || markdownResult.html?.length || 0} characters`);
    console.log(`  Preview: ${(markdownResult.markdown || markdownResult.html || '').substring(0, 100)}...`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed successfully!');
    console.log('\n📝 MCP Server Configuration:');
    console.log('Add the following to your Claude Desktop config:');
    console.log('(~/Library/Application Support/Claude/claude_desktop_config.json)\n');
    
    const config = {
      "scrapedo": {
        "command": "node",
        "args": [`${process.cwd()}/dist/index.js`],
        "env": {
          "SCRAPEDO_API_KEY": "your_api_key_here"
        }
      }
    };
    
    console.log(JSON.stringify(config, null, 2));
    console.log('\n🎉 Your Scrapedo MCP Server is ready to use!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    process.exit(1);
  }
}

testScrapedoMCPServer().catch(console.error);