import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Delete ALL messages first (foreign key constraint)
    const { error: msgError } = await supabase
      .from('mensajes')
      .delete()
      .neq('id', 0); // Delete all

    if (msgError) throw msgError;

    // Delete ALL conversations
    const { error: convError } = await supabase
      .from('conversaciones')
      .delete()
      .neq('id', ''); // Delete all

    if (convError) throw convError;

    return NextResponse.json({
      message: 'All conversations and messages deleted from Supabase',
      success: true
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
