import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    // Get all conversations from Supabase
    const { data: conversaciones, error: convError } = await supabase
      .from('conversaciones')
      .select('id');

    if (convError) throw convError;

    if (!conversaciones || conversaciones.length === 0) {
      return NextResponse.json({ message: 'No conversations found', deleted: 0 });
    }

    let deletedCount = 0;

    // Check each conversation for messages
    for (const conv of conversaciones) {
      const { count, error: countError } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true })
        .eq('conversacion_id', conv.id);

      if (countError) {
        console.error('Error counting messages:', countError);
        continue;
      }

      // If no messages, delete the conversation
      if (count === 0) {
        const { error: deleteError } = await supabase
          .from('conversaciones')
          .delete()
          .eq('id', conv.id);

        if (deleteError) {
          console.error('Error deleting conversation:', deleteError);
        } else {
          deletedCount++;
        }
      }
    }

    return NextResponse.json({
      message: `Cleanup complete`,
      deleted: deletedCount,
      total: conversaciones.length
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
