<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-api</v-icon>
            Chat Session Backend Integration Demo
          </v-card-title>

          <v-card-text>
            <v-alert v-if="!backendAvailable" type="warning" variant="tonal" class="mb-4">
              Backend API is not available. Make sure Laravel server is running on http://localhost:8000
            </v-alert>

            <v-alert v-if="backendAvailable" type="success" variant="tonal" class="mb-4">
              Backend API is available and working!
            </v-alert>

            <div class="demo-section">
              <h3>API Tests</h3>
              <v-row>
                <v-col cols="12" md="6">
                  <v-btn @click="testGetSessions" :loading="loading.sessions" block color="primary">
                    Test Get Sessions
                  </v-btn>
                </v-col>
                <v-col cols="12" md="6">
                  <v-btn @click="testCreateSession" :loading="loading.create" block color="success">
                    Test Create Session
                  </v-btn>
                </v-col>
                <v-col cols="12" md="6">
                  <v-btn
                    @click="testSendMessage"
                    :loading="loading.message"
                    :disabled="!testSessionId"
                    block
                    color="info"
                  >
                    Test Send Message
                  </v-btn>
                </v-col>
                <v-col cols="12" md="6">
                  <v-btn
                    @click="testDeleteSession"
                    :loading="loading.delete"
                    :disabled="!testSessionId"
                    block
                    color="error"
                  >
                    Test Delete Session
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <div class="demo-section mt-6">
              <h3>Test Results</h3>
              <v-textarea
                v-model="testResults"
                readonly
                rows="15"
                variant="outlined"
                label="Test Output"
                class="console-output"
              />
            </div>

            <div class="demo-section mt-6">
              <h3>Integration Status</h3>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Backend API</td>
                      <td>
                        <v-chip :color="backendAvailable ? 'success' : 'error'" size="small">
                          {{ backendAvailable ? 'Available' : 'Unavailable' }}
                        </v-chip>
                      </td>
                      <td>Laravel server on localhost:8000</td>
                    </tr>
                    <tr>
                      <td>Database</td>
                      <td>
                        <v-chip :color="databaseConnected ? 'success' : 'error'" size="small">
                          {{ databaseConnected ? 'Connected' : 'Disconnected' }}
                        </v-chip>
                      </td>
                      <td>MySQL with chat_sessions & chat_messages tables</td>
                    </tr>
                    <tr>
                      <td>Frontend Integration</td>
                      <td>
                        <v-chip color="success" size="small"> Ready </v-chip>
                      </td>
                      <td>chatSessionApi.ts service layer implemented</td>
                    </tr>
                    <tr>
                      <td>Offline Mode</td>
                      <td>
                        <v-chip color="info" size="small"> Enabled </v-chip>
                      </td>
                      <td>localStorage fallback when backend unavailable</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import {
    createChatSession,
    deleteChatSession,
    getChatSessions,
    sendMessageToSession,
  } from '../services/chatSessionApi';

  const backendAvailable = ref(false);
  const databaseConnected = ref(false);
  const testResults = ref('Click the test buttons to see results...\n\n');
  const testSessionId = ref(null);

  const loading = ref({
    sessions: false,
    create: false,
    message: false,
    delete: false,
  });

  const addToResults = message => {
    const timestamp = new Date().toLocaleTimeString();
    testResults.value += `[${timestamp}] ${message}\n`;
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/chat/status');
      if (response.ok) {
        backendAvailable.value = true;
        databaseConnected.value = true;
        addToResults('✅ Backend connection successful');
      }
    } catch (error) {
      backendAvailable.value = false;
      databaseConnected.value = false;
      addToResults('❌ Backend connection failed: ' + error.message);
    }
  };

  const testGetSessions = async () => {
    loading.value.sessions = true;
    try {
      addToResults('🔍 Testing GET /api/chat-sessions...');
      const sessions = await getChatSessions();
      addToResults(`✅ Retrieved ${sessions.length} sessions`);
      addToResults(JSON.stringify(sessions, null, 2));
    } catch (error) {
      addToResults('❌ Get sessions failed: ' + error.message);
    } finally {
      loading.value.sessions = false;
    }
  };

  const testCreateSession = async () => {
    loading.value.create = true;
    try {
      addToResults('🔨 Testing POST /api/chat-sessions...');
      const sessionData = {
        session_id: `demo-session-${Date.now()}`,
        title: 'Demo Integration Test',
        authority: 'ADMIN',
      };

      const session = await createChatSession(sessionData);
      testSessionId.value = session.id;
      addToResults(`✅ Created session: ${session.id}`);
      addToResults(JSON.stringify(session, null, 2));
    } catch (error) {
      addToResults('❌ Create session failed: ' + error.message);
    } finally {
      loading.value.create = false;
    }
  };

  const testSendMessage = async () => {
    if (!testSessionId.value) {
      addToResults('❌ No session available. Create a session first.');
      return;
    }

    loading.value.message = true;
    try {
      addToResults(`💬 Testing POST /api/chat-sessions/${testSessionId.value}/messages...`);
      const messageData = {
        content: 'What is the vision and mission of Peruri?',
        category: 'code-of-conduct',
        authority: 'ADMIN',
        message_id: `msg-${Date.now()}`,
      };

      const result = await sendMessageToSession(testSessionId.value, messageData);
      addToResults('✅ Message sent successfully');
      addToResults(`User message: "${result.userMessage.content}"`);
      if (result.assistantMessage) {
        addToResults(`Assistant response: "${result.assistantMessage.content.substring(0, 100)}..."`);
      }
    } catch (error) {
      addToResults('❌ Send message failed: ' + error.message);
    } finally {
      loading.value.message = false;
    }
  };

  const testDeleteSession = async () => {
    if (!testSessionId.value) {
      addToResults('❌ No session available. Create a session first.');
      return;
    }

    loading.value.delete = true;
    try {
      addToResults(`🗑️ Testing DELETE /api/chat-sessions/${testSessionId.value}...`);
      await deleteChatSession(testSessionId.value);
      addToResults('✅ Session deleted successfully');
      testSessionId.value = null;
    } catch (error) {
      addToResults('❌ Delete session failed: ' + error.message);
    } finally {
      loading.value.delete = false;
    }
  };

  onMounted(async () => {
    addToResults('🚀 Initializing Chat Session Backend Integration Demo...');
    await testBackendConnection();
  });
</script>

<style scoped>
  .demo-section {
    margin: 1rem 0;
  }

  .console-output {
    font-family: 'Courier New', monospace;
  }

  .console-output :deep(.v-field__input) {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
  }
</style>
