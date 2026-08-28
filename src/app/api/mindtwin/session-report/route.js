import { NextResponse } from 'next/server';
import { generarReportePostSesion } from '@/lib/server/services/servicioConversacionTerceros.js';
import {
  asegurarPerfiles,
  finalizarSesionSupabase,
} from '@/lib/server/services/persistenciaSupabase.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      sesionId = null,
      duracionSegundos = 1800,
      turnosModoA = 10,
      turnosModoB = 6,
      historialTurnos = [],
      alumnoName = 'Carlos Mendoza',
      alumnoId = 'usr_alumno_carlos',
      idiomaPractica = 'Inglés',
      precioCobradoEur = 4.50,
    } = body || {};

    // 1. Generar reporte con Gemini Flash 2.5
    const reporteRes = await generarReportePostSesion({
      duracionSegundos,
      turnosModoA,
      turnosModoB,
      historialTurnos,
      alumnoName,
      idiomaPractica,
    });

    // 2. Finalizar sesión y actualizar progreso en Supabase
    try {
      if (sesionId) {
        const profiles = await asegurarPerfiles({
          alumnoId,
          alumnoName,
        });

        await finalizarSesionSupabase({
          sesionId,
          alumnoId: profiles.alumnoUuid,
          duracionSegundos,
          precioCobradoEur,
          pctModoA: reporteRes.reporte?.pct_autonomia || 70,
          pctModoB: reporteRes.reporte?.pct_soporte_ia || 30,
          summaryReport: reporteRes.reporte,
          vocabularioAdquiridoCount: reporteRes.reporte?.vocabulario_absorbido?.length || 3,
        });
      }
    } catch (dbErr) {
      console.warn('[Supabase Persistencia] Advertencia finalizando sesión:', dbErr.message);
    }

    return NextResponse.json(reporteRes);
  } catch (error) {
    console.error('[API Session Report] Error generando reporte:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error generando reporte de sesión' },
      { status: 500 }
    );
  }
}
