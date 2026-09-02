import { NextResponse } from 'next/server';
import { obtenerSalaGuest } from '@/lib/server/services/servicioConversacionTerceros.js';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'invalid_slug', message: 'Slug no proporcionado' },
        { status: 400 }
      );
    }

    const resultado = await obtenerSalaGuest(slug);

    if (!resultado.success) {
      const statusCode = resultado.error === 'not_found' ? 404 : 410;
      return NextResponse.json(resultado, { status: statusCode });
    }

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('[API guest-room] Error:', error);
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
