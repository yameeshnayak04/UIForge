import { NextRequest, NextResponse } from 'next/server';
import { GeminiProvider } from '@/lib/llm/gemini-provider';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 400 });
    }

    const provider = new GeminiProvider(apiKey, process.env.GEMINI_MODEL || 'gemini-1.5-flash');
    const response = await provider.chat(prompt);

    return NextResponse.json({
      success: true,
      rawResponse: response,
      length: response.length,
      firstChars: response.substring(0, 500),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
