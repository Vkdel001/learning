'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  text: string;
  autoPlay?: boolean;
  useElevenLabs?: boolean;
}

export default function AudioPlayer({ 
  text, 
  autoPlay = false,
  useElevenLabs = true 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch audio from ElevenLabs
  const fetchAudio = async () => {
    if (!useElevenLabs) {
      speakWithBrowser();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success) {
        setAudioUrl(data.data.audioUrl);
        
        // Play the audio
        if (audioRef.current) {
          audioRef.current.src = data.data.audioUrl;
          audioRef.current.play();
        }
      } else {
        // Fallback to browser TTS
        console.warn('ElevenLabs failed, using browser TTS');
        speakWithBrowser();
      }
    } catch (err: any) {
      console.error('Audio fetch error:', err);
      // Fallback to browser TTS
      speakWithBrowser();
    } finally {
      setIsLoading(false);
    }
  };

  // Use browser's built-in speech synthesis as fallback
  const speakWithBrowser = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setError('Speech synthesis failed');
      };

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      setError('Speech synthesis not supported');
    }
  };

  const stop = () => {
    // Stop HTML5 audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop browser TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stop();
    } else {
      fetchAudio();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setError('Audio playback failed');
          setIsPlaying(false);
        }}
      />

      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        title={isPlaying ? 'Stop narration' : 'Play narration'}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </>
        ) : isPlaying ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Stop</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Listen</span>
          </>
        )}
      </button>

      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}

      {!isLoading && !error && (
        <span className="text-xs text-gray-500">
          {useElevenLabs ? 'ElevenLabs AI' : 'Browser TTS'}
        </span>
      )}
    </div>
  );
}
