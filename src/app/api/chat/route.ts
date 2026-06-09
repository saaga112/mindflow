import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { auth } from '@/auth';

export const maxDuration = 60;

// Initialize providers with server-side API keys
const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt, apiMode, apiKey, provider, model: modelId } = await req.json();

    if (apiMode === 'platform') {
      const session = await auth();
      if (!session || !session.user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized. Please sign in to use the platform AI, or switch to "Bring Your Own Key" in settings.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else if (apiMode === 'custom') {
      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'API Key is required in Bring Your Own Key mode. Please update your settings.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let aiModel;
    
    if (provider === 'openai') {
      const keyToUse = apiMode === 'custom' ? apiKey : process.env.OPENAI_API_KEY;
      if (!keyToUse) throw new Error('OpenAI API Key is missing.');
      const customOpenAI = createOpenAI({ apiKey: keyToUse });
      aiModel = customOpenAI(modelId || 'gpt-4o');
    } else if (provider === 'anthropic') {
      const keyToUse = apiMode === 'custom' ? apiKey : process.env.ANTHROPIC_API_KEY;
      if (!keyToUse) throw new Error('Anthropic API Key is missing.');
      const customAnthropic = createAnthropic({ apiKey: keyToUse });
      aiModel = customAnthropic(modelId || 'claude-sonnet-4-5');
    } else if (provider === 'google') {
      const keyToUse = apiMode === 'custom' ? apiKey : process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!keyToUse) throw new Error('Google Gemini API Key is missing.');
      const customGoogle = createGoogleGenerativeAI({ apiKey: keyToUse });
      aiModel = customGoogle(modelId || 'gemini-1.5-pro-latest');
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid or unsupported provider specified.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model: aiModel,
      system:
        systemPrompt ||
        `You are MindFlow, a patient and engaging AI tutor. Use markdown formatting: headings, bullet points, code blocks, tables. Break complex topics into digestible parts. Be encouraging.`,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
