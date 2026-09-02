import { NextResponse } from 'next/server';
import { obtenerSalaGuest } from '@/lib/server/services/servicioConversacionTerceros.js';
import { getApiConfig } from '@/lib/server/apiConfig.js';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug no proporcionado' },
        { status: 400 }
      );
    }

    const config = getApiConfig();
    const sala = await obtenerSalaGuest(slug);

    if (!sala.success) {
      return NextResponse.json(sala, { status: 404 });
    }

    return NextResponse.json({
      ...sala,
      app_id: config.agora?.appId || 'a3ff88591ae541f8994a8c59ef302fcd',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error al obtener sala' },
      { status: 500 }
    );
  }
}
