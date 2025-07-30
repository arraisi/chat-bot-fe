# Chat Bot Frontend

A modern, responsive chat interface built with Vue 3, Vuetify, and TypeScript. This application provides a ChatGPT-like experience with conversation history, real-time messaging, and API integration capabilities.

## 🌟 Features

- **Modern Chat Interface**: Clean, responsive design similar to ChatGPT
- **Conversation History**: Automatic saving and management of chat sessions
- **Real-time Messaging**: Instant message exchange with typing indicators
- **Persistent Storage**: Chat history saved in localStorage
- **API Integration**: Ready for integration with any ChatBot API
- **Mobile Responsive**: Works perfectly on all device sizes
- **Dark/Light Theme**: Automatic theme detection

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chat-bot-fe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔧 API Integration

### Using Mock API (Default)

By default, the application uses a mock API that simulates ChatBot responses. This is perfect for development and testing.

### Integrating with Real ChatBot API

To connect with a real ChatBot API:

1. **Update the API endpoint**: Modify the `sendMessage` function in `src/composables/useChat.ts`

2. **Replace mock calls**: Change `sendMessageMock` to `sendMessage` in `src/components/ChatInterface.vue`

3. **Configure your API**: Update `src/services/chatApi.ts` with your API details

### ChatGPT Integration Example

To integrate with OpenAI's ChatGPT API:

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/)

2. Create a `.env` file:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

3. Use the `sendToChatGPT` function from `src/services/chatApi.ts`

4. Update the chat composable to use the real API:

```typescript
// In src/composables/useChat.ts
import { sendToChatGPT } from '@/services/chatApi'

// Replace the mock implementation with:
const sendMessage = async (userMessage: string) => {
  if (!currentSession.value) {
    createNewSession()
  }

  try {
    isLoading.value = true
    error.value = null

    addMessage(userMessage, 'user')
    const assistantMessage = addMessage('', 'assistant', true)
    
    const conversationHistory = currentSession.value!.messages
      .slice(-10)
      .filter(m => !m.isTyping)

    const response = await sendToChatGPT({
      message: userMessage,
      conversation_history: conversationHistory
    })
    
    if (assistantMessage) {
      updateMessage(assistantMessage.id, response.content, false)
    }
  } catch (error_) {
    error.value = error_ instanceof Error ? error_.message : 'An error occurred'
    // Handle error...
  } finally {
    isLoading.value = false
  }
}
```

## 📁 Project Structure

```
src/
├── components/          # Vue components
│   ├── ChatInterface.vue    # Main chat interface
│   ├── ChatMessage.vue      # Individual message component
│   ├── ChatInput.vue        # Message input component
│   └── ChatSidebar.vue      # Chat history sidebar
├── composables/         # Vue composables
│   └── useChat.ts           # Chat logic and state management
├── services/            # API services
│   └── chatApi.ts           # API integration utilities
├── types/               # TypeScript type definitions
│   └── chat.ts              # Chat-related types
└── pages/               # Application pages
    └── index.vue            # Main page
```

## 🎨 Customization

### Styling

The application uses Vuetify for UI components. You can customize the theme in `src/plugins/vuetify.ts`:

```typescript
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          // Add your custom colors
        }
      }
    }
  }
})
```

### Message Components

Customize message appearance by modifying `src/components/ChatMessage.vue`:

- Change avatar icons
- Modify message bubble styling
- Add message actions (copy, delete, etc.)
- Implement message reactions

### Chat Features

Extend functionality by modifying `src/composables/useChat.ts`:

- Add message search
- Implement message export
- Add file upload support
- Create message categories

## 🔌 API Specification

### Request Format

```typescript
interface ChatBotRequest {
  message: string
  conversation_history?: Message[]
}
```

### Response Format

```typescript
interface ChatBotResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
```

### Example API Endpoint

```typescript
POST /api/chat
Content-Type: application/json

{
  "message": "Hello, how are you?",
  "conversation_history": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant", 
      "content": "Previous response"
    }
  ]
}
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

1. Connect your repository to Netlify or Vercel
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables if using external APIs

### Deploy to Traditional Hosting

1. Run `npm run build`
2. Upload the `dist` folder contents to your web server
3. Configure your server to serve `index.html` for all routes (SPA mode)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you need help or have questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Provide steps to reproduce any bugs

## 🔄 Updates

- **v1.0.0**: Initial release with basic chat functionality
- **v1.1.0**: Added conversation history and persistence
- **v1.2.0**: Improved mobile responsiveness and typing indicators

---

Built with ❤️ using Vue 3, Vuetify, and TypeScript.
