-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_fingerprint TEXT NOT NULL
);

-- Create indexes for efficient queries
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
