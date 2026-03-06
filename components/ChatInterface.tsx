'use client';

import { useState, useEffect, useRef } from 'react';
import { authenticatedFetch } from '@/lib/utils/api-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ChatInterfaceProps {
  lessonId: string;
  lessonTitle: string;
  onClose?: () => void;
}

export default function ChatInterface({ lessonId, lessonTitle, onClose }: ChatInterfaceProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [commonQuestions, setCommonQuestions] = useState<Array<{ question: string; count: number }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize conversation
  useEffect(() => {
    initializeConversation();
    loadCommonQuestions();
    checkVoiceSupport();
  }, [lessonId]);

  // Check if voice input is supported
  const checkVoiceSupport = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setVoiceSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'no-speech') {
            setError('No speech detected. Please try again.');
          } else if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone access.');
          } else {
            setError('Voice input failed. Please try typing instead.');
          }
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
  };

  // Start voice input
  const startVoiceInput = () => {
    if (!recognitionRef.current) return;
    
    setError('');
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start voice input:', error);
      setIsListening(false);
      setError('Failed to start voice input. Please try again.');
    }
  };

  // Stop voice input
  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeConversation = async () => {
    setInitializing(true);
    try {
      const response = await authenticatedFetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });

      const data = await response.json();
      if (data.success) {
        setConversationId(data.data.id);
        await loadConversationHistory(data.data.id);
      } else {
        setError(data.error || 'Failed to initialize chat');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize chat');
    } finally {
      setInitializing(false);
    }
  };

  const loadConversationHistory = async (convId: string) => {
    try {
      const response = await authenticatedFetch(`/api/chat/conversations/${convId}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Failed to load conversation history:', err);
    }
  };

  const loadCommonQuestions = async () => {
    try {
      const response = await authenticatedFetch(`/api/chat/lessons/${lessonId}/common-questions`);
      const data = await response.json();
      if (data.success) {
        setCommonQuestions(data.data);
      }
    } catch (err) {
      console.error('Failed to load common questions:', err);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || !conversationId) return;

    setLoading(true);
    setError('');
    setInputMessage('');

    // Add user message optimistically
    const tempUserMessage: Message = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await authenticatedFetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: textToSend }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        // Replace temp message with real messages
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempUserMessage.id);
          return [...withoutTemp, data.data.userMessage, data.data.assistantMessage];
        });
      } else {
        // Remove temp message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
        
        if (response.status === 429) {
          setError('Daily message limit reached (50 messages/day). Try again tomorrow!');
        } else {
          setError(data.error || 'Failed to send message');
        }
      }
    } catch (err: any) {
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleQuickAction = (action: string) => {
    const prompts: Record<string, string> = {
      simpler: 'Can you explain this in simpler terms?',
      example: 'Can you give me another example?',
      why: 'Why is this important?',
      relate: 'How does this relate to real life?',
    };
    sendMessage(prompts[action]);
  };

  const handleCommonQuestion = (question: string) => {
    sendMessage(question);
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-2">🤖</span>
          <div>
            <h3 className="font-semibold">AI Tutor</h3>
            <p className="text-xs text-indigo-200">{lessonTitle}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-indigo-200 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-gray-600 mb-4">
              Hi! I'm your AI tutor. Ask me anything about this lesson!
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <button
                onClick={() => handleQuickAction('simpler')}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                Explain simpler
              </button>
              <button
                onClick={() => handleQuickAction('example')}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
              >
                Give example
              </button>
              <button
                onClick={() => handleQuickAction('why')}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
              >
                Why important?
              </button>
            </div>

            {/* Common Questions */}
            {commonQuestions.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Common questions:</p>
                <div className="space-y-2">
                  {commonQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCommonQuestion(q.question)}
                      className="block w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      {q.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Quick Actions (when messages exist) */}
      {messages.length > 0 && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAction('simpler')}
              disabled={loading}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Explain simpler
            </button>
            <button
              onClick={() => handleQuickAction('example')}
              disabled={loading}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Give example
            </button>
            <button
              onClick={() => handleQuickAction('why')}
              disabled={loading}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Why important?
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask a question..."}
            disabled={loading || isListening}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
          />
          
          {/* Voice Input Button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || !inputMessage.trim() || isListening}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          50 messages per day • {voiceSupported ? '🎤 Voice input available • ' : ''}Press Enter to send
        </p>
      </form>
    </div>
  );
}
