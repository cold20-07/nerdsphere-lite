# Design Document

## Overview

NerdSphere is a Next.js application that provides an anonymous, real-time global chat room. The architecture follows a serverless approach with Next.js App Router for the frontend and API routes, Supabase for PostgreSQL database and real-time subscriptions, and Vercel for deployment. The design prioritizes simplicity, real-time performance, and basic spam prevention through client and server-side rate limiting.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Vercel Edge   │
│   (Next.js)     │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼──────┐
    │ Frontend │    │ API Routes │
    │  Pages   │    │ (Server)   │
    └────┬─────┘    └─────┬──────┘
         │                │
         │          ┌─────▼──────────┐
         │          │   Supabase     │
         └──────────►   PostgreSQL   │
                    │   + Realtime   │
                    └────────────────┘
```

### Technology Stack

- **Frontend Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS with custom theme configuration
- **Database**: Supabase PostgreSQL
- **Real-time**: Supabase Realtime (WebSocket subscriptions)
- **Deployment**: Vercel (serverless functions + edge network)
- **Rate Limiting**: Client-side (localStorage) + Server-side (database queries)

## Components and Interfaces

### Frontend Components

#### 1. Landing Page (`app/page.tsx`)
- **Purpose**: Welcome screen with explanation and entry point
- **Key Elements**:
  - Hero section with title and tagline
  - Warning/disclaimer section
  - Call-to-action button to enter chat
  - Unified theme styling (space or retro terminal)
- **State**: Stateless component
- **Navigation**: Links to `/chat` route

#### 2. Chat Room Page (`app/chat/page.tsx`)
- **Purpose**: Main chat interface
- **Key Elements**:
  - Message list container (scrollable)
  - Message input form
  - Send button with rate limit feedback
- **State Management**:
  - Messages array (from Supabase subscription)
  - Input value (controlled component)
  - Rate limit countdown timer
  - Loading/error states
- **Real-time Subscription**: Listens to Supabase `messages` table changes

#### 3. MessageList Component (`components/MessageList.tsx`)
- **Purpose**: Display messages with auto-scroll
- **Props**:
  - `messages`: Array of message objects
- **Behavior**:
  - Auto-scroll to bottom on new messages
  - Display last 100 messages
  - Format timestamps (relative time: "2 minutes ago")
  - Handle empty state

#### 4. MessageInput Component (`components/MessageInput.tsx`)
- **Purpose**: Input form with validation and rate limiting
- **Props**:
  - `onSendMessage`: Callback function
  - `isRateLimited`: Boolean
  - `remainingTime`: Number (seconds until next message allowed)
- **State**:
  - Input value
  - Character count
- **Validation**:
  - Max 500 characters (client-side)
  - Disable send button when rate limited
  - Show countdown timer

#### 5. Message Component (`components/Message.tsx`)
- **Purpose**: Individual message display
- **Props**:
  - `content`: String
  - `timestamp`: Date
- **Rendering**:
  - Message text
  - Formatted timestamp
  - Themed styling (glow effect for space theme, terminal style for retro)

### API Routes

#### 1. POST `/api/messages` (Server Action or Route Handler)
- **Purpose**: Create new message with validation and rate limiting
- **Request Body**:
  ```typescript
  {
    content: string;
    fingerprint: string;
  }
  ```
- **Validation**:
  - Content not empty
  - Content ≤ 500 characters
  - No HTML/script tags (sanitization)
  - No 50+ consecutive identical characters
  - Rate limit check (fingerprint + timestamp)
- **Response**:
  - Success: `{ success: true, message: MessageObject }`
  - Error: `{ success: false, error: string }`
- **Rate Limiting Logic**:
  ```typescript
  // Query last message from this fingerprint
  const lastMessage = await supabase
    .from('messages')
    .select('created_at')
    .eq('user_fingerprint', fingerprint)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (lastMessage && Date.now() - new Date(lastMessage.created_at).getTime() < 10000) {
    return { success: false, error: 'Rate limit exceeded' };
  }
  ```

#### 2. GET `/api/messages` (Optional - for initial load)
- **Purpose**: Fetch last 100 messages
- **Query Parameters**: None
- **Response**: Array of message objects
- **Query**:
  ```typescript
  const { data } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  ```

### Utility Functions

#### 1. Browser Fingerprinting (`lib/fingerprint.ts`)
```typescript
export function generateFingerprint(): string {
  const userAgent = navigator.userAgent;
  const screenResolution = `${screen.width}x${screen.height}`;
  const combined = `${userAgent}-${screenResolution}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(36);
}
```

#### 2. Content Sanitization (`lib/sanitize.ts`)
```typescript
export function sanitizeContent(content: string): string {
  // Remove HTML tags
  const withoutHtml = content.replace(/<[^>]*>/g, '');
  
  // Trim whitespace
  return withoutHtml.trim();
}

export function validateContent(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (content.length > 500) {
    return { valid: false, error: 'Message too long (max 500 characters)' };
  }
  
  // Check for spam (50+ identical characters)
  const spamPattern = /(.)\1{49,}/;
  if (spamPattern.test(content)) {
    return { valid: false, error: 'Message appears to be spam' };
  }
  
  return { valid: true };
}
```

#### 3. Rate Limit Manager (`lib/rateLimit.ts`)
```typescript
const RATE_LIMIT_KEY = 'nerdsphere_last_message';
const RATE_LIMIT_SECONDS = 10;

export function canSendMessage(): { allowed: boolean; remainingTime: number } {
  const lastMessageTime = localStorage.getItem(RATE_LIMIT_KEY);
  
  if (!lastMessageTime) {
    return { allowed: true, remainingTime: 0 };
  }
  
  const elapsed = Date.now() - parseInt(lastMessageTime);
  const remainingMs = (RATE_LIMIT_SECONDS * 1000) - elapsed;
  
  if (remainingMs <= 0) {
    return { allowed: true, remainingTime: 0 };
  }
  
  return { allowed: false, remainingTime: Math.ceil(remainingMs / 1000) };
}

export function recordMessageSent(): void {
  localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
}
```

## Data Models

### Message Model

```typescript
interface Message {
  id: string;              // UUID (generated by Supabase)
  content: string;         // Message text (max 500 chars)
  created_at: string;      // ISO timestamp
  user_fingerprint: string; // Browser fingerprint hash
}
```

### Database Schema (Supabase)

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_fingerprint TEXT NOT NULL
);

