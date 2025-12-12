# Telegram CS Bot with Translation - Implementation Plan

## System Overview

A customer service system where:
- **Customers** send messages in Korean via Telegram
- **CS Agents** view and reply in English via web portal
- **Translation** happens automatically using OpenAI

## Architecture (Demo - In-Memory Storage)

```
┌─────────────┐
│ Telegram Bot│ ← Receives Korean messages
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Backend API Server          │
│  ┌───────────────────────────────┐  │
│  │  Telegram Webhook Handler     │  │
│  └──────────────┬────────────────┘  │
│                 │                    │
│  ┌──────────────▼────────────────┐  │
│  │  Translation Service (OpenAI) │  │
│  │  Korean → English             │  │
│  └──────────────┬────────────────┘  │
│                 │                    │
│  ┌──────────────▼────────────────┐  │
│  │  In-Memory Store (Array/Map)  │  │
│  │  Messages stored in memory    │  │
│  └──────────────┬────────────────┘  │
│                 │                    │
│  ┌──────────────▼────────────────┐  │
│  │  API Routes (Next.js)          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Web Portal     │
                   │  (Next.js UI)   │
                   └────────┬────────┘
                            │
                            │ (User replies in English)
                            ▼
                   ┌─────────────────┐
                   │ Translation     │
                   │ English → Korean│
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ Send to Telegram│
                   └─────────────────┘
```

## Tech Stack

### Frontend (Web Portal)
- **Next.js 16** (App Router) - Already set up
- **React 19** - Already set up
- **Tailwind CSS** - Already set up
- **TypeScript** - Already set up

### Backend
- **Next.js API Routes** - For webhook and API endpoints
- **node-telegram-bot-api** - Telegram bot SDK
- **OpenAI API** - For translation
- **In-Memory Storage** - Simple arrays/Maps (demo only, data lost on restart)

### Additional Dependencies Needed
```json
{
  "node-telegram-bot-api": "^0.66.0",
  "openai": "^4.0.0"
}
```

## Project Structure

```
telegram-cs/
├── app/
│   ├── api/
│   │   ├── webhook/
│   │   │   └── route.ts          # Telegram webhook endpoint
│   │   ├── messages/
│   │   │   ├── route.ts          # GET/POST messages API
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET/PUT specific message
│   │   └── translate/
│   │       └── route.ts          # Translation API
│   ├── page.tsx                   # Main CS dashboard
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── telegram.ts                # Telegram bot client
│   ├── openai.ts                  # OpenAI client & translation
│   ├── store.ts                   # In-memory message store
│   └── types.ts                   # TypeScript types
├── components/
│   ├── MessageList.tsx            # List of conversations
│   ├── MessageThread.tsx          # Individual conversation thread
│   ├── ReplyBox.tsx               # Reply input component
│   └── MessageBubble.tsx          # Individual message display
├── .env.local                     # Environment variables
└── PLAN.md                        # This file
```

## Data Structure (In-Memory)

### Message Type
```typescript
interface Message {
  id: string; // UUID or timestamp-based ID
  telegramChatId: string;
  telegramMessageId: number;
  telegramUserId: number;
  telegramUsername?: string;
  direction: 'inbound' | 'outbound';
  originalText: string; // Original language text
  translatedText?: string; // Translated text
  language: 'ko' | 'en';
  createdAt: Date;
  sentAt?: Date; // When message was sent to Telegram
  status: 'pending' | 'sent' | 'failed';
}
```

### In-Memory Store
```typescript
// lib/store.ts
const messages: Message[] = [];
const conversations: Map<string, Message[]> = new Map(); // chatId -> messages[]
```

## API Endpoints

### 1. POST `/api/webhook`
- Receives Telegram webhook updates
- Validates webhook secret
- Processes incoming messages
- Translates Korean → English
- Stores in memory (messages array)
- Returns 200 OK

