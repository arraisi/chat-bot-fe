import axios from 'axios';

async function testChatAPI() {
  console.log('🧪 Testing Chat API Integration...\n');

  const testCases = [
    {
      prompt: 'visi misi tata nilai dan motto?',
      otoritas: 'SDM',
      kategori: 'Code of Conduct',
    },
    {
      prompt: 'Apa saja benefit yang diberikan perusahaan?',
      otoritas: 'SDM',
      kategori: 'Employee Benefits',
    },
    {
      prompt: 'Bagaimana prosedur pengajuan cuti?',
      otoritas: 'SDM',
      kategori: 'Leave Policy',
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${i + 1}. Testing: "${testCase.prompt}"`);
    console.log(`   Authority: ${testCase.otoritas}, Category: ${testCase.kategori}`);

    try {
      const response = await axios.post('http://localhost:8000/api/chat', testCase, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log(`   ✅ Status: ${response.status}`);

      if (response.data.success) {
        console.log(`   ✅ Success: ${response.data.success}`);
        console.log(`   📝 Response: ${response.data.response.substring(0, 100)}...`);
      } else {
        console.log(`   ❌ Failed: ${response.data.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (axios.isAxiosError(error)) {
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Data: ${JSON.stringify(error.response?.data)}`);
      }
    }
  }

  console.log('\n🏁 API Test Complete!');
}

// Run the test
testChatAPI().catch(console.error);
