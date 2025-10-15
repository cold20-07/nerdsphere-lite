import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Delete messages older than 24 hours
    const { error, count } = await supabase
      .from('messages')
      .delete()
      .lt('created_at', twentyFourHoursAgo.toISOString());

    if (error) {
      console.error('Error deleting old messages:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete old messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Old messages cleaned up successfully',
      deletedCount: count || 0,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
