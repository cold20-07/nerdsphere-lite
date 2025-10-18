'use client';

import { useState, FormEvent, useCallback, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isRateLimited: boolean;
  remainingTime: number;
  error?: string;
}

export default function MessageInput({
  onSendMessage,
  isRateLimited,
  remainingTime,
  error
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debouncedContent, setDebouncedContent] = useState('');
  
  const MAX_CHARS = 500;
  const remainingChars = MAX_CHARS - content.length;

  // Debounce content validation (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(content);
    }, 300);

    return () => clearTimeout(timer);
  }, [content]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isRateLimited || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSendMessage(content);
      setContent(''); // Clear input after successful send
    } catch (err) {
      // Error handling is done by parent component
      console.error('Failed to send message:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, isRateLimited, isSubmitting, onSendMessage]);

  const isDisabled = isRateLimited || isSubmitting || !debouncedContent.trim() || content.length > MAX_CHARS;

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="type your message..."
            maxLength={MAX_CHARS}
            rows={3}
            className="w-full bg-white/5 backdrop-blur-xl border border-purple-500/30 text-white rounded-2xl p-3 pr-16 sm:pr-20 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-500 transition-all duration-200 text-sm sm:text-base lowercase"
            disabled={isRateLimited || isSubmitting}
          />
          
          {/* Character counter */}
          <div className={`absolute bottom-3 right-3 text-xs sm:text-sm transition-colors duration-200 ${
            remainingChars < 50 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {remainingChars}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-3 mt-2 sm:mt-3">
          <div className="flex-1 min-h-[20px]">
            {/* Rate limit countdown */}
            {isRateLimited && (
              <p className="text-amber-400 text-xs sm:text-sm animate-fade-in lowercase">
                wait {remainingTime}s
              </p>
            )}
            
            {/* Error messages */}
            {error && !isRateLimited && (
              <p className="text-red-400 text-xs sm:text-sm animate-fade-in truncate lowercase">
                {error}
              </p>
            )}
          </div>

          {/* Send button - touch-friendly size on mobile */}
          <button
            type="submit"
            disabled={isDisabled}
            className={`px-5 sm:px-6 py-2.5 sm:py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-base min-h-[44px] sm:min-h-0 lowercase ${
              isDisabled
                ? 'bg-white/5 border border-gray-600/30 text-gray-400 cursor-not-allowed backdrop-blur-xl'
                : 'bg-black/60 backdrop-blur-xl border-2 border-purple-500/50 text-white hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]'
            }`}
          >
            {isSubmitting ? 'sending...' : 'send'}
          </button>
        </div>
      </div>
    </form>
  );
}
