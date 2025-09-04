import axios from 'axios';

const API_KEY = 'b1bc959fc23b4681a7328f78a081024e38c1e8cbddc';

async function testDirectAPI() {
  console.log('Testing direct API call to Scrapedo...\n');
  
  const url = `https://api.scrape.do?token=${API_KEY}&url=https://example.com`;
  console.log('Request URL:', url);
  
  try {
    const response = await axios.get(url);
    console.log('\nResponse Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Data (first 500 chars):', response.data.substring(0, 500));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testDirectAPI();