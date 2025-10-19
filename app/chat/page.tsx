'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import MessageList from '@/components/MessageList';
import MessageInput from '@/components/MessageInput';
import { createBrowserClient } from '@/lib/supabase';
import { generateFingerprint } from '@/lib/fingerprint';
import { canSendMessage, recordMessageSent } from '@/lib/rateLimit';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission,
  sendNewMessageNotification,
  resetNotificationFlag,
  isUserActive
} from '@/lib/notifications';
import { registerServiceWorker, initPWAInstall, canInstallPWA, showInstallPrompt } from '@/lib/pwa';

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
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [showInstallPromptUI, setShowInstallPromptUI] = useState(false);
  const lastScrollY = useRef(0);
  const previousMessageCount = useRef(0);

  // Initialize PWA and check for install prompt
  useEffect(() => {
    registerServiceWorker();
    initPWAInstall();

    // Check if install prompt is available after a short delay
    const timer = setTimeout(() => {
      if (canInstallPWA()) {
        setShowInstallPromptUI(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Handle notification permission prompt
  useEffect(() => {
    if (isNotificationSupported() && getNotificationPermission() === 'default') {
      // Show notification prompt after 5 seconds
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Handle visibility change for notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to app - reset notification flag
        resetNotificationFlag();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle header visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // Scrolling down & past threshold
        setIsHeaderVisible(false);
      } else {
        // Scrolling up
        setIsHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    // Poll for new messages every 1 second for faster updates
    const pollingInterval = setInterval(async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!fetchError && data) {
          const reversedData = data.reverse();
          
          // Check if new messages arrived while user is inactive
          if (reversedData.length > previousMessageCount.current && !isUserActive()) {
            sendNewMessageNotification();
          }
          
          previousMessageCount.current = reversedData.length;
          setMessages(reversedData);
          setConnectionStatus('connected');
        } else if (fetchError) {
          console.error('Polling error:', fetchError);
          setConnectionStatus('disconnected');
        }
      } catch (err) {
        console.error('Polling error:', err);
        setConnectionStatus('disconnected');
      }
    }, 1000); // Poll every 1 second for faster updates

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

      // Optimistic update - add message immediately to UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        user_fingerprint: fingerprint,
      };
      setMessages((prev) => [...prev, optimisticMessage]);

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
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        setError(result.error || 'Failed to send message');
        return;
      }

      // Replace optimistic message with real one from server
      if (result.data) {
        setMessages((prev) => 
          prev.map((m) => m.id === optimisticMessage.id ? result.data : m)
        );
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
      <header className={`fixed top-0 left-0 right-0 border-b border-purple-500/20 p-3 sm:p-4 z-50 bg-black/40 backdrop-blur-xl transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
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

      {/* Header spacer to prevent content jump */}
      <div className="h-[72px] sm:h-[80px]"></div>

      {/* Notification Permission Prompt */}
      {showNotificationPrompt && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md mx-4 animate-fade-in">
          <div className="bg-black/90 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(139,92,246,0.4)]">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔔</div>
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1 lowercase">enable notifications?</h3>
                <p className="text-gray-400 text-sm lowercase">get notified when new messages arrive while you're away</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={async () => {
                  await requestNotificationPermission();
                  setShowNotificationPrompt(false);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors lowercase"
              >
                enable
              </button>
              <button
                onClick={() => setShowNotificationPrompt(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors lowercase"
              >
                not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      {showInstallPromptUI && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-md mx-4 animate-slide-up">
          <div className="bg-black/90 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(139,92,246,0.4)]">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📱</div>
              <div className="flex-1">
                <h3 className="text-white font-bold mb-1 lowercase">install nerdsphere</h3>
                <p className="text-gray-400 text-sm lowercase">add to your home screen for quick access</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={async () => {
                  await showInstallPrompt();
                  setShowInstallPromptUI(false);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors lowercase"
              >
                install
              </button>
              <button
                onClick={() => setShowInstallPromptUI(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors lowercase"
              >
                dismiss
              </button>
            </div>
          </div>
        </div>
      )}

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
