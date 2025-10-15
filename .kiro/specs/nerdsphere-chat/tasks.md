# Implementation Plan

- [x] 1. Initialize Next.js project and configure dependencies





  - Create Next.js 14+ project with App Router and TypeScript
  - Install and configure Tailwind CSS
  - Install Supabase client library (@supabase/supabase-js)
  - Set up environment variables for Supabase connection
  - Configure Tailwind with space theme colors and custom styles
  - _Requirements: 8.1, 8.5_

- [x] 2. Set up Supabase database schema





  - Create messages table with id, content, created_at, user_fingerprint columns
  - Add CHECK constraint for 500 character limit on content
  - Create indexes on created_at and user_fingerprint for performance
  - Configure Row Level Security (RLS) policies for public read and insert
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 3. Create utility functions for core functionality






  - [x] 3.1 Implement browser fingerprinting function

    - Create `lib/fingerprint.ts` with generateFingerprint() function
    - Use user agent and screen resolution to generate consistent hash
    - _Requirements: 4.1_

  - [x] 3.2 Implement content sanitization and validation

    - Create `lib/sanitize.ts` with sanitizeContent() and validateContent() functions
    - Strip HTML tags and validate length, emptiness, and spam patterns
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 3.3 Implement client-side rate limiting logic


    - Create `lib/rateLimit.ts` with canSendMessage() and recordMessageSent() functions
    - Use localStorage to track last message timestamp
    - Calculate remaining cooldown time
    - _Requirements: 4.2, 4.3_

- [x] 4. Create Supabase client configuration





  - Create `lib/supabase.ts` with client initialization
  - Export client for server components and client components
  - Configure with environment variables
  - _Requirements: 8.2_

- [x] 5. Build landing page





  - [x] 5.1 Create landing page component


    - Create `app/page.tsx` with hero section
    - Add title "Welcome to NerdSphere" and tagline
    - Add warning section with disclaimer text
    - Add "Enter the Chaos" button linking to /chat
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.2 Style landing page with space theme

    - Apply dark gradient background
    - Style text with appropriate colors and typography
    - Add subtle animations or effects
    - Ensure responsive design
    - _Requirements: 1.6_

- [x] 6. Create message API route






  - [x] 6.1 Implement POST /api/messages route handler

    - Create `app/api/messages/route.ts` with POST handler
    - Parse request body for content and fingerprint
    - Call validation functions from lib/sanitize.ts
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 6.2 Add server-side rate limiting

    - Query Supabase for last message from fingerprint
    - Check if less than 10 seconds have passed
    - Return error if rate limited
    - _Requirements: 4.5, 4.6_

  - [x] 6.3 Insert message into database




    - Insert validated message with fingerprint and timestamp
    - Return success response with message object
    - Handle database errors gracefully
    - _Requirements: 3.5, 3.6, 3.7_

- [x] 7. Build Message component





  - Create `components/Message.tsx` component
  - Accept content and timestamp as props
  - Format timestamp as relative time ("2 minutes ago")
  - Apply space theme styling with subtle glow effect
  - _Requirements: 2.4_

- [x] 8. Build MessageList component






  - [x] 8.1 Create MessageList component structure

    - Create `components/MessageList.tsx` component
    - Accept messages array as prop
    - Map over messages and render Message components
    - Handle empty state with placeholder text
    - _Requirements: 2.1_

  - [x] 8.2 Implement auto-scroll functionality





    - Use useRef to reference scroll container
    - Scroll to bottom when new messages arrive
    - Ensure smooth scrolling behavior
    - _Requirements: 2.3_

- [x] 9. Build MessageInput component






  - [x] 9.1 Create input form with validation

    - Create `components/MessageInput.tsx` component
    - Add textarea with 500 character limit
    - Display character counter
    - Add send button
    - _Requirements: 2.6, 2.7_
  - [x] 9.2 Implement rate limit UI feedback

    - Accept isRateLimited and remainingTime as props
    - Disable send button when rate limited
    - Display countdown timer showing remaining seconds
    - Show error messages for validation failures
    - _Requirements: 4.3, 4.4, 4.6_

  - [x] 9.3 Handle form submission





    - Call onSendMessage callback prop with message content
    - Clear input after successful send
    - Handle errors and display to user
    - _Requirements: 3.7_

- [x] 10. Build chat room page with real-time functionality




  - [x] 10.1 Create chat page component structure


    - Create `app/chat/page.tsx` component
    - Set up state for messages array, input value, and rate limit status
    - Render MessageList and MessageInput components
    - _Requirements: 2.1, 2.5_
  - [x] 10.2 Implement initial message loading


    - Fetch last 100 messages from Supabase on component mount
    - Order by created_at descending, then reverse for display
    - Set messages state with fetched data
    - Handle loading and error states
    - _Requirements: 2.1_
  - [x] 10.3 Set up Supabase Realtime subscription


    - Create channel subscription for messages table
    - Listen for INSERT events
    - Append new messages to state in real-time
    - Clean up subscription on unmount
    - _Requirements: 2.2, 6.1, 6.2_
  - [x] 10.4 Implement message sending logic


    - Get browser fingerprint using utility function
    - Check client-side rate limit before sending
    - Call POST /api/messages with content and fingerprint
    - Update rate limit state and start countdown timer
    - Handle success and error responses
    - _Requirements: 2.2, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4_
  - [x] 10.5 Handle reconnection and error states


    - Display connection status indicator
    - Implement auto-reconnect on disconnect
    - Show appropriate error messages to user
    - _Requirements: 6.3, 6.4_

- [x] 11. Create message cleanup mechanism





  - Create `app/api/cleanup/route.ts` for Vercel Cron
  - Implement GET handler that deletes messages older than 24 hours
  - Query and delete messages where created_at < NOW() - 24 hours
  - Return success response
  - Configure Vercel cron job in vercel.json to run hourly
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 12. Add final polish and optimizations





  - [x] 12.1 Optimize component rendering


    - Wrap Message component with React.memo
    - Add key props to mapped message lists
    - Implement debouncing for input validation
    - _Requirements: 8.3, 8.4_
  - [x] 12.2 Add loading states and transitions


    - Add loading spinner for initial message fetch
    - Add fade-in animation for new messages
    - Add smooth transitions for UI state changes
    - _Requirements: 8.3, 8.4_
  - [x] 12.3 Ensure responsive design


    - Test on mobile, tablet, and desktop viewports
    - Adjust layout and spacing for different screen sizes
    - Ensure touch-friendly button sizes on mobile
    - _Requirements: 1.6, 8.3_
  - [x] 12.4 Add space theme visual enhancements


    - Add subtle particle or star background effect
    - Implement glow effects on messages and buttons
    - Add smooth animations and transitions
    - Ensure consistent theme across all pages
    - _Requirements: 1.6_
