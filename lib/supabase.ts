import { createClient } from '@supabase/supabase-js';

// Client component client (for use in 'use client' components)
export function createBrowserClient() {
  // Hardcoded for client-side to avoid bundling issues
  const supabaseUrl = 'https://tqdzeqkhwasfvsnstrzv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZHplcWtod2FzZnZzbnN0cnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1Mzk5NTAsImV4cCI6MjA3NjExNTk1MH0.qS5uMmjDPhBXaGR_shQImdqgtL40mlr_1LaW4i-X_eg';

  return createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'api' }
  });
}

// Server component client (for use in API routes)
export function createServerClient() {
  const supabaseUrl = 'https://tqdzeqkhwasfvsnstrzv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZHplcWtod2FzZnZzbnN0cnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1Mzk5NTAsImV4cCI6MjA3NjExNTk1MH0.qS5uMmjDPhBXaGR_shQImdqgtL40mlr_1LaW4i-X_eg';

  return createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'api' }
  });
}

// Generic client for API routes and server actions
export function getSupabaseClient() {
  const supabaseUrl = 'https://tqdzeqkhwasfvsnstrzv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZHplcWtod2FzZnZzbnN0cnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1Mzk5NTAsImV4cCI6MjA3NjExNTk1MH0.qS5uMmjDPhBXaGR_shQImdqgtL40mlr_1LaW4i-X_eg';

  return createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'api' }
  });
}
