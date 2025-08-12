import axios from 'axios';

// Test the chat API endpoint directly
export const testChatAPI = async () => {
  console.log('Testing Chat API: http://localhost:8000/api/chat');

  try {
    const response = await axios.post(
      'http://localhost:8000/api/chat',
      {
        prompt: 'visi misi tata nilai dan motto?',
        otoritas: 'SDM',
        kategori: 'Code of Conduct',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Chat API Response Status:', response.status);
    console.log('✅ Chat API Response Data:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Chat API Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    }
    throw error;
  }
};

// Test with different parameters
export const testChatAPIWithParams = async (prompt: string, otoritas: string, kategori: string) => {
  console.log(`Testing Chat API with prompt: "${prompt}", otoritas: "${otoritas}", kategori: "${kategori}"`);

  try {
    const response = await axios.post(
      'http://localhost:8000/api/chat',
      {
        prompt,
        otoritas,
        kategori,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};
