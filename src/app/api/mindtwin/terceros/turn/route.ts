import { NextResponse } from 'next/server';
import { procesarTurnoTerceros } from '@/lib/server/services/servicioConversacionTerceros.js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      room_id,
      speaker = 'follower', // 'follower' | 'guest'
      mode = 'yo_hablo',    // 'yo_hablo' | 'twin_habla'
      text,
      lang_follower = 'zh',
      lang_guest = 'es',
      follower_voice_id = undefined,
    } = body || {};

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'El campo "text" es obligatorio.' },
        { status: 400 }
      );
    }

    const resultado = await procesarTurnoTerceros({
      roomId: room_id,
      speaker,
      mode,
      text,
      langFollower: lang_follower,
      langGuest: lang_guest,
      followerVoiceId: follower_voice_id,
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('[API turn terceros] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar turno' },
      { status: 500 }
    );
  }
}
