/**
 * Configuración centralizada de API Keys y servicios externos para Lili Speak.
 * Lee estrictamente de process.env del lado del servidor.
 * NUNCA exponer estas variables en componentes de cliente.
 */

export const getApiConfig = () => {
  return {
    // Voz en tiempo real y pronunciación (Azure Cognitive Services)
    azureSpeech: {
      key: process.env.AZURE_SPEECH_KEY || '',
      region: process.env.AZURE_SPEECH_REGION || 'francecentral',
    },
    // Traducción simultánea (Azure Cognitive Services)
    azureTranslator: {
      key: process.env.AZURE_TRANSLATOR_KEY || '',
      region: process.env.AZURE_TRANSLATOR_REGION || 'francecentral',
    },
    // Canal de voz/video WebRTC bidireccional (Agora RTC)
    agora: {
      appId: process.env.AGORA_APP_ID || '',
      appCertificate: process.env.AGORA_APP_CERTIFICATE || '',
    },
    // LLM e Inteligencia Pedagógica (Gemini / Vertex AI)
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2 || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    },
    // Síntesis de voz clonada docente / alumno (ElevenLabs)
    elevenLabs: {
      apiKey: process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_KEY || '',
      modelId: 'eleven_turbo_v2_5',
    },
    // Base de datos, Auth y pgvector (Supabase)
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://zbhevbzgbhvalsboobfz.supabase.co',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    },
    // Pasarela de pagos y Split Docente / Lili Speak (Stripe Connect)
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || process.env.STRIPE_Secret_key || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      applicationFeeEur: 6.00,
    },
  };
};
