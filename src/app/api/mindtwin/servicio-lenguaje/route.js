import { NextResponse } from 'next/server';
import { procesarMensajeLenguajeTexto } from '@/lib/server/services/servicioLenguaje.js';
import {
  asegurarPerfiles,
  iniciarSesionSupabase,
  guardarMensajeSupabase,
} from '@/lib/server/services/persistenciaSupabase.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      mensaje,
      teacherName = 'María López',
      ownerId = 'usr_teacher_maria',
      alumnoName = 'Carlos Mendoza',
      alumnoId = 'usr_alumno_carlos',
      idiomaEnsenanza = 'Inglés',
      nivelAlumno = 'B1',
      egoId = null,
      historial = [],
      sesionId: incomingSesionId = null,
    } = body || {};

    if (!mensaje || typeof mensaje !== 'string' || !mensaje.trim()) {
      return NextResponse.json(
        { error: 'El parámetro "mensaje" es obligatorio y no puede estar vacío.' },
        { status: 400 }
      );
    }

    // 1. Asegurar persistencia en Supabase
    let sesionId = incomingSesionId;
    let profiles = null;
    try {
      profiles = await asegurarPerfiles({
        ownerId,
        ownerName,
        alumnoId,
        alumnoName,
        idiomaEnsenanza: idiomaEnsenanza === 'Inglés' ? 'en' : 'es',
        nivelAlumno,
      });

      if (!sesionId) {
        const sRes = await iniciarSesionSupabase({
          teacherId: profiles.teacherUuid,
          alumnoId: profiles.alumnoUuid,
          servicio: 'lenguaje',
          canal: 'texto',
        });
        sesionId = sRes.sesionId;
      }

      // Guardar mensaje del alumno
      await guardarMensajeSupabase({
        sesionId,
        emisor: 'alumno',
        textoOriginal: mensaje.trim(),
        idiomaDetectado: 'en',
      });
    } catch (dbErr) {
      console.warn('[Supabase Persistencia] Advertencia guardando inicio/mensaje alumno:', dbErr.message);
    }

    // 2. Procesar con Gemini Flash 2.5 y Teacher Persona
    const resultado = await procesarMensajeLenguajeTexto({
      mensaje: mensaje.trim(),
      teacherName,
      idiomaEnsenanza,
      nivelAlumno,
      egoId,
      historial,
    });

    resultado.sesionId = sesionId;

    // 3. Guardar respuesta del Teacher Twin en Supabase
    try {
      if (sesionId) {
        await guardarMensajeSupabase({
          sesionId,
          emisor: 'teacher_twin',
          textoOriginal: resultado.respuestaDirecta,
          textoTraducido: resultado.traduccionEspanol,
          idiomaDetectado: 'en',
          correccionesInline: resultado.correccionesInline,
          notasFoneticas: resultado.notaFoneticaIpa ? [{ ipa: resultado.notaFoneticaIpa }] : [],
        });
      }
    } catch (dbErr2) {
      console.warn('[Supabase Persistencia] Advertencia guardando respuesta twin:', dbErr2.message);
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[API Servicio Lenguaje] Error procesando solicitud:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
