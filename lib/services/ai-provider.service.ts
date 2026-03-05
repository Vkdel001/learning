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

  constructor(apiKey: string, model: string = 'gemini-pro') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
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

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return {
        content: text,
        provider: 'gemini',
        model: this.model,
        tokensUsed: response.usageMetadata?.totalTokenCount,
      };
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new Error('Failed to generate content with Gemini');
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
