import { NextResponse } from 'next/server';
import { crearSalaTerceros } from '@/lib/server/services/servicioConversacionTerceros.js';
import { getApiConfig } from '@/lib/server/apiConfig.js';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const config = getApiConfig();
    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://lili-speak-demo.vercel.app';

    const sala = await crearSalaTerceros({
      followerId: body.follower_id || '00000000-0000-0000-0000-000000000001',
      followerDisplayName: body.follower_display_name || 'Ana',
      langFollower: body.lang_follower || 'zh',
      langGuest: body.lang_guest || 'es',
      privacy: body.privacy ?? true,
      origin,
    });

    return NextResponse.json({
      ...sala,
      app_id: config.agora?.appId || 'a3ff88591ae541f8994a8c59ef302fcd',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al crear la sala' },
      { status: 500 }
    );
  }
}
