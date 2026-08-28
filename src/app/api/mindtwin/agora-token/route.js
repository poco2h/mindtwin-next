import { NextResponse } from 'next/server';
import { generarTokenAgoraRTC } from '@/lib/server/services/servicioConversacionTerceros.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      channelName,
      uid = 0,
      isPublisher = true,
      expireSeconds = 3600,
    } = body || {};

    if (!channelName) {
      return NextResponse.json(
        { error: 'El parámetro "channelName" es obligatorio.' },
        { status: 400 }
      );
    }

    const tokenData = generarTokenAgoraRTC({
      channelName,
      uid,
      isPublisher,
      expireSeconds,
    });

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('[API Agora Token] Error generando token RTC:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno generando token Agora' },
      { status: 500 }
    );
  }
}
