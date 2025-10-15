# Requirements Document

## Introduction

NerdSphere is an experimental anonymous global chat room that embraces chaos. It's a proof-of-concept application (Week 3 of 10 apps in 10 weeks) that allows anyone to post messages without authentication, moderation, or rules. The application features a landing page that sets expectations, a single real-time chat room, basic rate limiting to prevent spam, and automatic message cleanup after 24 hours. Built with Next.js, Tailwind CSS, and Supabase, it's designed to be simple, fast, and deployed on Vercel.

## Requirements

### Requirement 1: Landing Page

**User Story:** As a visitor, I want to see a landing page that explains what NerdSphere is and sets clear expectations, so that I understand what I'm getting into before entering the chat.

#### Acceptance Criteria

1. WHEN a user visits the root URL THEN the system SHALL display a hero section with the title "Welcome to NerdSphere"
2. WHEN the landing page loads THEN the system SHALL display an explanation that this is "An experimental anonymous global chat room"
3. WHEN the landing page loads THEN the system SHALL display a prominent warning that includes "No moderation. Expect chaos. Messages disappear after 24 hours."
4. WHEN the landing page loads THEN the system SHALL display a disclaimer section explaining what to expect (messages disappear after 24 hours, anyone can say anything, it's an experiment)
5. WHEN the landing page loads THEN the system SHALL display an "Enter Chat" or "Enter the Chaos" button that navigates to the chat room
6. WHEN the landing page renders THEN the system SHALL use a unified theme (space/planet or retro terminal aesthetic) with appropriate colors and typography

### Requirement 2: Anonymous Chat Room

**User Story:** As a user, I want to post and read messages in a global chat room without creating an account, so that I can participate anonymously and freely.

#### Acceptance Criteria

1. WHEN a user enters the chat room THEN the system SHALL display the last 100 messages in chronological order
2. WHEN a new message is posted by any user THEN the system SHALL display it in real-time to all connected users
3. WHEN the message list updates THEN the system SHALL auto-scroll to show the newest message
4. WHEN a user views a message THEN the system SHALL display the message content and timestamp
5. WHEN a user accesses the chat room THEN the system SHALL NOT require authentication or account creation
6. WHEN the chat room loads THEN the system SHALL display a message input box with a 500 character limit
7. WHEN the chat room loads THEN the system SHALL display a send button to submit messages

### Requirement 3: Message Creation and Validation

**User Story:** As a user, I want to post messages to the chat room with reasonable constraints, so that I can communicate while preventing obvious abuse.

#### Acceptance Criteria

1. WHEN a user submits a message THEN the system SHALL validate that the message is not empty
2. WHEN a user submits a message THEN the system SHALL validate that the message does not exceed 500 characters
3. WHEN a user submits a message THEN the system SHALL strip HTML and scripts to prevent XSS attacks
4. WHEN a user submits a message THEN the system SHALL reject messages with 50 or more identical consecutive characters
5. WHEN a message passes validation THEN the system SHALL store it in the database with content, timestamp, and user fingerprint
6. WHEN a message is successfully created THEN the system SHALL broadcast it to all connected users in real-time
7. WHEN a message fails validation THEN the system SHALL display an appropriate error message to the user

### Requirement 4: Rate Limiting

**User Story:** As a system, I want to limit how frequently users can post messages, so that spam and flooding are minimized.

#### Acceptance Criteria

1. WHEN a user sends a message THEN the system SHALL generate a browser fingerprint based on user agent and screen resolution
2. WHEN a user sends a message THEN the system SHALL store the timestamp in localStorage
3. WHEN a user attempts to send a message AND less than 10 seconds have passed since their last message THEN the system SHALL prevent submission and display a countdown
4. WHEN a user sends a message THEN the system SHALL disable the send button for 10 seconds
5. WHEN the server receives a message submission AND the same fingerprint posted within the last 10 seconds THEN the system SHALL reject the message
6. WHEN a rate limit is hit THEN the system SHALL display a clear message indicating how long the user must wait

### Requirement 5: Message Cleanup

**User Story:** As a system administrator, I want messages to automatically delete after 24 hours, so that the chat remains ephemeral and doesn't accumulate indefinitely.

#### Acceptance Criteria

1. WHEN a message is older than 24 hours THEN the system SHALL automatically delete it from the database
2. WHEN the cleanup process runs THEN the system SHALL remove all messages where created_at is more than 24 hours in the past
3. WHEN messages are deleted THEN the system SHALL not notify users or leave any trace

### Requirement 6: Real-Time Functionality

**User Story:** As a user, I want to see new messages appear instantly without refreshing, so that the chat feels live and responsive.

#### Acceptance Criteria

1. WHEN a user is viewing the chat room THEN the system SHALL establish a real-time subscription to new messages
2. WHEN any user posts a message THEN the system SHALL broadcast it to all connected clients within 1 second
3. WHEN a user's connection is interrupted THEN the system SHALL attempt to reconnect automatically
4. WHEN a user reconnects THEN the system SHALL display any messages that were posted during the disconnection

### Requirement 7: Database Schema

**User Story:** As a developer, I want a simple database schema that supports the core functionality, so that the system is easy to maintain and scale.

#### Acceptance Criteria

1. WHEN the database is initialized THEN the system SHALL create a messages table with id (uuid, primary key)
2. WHEN the database is initialized THEN the messages table SHALL include content (text) field
3. WHEN the database is initialized THEN the messages table SHALL include created_at (timestamp) field
4. WHEN the database is initialized THEN the messages table SHALL include user_fingerprint (text) field for rate limiting
5. WHEN querying messages THEN the system SHALL use an index on created_at for efficient cleanup and retrieval

### Requirement 8: Deployment and Performance

**User Story:** As a developer, I want the application to be deployed on Vercel with Supabase backend, so that it's fast, reliable, and cost-effective.

#### Acceptance Criteria

1. WHEN the application is deployed THEN the system SHALL host the Next.js frontend on Vercel
2. WHEN the application is deployed THEN the system SHALL use Supabase for database and real-time subscriptions
3. WHEN a user loads the landing page THEN the system SHALL render within 2 seconds
4. WHEN a user loads the chat room THEN the system SHALL display existing messages within 2 seconds
5. WHEN the application is built THEN the system SHALL use Tailwind CSS for styling
