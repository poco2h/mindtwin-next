import sdk from 'microsoft-cognitiveservices-speech-sdk';
import { getApiConfig } from '../apiConfig.js';
import { buscarEnDomainPack, DOMAIN_PACKS } from './domainPacks.js';

const EU_AI_DISCLAIMER = 'Lili Speak Teacher MindTwin · AI Generated Voice & Content (EU AI Act Art. 50)';
const DEFAULT_TEACHER_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel / Teacher Twin default

/**
 * 1. Evaluar pronunciación mediante Azure Speech Pronunciation Assessment (francecentral)
 */
export async function evaluarPronunciacionAzure({
  audioBufferPcm,
  referenceText = '',
  language = 'en-US',
}) {
  const config = getApiConfig();
  const speechKey = config.azureSpeech.key;
  const speechRegion = config.azureSpeech.region || 'francecentral';

  if (!speechKey) {
    throw new Error('AZURE_SPEECH_KEY no está configurada.');
  }

  const pushStream = sdk.AudioInputStream.createPushStream(
    sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
  );

  if (audioBufferPcm && audioBufferPcm.length > 0) {
    pushStream.write(audioBufferPcm);
  }
  pushStream.close();

  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechRecognitionLanguage = language;

  const pronConfig = new sdk.PronunciationAssessmentConfig(
    referenceText || '',
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true
  );
  pronConfig.enableProsodyAssessment = true;

  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  pronConfig.applyTo(recognizer);

  return new Promise((resolve) => {
    recognizer.recognizeOnceAsync(
      (result) => {
        try {
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            const pronResult = sdk.PronunciationAssessmentResult.fromResult(result);
            const jsonStr = result.properties.getProperty(
              sdk.PropertyId.SpeechServiceResponse_JsonResult
            );
            const detailed = jsonStr ? JSON.parse(jsonStr) : {};
            const words = detailed?.NBest?.[0]?.Words || [];

            recognizer.close();
            return resolve({
              success: true,
              recognizedText: result.text,
              accuracyScore: pronResult.accuracyScore,
              fluencyScore: pronResult.fluencyScore,
              completenessScore: pronResult.completenessScore,
              pronunciationScore: pronResult.pronunciationScore,
              prosodyScore: pronResult.prosodyScore,
              palabrasDetalle: words.map((w) => ({
                word: w.Word,
                accuracy: w.PronunciationAssessment?.AccuracyScore,
                errorType: w.PronunciationAssessment?.ErrorType,
                phonemes: (w.Phonemes || []).map((p) => ({
                  phoneme: p.Phoneme,
                  accuracy: p.PronunciationAssessment?.AccuracyScore,
                })),
              })),
            });
          } else {
            recognizer.close();
            return resolve({
              success: false,
              recognizedText: result.text || '',
              accuracyScore: 0,
              fluencyScore: 0,
              completenessScore: 0,
              pronunciationScore: 0,
              prosodyScore: 0,
              palabrasDetalle: [],
              reason: sdk.ResultReason[result.reason],
              error: result.errorDetails || 'No se reconoció voz clara.',
            });
          }
        } catch (err) {
          recognizer.close();
          return resolve({ success: false, error: err.message });
        }
      },
      (err) => {
        recognizer.close();
        return resolve({ success: false, error: err });
      }
    );
  });
}

/**
 * 2. Síntesis de voz con ElevenLabs (TTS Teacher Twin)
 */
