import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sanitizeContent, validateContent } from '@/lib/sanitize';

/**
 * POST /api/messages
 * Creates a new message with validation and rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { content, fingerprint } = body;

    // Validate required fields
    if (!content || !fingerprint) {
      return NextResponse.json(
        { success: false, error: 'Content and fingerprint are required' },
        { status: 400 }
      );
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(content);

    // Validate content
    const validation = validateContent(sanitizedContent);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Server-side rate limiting: Check if user posted within last 10 seconds
    const { data: lastMessage, error: queryError } = await supabase
      .from('messages')
      .select('created_at')
      .eq('user_fingerprint', fingerprint)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (queryError) {
      console.error('Error querying last message:', queryError);
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      );
    }

    // Check rate limit
    if (lastMessage) {
      const lastMessageTime = new Date(lastMessage.created_at).getTime();
      const now = Date.now();
      const timeSinceLastMessage = now - lastMessageTime;
      const rateLimitMs = 10000; // 10 seconds

      if (timeSinceLastMessage < rateLimitMs) {
        const remainingSeconds = Math.ceil((rateLimitMs - timeSinceLastMessage) / 1000);
        return NextResponse.json(
          { 
            success: false, 
            error: `Rate limit exceeded. Please wait ${remainingSeconds} seconds.` 
          },
          { status: 429 }
        );
      }
    }

    // Insert message into database
    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        content: sanitizedContent,
        user_fingerprint: fingerprint,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create message' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      { success: true, data: newMessage },
      { status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error in POST /api/messages:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
