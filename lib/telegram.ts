import TelegramBot from 'node-telegram-bot-api';
import { translateKoToEn, translateEnToKo } from './openai';
import { addMessage, updateMessageStatus } from './store';

let bot: TelegramBot | null = null;

/**
 * Initialize Telegram bot
 */
export function initTelegramBot(): TelegramBot {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  bot = new TelegramBot(token);

  // Handle incoming messages
  bot.on('message', async (msg) => {
    try {
      // Skip if message is from a channel or group (only handle private messages)
      if (msg.chat.type !== 'private') {
        return;
      }

      // Skip if message doesn't have text
      if (!msg.text) {
        return;
      }

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
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  return bot;
}

/**
 * Get bot instance
 */
export function getBot(): TelegramBot {
  if (!bot) {
    throw new Error('Bot not initialized. Call initTelegramBot() first.');
  }
  return bot;
}

/**
 * Send message to Telegram user
 */
export async function sendMessage(
  chatId: string,
  text: string
): Promise<TelegramBot.Message> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  // Create bot instance for sending (webhook mode)
  const botInstance = new TelegramBot(token);
  
  try {
    // Translate English to Korean before sending
    const koreanText = await translateEnToKo(text);
    
    // Send to Telegram
    const sentMessage = await botInstance.sendMessage(chatId, koreanText);
    
    // Store outbound message
    const storedMessage = addMessage({
      telegramChatId: chatId,
      telegramMessageId: sentMessage.message_id,
      telegramUserId: parseInt(chatId), // Chat ID is usually the user ID for private chats
      direction: 'outbound',
      originalText: text,
      translatedText: koreanText,
      language: 'en',
      status: 'sent',
    });

    updateMessageStatus(storedMessage.id, 'sent', new Date());

    return sentMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Store failed message
    addMessage({
      telegramChatId: chatId,
      telegramMessageId: 0,
      telegramUserId: parseInt(chatId),
      direction: 'outbound',
      originalText: text,
      language: 'en',
      status: 'failed',
    });

    throw error;
  }
}

