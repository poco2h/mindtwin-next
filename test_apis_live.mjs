import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

async function run() {
  console.log('--- 1. Testing Azure Translator ---');
  const tKey = env.AZURE_TRANSLATOR_KEY;
  const tRegion = env.AZURE_TRANSLATOR_REGION || 'francecentral';
  const url = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=es&to=en&to=de';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': tKey,
        'Ocp-Apim-Subscription-Region': tRegion,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ Text: 'Hola, un placer hablar contigo hoy.' }]),
    });
    console.log('Azure Translator HTTP Status:', res.status);
    const data = await res.json();
    console.log('Azure Translator Output:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Azure Translator Error:', e.message);
  }

  console.log('\n--- 2. Testing ElevenLabs TTS ---');
  const elKey = env.ELEVENLABS_API_KEY;
  const elUrl = 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM';
  try {
    const elRes = await fetch(elUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': elKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello, this is MindTwin translating your voice.',
        model_id: 'eleven_multilingual_v2',
      }),
    });
    console.log('ElevenLabs HTTP Status:', elRes.status);
    if (elRes.ok) {
      const buf = await elRes.arrayBuffer();
      console.log('ElevenLabs Audio received! Bytes:', buf.byteLength);
    } else {
      console.log('ElevenLabs Error:', await elRes.text());
    }
  } catch (e) {
    console.error('ElevenLabs Error:', e.message);
  }

  console.log('\n--- 3. Testing Azure Speech Services ---');
  const sKey = env.AZURE_SPEECH_KEY;
  const sRegion = env.AZURE_SPEECH_REGION || 'francecentral';
  const sUrl = `https://${sRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  try {
    const sRes = await fetch(sUrl, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': sKey },
    });
    console.log('Azure Speech Token HTTP Status:', sRes.status);
    if (sRes.ok) {
      const tok = await sRes.text();
      console.log('Azure Speech Token OK! Length:', tok.length);
    } else {
      console.log('Azure Speech Error:', await sRes.text());
    }
  } catch (e) {
    console.error('Azure Speech Error:', e.message);
  }
}

run();