-- Index for efficient queries
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_fingerprint_time ON messages(user_fingerprint, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read messages
CREATE POLICY "Messages are publicly readable"
  ON messages FOR SELECT
  USING (true);

-- Policy: Anyone can insert messages (validation in API)
CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  WITH CHECK (true);
```

### Supabase Function for Auto-Cleanup

```sql
-- Function to delete old messages
CREATE OR REPLACE FUNCTION delete_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM messages
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron (if available) or use Supabase Edge Function
-- Alternative: Call from a Vercel Cron Job
```

## Real-Time Implementation

### Supabase Realtime Subscription

```typescript
// In Chat component
useEffect(() => {
  const supabase = createClientComponentClient();
  
  // Subscribe to new messages
  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      },
      (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Initial Data Load

```typescript
// Fetch last 100 messages on mount
useEffect(() => {
  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    setMessages(data?.reverse() || []);
  }
  
  loadMessages();
}, []);
```

## Error Handling

### Client-Side Error Handling

1. **Network Errors**:
   - Display toast notification: "Failed to send message. Please try again."
   - Retry mechanism with exponential backoff
   - Fallback to manual refresh

2. **Validation Errors**:
   - Show inline error message below input
   - Highlight input field in red
   - Clear error on input change

3. **Rate Limit Errors**:
   - Display countdown timer: "Wait X seconds before sending"
   - Disable send button
   - Visual feedback (button color change)

4. **Real-time Connection Errors**:
   - Show connection status indicator
   - Auto-reconnect on disconnect
   - Display "Reconnecting..." message

### Server-Side Error Handling

1. **Database Errors**:
   - Log error to console/monitoring service
   - Return generic error to client: "Something went wrong"
   - Implement retry logic for transient failures

2. **Validation Errors**:
   - Return specific error message
   - HTTP 400 status code
   - Include error details in response body

3. **Rate Limit Violations**:
   - Return 429 status code
   - Include retry-after header
   - Log potential abuse patterns

## Testing Strategy

### Unit Tests

1. **Utility Functions**:
   - `generateFingerprint()`: Test consistency and uniqueness
   - `sanitizeContent()`: Test HTML removal and XSS prevention
   - `validateContent()`: Test all validation rules
   - `canSendMessage()`: Test rate limit logic with mocked localStorage

2. **Component Tests**:
   - MessageInput: Test character counter, validation, disabled states
   - Message: Test timestamp formatting
   - MessageList: Test auto-scroll behavior

### Integration Tests

1. **API Routes**:
   - POST `/api/messages`: Test successful creation, validation failures, rate limiting
   - Test with various payloads (empty, too long, spam, XSS attempts)

2. **Real-time Subscription**:
   - Test message appears in all connected clients
   - Test reconnection behavior
   - Test handling of connection drops

### End-to-End Tests

1. **User Flow**:
   - Navigate from landing page to chat
   - Send a message successfully
   - Verify message appears in real-time
   - Test rate limiting (send multiple messages quickly)
   - Verify error messages display correctly

2. **Cross-Browser Testing**:
   - Test fingerprinting works consistently
   - Test localStorage persistence
   - Test real-time subscriptions in different browsers

## Design Theme Implementation

### Space/Planet Theme (Recommended)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        space: {
          black: '#0a0e27',
          navy: '#1a1f3a',
          purple: '#6366f1',
          cyan: '#06b6d4',
          glow: '#8b5cf6',
        }
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(to bottom, #0a0e27, #1a1f3a)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
      }
    }
  }
}
```

**Visual Elements**:
- Dark gradient background (deep space)
- Messages with subtle glow effect
- Animated stars/particles in background (CSS or lightweight library)
- Smooth fade-in animations for new messages
- Futuristic sans-serif font (e.g., Inter, Space Grotesk)

### Alternative: Retro Terminal Theme

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        terminal: {
          black: '#000000',
          green: '#00ff00',
          amber: '#ffb000',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      }
    }
  }
}
```

