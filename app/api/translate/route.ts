import { NextRequest, NextResponse } from 'next/server';
import { translate } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, from, to } = body;

    if (!text || !from || !to) {
      return NextResponse.json(
        { error: 'text, from, and to are required' },
        { status: 400 }
      );
    }

    if (from !== 'ko' && from !== 'en') {
      return NextResponse.json(
        { error: 'from must be "ko" or "en"' },
        { status: 400 }
      );
    }

    if (to !== 'ko' && to !== 'en') {
      return NextResponse.json(
        { error: 'to must be "ko" or "en"' },
        { status: 400 }
      );
    }

    const translated = await translate(text, from, to);

    return NextResponse.json({ translated });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}

