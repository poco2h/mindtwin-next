import { NextResponse } from 'next/server';
import { DOMAIN_PACKS } from '@/lib/server/services/domainPacks.js';

export async function GET() {
  try {
    const packsList = Object.values(DOMAIN_PACKS).map((pack) => ({
      slug: pack.slug,
      nombre: pack.nombre,
      fuentes: pack.fuentes,
      descripcion: pack.descripcion,
      totalTerminos: pack.chunks.length,
      muestraTerminos: pack.chunks.slice(0, 3).map((c) => ({
        termino: c.termino,
        definicion: c.definicion,
        ejemplo: c.ejemplo,
        fonetica: c.fonetica,
      })),
    }));

    return NextResponse.json({
      success: true,
      totalPacks: packsList.length,
      domainPacks: packsList,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
