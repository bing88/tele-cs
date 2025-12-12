import { NextRequest, NextResponse } from 'next/server';
import { generateSampleData } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    await generateSampleData();
    return NextResponse.json({ 
      success: true,
      message: 'Sample data generated successfully',
      conversations: 4,
      messages: 12
    });
  } catch (error) {
    console.error('Error generating sample data:', error);
    return NextResponse.json(
      { error: 'Failed to generate sample data' },
      { status: 500 }
    );
  }
}

// Also allow GET for easy testing
export async function GET() {
  try {
    await generateSampleData();
    return NextResponse.json({ 
      success: true,
      message: 'Sample data generated successfully',
      conversations: 4,
      messages: 12
    });
  } catch (error) {
    console.error('Error generating sample data:', error);
    return NextResponse.json(
      { error: 'Failed to generate sample data' },
      { status: 500 }
    );
  }
}

