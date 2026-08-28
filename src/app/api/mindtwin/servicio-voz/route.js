import { NextResponse } from 'next/server';
import { procesarSesionVoz } from '@/lib/server/services/servicioVozLenguaje.js';
import {
  asegurarPerfiles,
  iniciarSesionSupabase,
  guardarMensajeSupabase,
  guardarPronunciacionSupabase,
} from '@/lib/server/services/persistenciaSupabase.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      audioPcmBase64 = null,
      textoTranscrito = '',
      sesionId: incomingSesionId = null,
      servicio = 'lenguaje', // 'lenguaje' | 'lenguaje_tecnico'
      domainSlug = 'aeronautico',
      teacherName = 'María López',
      ownerId = 'usr_teacher_maria',
      alumnoName = 'Carlos Mendoza',
      alumnoId = 'usr_alumno_carlos',
      teacherVoiceId = undefined,
      idiomaEnsenanza = 'Inglés',
      nivelAlumno = 'B1',
      egoId = null,
      historial = [],
    } = body || {};

    if (!audioPcmBase64 && (!textoTranscrito || !textoTranscrito.trim())) {
      return NextResponse.json(
        { error: 'Debes proporcionar "audioPcmBase64" o "textoTranscrito".' },
        { status: 400 }
      );
    }

    let audioBufferPcm = null;
    if (audioPcmBase64) {
      audioBufferPcm = Buffer.from(audioPcmBase64, 'base64');
    }

    // 1. Asegurar sesión en Supabase
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
          servicio: servicio === 'lenguaje_tecnico' ? 'lenguaje_tecnico' : 'lenguaje',
          canal: 'voz',
        });
        sesionId = sRes.sesionId;
      }
    } catch (dbErr) {
      console.warn('[Supabase Persistencia] Advertencia iniciando sesión de voz:', dbErr.message);
    }

    // 2. Procesar con Azure Speech, Gemini Flash 2.5 y ElevenLabs
    const resultado = await procesarSesionVoz({
      audioBufferPcm,
      textoTranscrito: textoTranscrito ? textoTranscrito.trim() : '',
      sesionId,
      servicio,
      domainSlug,
      teacherName,
      teacherVoiceId,
      idiomaEnsenanza,
      nivelAlumno,
      egoId,
      historial,
    });

    resultado.sesionId = sesionId;

    // 3. Persistir mensajes y evaluación en Supabase
    try {
      if (sesionId) {
        // Guardar mensaje del alumno
        const recognizedText = resultado.pronunciacionAzure?.recognizedText || textoTranscrito;
        await guardarMensajeSupabase({
          sesionId,
          emisor: 'alumno',
          textoOriginal: recognizedText,
          idiomaDetectado: 'en',
        });

        // Si hubo evaluación fonética de Azure, guardar en pronunciacion_historial
        if (resultado.pronunciacionAzure?.success && profiles?.alumnoUuid) {
          await guardarPronunciacionSupabase({
            sesionId,
            alumnoId: profiles.alumnoUuid,
            palabraOFrase: recognizedText,
            accuracyScore: resultado.pronunciacionAzure.accuracyScore || 0,
            fluencyScore: resultado.pronunciacionAzure.fluencyScore || 0,
            completenessScore: resultado.pronunciacionAzure.completenessScore || 0,
            prosodyScore: resultado.pronunciacionAzure.prosodyScore || 0,
            phonemeDetails: resultado.pronunciacionAzure.palabrasDetalle || [],
            tipoError: 'None',
          });
        }

        // Guardar respuesta del Teacher Twin
        await guardarMensajeSupabase({
          sesionId,
          emisor: 'teacher_twin',
          textoOriginal: resultado.feedbackPedagogico?.respuesta_voz || '',
          textoTraducido: resultado.feedbackPedagogico?.traduccion_es || '',
          idiomaDetectado: 'en',
          notasFoneticas: resultado.feedbackPedagogico?.consejo_fonetico
            ? [{ consejo: resultado.feedbackPedagogico.consejo_fonetico }]
            : [],
        });
      }
    } catch (dbErr2) {
      console.warn('[Supabase Persistencia] Advertencia guardando evaluación/mensajes voz:', dbErr2.message);
    }

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('[API Servicio Voz] Error procesando solicitud:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno en Servicio de Voz' },
      { status: 500 }
    );
  }
}
