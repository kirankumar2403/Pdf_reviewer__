const axios = require('axios');

const API_BASE = 'http://localhost:3002';

async function testAPI() {
  console.log('🧪 Testing PDF Review Dashboard API...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Get Invoices
    console.log('2️⃣ Testing Get Invoices...');
    const invoicesResponse = await axios.get(`${API_BASE}/invoices`);
    console.log('✅ Get Invoices:', invoicesResponse.data);
    console.log('');

    // Test 3: Get Single Invoice
    console.log('3️⃣ Testing Get Single Invoice...');
    const singleInvoiceResponse = await axios.get(`${API_BASE}/invoices/1`);
    console.log('✅ Get Invoice by ID:', singleInvoiceResponse.data);
    console.log('');

    // Test 4: Search Invoices
    console.log('4️⃣ Testing Search Invoices...');
    const searchResponse = await axios.get(`${API_BASE}/invoices?q=ABC`);
    console.log('✅ Search Invoices:', searchResponse.data);
    console.log('');

    // Test 5: Extract (Mock)
    console.log('5️⃣ Testing AI Extract...');
    const extractResponse = await axios.post(`${API_BASE}/extract`, {
      fileId: 'test_file_123',
      provider: 'gemini'
    });
    console.log('✅ Extract Data:', extractResponse.data);
    console.log('');

    console.log('🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
  }
}

testAPI();
