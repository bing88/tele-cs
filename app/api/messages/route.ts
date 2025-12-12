import { NextRequest, NextResponse } from 'next/server';
import { getAllConversations, getMessagesByChatId } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatId = searchParams.get('chat_id');

    if (chatId) {
      // Get messages for specific chat
      const messages = getMessagesByChatId(chatId);
      return NextResponse.json({ messages });
    } else {
      // Get all conversations
      const conversations = getAllConversations();
      return NextResponse.json({ conversations });
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