### 2. GET `/api/messages`
- Returns list of conversations
- Query params: `?chat_id=123` (optional, for specific chat)
- Returns: Array of message threads with latest message
- Reads from in-memory store

### 3. GET `/api/messages/[chatId]`
- Returns full conversation thread for a chat
- Returns: Array of all messages in chronological order
- Reads from in-memory store

### 4. POST `/api/messages/[chatId]/reply`
- Receives English reply from web portal
- Translates English → Korean
- Sends to Telegram
- Stores in memory (messages array)
- Returns: Sent message object

### 5. POST `/api/translate`
- Utility endpoint for translation
- Body: `{ text: string, from: string, to: string }`
- Returns: `{ translated: string }`

## Environment Variables

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret_here
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/webhook

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Implementation Steps

### Phase 1: Setup & Infrastructure
1. ✅ Install dependencies (`node-telegram-bot-api`, `openai`)
2. ✅ Create in-memory store (messages array/Map)
3. ✅ Create TypeScript types
4. ✅ Setup environment variables

### Phase 2: Telegram Integration
1. ✅ Create Telegram bot client
2. ✅ Setup webhook endpoint
3. ✅ Handle incoming messages
4. ✅ Store messages in memory

### Phase 3: Translation Service
1. ✅ Create OpenAI client
2. ✅ Implement translation functions (KO→EN, EN→KO)
3. ✅ Integrate with message flow

### Phase 4: Web Portal
1. ✅ Create message list component
2. ✅ Create conversation thread view
3. ✅ Create reply input component
4. ✅ Implement real-time updates (polling or SSE)

### Phase 5: Reply System
1. ✅ Create reply API endpoint
2. ✅ Translate reply (EN→KO)
3. ✅ Send to Telegram
4. ✅ Store reply in memory

### Phase 6: Polish & Testing
1. ✅ Error handling
2. ✅ Loading states
3. ✅ Error messages
4. ✅ Testing with real Telegram bot

## Key Features

### Web Portal Features
- **Conversation List**: Shows all active conversations
- **Message Thread**: Shows full conversation history
- **Reply Box**: Type English reply, auto-translates to Korean
- **Status Indicators**: Shows message status (pending, sent, failed)
- **Auto-refresh**: Polls for new messages every few seconds

### Translation Features
- **Automatic Detection**: Detects source language
- **Bidirectional**: Korean ↔ English
- **Context Preservation**: Maintains conversation context
- **Error Handling**: Falls back gracefully if translation fails

### Telegram Bot Features
- **Webhook-based**: Real-time message receiving
- **In-Memory Storage**: All messages stored in memory (demo only)
- **Reply Tracking**: Tracks sent messages
- **Error Recovery**: Handles failed sends

### Demo Limitations
- ⚠️ **Data Loss on Restart**: All messages lost when server restarts
- ⚠️ **No Persistence**: Messages only exist in memory
- ⚠️ **Single Instance**: Not suitable for multiple server instances

## Security Considerations

1. **Webhook Validation**: Verify Telegram webhook requests
2. **API Authentication**: Protect API routes (optional for MVP)
3. **Rate Limiting**: Prevent abuse
4. **Input Sanitization**: Sanitize user inputs
5. **Environment Variables**: Never commit secrets

## Future Enhancements

- [ ] Multiple language support (not just Korean)
- [ ] Multiple CS agents
- [ ] Message status tracking (read receipts)
- [ ] File/image support
- [ ] Search functionality
- [ ] Conversation tagging/categorization
- [ ] Analytics dashboard
- [ ] WebSocket for real-time updates (instead of polling)

## Testing Checklist

- [ ] Telegram bot receives messages
- [ ] Messages are translated correctly
- [ ] Messages appear in web portal
- [ ] Replies are translated correctly
- [ ] Replies are sent to Telegram
- [ ] In-memory store maintains messages during session
- [ ] Error handling works
- [ ] Webhook validation works
- [ ] Messages persist during server runtime (until restart)

