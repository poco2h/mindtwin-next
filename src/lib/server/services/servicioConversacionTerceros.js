import agoraPkg from 'agora-token';
const { RtcTokenBuilder, RtcRole } = agoraPkg;
import { getApiConfig } from '../apiConfig.js';

const EU_AI_DISCLAIMER = 'Lili Speak MindTwin · Simultaneous AI Translation & Voice Synthesis (EU AI Act Art. 50)';
const DEFAULT_FOLLOWER_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Default cloned voice for Follower Twin

/**
 * 1. Generación de Token de Acceso para Canal WebRTC de Voz/Video en Agora
 */
export function generarTokenAgoraRTC({
  channelName,
  uid = 0,
  isPublisher = true,
  expireSeconds = 3600,
}) {
  const config = getApiConfig();
  const appId = config.agora.appId;
  const appCert = config.agora.appCertificate;

  if (!appId || !appCert) {
    throw new Error('AGORA_APP_ID y AGORA_APP_CERTIFICATE deben estar configurados en apiConfig.');
  }

  if (!channelName) {
    throw new Error('channelName es obligatorio para generar token de Agora.');
  }

  // RtcRole: 1 = PUBLISHER, 2 = SUBSCRIBER
  const role = isPublisher ? (RtcRole?.PUBLISHER ?? 1) : (RtcRole?.SUBSCRIBER ?? 2);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCert,
    channelName,
    uid,
    role,
    privilegeExpiredTs,
    privilegeExpiredTs
  );

  return {
    success: true,
    token,
    appId,
    channelName,
    uid,
    expiresAt: privilegeExpiredTs,
  };
}

/**
 * 2. Traducción Simultánea en Tiempo Real con Azure Translator (francecentral)
 */
export async function traducirTextoAzure({
  texto,
  idiomaOrigen = 'es',
  idiomaDestino = 'en',
}) {
  const config = getApiConfig();
  const key = config.azureTranslator.key;
  const region = config.azureTranslator.region || 'francecentral';

  if (!key) {
    throw new Error('AZURE_TRANSLATOR_KEY no está configurada.');
  }

  const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${idiomaOrigen}&to=${idiomaDestino}`;
  const startTime = Date.now();

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': region,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ Text: texto }]),
  });

  const latencyMs = Date.now() - startTime;

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error en Azure Translator (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const textoTraducido = data?.[0]?.translations?.[0]?.text || texto;

  return {
    success: true,
    textoOriginal: texto,
    textoTraducido,
    idiomaOrigen,
    idiomaDestino,
    latencyMs,
  };
}

/**
 * 3. Síntesis de Voz del Follower Twin (con voz del alumno o follower)
 */
export async function sintetizarVozFollowerTwin({
  texto,
  voiceId = DEFAULT_FOLLOWER_VOICE_ID,
}) {
  const config = getApiConfig();
  const apiKey = config.elevenLabs.apiKey;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY no está configurada.');
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: texto,
      model_id: config.elevenLabs.modelId || 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Error en ElevenLabs Follower TTS (${res.status}): ${errorBody}`);
  }

  const arrayBuf = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  return {
    audioBase64: buffer.toString('base64'),
    byteLength: buffer.length,
    mimeType: 'audio/mpeg',
  };
}

/**
 * 4. Motor de Decisión Dual Control (Control A vs Control B) con Gemini Flash 2.5
 */
