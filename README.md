# Telegram CS Bot with Translation

A customer service system where:
- **Customers** send messages in Korean via Telegram
- **CS Agents** view and reply in English via web portal
- **Translation** happens automatically using OpenAI

## Features

- ✅ Real-time message receiving via Telegram webhooks
- ✅ Automatic translation (Korean ↔ English)
- ✅ Simple web portal for CS agents
- ✅ In-memory storage (demo mode)
- ✅ Bidirectional communication

## Prerequisites

- Node.js 18+ 
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- OpenAI API Key

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret_here
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/webhook

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token and add it to `.env.local`

### 4. Setup Webhook (Production)

For production, you need to set up the webhook URL. You can use a service like:
- [ngrok](https://ngrok.com/) for local testing
- [Vercel](https://vercel.com/) for deployment

#### Using ngrok (Local Testing)

```bash
# 1. Sign up for free ngrok account at https://dashboard.ngrok.com/signup
# 2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
# 3. Authenticate ngrok (one-time setup)
ngrok config add-authtoken YOUR_AUTHTOKEN

# 4. Start your Next.js app
npm run dev

# 5. In another terminal, expose localhost:3000
ngrok http 3000

# 6. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# 7. Update TELEGRAM_WEBHOOK_URL in .env.local with the ngrok URL
```

Then set the webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/api/webhook", "secret_token": "your_webhook_secret"}'
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the web portal.

## Usage

1. **Customer sends message in Korean** → Telegram bot receives it
2. **Backend translates to English** → Message appears in web portal
3. **CS Agent types reply in English** → Reply box in web portal
4. **Backend translates to Korean** → Reply sent to Telegram user

## Project Structure

```
telegram-cs/
├── app/
│   ├── api/
│   │   ├── webhook/          # Telegram webhook endpoint
│   │   ├── messages/         # Message API endpoints
│   │   └── translate/       # Translation API
│   └── page.tsx              # Main dashboard
├── components/
│   ├── MessageList.tsx      # Conversation list
│   ├── MessageThread.tsx    # Message thread view
│   ├── MessageBubble.tsx    # Individual message
│   └── ReplyBox.tsx         # Reply input
├── lib/
│   ├── types.ts             # TypeScript types
│   ├── store.ts             # In-memory storage
│   ├── openai.ts            # OpenAI client
│   └── telegram.ts          # Telegram bot client
└── .env.local               # Environment variables
```

## API Endpoints

- `POST /api/webhook` - Telegram webhook handler
- `GET /api/messages` - Get all conversations
- `GET /api/messages/[chatId]` - Get messages for a chat
- `POST /api/messages/[chatId]/reply` - Send reply to user
- `POST /api/translate` - Translate text

## Demo Limitations

⚠️ **In-Memory Storage**: All messages are stored in memory and will be lost when the server restarts.

For production use, consider adding a database (PostgreSQL, MongoDB, etc.).

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### Webhook not receiving messages
- Check that webhook URL is correctly set
- Verify `TELEGRAM_WEBHOOK_SECRET` matches
- Check server logs for errors

### Translation not working
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI API quota/limits
- Review server logs for translation errors

### Messages not appearing
- Check browser console for errors
- Verify API endpoints are working
- Check network tab for failed requests

## License

MIT
