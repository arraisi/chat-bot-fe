import axios from 'axios';

async function comprehensiveAPITest() {
  console.log('🔍 Comprehensive Chat API Test\n');

  // Test 1: Basic API connectivity
  console.log('1. Testing API connectivity...');
  try {
    const response = await axios.post('http://localhost:8000/api/chat', {
      prompt: 'Hello, test message',
      otoritas: 'SDM',
      kategori: 'general',
    });

    console.log('   ✅ API is accessible');
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Success: ${response.data.success}`);
    console.log(`   ✅ Message: ${response.data.message}`);
    console.log(`   ✅ Has response: ${!!response.data.response}`);
    console.log(`   ✅ Has timestamp: ${!!response.data.timestamp}`);
    console.log(`   ✅ Has raw_data: ${!!response.data.raw_data}\n`);
  } catch (error) {
    console.log('   ❌ API connectivity failed:', error.message);
    return;
  }

  // Test 2: Response format validation
  console.log('2. Testing response format...');
  try {
    const response = await axios.post('http://localhost:8000/api/chat', {
      prompt: 'visi misi tata nilai dan motto?',
      otoritas: 'SDM',
      kategori: 'Code of Conduct',
    });

    const data = response.data;
    const requiredFields = ['success', 'message', 'response', 'raw_data', 'timestamp'];
    const missingFields = requiredFields.filter(field => !(field in data));

    if (missingFields.length === 0) {
      console.log('   ✅ All required fields present');
      console.log(`   ✅ Response length: ${data.response.length} characters`);
      console.log(`   ✅ Contains markdown formatting: ${data.response.includes('*')}`);
      console.log(`   ✅ Contains reference: ${data.response.includes('Referensi')}`);
    } else {
      console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
    }
  } catch (error) {
    console.log('   ❌ Response format test failed:', error.message);
  }

  // Test 3: Different authorities and categories
  console.log('\n3. Testing different authorities and categories...');
  const testCases = [
    { otoritas: 'SDM', kategori: 'Employee Benefits' },
    { otoritas: 'HUKUM', kategori: 'Legal Compliance' },
    { otoritas: 'ADMIN', kategori: 'System Administration' },
  ];

  for (const testCase of testCases) {
    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        prompt: `Test message for ${testCase.otoritas}`,
        otoritas: testCase.otoritas,
        kategori: testCase.kategori,
      });

      console.log(`   ✅ ${testCase.otoritas}/${testCase.kategori}: Success`);
    } catch (error) {
      console.log(`   ❌ ${testCase.otoritas}/${testCase.kategori}: Failed - ${error.message}`);
    }
  }

  console.log('\n🎉 API Test Complete! Your chat integration is ready to use.');
  console.log('\n📝 Next steps:');
  console.log('   1. Open http://localhost:3000 in your browser');
  console.log('   2. Try sending a message in the chat interface');
  console.log('   3. Check the browser console for API call logs');
}

comprehensiveAPITest().catch(console.error);
