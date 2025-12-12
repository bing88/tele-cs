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

