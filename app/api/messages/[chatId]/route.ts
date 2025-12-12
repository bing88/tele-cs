import { NextRequest, NextResponse } from 'next/server';
import { getMessagesByChatId } from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const messages = getMessagesByChatId(chatId);
    
    // Sort by creation time (oldest first)
    const sorted = [...messages].sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );

    return NextResponse.json({ messages: sorted });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

