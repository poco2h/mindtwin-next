import { NextResponse } from 'next/server';
import { procesarTurnoConversacionTerceros } from '@/lib/server/services/servicioConversacionTerceros.js';
import {
  asegurarPerfiles,
  iniciarSesionSupabase,
  guardarMensajeSupabase,
} from '@/lib/server/services/persistenciaSupabase.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      textoTranscrito,
      emisor = 'alumno',
      idiomaOrigen = 'es',
      idiomaDestino = 'en',
      tipoControl = 'control_a',
      modoActivo = 'modo_b',
      followerVoiceId = undefined,
      nivelAlumno = 'B1',
      sesionId: incomingSesionId = null,
      alumnoName = 'Carlos Mendoza',
      alumnoId = 'usr_alumno_carlos',
      teacherName = 'María López',
      ownerId = 'usr_teacher_maria',
    } = body || {};

    if (!textoTranscrito || typeof textoTranscrito !== 'string' || !textoTranscrito.trim()) {
      return NextResponse.json(
        { error: 'El parámetro "textoTranscrito" es obligatorio.' },
        { status: 400 }
      );
    }

    // 1. Asegurar sesión en Supabase
    let sesionId = incomingSesionId;
    try {
      const profiles = await asegurarPerfiles({
        ownerId,
        ownerName: teacherName,
        alumnoId,
        alumnoName,
        idiomaEnsenanza: idiomaDestino,
        nivelAlumno,
      });

      if (!sesionId) {
        const sRes = await iniciarSesionSupabase({
          teacherId: profiles.teacherUuid,
          alumnoId: profiles.alumnoUuid,
          servicio: 'conversacion_terceros',
          canal: 'video_webrtc',
          modoControl: tipoControl,
        });
        sesionId = sRes.sesionId;
      }
    } catch (dbErr) {
      console.warn('[Supabase Persistencia] Advertencia iniciando sesión terceros:', dbErr.message);
    }

    // 2. Procesar turno con Azure Translator, Follower Twin y Dual Control
    const resultado = await procesarTurnoConversacionTerceros({
      textoTranscrito: textoTranscrito.trim(),
      emisor,
      idiomaOrigen,
      idiomaDestino,
      tipoControl,
      modoActivo,
      followerVoiceId,
      nivelAlumno,
      sesionId,
    });

    resultado.sesionId = sesionId;

    // 3. Guardar turno en Supabase
    try {
      if (sesionId) {
        await guardarMensajeSupabase({
          sesionId,
          emisor: emisor === 'alumno' ? 'alumno' : 'interlocutor',
          textoOriginal: textoTranscrito.trim(),
          textoTraducido: resultado.textoTraducido,
          idiomaDetectado: resultado.idiomaOrigen,
        });
      }
    } catch (dbErr2) {
      console.warn('[Supabase Persistencia] Advertencia guardando mensaje terceros:', dbErr2.message);
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[API Conversación Terceros] Error procesando turno:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno en Conversación con Terceros' },
      { status: 500 }
    );
  }
}
