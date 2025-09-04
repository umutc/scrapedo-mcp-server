import axios from 'axios';

const API_KEY = 'b1bc959fc23b4681a7328f78a081024e38c1e8cbddc';

async function testDirectAPI() {
  try {
    console.log('Testing direct Scrapedo API calls...\n');

    // Test the actual API endpoint
    const response = await axios.post(
      'https://api.scrapedo.com/scrape',
      {
        url: 'https://example.com',
        render_js: false
      },
      {
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDirectAPI();