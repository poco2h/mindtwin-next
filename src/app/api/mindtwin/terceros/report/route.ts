import { NextResponse } from 'next/server';
import {
  generarInformePostLlamada,
  obtenerInformePostLlamada,
} from '@/lib/server/services/servicioConversacionTerceros.js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      room_id,
      follower_id = '00000000-0000-0000-0000-000000000001',
      follower_name = 'Ana',
      interlocutor_name = 'Contacto',
      lang_follower = 'zh',
      lang_guest = 'es',
      duracion_segundos = 360,
    } = body || {};

    if (!room_id) {
      return NextResponse.json(
        { success: false, error: 'El room_id es obligatorio.' },
        { status: 400 }
      );
    }

    const resultado = await generarInformePostLlamada({
      roomId: room_id,
      followerId: follower_id,
      followerName: follower_name,
      interlocutorName: interlocutor_name,
      langFollower: lang_follower,
      langGuest: lang_guest,
      duracionSegundos: duracion_segundos,
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('[API report terceros] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al generar informe' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'El room_id es obligatorio.' },
        { status: 400 }
      );
    }

    const report = await obtenerInformePostLlamada(roomId);
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Informe no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('[API get report terceros] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener informe' },
      { status: 500 }
    );
  }
}
