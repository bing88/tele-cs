import { Message, Conversation } from './types';

// In-memory storage
const messages: Message[] = [];
const conversations: Map<string, Message[]> = new Map();

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Store a message
export function addMessage(message: Omit<Message, 'id' | 'createdAt'>): Message {
  const newMessage: Message = {
    ...message,
    id: generateId(),
    createdAt: new Date(),
  };

  messages.push(newMessage);

  // Update conversations map
  if (!conversations.has(message.telegramChatId)) {
    conversations.set(message.telegramChatId, []);
  }
  conversations.get(message.telegramChatId)!.push(newMessage);

  return newMessage;
}

// Get all messages for a specific chat
export function getMessagesByChatId(chatId: string): Message[] {
  return conversations.get(chatId) || [];
}

// Get all conversations (with latest message)
export function getAllConversations(): Conversation[] {
  const convs: Conversation[] = [];

  conversations.forEach((msgs, chatId) => {
    if (msgs.length === 0) return;

    const sorted = [...msgs].sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
    const lastMessage = sorted[sorted.length - 1];
    const firstMessage = sorted[0];

    convs.push({
      chatId,
      userId: firstMessage.telegramUserId,
      username: firstMessage.telegramUsername,
      lastMessage,
      messageCount: msgs.length,
      lastActivity: lastMessage.createdAt,
    });
  });

  // Sort by last activity (most recent first)
  return convs.sort((a, b) => 
    b.lastActivity.getTime() - a.lastActivity.getTime()
  );
}

// Get a single message by ID
export function getMessageById(id: string): Message | undefined {
  return messages.find(msg => msg.id === id);
}

// Update message status
export function updateMessageStatus(
  id: string,
  status: Message['status'],
  sentAt?: Date
): Message | undefined {
  const message = messages.find(msg => msg.id === id);
  if (message) {
    message.status = status;
    if (sentAt) {
      message.sentAt = sentAt;
    }
  }
  return message;
}

// Clear all messages (for testing/reset)
export function clearAll(): void {
  messages.length = 0;
  conversations.clear();
}