export async function sintetizarVozTeacherTwin({
  texto,
  voiceId = DEFAULT_TEACHER_VOICE_ID,
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
    throw new Error(`Error en ElevenLabs TTS (${res.status}): ${errorBody}`);
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
 * 3. Pipeline Integral de Voz: Lenguaje & Lenguaje Técnico (Domain Pack RAG)
 */
export async function procesarSesionVoz({
  audioBufferPcm = null,
  textoTranscrito = '',
  sesionId = null,
  servicio = 'lenguaje', // 'lenguaje' | 'lenguaje_tecnico'
  domainSlug = 'aeronautico', // 'aeronautico', 'medico', 'juridico', 'financiero', 'academico'
  teacherName = 'María López',
  teacherVoiceId = DEFAULT_TEACHER_VOICE_ID,
  idiomaEnsenanza = 'Inglés',
  nivelAlumno = 'B1',
  egoId = null,
  historial = [],
}) {
  const config = getApiConfig();
  const apiKey = config.gemini.apiKey;

  // Paso 1: Si se recibe audio PCM, evaluar pronunciación con Azure Speech
  let pronResult = null;
  let queryText = textoTranscrito;

  if (audioBufferPcm && audioBufferPcm.length > 0) {
    pronResult = await evaluarPronunciacionAzure({
      audioBufferPcm,
      referenceText: textoTranscrito,
      language: idiomaEnsenanza === 'Inglés' ? 'en-US' : 'es-ES',
    });
    if (pronResult.success && pronResult.recognizedText) {
      queryText = pronResult.recognizedText;
    }
  }

  // Paso 2: Si es Lenguaje Técnico, buscar en Domain Pack RAG
  let domainChunks = [];
  if (servicio === 'lenguaje_tecnico') {
    domainChunks = buscarEnDomainPack(domainSlug, queryText);
  }

  // Paso 3: Construcción del System Prompt enriquecido con RAG y Pronunciación
  const pronContext = pronResult?.success
    ? `
MÉTRICAS DE PRONUNCIACIÓN DEL ALUMNO (Azure Assessment):
- Precisión fonética (Accuracy): ${pronResult.accuracyScore}/100
- Fluidez (Fluency): ${pronResult.fluencyScore}/100
- Entonación (Prosody): ${pronResult.prosodyScore}/100
- Palabras con error fonético: ${pronResult.palabrasDetalle
        .filter((w) => w.accuracy < 80)
        .map((w) => `${w.word} (${w.accuracy}%)`)
        .join(', ') || 'Ninguna significativa'}
`
    : '';

  const ragContext =
    domainChunks.length > 0
      ? `
CONOCIMIENTO TÉCNICO ESPECIALIZADO (${DOMAIN_PACKS[domainSlug]?.nombre || domainSlug}):
${domainChunks
  .map(
    (c) =>
      `• TÉRMINO: ${c.termino}\n  DEFINICIÓN: ${c.definicion}\n  EJEMPLO ICAO/ESTÁNDAR: ${c.ejemplo}\n  FONÉTICA: ${c.fonetica}`
  )
  .join('\n\n')}
`
      : '';

  const promptText = `Eres el Teacher MindTwin de ${teacherName}, impartiendo una sesión de ${
    servicio === 'lenguaje_tecnico' ? 'Lenguaje Técnico Especializado' : 'Lenguaje'
  } (${idiomaEnsenanza}) en Lili Speak.
Nivel del alumno: ${nivelAlumno}.
${pronContext}
${ragContext}

El alumno acaba de decir por voz: "${queryText || 'Hello teacher'}"

Responde en formato JSON estricto:
{
  "respuesta_voz": "Tu respuesta hablada en ${idiomaEnsenanza} (máximo 2-3 frases, clara y concisa)",
  "traduccion_es": "Traducción al español de tu respuesta para apoyo del alumno",
  "consejo_fonetico": "1 consejo fonético breve para mejorar pronunciación o entonación",
  "termino_tecnico_destacado": "${servicio === 'lenguaje_tecnico' ? domainChunks[0]?.termino || '' : ''}"
}`;

  // Paso 4: Llamada a Flash 2.5
  const startTime = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${apiKey}`;

  const geminiRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!geminiRes.ok) {
    throw new Error(`Error en Gemini Flash 2.5 (${geminiRes.status}): ${await geminiRes.text()}`);
  }

  const geminiData = await geminiRes.json();
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  let parsed = {};
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    parsed = {
      respuesta_voz: rawText,
      traduccion_es: '',
      consejo_fonetico: 'Pronuncia con claridad y ritmo constante.',
      termino_tecnico_destacado: domainChunks[0]?.termino || '',
    };
  }

  parsed.indicador_ia = EU_AI_DISCLAIMER;
  if (!parsed.termino_tecnico_destacado && domainChunks.length > 0) {
    parsed.termino_tecnico_destacado = domainChunks[0].termino;
  }

  // Texto a sintetizar en audio por el Twin
  const textoParaTTS = parsed.respuesta_voz || 'Great practice! Let us proceed.';

  // Paso 5: Síntesis de voz con ElevenLabs Teacher Twin
  const audioTwin = await sintetizarVozTeacherTwin({
    texto: textoParaTTS,
    voiceId: teacherVoiceId,
  });

  const totalTimeMs = Date.now() - startTime;

  return {
    success: true,
    servicio,
    canal: 'voz',
    sesionId,
    domainSlug: servicio === 'lenguaje_tecnico' ? domainSlug : null,
    latencyMs: totalTimeMs,
    pronunciacionAzure: pronResult,
    feedbackPedagogico: parsed,
    audioTwin: {
      mimeType: audioTwin.mimeType,
      byteLength: audioTwin.byteLength,
      audioBase64: audioTwin.audioBase64,
    },
    indicadorIa: EU_AI_DISCLAIMER,
  };
}
