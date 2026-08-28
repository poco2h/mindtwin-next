import { NextResponse } from 'next/server';
import { traducirTextoAzure, sintetizarVozFollowerTwin } from '@/lib/server/services/servicioConversacionTerceros.js';
import { getApiConfig } from '@/lib/server/apiConfig.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { texto, idiomaOrigen = 'es', idiomaDestino = 'en', generarVoz = false, voiceId } = body || {};

    if (!texto || typeof texto !== 'string' || !texto.trim()) {
      return NextResponse.json({ error: 'El texto es obligatorio.' }, { status: 400 });
    }

    let textoTraducido = '';
    let motor = 'Azure Cognitive Translator v3.0';
    let latencyMs = 0;

    // 1. Intentar Azure Translator
    try {
      const azureRes = await traducirTextoAzure({
        texto: texto.trim(),
        idiomaOrigen,
        idiomaDestino,
      });
      textoTraducido = azureRes.textoTraducido;
      latencyMs = azureRes.latencyMs;
    } catch (azureErr) {
      console.warn('[Traducción] Fallback a Gemini Flash por error en Azure:', azureErr.message);
      // Fallback a Gemini Flash
      const config = getApiConfig();
      const prompt = `Translate the following text strictly from ${idiomaOrigen} to ${idiomaDestino}. Respond ONLY with the translation without extra text, explanations, or quotes.\n\nText: "${texto.trim()}"`;
      const t0 = Date.now();
      const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      });
      latencyMs = Date.now() - t0;
      motor = 'Gemini 2.5 Flash (Fallback)';
      if (gemRes.ok) {
        const gemData = await gemRes.json();
        textoTraducido = gemData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || texto;
      } else {
        textoTraducido = texto;
      }
    }

    // 2. Si se solicita síntesis de voz
    let audioBase64 = null;
    if (generarVoz && textoTraducido) {
      try {
        const audioRes = await sintetizarVozFollowerTwin({
          texto: textoTraducido,
          voiceId,
        });
        audioBase64 = audioRes.audioBase64;
      } catch (ttsErr) {
        console.warn('[Traducción] Advertencia sintetizando voz:', ttsErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      textoOriginal: texto.trim(),
      textoTraducido,
      idiomaOrigen,
      idiomaDestino,
      motor,
      latencyMs,
      audioBase64,
    });
  } catch (error) {
    console.error('[API Traducción] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error en servicio de traducción' },
      { status: 500 }
    );
  }
}