// Generate sample data for testing
export function generateSampleData(): void {
  clearAll(); // Clear existing data first

  const now = new Date();
  
  // Sample conversation 1: 김민수 (Kim Minsoo)
  const chatId1 = '1236855149';
  const userId1 = 1236855149;
  
  addMessage({
    telegramChatId: chatId1,
    telegramMessageId: 1,
    telegramUserId: userId1,
    telegramUsername: 'kimminsoo',
    direction: 'inbound',
    originalText: '안녕하세요, 제품에 대해 문의가 있습니다.',
    translatedText: 'Hello, I have a question about the product.',
    language: 'ko',
    status: 'sent',
    createdAt: new Date(now.getTime() - 10 * 60000), // 10 minutes ago
  });

  addMessage({
    telegramChatId: chatId1,
    telegramMessageId: 2,
    telegramUserId: userId1,
    telegramUsername: 'kimminsoo',
    direction: 'outbound',
    originalText: 'Hello! How can I help you today?',
    translatedText: '안녕하세요! 오늘 어떻게 도와드릴까요?',
    language: 'en',
    status: 'sent',
    createdAt: new Date(now.getTime() - 9 * 60000), // 9 minutes ago
  });

  addMessage({
    telegramChatId: chatId1,
    telegramMessageId: 3,
    telegramUserId: userId1,
    telegramUsername: 'kimminsoo',
    direction: 'inbound',
    originalText: '배송은 언제 도착하나요?',
    translatedText: 'When will the delivery arrive?',
    language: 'ko',
    status: 'sent',
    createdAt: new Date(now.getTime() - 8 * 60000), // 8 minutes ago
  });

  addMessage({
    telegramChatId: chatId1,
    telegramMessageId: 4,
    telegramUserId: userId1,
    telegramUsername: 'kimminsoo',
    direction: 'outbound',
    originalText: 'Your order will arrive within 2-3 business days.',
    translatedText: '주문하신 상품은 영업일 기준 2-3일 내에 도착할 예정입니다.',
    language: 'en',
    status: 'sent',
    createdAt: new Date(now.getTime() - 7 * 60000), // 7 minutes ago
  });

  addMessage({
    telegramChatId: chatId1,
    telegramMessageId: 5,
    telegramUserId: userId1,
    telegramUsername: 'kimminsoo',
    direction: 'inbound',
    originalText: '감사합니다!',
    translatedText: 'Thank you!',
    language: 'ko',
    status: 'sent',
    createdAt: new Date(now.getTime() - 2 * 60000), // 2 minutes ago
  });

  // Sample conversation 2: 이지은 (Lee Jieun)
  const chatId2 = '987654321';
  const userId2 = 987654321;

  addMessage({
    telegramChatId: chatId2,
    telegramMessageId: 1,
    telegramUserId: userId2,
    telegramUsername: 'jieunlee',
    direction: 'inbound',
    originalText: '환불 요청하고 싶어요.',
    translatedText: 'I would like to request a refund.',
    language: 'ko',
    status: 'sent',
    createdAt: new Date(now.getTime() - 15 * 60000), // 15 minutes ago
  });

  addMessage({
    telegramChatId: chatId2,
    telegramMessageId: 2,
    telegramUserId: userId2,
    telegramUsername: 'jieunlee',
    direction: 'outbound',
    originalText: 'I can help you with that. Can you provide your order number?',
    translatedText: '도와드리겠습니다. 주문 번호를 알려주실 수 있나요?',
    language: 'en',
    status: 'sent',
    createdAt: new Date(now.getTime() - 14 * 60000), // 14 minutes ago
  });

  addMessage({
    telegramChatId: chatId2,
    telegramMessageId: 3,
    telegramUserId: userId2,
    telegramUsername: 'jieunlee',
    direction: 'inbound',
    originalText: '주문번호는 ORD-12345입니다.',
    translatedText: 'The order number is ORD-12345.',
    language: 'ko',
    status: 'sent',
    createdAt: new Date(now.getTime() - 13 * 60000), // 13 minutes ago
  });

  // Sample conversation 3: 박서준 (Park Seojun)
  const chatId3 = '555666777';
  const userId3 = 555666777;

  addMessage({
    telegramChatId: chatId3,
    telegramMessageId: 1,
    telegramUserId: userId3,
    telegramUsername: 'seojunpark',
    direction: 'inbound',
    originalText: '제품이 손상되어 도착했어요.',
    translatedText: 'The product arrived damaged.',
    language: 'ko',
    status: 'sent',
    createdAt: new Date(now.getTime() - 30 * 60000), // 30 minutes ago
  });

  addMessage({
    telegramChatId: chatId3,
    telegramMessageId: 2,
    telegramUserId: userId3,
    telegramUsername: 'seojunpark',
    direction: 'outbound',
    originalText: 'I apologize for the inconvenience. Please send photos of the damaged item.',
    translatedText: '불편을 드려 죄송합니다. 손상된 제품 사진을 보내주세요.',
    language: 'en',
    status: 'sent',
    createdAt: new Date(now.getTime() - 29 * 60000), // 29 minutes ago
  });

  addMessage({
    telegramChatId: chatId3,
    telegramMessageId: 3,
    telegramUserId: userId3,
    telegramUsername: 'seojunpark',
    direction: 'inbound',
    originalText: '사진 보내드릴게요.',
    translatedText: 'I will send you the photos.',
    language: 'ko',
    status: 'sent',
    createdAt: new Date(now.getTime() - 28 * 60000), // 28 minutes ago
  });

  // Sample conversation 4: 최유나 (Choi Yuna) - New conversation
  const chatId4 = '111222333';
  const userId4 = 111222333;

  addMessage({
    telegramChatId: chatId4,
    telegramMessageId: 1,
    telegramUserId: userId4,
    telegramUsername: 'yunachoi',
    direction: 'inbound',
    originalText: '안녕하세요, 상품 재고가 있나요?',
    translatedText: 'Hello, is the product in stock?',
    language: 'ko',
    status: 'sent',
    createdAt: new Date(now.getTime() - 1 * 60000), // 1 minute ago
  });
}

