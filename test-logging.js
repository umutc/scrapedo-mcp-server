import { ScrapedoClient } from './dist/scrapedo-client.js';

// Set environment variables for testing
process.env.SCRAPEDO_API_KEY = 'b1bc959fc23b4681a7328f78a081024e38c1e8cbddc';
process.env.LOG_LEVEL = 'DEBUG'; // Set to DEBUG to see all logs

async function testLogging() {
  console.log('🔍 Testing Scrapedo MCP Server with Logging\n');
  console.log('=' .repeat(50));
  console.log('📁 Log file will be created at: logs/scrapedo-mcp.log');
  console.log('=' .repeat(50));

  const client = new ScrapedoClient(process.env.SCRAPEDO_API_KEY);

  try {
    // Test 1: Basic scrape
    console.log('\n📌 Test 1: Basic scraping (check logs for details)');
    const result1 = await client.scrape({
      url: 'https://httpbin.org/html',
    });
    console.log('✅ Scrape successful, status:', result1.statusCode);

    // Test 2: With error handling
    console.log('\n📌 Test 2: Testing error logging');
    try {
      await client.scrape({
        url: 'https://invalid-domain-that-does-not-exist-12345.com',
      });
    } catch (error) {
      console.log('✅ Error captured and logged');
    }

    // Test 3: Usage stats
    console.log('\n📌 Test 3: Usage statistics (check logs)');
    const stats = await client.getUsageStats();
    console.log('✅ Stats retrieved, remaining credits:', stats.remainingCredits);

    // Test 4: Credit calculation
    console.log('\n📌 Test 4: Credit calculation logging');
    const credits = client.calculateCredits({
      url: 'https://google.com',
      render: true,
      super: true,
    });
    console.log('✅ Calculated credits:', credits);

    console.log('\n' + '=' .repeat(50));
    console.log('📊 Testing complete!');
    console.log('📝 Check the log file at: logs/scrapedo-mcp.log');
    console.log('💡 Tip: Use LOG_LEVEL environment variable to control logging:');
    console.log('   - DEBUG: All logs including API calls');
    console.log('   - INFO: General information and responses');
    console.log('   - WARN: Warnings only');
    console.log('   - ERROR: Errors only');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  // Give time for logs to be written
  await new Promise(resolve => setTimeout(resolve, 1000));
}

testLogging().catch(console.error);