**Visual Elements**:
- Pure black background
- Green or amber monospace text
- Scanline effect (CSS pseudo-element with animation)
- Blinking cursor in input
- CRT screen curvature effect (optional)

## Performance Considerations

1. **Message Limit**: Only load and display last 100 messages to prevent memory issues
2. **Debouncing**: Debounce input validation to reduce re-renders
3. **Memoization**: Use React.memo for Message components to prevent unnecessary re-renders
4. **Lazy Loading**: Code-split chat page from landing page
5. **Optimistic Updates**: Show message immediately, rollback on error
6. **Connection Pooling**: Supabase handles this automatically

## Security Considerations

1. **XSS Prevention**: Sanitize all user input, never use `dangerouslySetInnerHTML`
2. **Rate Limiting**: Dual-layer (client + server) to prevent spam
3. **Content Validation**: Server-side validation as source of truth
4. **No PII Storage**: Fingerprint is anonymous, no IP addresses stored
5. **HTTPS Only**: Enforce secure connections (Vercel default)
6. **Supabase RLS**: Row-level security policies for database access

## Deployment Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Supabase Configuration

1. Create project in Supabase dashboard
2. Run SQL schema migration
3. Enable Realtime for `messages` table
4. Configure RLS policies
5. Set up database webhook or cron for cleanup (optional)

## Future Enhancements (Out of Scope)

- Message reactions/emojis
- User nicknames (still anonymous)
- Multiple chat rooms
- Message search
- Profanity filter
- Admin moderation tools
- Message reporting
