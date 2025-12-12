import OpenAI from 'openai';
import { TranslationRequest, TranslationResponse } from './types';

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey });
}

/**
 * Translate text from one language to another
 */
export async function translate(
  text: string,
  from: 'ko' | 'en',
  to: 'ko' | 'en'
): Promise<string> {
  const fromLang = from === 'ko' ? 'Korean' : 'English';
  const toLang = to === 'ko' ? 'Korean' : 'English';

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in customer service for the betting industry. Translate the following text from ${fromLang} to ${toLang}, maintaining the professional and appropriate tone for customer service in the betting industry. Use industry-appropriate terminology and maintain a helpful, professional customer service voice. Only return the translated text, nothing else.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const translated = response.choices[0]?.message?.content?.trim();
    if (!translated) {
      throw new Error('Translation returned empty result');
    }

    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * Translate Korean to English
 */
export async function translateKoToEn(text: string): Promise<string> {
  return translate(text, 'ko', 'en');
}

/**
 * Translate English to Korean
 */
export async function translateEnToKo(text: string): Promise<string> {
  return translate(text, 'en', 'ko');
}

