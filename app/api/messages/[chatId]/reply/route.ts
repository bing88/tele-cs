import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/telegram';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }

    // Send message via Telegram bot
    const sentMessage = await sendMessage(chatId, text);

    return NextResponse.json({ 
      success: true,
      message: sentMessage 
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTelegramError = errorMessage.includes('TELEGRAM_BOT_TOKEN') || errorMessage.includes('Telegram');
    const isOpenAIError = errorMessage.includes('OPENAI_API_KEY') || errorMessage.includes('OpenAI');
    
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        hint: isTelegramError 
          ? 'Telegram bot token may be missing or invalid'
          : isOpenAIError
          ? 'OpenAI API key may be missing or invalid'
          : 'Check server logs for details'
      },
      { status: 500 }
    );
  }
}

