import { NextResponse } from 'next/server';
import { crearSalaTerceros } from '@/lib/server/services/servicioConversacionTerceros.js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      follower_id = '00000000-0000-0000-0000-000000000001',
      lang_follower = 'zh',
      lang_guest = 'es',
      privacy = true,
      follower_display_name = 'Ana',
    } = body || {};

    const url = new URL(request.url);
    const origin = url.origin;

    const resultado = await crearSalaTerceros({
      followerId: follower_id,
      langFollower: lang_follower,
      langGuest: lang_guest,
      privacy: privacy,
      followerDisplayName: follower_display_name,
      origin,
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('[API create-room terceros] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear la sala de terceros' },
      { status: 500 }
    );
  }
}
