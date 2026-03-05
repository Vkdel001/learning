import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Provider Service
 * Abstraction layer for AI content generation
 */

export interface GenerationConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

/**
 * AI Provider interface
 */
export interface IAIProvider {
  generateContent(prompt: string, config?: GenerationConfig): Promise<AIResponse>;
  getName(): string;
  getModel(): string;
}

/**
 * Google Gemini Provider
 */
export class GeminiProvider implements IAIProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    // Allow model override via env var or parameter
    // Default to gemini-2.5-flash (fast and reliable)
    this.model = model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    console.log(`🤖 Using Gemini model: ${this.model}`);
  }

  async generateContent(
    prompt: string,
    config?: GenerationConfig
  ): Promise<AIResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: config?.temperature ?? 0.7,
          maxOutputTokens: config?.maxTokens ?? 2048,
          topP: config?.topP ?? 0.95,
          topK: config?.topK ?? 40,
        },
      });

      console.log(`🤖 Calling Gemini API (${this.model})...`);
      console.log(`📝 Prompt length: ${prompt.length} characters`);
      
      // Add timeout wrapper (60 seconds for longer prompts)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('API call timed out after 60 seconds')), 60000);
      });

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);
      
      const response = result.response;
      const text = response.text();

      console.log(`✅ Received response (${text.length} chars, ${response.usageMetadata?.totalTokenCount || 0} tokens)`);

      return {
        content: text,
        provider: 'gemini',
        model: this.model,
        tokensUsed: response.usageMetadata?.totalTokenCount,
      };
    } catch (error: any) {
      console.error('Gemini generation error:', error.message);
      
      // Handle rate limiting
      if (error.message && error.message.includes('429')) {
        throw new Error('Gemini API rate limit exceeded. Free tier allows 20 requests/day. Please wait or upgrade your plan. See RATE_LIMIT_ISSUE.md for solutions.');
      }
      
      // Handle timeout
      if (error.message.includes('timeout')) {
        throw new Error('AI request timed out. Please try again.');
      }
      
      throw new Error(`Failed to generate content with Gemini: ${error.message}`);
    }
  }

  getName(): string {
    return 'gemini';
  }

  getModel(): string {
    return this.model;
  }
}

/**
 * Factory function to create AI provider
 */
export function createAIProvider(
  provider: string = 'gemini',
  apiKey?: string
): IAIProvider {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('AI provider API key not configured');
  }

  switch (provider.toLowerCase()) {
    case 'gemini':
      return new GeminiProvider(key);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

/**
 * Default AI provider instance
 */
let defaultProvider: IAIProvider | null = null;

export function getDefaultProvider(): IAIProvider {
  if (!defaultProvider) {
    defaultProvider = createAIProvider();
  }
  return defaultProvider;
}
