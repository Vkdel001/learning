import { ElevenLabsClient } from 'elevenlabs';
import { createHash } from 'crypto';
import { prisma } from '../prisma';

/**
 * Text-to-Speech Service using ElevenLabs
 * Generates audio narration for lesson content
 */

export interface TTSOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - friendly female voice
const DEFAULT_MODEL_ID = 'eleven_monolingual_v1';

// Initialize ElevenLabs client
let elevenLabsClient: ElevenLabsClient | null = null;

if (process.env.ELEVENLABS_API_KEY) {
  elevenLabsClient = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });
}

/**
 * Generate a hash for text to use as cache key
 */
function generateTextHash(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

/**
 * Generate audio from text using ElevenLabs
 */
export async function generateSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<{ audioUrl: string; duration: number; textHash: string }> {
  const {
    voiceId = DEFAULT_VOICE_ID,
    modelId = DEFAULT_MODEL_ID,
    stability = 0.5,
    similarityBoost = 0.75,
  } = options;

  const textHash = generateTextHash(text);

  // Check if we already have this audio in database
  const existingAudio = await prisma.audioSegment.findUnique({
    where: { textHash },
  });

  if (existingAudio) {
    console.log(`✅ Audio cache hit for text hash: ${textHash}`);
    
    // Update usage count
    await prisma.audioSegment.update({
      where: { id: existingAudio.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return {
      audioUrl: existingAudio.audioUrl,
      duration: existingAudio.duration,
      textHash,
    };
  }

  // Generate new audio with ElevenLabs
  if (!elevenLabsClient) {
    console.warn('⚠️ ElevenLabs not configured, using placeholder');
    
    // Estimate duration
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = Math.ceil((wordCount / 150) * 60);

    return {
      audioUrl: '/audio/placeholder.mp3',
      duration: estimatedDuration,
      textHash,
    };
  }

  try {
    console.log(`🔊 Generating audio with ElevenLabs for text: ${text.substring(0, 50)}...`);

    // Generate audio
    const audio = await elevenLabsClient.generate({
      voice: voiceId,
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
      },
    });

    // Convert audio stream to base64 data URL
    // In production, you'd upload this to S3/storage and get a URL
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Estimate duration (rough calculation)
    const wordCount = text.split(/\s+/).length;
    const estimatedDuration = Math.ceil((wordCount / 150) * 60);

    // Save to database
    await prisma.audioSegment.create({
      data: {
        textHash,
        text,
        audioUrl,
        duration: estimatedDuration,
        provider: 'elevenlabs',
        storageKey: textHash,
        usageCount: 1,
        lastUsedAt: new Date(),
      },
    });

    console.log(`✅ Audio generated and cached for text hash: ${textHash}`);

    return {
      audioUrl,
      duration: estimatedDuration,
      textHash,
    };
  } catch (error: any) {
    console.error('❌ ElevenLabs error:', error);
    throw new Error(`Failed to generate audio: ${error.message}`);
  }
}

/**
 * Generate audio for lesson sections
 */
export async function generateLessonAudio(lesson: {
  explanation: string;
  examples: string[];
  keyPoints: string[];
}): Promise<{
  explanationAudio: string;
  examplesAudio: string[];
  keyPointsAudio: string[];
}> {
  // Generate audio for each section
  const explanationResult = await generateSpeech(lesson.explanation);
  
  const examplesAudio = await Promise.all(
    lesson.examples.map(example => generateSpeech(example))
  );
  
  const keyPointsAudio = await Promise.all(
    lesson.keyPoints.map(point => generateSpeech(point))
  );

  return {
    explanationAudio: explanationResult.audioUrl,
    examplesAudio: examplesAudio.map(r => r.audioUrl),
    keyPointsAudio: keyPointsAudio.map(r => r.audioUrl),
  };
}
