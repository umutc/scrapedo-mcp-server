import axios from 'axios';

const API_KEY = 'b1bc959fc23b4681a7328f78a081024e38c1e8cbddc';

async function testScrapedoAPI() {
  try {
    console.log('Testing Scrapedo API with different endpoints...\n');

    // Test 1: Try the API with the key in the URL
    console.log('Test 1: With API key in URL parameter');
    try {
      const response1 = await axios.get(
        `https://api.scrapedo.com/scrape?token=${API_KEY}&url=https://example.com`
      );
      console.log('Response 1:', response1.data.substring(0, 200));
    } catch (e) {
      console.log('Error 1:', e.message);
    }

    // Test 2: Try with different auth header
    console.log('\nTest 2: With Authorization header');
    try {
      const response2 = await axios.post(
        'https://api.scrapedo.com/scrape',
        { url: 'https://example.com' },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Response 2:', response2.data.substring(0, 200));
    } catch (e) {
      console.log('Error 2:', e.message);
    }

    // Test 3: Try proxy-style endpoint
    console.log('\nTest 3: Proxy-style endpoint');
    try {
      const response3 = await axios.get(
        `https://${API_KEY}@api.scrapedo.com/scrape/https://example.com`
      );
      console.log('Response 3:', response3.data.substring(0, 200));
    } catch (e) {
      console.log('Error 3:', e.message);
    }

    // Test 4: Try alternate base URL
    console.log('\nTest 4: Alternate base URL');
    try {
      const response4 = await axios.get(
        `https://scrapedo.com/api/scrape?token=${API_KEY}&url=https://example.com`
      );
      console.log('Response 4:', response4.data.substring(0, 200));
    } catch (e) {
      console.log('Error 4:', e.message);
    }

  } catch (error) {
    console.error('General error:', error.message);
  }
}

testScrapedoAPI();