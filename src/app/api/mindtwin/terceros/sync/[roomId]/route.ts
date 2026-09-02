import { NextResponse } from 'next/server';
import { obtenerEstadoSala } from '@/lib/server/services/servicioConversacionTerceros.js';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'roomId es requerido' },
        { status: 400 }
      );
    }

    const estado = await obtenerEstadoSala(roomId);
    return NextResponse.json(estado);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error en sync' },
      { status: 500 }
    );
  }
}
