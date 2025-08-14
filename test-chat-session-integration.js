// Frontend integration demo for chat sessions
console.log('Chat Session API Integration Demo');

// Test the API endpoints
async function testChatSessionAPI() {
  const baseURL = 'http://localhost:8000/api';

  try {
    console.log('1. Testing chat sessions API...');

    // Test 1: Get all sessions
    console.log('Getting all sessions...');
    const sessionsResponse = await fetch(`${baseURL}/chat-sessions`);
    const sessionsData = await sessionsResponse.json();
    console.log('Sessions:', sessionsData);

    // Test 2: Create a new session
    console.log('Creating new session...');
    const createResponse = await fetch(`${baseURL}/chat-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: `demo-session-${Date.now()}`,
        title: 'Demo Chat Session',
        authority: 'ADMIN',
      }),
    });
    const createData = await createResponse.json();
    console.log('Created session:', createData);

    if (createData.success && createData.session) {
      const sessionId = createData.session.id;

      // Test 3: Send a message
      console.log('Sending message...');
      const messageResponse = await fetch(`${baseURL}/chat-sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'What is the vision of Peruri?',
          category: 'code-of-conduct',
          authority: 'ADMIN',
          message_id: `msg-${Date.now()}`,
        }),
      });
      const messageData = await messageResponse.json();
      console.log('Message response:', messageData);

      // Test 4: Get session with messages
      console.log('Getting session with messages...');
      const sessionResponse = await fetch(`${baseURL}/chat-sessions/${sessionId}`);
      const sessionData = await sessionResponse.json();
      console.log('Session with messages:', sessionData);
    }

    console.log('API tests completed!');
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Test if running in browser
if (typeof window !== 'undefined') {
  window.testChatSessionAPI = testChatSessionAPI;
  console.log('Run testChatSessionAPI() in browser console to test the API');
} else {
  // Test if running in Node.js
  testChatSessionAPI();
}
