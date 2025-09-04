/**
 * Quick test to verify your Scrapedo MCP Server setup
 * 
 * Run this file to test if your API key is working:
 * node examples/quick-test.js
 */

import axios from 'axios';

const API_KEY = process.env.SCRAPEDO_API_KEY;

if (!API_KEY) {
    console.error('❌ Error: SCRAPEDO_API_KEY environment variable is not set');
    console.log('\n💡 Set your API key:');
    console.log('   export SCRAPEDO_API_KEY="your_api_key_here"');
    console.log('\n📝 Get your API key from: https://scrape.do');
    process.exit(1);
}

async function testScrapedo() {
    console.log('🔧 Testing Scrapedo API connection...\n');
    
    try {
        // Test 1: Check usage stats
        console.log('1️⃣ Checking API usage stats...');
        const usageResponse = await axios.get('https://api.scrape.do/v2/info', {
            params: { token: API_KEY }
        });
        
        console.log('✅ API connection successful!');
        console.log(`   Remaining credits: ${usageResponse.data.remainingCredits}`);
        console.log(`   Monthly limit: ${usageResponse.data.monthlyLimit}\n`);
        
        // Test 2: Simple scrape
        console.log('2️⃣ Testing basic web scraping...');
        const scrapeResponse = await axios.get('https://api.scrape.do', {
            params: {
                token: API_KEY,
                url: 'https://httpbin.org/user-agent',
                render: 'false'
            }
        });
        
        console.log('✅ Scraping successful!');
        console.log('   Response received:', scrapeResponse.data.substring(0, 100) + '...\n');
        
        console.log('🎉 All tests passed! Your Scrapedo MCP Server is ready to use.\n');
        console.log('Next steps:');
        console.log('1. Run: npx scrapedo-mcp-server init');
        console.log('2. Restart Claude Desktop');
        console.log('3. Start scraping!\n');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.error || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n⚠️  Your API key appears to be invalid.');
            console.log('   Please check your key at: https://scrape.do/dashboard');
        }
    }
}

testScrapedo();