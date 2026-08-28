import { getApiConfig } from '../apiConfig.js';

/**
 * Servicio 1: Lenguaje (Canal Texto)
 * Pipeline según Arquitectura Técnica v3 (§01, §02, §05):
 * Alumno escribe → Flash 2.5 con prompt pedagógico del profesor + perfil EGO ID →
 * Respuesta inmediata con correcciones inline, notas fonéticas y feedback de nivel.
 */

const EU_AI_DISCLAIMER = 'Lili Speak Teacher MindTwin · AI Generated (EU AI Act Art. 50)';

export function construirSystemPromptPedagogico({
  teacherName = 'María López',
  idiomaEnsenanza = 'Inglés',
  nivelAlumno = 'B1',
  egoId = null,
  systemPromptDocente = null,
}) {
  const estilo = egoId ? `
- Perfil EGO ID docente: ${egoId.serialized || 'Estilo cercano, constructivo, motivador'}
- Nivel de apertura y empatía: Alta
- Método de corrección: Sutil y pedagógico (señala el error amablemente y ofrece la alternativa natural)
` : '- Método de corrección: Señala el error amablemente y modela la frase correcta.';

  return `Eres el Teacher MindTwin oficial de ${teacherName}, profesor/a experto/a de ${idiomaEnsenanza} en Lili Speak.
Tu misión es enseñar y conversar con tu alumno/a (nivel actual: ${nivelAlumno}) aplicando tu metodología docente real.

REGLAS PEDAGÓGICAS (ESTRICTAS):
1. Responde SIEMPRE con naturalidad y cercanía en ${idiomaEnsenanza} adaptando tu vocabulario y complejidad al nivel ${nivelAlumno}.
2. Identifica cualquier error gramatical, léxico o sintáctico en el mensaje del alumno.
3. Proporciona notas fonéticas (guía de pronunciación IPA y trucos para hispanohablantes) para palabras difíciles o que se suelan pronunciar mal.
4. Estimula la conversación haciendo una pregunta de seguimiento que invite al alumno a expresarse más.
5. ${estilo}
${systemPromptDocente ? `\nDIRECTRICES ESPECÍFICAS DEL DOCENTE:\n${systemPromptDocente}` : ''}

DEBES RESPONDER EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA (sin bloques de código markdown extraños):
{
  "respuesta": "Tu respuesta conversacional en ${idiomaEnsenanza}...",
  "traduccion_es": "Traducción al español de tu respuesta para apoyo del alumno...",
  "correcciones": [
    {
      "original": "fragmento con error del alumno",
      "corregido": "versión correcta y natural",
      "explicacion": "explicación clara y concisa en español"
    }
  ],
  "notas_foneticas": [
    {
      "palabra": "palabra_clave",
      "ipa": "/transcripcion_ipa/",
      "truco": "consejo fonético práctico para hispanohablantes"
    }
  ],
  "vocabulario_nuevo": ["palabra1", "palabra2"],
  "sugerencia_siguiente": "Pregunta o reto pedagógico para el alumno...",
  "indicador_ia": "${EU_AI_DISCLAIMER}"
}`;
}

export async function procesarMensajeLenguajeTexto({
  mensaje,
  sesionId = null,
  teacherName = 'María López',
  idiomaEnsenanza = 'Inglés',
  nivelAlumno = 'B1',
  egoId = null,
  systemPromptDocente = null,
  historial = [],
}) {
  const config = getApiConfig();
  const apiKey = config.gemini.apiKey;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en apiConfig.');
  }

  const systemInstruction = construirSystemPromptPedagogico({
    teacherName,
    idiomaEnsenanza,
    nivelAlumno,
    egoId,
    systemPromptDocente,
  });

  const contents = [];

  if (Array.isArray(historial) && historial.length > 0) {
    for (const h of historial.slice(-8)) {
      contents.push({
        role: h.emisor === 'alumno' ? 'user' : 'model',
        parts: [{ text: typeof h.texto === 'string' ? h.texto : JSON.stringify(h.texto) }],
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: `Mensaje del alumno: "${mensaje}"` }],
  });

  const startTime = Date.now();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  const latencyMs = Date.now() - startTime;

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Error en llamada a Gemini (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  let parsed = null;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch (e2) {
      parsed = {
        respuesta: rawText,
        traduccion_es: '',
        correcciones: [],
        notas_foneticas: [],
        vocabulario_nuevo: [],
        sugerencia_siguiente: '',
        indicador_ia: EU_AI_DISCLAIMER,
      };
    }
  }

  if (!parsed.indicador_ia) {
    parsed.indicador_ia = EU_AI_DISCLAIMER;
  }

  return {
    success: true,
    servicio: 'lenguaje',
    canal: 'texto',
    sesionId,
    latencyMs,
    respuesta: parsed.respuesta || '',
    traduccion_es: parsed.traduccion_es || '',
    correcciones: parsed.correcciones || [],
    notas_foneticas: parsed.notas_foneticas || [],
    vocabulario_nuevo: parsed.vocabulario_nuevo || [],
    sugerencia_siguiente: parsed.sugerencia_siguiente || '',
    indicador_ia: parsed.indicador_ia || EU_AI_DISCLAIMER,
    resultado: parsed,
  };
}
