const axios = require('axios');
require('dotenv').config();

async function testCashfreeEndpoints() {
  console.log('=== Testing Cashfree API Endpoints ===\n');
  
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
    console.log('❌ Missing CLIENT_ID or CLIENT_SECRET');
    return;
  }

  const baseUrl = 'https://sandbox.cashfree.com';
  const headers = {
    'x-client-id': process.env.CASHFREE_CLIENT_ID,
    'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
    'x-api-version': '2022-09-01',
    'Content-Type': 'application/json'
  };

  const possibleEndpoints = [
    '/links',
    '/pg/links',
    '/v1/links',
    '/pg/v1/links',
    '/api/links',
    '/api/pg/links'
  ];

  console.log('Testing GET endpoints (to check if they exist):');
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`Testing GET ${baseUrl}${endpoint}`);
      const response = await axios.get(`${baseUrl}${endpoint}`, {
        headers,
        timeout: 10000
      });
      
      console.log(`✅ GET ${endpoint} - Status: ${response.status}`);
      
    } catch (error) {
      console.log(`❌ GET ${endpoint} - Status: ${error.response?.status || 'No response'} - ${error.response?.data?.error_msg || error.message}`);
    }
  }

  console.log('\nTesting POST endpoint for creating payment link:');
  
  const testPayload = {
    link_id: `TEST-${Date.now()}`,
    customer_details: {
      customer_id: 'test-customer',
      customer_phone: '9999999999'
    },
    link_notify: {
      send_sms: true,
      send_email: false
    },
    link_meta: {
      return_url: 'http://localhost:5173/payment-success',
      notify_url: 'http://localhost:4000/api/payment/webhook'
    },
    link_amount: 100,
    link_currency: 'INR',
    link_purpose: 'Test Payment',
    link_expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    link_minimum_partial_amount: 100
  };

  // Test the most likely endpoint
  try {
    console.log(`Testing POST ${baseUrl}/links`);
    const response = await axios.post(`${baseUrl}/links`, testPayload, {
      headers,
      timeout: 30000
    });
    
    console.log(`✅ POST /links - Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log(`❌ POST /links - Status: ${error.response?.status || 'No response'}`);
    console.log('Error:', error.response?.data || error.message);
    
    // Try alternative endpoint
    try {
      console.log(`\nTesting POST ${baseUrl}/pg/links`);
      const response2 = await axios.post(`${baseUrl}/pg/links`, testPayload, {
        headers,
        timeout: 30000
      });
      
      console.log(`✅ POST /pg/links - Status: ${response2.status}`);
      console.log('Response:', JSON.stringify(response2.data, null, 2));
      
    } catch (error2) {
      console.log(`❌ POST /pg/links - Status: ${error2.response?.status || 'No response'}`);
      console.log('Error:', error2.response?.data || error2.message);
    }
  }

  console.log('\n=== Test Complete ===');
}

testCashfreeEndpoints().catch(console.error); 