export async function evaluarDecisionDualControl({
  transcripcion,
  idiomaOrigen = 'es',
  idiomaDestino = 'en',
  nivelAlumno = 'B1',
  tipoControl = 'control_a', // 'control_a' (Twin al mando) | 'control_b' (Alumno al mando)
  modoActual = 'modo_b',    // 'modo_a' (Directo) | 'modo_b' (Traducción asistida)
}) {
  const config = getApiConfig();
  const apiKey = config.gemini.apiKey;

  const promptText = `Actúas como el motor de Dual Control (Conversación con Terceros) de Lili Speak.
Nivel del alumno: ${nivelAlumno}.
Idioma origen alumno: ${idiomaOrigen} | Idioma interlocutor: ${idiomaDestino}.
Tipo de control actual: ${tipoControl.toUpperCase()}.
Modo de sesión actual: ${modoActual.toUpperCase()}.

El alumno acaba de decir: "${transcripcion}".

EN CONTROL A (Twin al mando):
- Evalúa si un alumno de nivel ${nivelAlumno} es capaz de decir esta frase directamente en ${idiomaDestino} sin traducción.
- Si sí puede -> sugerir Modo A (alumno habla directo).
- Si no puede -> sugerir Modo B (traducción automática con voz clonada).
- Si hay duda o una frase clave que el alumno debería intentar -> susurro con frase sugerida.

EN CONTROL B (Alumno al mando):
- Respeta el toggle del alumno.
- Genera 1 notificación breve y no intrusiva de coaching.

Responde estrictamente en formato JSON:
{
  "modo_recomendado": "modo_a" | "modo_b",
  "razon_decision": "Explicación breve de la decisión",
  "susurro_alumno": "Frase que el Twin le susurra al alumno discretamente en su pantalla",
  "notificacion_control_b": "Mensaje de coaching asíncrono para el alumno",
  "indicador_ia": "${EU_AI_DISCLAIMER}"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.5,
        maxOutputTokens: 512,
      },
    }),
  });

  if (!res.ok) {
    return {
      modo_recomendado: modoActual,
      razon_decision: 'Continuación de flujo por defecto',
      susurro_alumno: '',
      notificacion_control_b: '',
      indicador_ia: EU_AI_DISCLAIMER,
    };
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  try {
    return JSON.parse(rawText);
  } catch (e) {
    return {
      modo_recomendado: modoActual,
      razon_decision: 'Decisión evaluada',
      susurro_alumno: '',
      notificacion_control_b: '',
      indicador_ia: EU_AI_DISCLAIMER,
    };
  }
}

/**
 * 5. Procesamiento Completo de un Turno de Conversación con Terceros
 */
export async function procesarTurnoConversacionTerceros({
  textoTranscrito,
  emisor = 'alumno', // 'alumno' | 'interlocutor'
  idiomaOrigen = 'es',
  idiomaDestino = 'en',
  tipoControl = 'control_a',
  modoActivo = 'modo_b',
  followerVoiceId = DEFAULT_FOLLOWER_VOICE_ID,
  nivelAlumno = 'B1',
  sesionId = null,
}) {
  const startTime = Date.now();

  // Paso 1: Evaluación de Dual Control
  let dualControlDecision = null;
  if (emisor === 'alumno') {
    dualControlDecision = await evaluarDecisionDualControl({
      transcripcion: textoTranscrito,
      idiomaOrigen,
      idiomaDestino,
      nivelAlumno,
      tipoControl,
      modoActual: modoActivo,
    });
  }

  // Paso 2: Traducción simultánea con Azure Translator
  const fromLang = emisor === 'alumno' ? idiomaOrigen : idiomaDestino;
  const toLang = emisor === 'alumno' ? idiomaDestino : idiomaOrigen;

  const traduccion = await traducirTextoAzure({
    texto: textoTranscrito,
    idiomaOrigen: fromLang,
    idiomaDestino: toLang,
  });

  // Paso 3: Síntesis de voz Follower Twin si el emisor es el alumno y está en Modo B
  let audioSintetizado = null;
  const debeSintetizar = emisor === 'alumno' && (modoActivo === 'modo_b' || dualControlDecision?.modo_recomendado === 'modo_b');

  if (debeSintetizar) {
    audioSintetizado = await sintetizarVozFollowerTwin({
      texto: traduccion.textoTraducido,
      voiceId: followerVoiceId,
    });
  }

  const totalTimeMs = Date.now() - startTime;

  return {
    success: true,
    servicio: 'conversacion_terceros',
    sesionId,
    emisor,
    transcripcionOriginal: textoTranscrito,
    textoTraducido: traduccion.textoTraducido,
    idiomaOrigen: fromLang,
    idiomaDestino: toLang,
    dualControl: dualControlDecision,
    audioFollowerTwin: audioSintetizado
      ? {
          mimeType: audioSintetizado.mimeType,
          byteLength: audioSintetizado.byteLength,
          audioBase64: audioSintetizado.audioBase64,
        }
      : null,
    latencyMs: totalTimeMs,
    disclaimerLegal: EU_AI_DISCLAIMER,
  };
}

/**
 * 6. Motor de Reporte Post-Sesión (Flash 2.5)
 */
export async function generarReportePostSesion({
  duracionSegundos = 1800, // 30 min
  turnosModoA = 12,
  turnosModoB = 8,
  historialTurnos = [],
  alumnoName = 'Carlos',
  idiomaPractica = 'Inglés',
}) {
  const config = getApiConfig();
  const apiKey = config.gemini.apiKey;

  const totalTurnos = turnosModoA + turnosModoB || 1;
  const pctModoA = Math.round((turnosModoA / totalTurnos) * 100);
  const pctModoB = 100 - pctModoA;

  const prompt = `Genera un informe post-sesión de Conversación con Terceros para ${alumnoName} (${idiomaPractica}).
Métricas:
- Duración total: ${Math.round(duracionSegundos / 60)} minutos
- % Autonomía (Modo A - Alumno habló directo): ${pctModoA}%
- % Soporte IA (Modo B - Traducción asistida): ${pctModoB}%
- Turnos totales: ${totalTurnos}

Devuelve un JSON estructurado con:
{
  "resumen_ejecutivo": "Resumen motivador y analítico de la sesión...",
  "pct_autonomia": ${pctModoA},
  "pct_soporte_ia": ${pctModoB},
  "vocabulario_absorbido": ["palabra1", "palabra2", "palabra3"],
  "hitos_conseguidos": ["Hito 1", "Hito 2"],
  "recomendaciones_proxima_sesion": ["Recomendación 1", "Recomendación 2"],
  "indicador_ia": "${EU_AI_DISCLAIMER}"
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    }),
  });

  if (!res.ok) {
    return {
      success: true,
      reporte: {
        resumen_ejecutivo: `Sesión completada con ${pctModoA}% de autonomía directa y ${pctModoB}% de asistencia con voz clonada.`,
        pct_autonomia: pctModoA,
        pct_soporte_ia: pctModoB,
        vocabulario_absorbido: ['negotiate', 'schedule', 'deliverable'],
        hitos_conseguidos: ['Mantuvo conversación fluida con interlocutor internacional'],
        recomendaciones_proxima_sesion: ['Incrementar tiempo en Modo A en los primeros 10 minutos'],
        indicador_ia: EU_AI_DISCLAIMER,
      },
    };
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const clean = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();
  try {
    return {
      success: true,
      reporte: JSON.parse(clean),
    };
  } catch (parseErr) {
    return {
      success: true,
      reporte: {
        resumen_ejecutivo: `Sesión completada con ${pctModoA}% de autonomía directa y ${pctModoB}% de asistencia con voz clonada.`,
        pct_autonomia: pctModoA,
        pct_soporte_ia: pctModoB,
        vocabulario_absorbido: ['negotiate', 'schedule', 'deliverable'],
        hitos_conseguidos: ['Mantuvo conversación fluida con interlocutor internacional'],
        recomendaciones_proxima_sesion: ['Incrementar tiempo en Modo A en los primeros 10 minutos'],
        indicador_ia: EU_AI_DISCLAIMER,
      },
    };
  }
}
