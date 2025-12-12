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
    const isTelegramError = errorMessage.includes('TELEGRAM_BOT_TOKEN') || 
                           errorMessage.includes('Telegram') ||
                           errorMessage.includes('blocked') ||
                           errorMessage.includes('Invalid request');
    const isOpenAIError = errorMessage.includes('OPENAI_API_KEY') || 
                         errorMessage.includes('OpenAI') ||
                         errorMessage.includes('Translation failed');
    
    // In production, still return some details for debugging
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        message: errorMessage, // Always return the actual error message
        hint: isTelegramError 
          ? 'Telegram error - user may have blocked bot or not started conversation'
          : isOpenAIError
          ? 'Translation error - check OpenAI API key and quota'
          : 'Check server logs for details'
      },
      { status: 500 }
    );
  }
}

