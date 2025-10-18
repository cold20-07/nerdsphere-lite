'use client';

import { useState, useEffect, useCallback } from 'react';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import { createBrowserClient } from '@/lib/supabase';
import { generateFingerprint } from '@/lib/fingerprint';
import { canSendMessage, recordMessageSent } from '@/lib/rateLimit';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_fingerprint: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  // Load initial messages on component mount
  useEffect(() => {
    async function loadMessages() {
      try {
        setIsLoading(true);
        const supabase = createBrowserClient();

        const response = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        console.log('Full Supabase response:', JSON.stringify(response, null, 2));
        console.log('Response data:', response.data);
        console.log('Response error:', response.error);
        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);

        if (response.error) {
          console.error('Error fetching messages:', response.error);
          console.error('Error code:', response.error.code);
          console.error('Error message:', response.error.message);
          console.error('Error details:', response.error.details);
          console.error('Error hint:', response.error.hint);
          setError(`Failed to load messages: ${response.error.message || 'Unknown error'}`);
          setConnectionStatus('disconnected');
          return;
        }

        // Success - reverse to display in chronological order (oldest first)
        console.log('Successfully loaded messages:', response.data?.length || 0);
        setMessages(response.data?.reverse() || []);
        setConnectionStatus('connected');
        setError('');
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, []);

  // Set up polling for new messages (since Realtime isn't available)
  useEffect(() => {
    const supabase = createBrowserClient();

    // Poll for new messages every 3 seconds
    const pollingInterval = setInterval(async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!fetchError && data) {
          setMessages(data.reverse());
          setConnectionStatus('connected');
        } else if (fetchError) {
          console.error('Polling error:', fetchError);
          setConnectionStatus('disconnected');
        }
      } catch (err) {
        console.error('Polling error:', err);
        setConnectionStatus('disconnected');
      }
    }, 3000); // Poll every 3 seconds

    // Clean up polling on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    try {
      // Clear any previous errors
      setError('');

      // Check client-side rate limit before sending
      const rateLimitCheck = canSendMessage();
      if (!rateLimitCheck.allowed) {
        setIsRateLimited(true);
        setRemainingTime(rateLimitCheck.remainingTime);
        setError('Please wait before sending another message');
        return;
      }

      // Get browser fingerprint
      const fingerprint = generateFingerprint();

      // Call POST /api/messages with content and fingerprint
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          fingerprint,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to send message');
        return;
      }

      // Record message sent and update rate limit state
      recordMessageSent();
      setIsRateLimited(true);
      setRemainingTime(10);

      // Start countdown timer
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-black via-space-black to-purple-950">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      {/* Black hole sphere at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 pointer-events-none">
        {/* Outer glow rings with breathing animation */}
        <div className="absolute inset-0 -inset-32">
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-purple-500/30 via-purple-600/20 to-transparent blur-3xl animate-breathe"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-pink-500/20 via-purple-500/10 to-transparent blur-2xl animate-breathe" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Black hole sphere */}
        <div className="relative w-96 h-96 rounded-full bg-gradient-radial from-black via-purple-950 to-black shadow-[0_0_100px_rgba(168,85,247,0.4)]">
          {/* Inner dark core */}
          <div className="absolute inset-12 rounded-full bg-black shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]"></div>

          {/* Event horizon ring */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-breathe"></div>
          <div className="absolute inset-6 rounded-full border border-purple-400/20 animate-breathe" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Purple horizon glow */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-purple-900/40 via-purple-500/10 to-transparent pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-purple-500/20 p-3 sm:p-4 relative z-10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate lowercase">nerdsphere chat</h1>
              <p className="text-gray-400 text-xs sm:text-sm hidden sm:block lowercase">anonymous. unfiltered. ephemeral.</p>
            </div>

            {/* Connection Status Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
              <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline lowercase">
                {connectionStatus === 'connected' ? 'connected' :
                  connectionStatus === 'connecting' ? 'connecting...' :
                    'disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-space-purple mx-auto mb-4 shadow-glow"></div>
            <p className="text-gray-400 lowercase">loading messages...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Message List */}
          <div className="flex-1 relative z-10 overflow-hidden">
            <MessageList messages={messages} />
          </div>

          {/* Message Input */}
          <div className="relative z-10 bg-black/40 backdrop-blur-xl border-t border-purple-500/20">
            <MessageInput
              onSendMessage={handleSendMessage}
              isRateLimited={isRateLimited}
              remainingTime={remainingTime}
              error={error}
            />
          </div>
        </>
      )}
    </div>
  );
}
