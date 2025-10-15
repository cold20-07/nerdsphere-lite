# Supabase Database Setup

This directory contains SQL migrations for the NerdSphere database schema.

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended for Quick Setup)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Create a new query
4. Copy and paste the contents of `migrations/001_create_messages_table.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 3: Manual Execution

You can also execute the SQL directly in any PostgreSQL client connected to your Supabase database.

## What This Migration Does

The migration creates:

1. **messages table** with the following columns:
   - `id` (UUID, primary key, auto-generated)
   - `content` (TEXT, max 500 characters via CHECK constraint)
   - `created_at` (TIMESTAMPTZ, defaults to NOW())
   - `user_fingerprint` (TEXT, for rate limiting)

2. **Indexes** for performance:
   - `idx_messages_created_at` - For efficient message retrieval and cleanup
   - `idx_messages_fingerprint_time` - For rate limiting queries

3. **Row Level Security (RLS) policies**:
   - Public read access (anyone can SELECT)
   - Public insert access (anyone can INSERT)

## Verification

After running the migration, verify it worked by running this query in the SQL Editor:

```sql
-- Check table exists
SELECT * FROM messages LIMIT 1;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'messages';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

## Enable Realtime

After creating the table, enable Realtime replication:

1. Go to **Database** → **Replication** in your Supabase dashboard
2. Find the `messages` table
3. Toggle the switch to enable Realtime

This allows the application to receive real-time updates when new messages are inserted.
