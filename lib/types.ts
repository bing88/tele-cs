export interface Message {
  id: string;
  telegramChatId: string;
  telegramMessageId: number;
  telegramUserId: number;
  telegramUsername?: string;
  direction: 'inbound' | 'outbound';
  originalText: string;
  translatedText?: string;
  language: 'ko' | 'en';
  createdAt: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
}

export interface Conversation {
  chatId: string;
  userId: number;
  username?: string;
  lastMessage?: Message;
  messageCount: number;
  lastActivity: Date;
}

export interface TranslationRequest {
  text: string;
  from: 'ko' | 'en';
  to: 'ko' | 'en';
}

export interface TranslationResponse {
  translated: string;
}

