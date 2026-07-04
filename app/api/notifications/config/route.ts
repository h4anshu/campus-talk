import { NextResponse } from 'next/server';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';

export async function GET() {
  try {
    // Gated to authenticated users
    await getSessionOrThrow();

    return NextResponse.json({
      url: process.env.SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || '',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
