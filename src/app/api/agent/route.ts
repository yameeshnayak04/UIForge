import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/agent/orchestrator';
import { MockProvider } from '@/lib/llm/mock-provider';
import { OpenAIProvider } from '@/lib/llm/openai-provider';
import { GeminiProvider } from '@/lib/llm/gemini-provider';
import { AgentRequest, AgentResponse } from '@/types';
import { LLMProvider } from '@/lib/llm/provider';

function getProvider(): LLMProvider {
  const providerType = process.env.LLM_PROVIDER || 'mock';

  switch (providerType.toLowerCase()) {
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('OPENAI_API_KEY not set, falling back to mock provider');
        return new MockProvider();
      }
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      console.log(`Using OpenAI provider with model: ${model}`);
      return new OpenAIProvider(apiKey, model);
    }

    case 'gemini': {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('GEMINI_API_KEY not set, falling back to mock provider');
        return new MockProvider();
      }
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      console.log(`Using Gemini provider with model: ${model}`);
      return new GeminiProvider(apiKey, model);
    }

    case 'mock':
    default:
      console.log('Using Mock provider (no API key required)');
      return new MockProvider();
  }
}

function isQuotaOrRateLimitError(errorMessage?: string): boolean {
  if (!errorMessage) return false;
  const lower = errorMessage.toLowerCase();
  return (
    lower.includes('429') ||
    lower.includes('quota') ||
    lower.includes('resource_exhausted') ||
    lower.includes('rate limit')
  );
}

function getFallbackProvider(primaryType: string): LLMProvider {
  const fallbackType = (process.env.LLM_FALLBACK_PROVIDER || 'mock').toLowerCase();

  if (fallbackType === primaryType) {
    return new MockProvider();
  }

  switch (fallbackType) {
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('Fallback OPENAI_API_KEY not set, using mock provider');
        return new MockProvider();
      }
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      return new OpenAIProvider(apiKey, model);
    }
    case 'gemini': {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('Fallback GEMINI_API_KEY not set, using mock provider');
        return new MockProvider();
      }
      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      return new GeminiProvider(apiKey, model);
    }
    case 'mock':
    default:
      return new MockProvider();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AgentRequest = await request.json();
    const providerType = (process.env.LLM_PROVIDER || 'mock').toLowerCase();

    const provider = getProvider();
    const orchestrator = new AgentOrchestrator(provider);
    let response: AgentResponse = await orchestrator.execute(body);

    if (!response.success && isQuotaOrRateLimitError(response.error)) {
      console.warn('Primary provider quota/rate limit reached. Falling back provider...');
      const fallbackProvider = getFallbackProvider(providerType);
      const fallbackOrchestrator = new AgentOrchestrator(fallbackProvider);
      const fallbackResponse = await fallbackOrchestrator.execute(body);

      if (fallbackResponse.success) {
        fallbackResponse.explanation = `[Fallback: ${process.env.LLM_FALLBACK_PROVIDER || 'mock'}] ${fallbackResponse.explanation || ''}`.trim();
        response = fallbackResponse;
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
