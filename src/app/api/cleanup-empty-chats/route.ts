import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Count before
    const { count: beforeCount } = await supabase
      .from('conversaciones')
      .select('*', { count: 'exact', head: true });

    // Delete ALL messages (gte empty string matches all UUIDs)
    const { error: msgError } = await supabase
      .from('mensajes')
      .delete()
      .gte('id', 0);

    if (msgError) {
      return NextResponse.json({ error: `Message delete error: ${msgError.message}` }, { status: 500 });
    }

    // Delete ALL conversations (gte empty string matches all UUIDs)
    const { error: convError } = await supabase
      .from('conversaciones')
      .delete()
      .gte('creada_en', '1970-01-01');

    if (convError) {
      return NextResponse.json({ error: `Conversation delete error: ${convError.message}` }, { status: 500 });
    }

    // Count after
    const { count: afterCount } = await supabase
      .from('conversaciones')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      message: 'All conversations and messages deleted from Supabase',
      before: beforeCount,
      after: afterCount,
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
