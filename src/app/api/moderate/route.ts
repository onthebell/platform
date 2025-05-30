import { NextRequest, NextResponse } from 'next/server';
import { moderateContent, getFlaggedContentMessage } from '@/lib/moderation';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Content is too long (maximum 10,000 characters)' },
        { status: 400 }
      );
    }

    const result = await moderateContent(content);

    const response = {
      flagged: result.flagged,
      safe: !result.flagged,
      message: result.flagged ? getFlaggedContentMessage(result) : 'Content is appropriate',
      categories: result.categories,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in moderation API:', error);

    return NextResponse.json(
      {
        error: 'Failed to moderate content',
        safe: true, // Allow content through in case of API failure
        message: 'Content moderation temporarily unavailable',
      },
      { status: 500 }
    );
  }
}
