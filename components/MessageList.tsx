'use client';

import { useEffect, useRef } from 'react';
import Message from './Message';

interface MessageData {
  id: string;
  content: string;
  created_at: string;
  user_fingerprint: string;
}

interface MessageListProps {
  messages: MessageData[];
}

export default function MessageList({ messages }: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 transition-opacity duration-300"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full animate-fade-in px-4">
          <p className="text-gray-400 text-center text-sm sm:text-base">
            No messages yet. Be the first to break the silence...
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <Message
            key={message.id}
            content={message.content}
            timestamp={message.created_at}
          />
        ))
      )}
    </div>
  );
}
