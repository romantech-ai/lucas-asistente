import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Get all conversation IDs first
    const { data: conversaciones, error: fetchError } = await supabase
      .from('conversaciones')
      .select('id');

    if (fetchError) {
      return NextResponse.json({ error: `Fetch error: ${fetchError.message}` }, { status: 500 });
    }

    if (!conversaciones || conversaciones.length === 0) {
      return NextResponse.json({ message: 'No conversations to delete', deleted: 0 });
    }

    const convIds = conversaciones.map(c => c.id);

    // Delete messages for these conversations
    const { error: msgError } = await supabase
      .from('mensajes')
      .delete()
      .in('conversacion_id', convIds);

    if (msgError) {
      return NextResponse.json({ error: `Message delete error: ${msgError.message}` }, { status: 500 });
    }

    // Delete all conversations
    const { error: convError } = await supabase
      .from('conversaciones')
      .delete()
      .in('id', convIds);

    if (convError) {
      return NextResponse.json({ error: `Conversation delete error: ${convError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      message: 'All conversations and messages deleted from Supabase',
      deleted: convIds.length,
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
