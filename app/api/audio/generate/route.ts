import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/services/tts.service';

/**
 * POST /api/audio/generate
 * Generate audio from text using ElevenLabs TTS
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voiceId, modelId } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // Generate audio
    const result = await generateSpeech(text, { voiceId, modelId });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate audio' },
      { status: 500 }
    );
  }
}
