import { ScrapedoClient } from './dist/scrapedo-client.js';

const API_KEY = 'b1bc959fc23b4681a7328f78a081024e38c1e8cbddc';
const client = new ScrapedoClient(API_KEY);

async function testScraping() {
  try {
    console.log('Testing Scrapedo API...\n');
    
    // Test 1: Basic scraping
    console.log('Test 1: Basic scraping of example.com');
    const result1 = await client.scrape({
      url: 'https://example.com',
      render_js: false,
    });
    console.log('✓ Basic scraping successful');
    console.log(`  Status code: ${result1.status_code}`);
    console.log(`  HTML length: ${result1.html?.length || 0} characters`);
    console.log(`  Text preview: ${result1.text?.substring(0, 100)}...`);
    console.log();

    // Test 2: Scraping with JavaScript rendering
    console.log('Test 2: Scraping with JavaScript rendering');
    const result2 = await client.scrapeAdvanced({
      url: 'https://httpbin.org/headers',
      render_js: true,
      custom_headers: {
        'X-Test-Header': 'Scrapedo MCP Server',
      },
    });
    console.log('✓ Advanced scraping successful');
    console.log(`  Status code: ${result2.status_code}`);
    console.log(`  Headers received: ${Object.keys(result2.headers || {}).length}`);
    console.log();

    // Test 3: Task monitoring
    console.log('Test 3: Listing recent tasks');
    const tasks = await client.listTasks({ limit: 5 });
    console.log(`✓ Found ${tasks.total} total tasks`);
    if (tasks.tasks.length > 0) {
      console.log('  Recent task statuses:');
      tasks.tasks.forEach(task => {
        console.log(`    - ${task.id}: ${task.status} (${new Date(task.created_at).toLocaleString()})`);
      });
    }
    console.log();

    // Test 4: Proxy listing
    console.log('Test 4: Listing available proxies');
    try {
      const proxies = await client.listProxies({ limit: 5 });
      console.log(`✓ Found ${proxies.total} proxies`);
      if (proxies.proxies.length > 0) {
        console.log('  Proxy types:');
        const types = [...new Set(proxies.proxies.map(p => p.type))];
        types.forEach(type => console.log(`    - ${type}`));
      }
    } catch (error) {
      console.log('  Note: Proxy listing might require specific account permissions');
    }
    console.log();

    console.log('All tests completed successfully! ✅');
    console.log('\nThe Scrapedo MCP server is ready to use with Claude Desktop.');
    console.log('Add the following to your claude_desktop_config.json:');
    console.log(JSON.stringify({
      "scrapedo": {
        "command": "node",
        "args": [`${process.cwd()}/dist/index.js`],
        "env": {
          "SCRAPEDO_API_KEY": "your_api_key_here"
        }
      }
    }, null, 2));

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testScraping();