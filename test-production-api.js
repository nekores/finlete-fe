// Test script to check production API
const API_BASE_URL = 'http://localhost:3000/api';

async function testProductionAPI() {
  console.log('🧪 Testing Production API...');
  console.log(`📍 API URL: ${API_BASE_URL}/deals`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/deals`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is working!');
      console.log(`📊 Found ${data.items?.length || 0} deals`);
      console.log('🎉 Production API is ready for React app!');
    } else {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      if (response.status === 403) {
        console.log('🔒 Deployment protection is still enabled');
        console.log('💡 Go to Vercel Dashboard → Settings → Deployment Protection → Disable');
      }
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

// Run the test
testProductionAPI();
