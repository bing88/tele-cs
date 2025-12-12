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

  // Create bot instance for sending (webhook mode - no polling)
  const botInstance = new TelegramBot(token, { polling: false });
  
  let koreanText: string;
  
  try {
    // Step 1: Translate English to Korean
    console.log(`[Step 1] Translating message: "${text}"`);
    koreanText = await translateEnToKo(text);
    console.log(`[Step 1] Translation successful: "${koreanText}"`);
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : String(error);
    console.error('[Step 1] Translation failed:', errorDetails);
    throw new Error(`Translation failed: ${errorDetails}`);
  }

  try {
    // Step 2: Send to Telegram
    // Convert chatId to number for private chats (Telegram API expects number)
    const numericChatId = parseInt(chatId);
    if (isNaN(numericChatId)) {
      throw new Error(`Invalid chatId format: ${chatId}. Expected a number.`);
    }

    console.log(`[Step 2] Sending message to chat ${numericChatId}: "${koreanText}"`);
    
    // Send to Telegram (use numeric chatId)
    const sentMessage = await botInstance.sendMessage(numericChatId, koreanText);
    console.log(`[Step 2] Message sent successfully: ${sentMessage.message_id}`);
    
    // Store outbound message
    const storedMessage = await addMessage({
      telegramChatId: chatId,
      telegramMessageId: sentMessage.message_id,
      telegramUserId: numericChatId,
      direction: 'outbound',
      originalText: text,
      translatedText: koreanText,
      language: 'en',
      status: 'sent',
    });

    await updateMessageStatus(storedMessage.id, 'sent', new Date());

    return sentMessage;
  } catch (error) {
    const errorDetails = error instanceof Error ? error.message : String(error);
    const errorCode = (error as any)?.response?.body?.error_code;
    const errorDescription = (error as any)?.response?.body?.description;
    
    console.error('[Step 2] Telegram send failed:', {
      chatId,
      numericChatId: parseInt(chatId),
      text,
      translatedText: koreanText,
      error: errorDetails,
      errorCode,
      errorDescription,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Store failed message
    await addMessage({
      telegramChatId: chatId,
      telegramMessageId: 0,
      telegramUserId: parseInt(chatId) || 0,
      direction: 'outbound',
      originalText: text,
      translatedText: koreanText,
      language: 'en',
      status: 'failed',
    });

    // Provide more specific error message
    let errorMsg = `Failed to send Telegram message: ${errorDetails}`;
    if (errorCode === 403) {
      errorMsg = 'Bot is blocked by user or user has not started conversation with bot';
    } else if (errorCode === 400) {
      errorMsg = `Invalid request: ${errorDescription || errorDetails}`;
    } else if (errorCode) {
      errorMsg = `Telegram API error (${errorCode}): ${errorDescription || errorDetails}`;
    }

    throw new Error(errorMsg);
  }
}

