import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const { data: conversaciones, error: convError } = await supabase
      .from('conversaciones')
      .select('*');

    if (convError) {
      return NextResponse.json({ error: `Fetch error: ${convError.message}` }, { status: 500 });
    }

    const { data: mensajes, error: msgError } = await supabase
      .from('mensajes')
      .select('*');

    if (msgError) {
      return NextResponse.json({ error: `Message fetch error: ${msgError.message}` }, { status: 500 });
    }

    return NextResponse.json({
      conversaciones_count: conversaciones?.length || 0,
      mensajes_count: mensajes?.length || 0,
      conversaciones: conversaciones?.slice(0, 10), // First 10
      mensajes: mensajes?.slice(0, 10), // First 10
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
