import 'server-only';

// Helper Gemini server-side (migrado 1:1 de las funciones Base44).
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function key() {
  const k = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2;
  if (!k) throw new Error('GEMINI_API_KEY no configurada');
  return k;
}

export async function callGeminiText(prompt, { jsonMode = false, maxOutputTokens = 700, temperature = 0.8, retries = 3 } = {}) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key() },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens,
            temperature,
            ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
          },
        }),
      });
      if (!res.ok) {
        lastErr = new Error(`Gemini error ${res.status}: ${(await res.text()).slice(0, 200)}`);
        if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 500 * (i + 1))); continue; }
        throw lastErr;
      }
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}

export async function callGeminiVision(imageUrl, prompt, opts = {}) {
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`No se pudo descargar la imagen: ${imgRes.status}`);
  const arrayBuffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key() },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: contentType, data: base64 } }, { text: prompt }] }],
      generationConfig: { maxOutputTokens: opts.maxOutputTokens ?? 700, temperature: opts.temperature ?? 0.8 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini Vision error ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}
