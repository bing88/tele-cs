import { NextRequest, NextResponse } from 'next/server';
import TelegramBot from 'node-telegram-bot-api';
import { translateKoToEn } from '@/lib/openai';
import { addMessage } from '@/lib/store';

// Initialize bot (will be reused)
let bot: TelegramBot | null = null;

function getBot(): TelegramBot {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }
    bot = new TelegramBot(token);
  }
  return bot;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Telegram webhook validation
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret && request.headers.get('x-telegram-bot-api-secret-token') !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process update
    const update = body;
    
    // Handle message updates
    if (update.message) {
      const msg = update.message;
      
      // Only handle private messages with text
      if (msg.chat.type === 'private' && msg.text) {
        const chatId = msg.chat.id.toString();
        const userId = msg.from?.id || 0;
        const username = msg.from?.username || msg.from?.first_name || 'Unknown';

        console.log(`Received message from ${username} (${userId}): ${msg.text}`);

        // Translate Korean to English
        let translatedText: string;
        try {
          translatedText = await translateKoToEn(msg.text);
          console.log(`Translated: ${msg.text} -> ${translatedText}`);
        } catch (error) {
          console.error('Translation failed:', error);
          // Fallback: use original text if translation fails
          translatedText = msg.text;
        }

        // Store message in memory
        addMessage({
          telegramChatId: chatId,
          telegramMessageId: msg.message_id,
          telegramUserId: userId,
          telegramUsername: username,
          direction: 'inbound',
          originalText: msg.text,
          translatedText,
          language: 'ko',
          status: 'sent',
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// For webhook setup (GET request)
export async function GET() {
  return NextResponse.json({ 
    message: 'Telegram webhook endpoint',
    status: 'ready'
  });
}

