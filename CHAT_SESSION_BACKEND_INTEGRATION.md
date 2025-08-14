# Chat Session Backend Integration

This document explains the implementation of the chat session backend API and its integration with the frontend.

## Backend Implementation

### Database Structure

#### chat_sessions table

- `id`: Primary key
- `session_id`: Unique identifier for frontend
- `title`: Session title (auto-generated from first message)
- `authority`: User authority (ALL, SDM, HUKUM, ADMIN)
- `user_id`: Optional user identifier
- `message_count`: Number of messages in session
- `last_activity_at`: Last activity timestamp
- `created_at`, `updated_at`: Standard Laravel timestamps

#### chat_messages table

- `id`: Primary key
- `message_id`: Unique identifier for frontend
- `chat_session_id`: Foreign key to chat_sessions
- `role`: Message role (user, assistant)
- `content`: Message content
- `category`: Message category (code-of-conduct, etc.)
- `authority`: Authority used for this message
- `metadata`: JSON field for additional data
- `is_typing`: Boolean for typing indicator
- `created_at`, `updated_at`: Standard Laravel timestamps

### API Endpoints

#### Chat Sessions Resource

- `GET /api/chat-sessions` - Get all sessions
- `POST /api/chat-sessions` - Create new session
- `GET /api/chat-sessions/{sessionId}` - Get specific session with messages
- `PUT /api/chat-sessions/{sessionId}` - Update session
- `DELETE /api/chat-sessions/{sessionId}` - Delete session

#### Messages

- `POST /api/chat-sessions/{sessionId}/messages` - Send message to session

#### Search & Stats

- `GET /api/chat-sessions-search?q={query}` - Search sessions
- `GET /api/chat-sessions-stats` - Get session statistics

### Backend Components

1. **Models**
   - `ChatSession.php` - Session model with relationships
   - `ChatMessage.php` - Message model with relationships

2. **Repository**
   - `ChatSessionRepository.php` - Data access layer

3. **Service**
   - `ChatSessionService.php` - Business logic layer

4. **Controller**
   - `ChatSessionController.php` - HTTP request handling

## Frontend Integration

### New Service Layer

- `chatSessionApi.ts` - API communication layer
- Functions for CRUD operations on sessions and messages

### Updated Composable

- `useChatWithBackend.ts` - New composable with backend integration
- Offline mode support with localStorage fallback
- Automatic sync between backend and local storage

### Key Features

1. **Online/Offline Mode**
   - Backend API when online
   - Local storage fallback when offline
   - Automatic reconnection and sync

2. **Session Persistence**
   - Sessions stored in database
   - Messages persist across browser sessions
   - Real-time sync with backend

3. **Authority Management**
   - Per-session authority tracking
   - Message-level authority recording
   - Authority-based content filtering

## Usage Examples

### Creating a Session

```typescript
const session = await createChatSession({
  title: 'My Chat Session',
  authority: 'ADMIN',
  user_id: 'user123',
});
```

### Sending Messages

```typescript
const result = await sendMessageToSession(sessionId, {
  content: 'What is the vision of Peruri?',
  category: 'code-of-conduct',
  authority: 'ADMIN',
});
```

### Loading Sessions

```typescript
const sessions = await getChatSessions();
```

### Searching Sessions

```typescript
const results = await searchChatSessions('vision mission');
```

## Migration Steps

### Backend

1. Run migrations: `php artisan migrate`
2. Start Laravel server: `php artisan serve`

### Frontend

1. Import new composable: `import { useChat } from '@/composables/useChatWithBackend'`
2. Replace existing useChat with new backend-enabled version
3. Test online/offline functionality

## API Testing

Use the provided test scripts:

### Backend Test

```bash
cd chat-bot-be
./test-chat-sessions-api.sh
```

### Frontend Test

```javascript
// In browser console
testChatSessionAPI();
```

## Benefits

1. **Data Persistence** - Chat history survives browser refreshes
2. **Cross-Device Sync** - Access chats from multiple devices
3. **Search Capability** - Find specific conversations
4. **Analytics** - Track usage patterns and statistics
5. **Scalability** - Backend can handle multiple users
6. **Offline Support** - Works without internet connection

## Future Enhancements

1. **User Authentication** - Proper user management
2. **Real-time Updates** - WebSocket support for live updates
3. **File Attachments** - Support for file uploads in messages
4. **Message Reactions** - Like/dislike functionality
5. **Export/Import** - Chat history export/import
6. **Advanced Search** - Full-text search with filters

## Configuration

### Environment Variables

```env
# Backend (.env)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_bot
DB_USERNAME=root
DB_PASSWORD=

# Frontend (.env)
VITE_API_BASE_URL=http://localhost:8000/api
VITE_ENABLE_OFFLINE_MODE=true
```

## Error Handling

The system includes comprehensive error handling:

1. **Network Errors** - Automatic fallback to offline mode
2. **Validation Errors** - User-friendly error messages
3. **Server Errors** - Graceful degradation
4. **Data Consistency** - Automatic sync when reconnected

## Performance Considerations

1. **Pagination** - Large session lists are paginated
2. **Lazy Loading** - Messages loaded on demand
3. **Caching** - Local storage caching for offline access
4. **Compression** - API responses can be compressed
5. **Indexing** - Database indexes for fast queries

This implementation provides a robust, scalable chat session system with both online and offline capabilities.
