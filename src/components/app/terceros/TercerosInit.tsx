"use client";

import React, { useState, useEffect } from "react";
import MyliliLogoHeader from "./MyliliLogoHeader";
import MyliliFooter from "./MyliliFooter";

export const IDIOMAS_12_DISPONIBLES = [
  { code: "es", name: "Español (Español)", flag: "🇪🇸" },
  { code: "en", name: "Inglés (English)", flag: "🇬🇧" },
  { code: "fr", name: "Francés (Français)", flag: "🇫🇷" },
  { code: "de", name: "Alemán (Deutsch)", flag: "🇩🇪" },
  { code: "it", name: "Italiano (Italiano)", flag: "🇮🇹" },
  { code: "pt", name: "Portugués (Português)", flag: "🇵🇹" },
  { code: "zh", name: "Chino mandarín (中文)", flag: "🇨🇳" },
  { code: "ja", name: "Japonés (日本語)", flag: "🇯🇵" },
  { code: "ru", name: "Ruso (Русский)", flag: "🇷🇺" },
  { code: "ar", name: "Árabe (العربية)", flag: "🇸🇦" },
  { code: "nl", name: "Holandés (Nederlands)", flag: "🇳🇱" },
  { code: "pl", name: "Polaco (Polski)", flag: "🇵🇱" },
];

export const getLanguageName = (code: string): string => {
  switch (code) {
    case "es": return "español";
    case "en": return "inglés";
    case "fr": return "francés";
    case "de": return "alemán";
    case "it": return "italiano";
    case "pt": return "portugués";
    case "zh": return "chino";
    case "ja": return "japonés";
    case "ru": return "ruso";
    case "ar": return "árabe";
    case "nl": return "holandés";
    case "pl": return "polaco";
    default: return code.toUpperCase();
  }
};

export const getSpeechLangCode = (langCode: string): string => {
  switch (langCode) {
    case "es": return "es-ES";
    case "en": return "en-US";
    case "fr": return "fr-FR";
    case "de": return "de-DE";
    case "it": return "it-IT";
    case "pt": return "pt-PT";
    case "zh": return "zh-CN";
    case "ja": return "ja-JP";
    case "ru": return "ru-RU";
    case "ar": return "ar-SA";
    case "nl": return "nl-NL";
    case "pl": return "pl-PL";
    default: return "es-ES";
  }
};

interface TercerosInitProps {
  onGenerarEnlace: (config: {
    langFollower: string;
    langGuest: string;
    privacy: boolean;
  }) => Promise<void>;
  minutosDisponibles?: number;
  cargando?: boolean;
}

export default function TercerosInit({
  onGenerarEnlace,
  minutosDisponibles = 45,
  cargando = false,
}: TercerosInitProps) {
  // Inicialización con persistencia en localStorage para evitar reseteos al navegar
  const [langFollower, setLangFollower] = useState("es");
  const [langGuest, setLangGuest] = useState("en");
  const [privacy, setPrivacy] = useState(true);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFollower = localStorage.getItem("mindtwin_ts_lang_follower");
      const savedGuest = localStorage.getItem("mindtwin_ts_lang_guest");
      if (savedFollower && IDIOMAS_12_DISPONIBLES.some((i) => i.code === savedFollower)) {
        setLangFollower(savedFollower);
      }
      if (savedGuest && IDIOMAS_12_DISPONIBLES.some((i) => i.code === savedGuest)) {
        setLangGuest(savedGuest);
      }
    }
  }, []);

  const handleChangeFollower = (code: string) => {
    setLangFollower(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("mindtwin_ts_lang_follower", code);
    }
  };

  const handleChangeGuest = (code: string) => {
    setLangGuest(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("mindtwin_ts_lang_guest", code);
    }
  };

  const toggleFaq = (index: number) => {
    setFaqAbierta(faqAbierta === index ? null : index);
  };

  const handleCrear = async () => {
    if (cargando || minutosDisponibles <= 0) return;
    await onGenerarEnlace({ langFollower, langGuest, privacy });
  };

  const faqs = [
    {
      q: "¿Cómo funciona la Doble Sala sin solapamiento?",
      a: "Tú estás en la Sala de Alumno y tu interlocutor entra en la Sala de Invitado. Cada persona habla en su propio idioma y escucha únicamente la voz traducida por la IA en su idioma correspondiente, sin que las voces se mezclen ni se solapen.",
    },
    {
      q: "¿Qué ve el interlocutor al abrir el enlace?",
      a: "El interlocutor entra en su Sala de Invitado en cualquier navegador (Chrome, Safari, móvil). Lee y escucha en su idioma nativo todo lo que dices, y cuenta con un botón de micrófono para responderte en su idioma nativo.",
    },
    {
      q: "¿Cuántos minutos consume de mi pack?",
      a: "La llamada consume 1 minuto de tu pack por cada minuto de conversación activa. El contador se descuenta al finalizar la llamada.",
    },
    {
      q: "¿Qué significa el modo Privacidad ON?",
      a: "Si activas Privacidad ON, el informe de análisis de errores y la transcripción de la llamada solo serán visibles por ti en tu cuenta privada.",
    },
  ];

  return (
    <div className="flex min-h-full flex-col bg-transparent text-[#f0f0f0]">
      <MyliliLogoHeader badgeText="Traducción Simultánea" />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8">
        <div className="text-center">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#00bfa5]">
            Doble Sala · Interpretación Simultánea
          </p>
          <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[#f0f0f0] md:text-4xl">
            Conversación con Interlocutor
          </h1>
          <p className="mt-2 text-xs text-[#f0f0f0]/60 max-w-lg mx-auto leading-relaxed">
            Habla en tiempo real en tu idioma. La IA traduce y sintetiza la voz en el idioma de tu contacto sin solapamientos.
          </p>
        </div>

        <div className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#f0f0f0]/70 mb-2">
              Configuración de Idiomas de la Doble Sala (12 Idiomas Soportados)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-[10px] font-semibold text-[#00bfa5] uppercase block mb-1">
                  Tu idioma (en tu sala)
                </span>
                <select
                  value={langFollower}
                  onChange={(e) => handleChangeFollower(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:border-[#00bfa5] focus:outline-none cursor-pointer"
                >
                  {IDIOMAS_12_DISPONIBLES.map((idioma) => (
                    <option key={idioma.code} value={idioma.code} className="bg-[#15191e] text-white">
                      {idioma.flag} {idioma.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-[10px] font-semibold text-[#00bfa5] uppercase block mb-1">
                  Idioma de tu interlocutor (en su sala)
                </span>
                <select
                  value={langGuest}
                  onChange={(e) => handleChangeGuest(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:border-[#00bfa5] focus:outline-none cursor-pointer"
                >
                  {IDIOMAS_12_DISPONIBLES.map((idioma) => (
                    <option key={idioma.code} value={idioma.code} className="bg-[#15191e] text-white">
                      {idioma.flag} {idioma.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-white/40 italic">
              💡 Por ejemplo: Si tú hablas en 🇪🇸 {getLanguageName(langFollower).toUpperCase()} y tu interlocutor en 🇬🇧 {getLanguageName(langGuest).toUpperCase()}, tú lo escucharás en {getLanguageName(langFollower)} y él te escuchará en {getLanguageName(langGuest)}.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="pr-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔒</span>
                <span className="text-xs font-bold text-white">Privacidad de sesión</span>
                <span className={`rounded px-2 py-0.5 text-[9px] font-extrabold uppercase ${privacy ? "bg-[#00bfa5]/20 text-[#00bfa5]" : "bg-white/10 text-white/50"}`}>
                  {privacy ? "ON · Solo visible por ti" : "OFF · Visible por tu tutor"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-white/50 leading-normal">
                {privacy
                  ? "El informe y los errores solo serán visibles en tu cuenta privada."
                  : "Tu tutor podrá revisar el informe para ayudarte a mejorar."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPrivacy(!privacy)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                privacy ? "bg-[#00bfa5]" : "bg-white/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  privacy ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#00bfa5]/25 bg-[#00bfa5]/5 px-4 py-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-base">⏱️</span>
              <span className="font-semibold text-white">
                Minutos de pack disponibles:
              </span>
            </div>
            <span className="font-mono text-sm font-extrabold text-[#00bfa5]">
              {minutosDisponibles} min
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleCrear}
              disabled={cargando || minutosDisponibles <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00bfa5] py-3.5 text-xs md:text-sm font-extrabold text-[#0d0d10] hover:bg-[#00d4b7] transition-all disabled:opacity-40 shadow-lg shadow-[#00bfa5]/20 cursor-pointer"
            >
              {cargando ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Generando sala segura y enlace...</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span>Generar enlace e invitar ahora</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 px-1">
            Preguntas Frecuentes
          </p>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="flex w-full items-center justify-between p-3.5 text-left text-xs font-semibold text-white hover:text-[#00bfa5] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-white/40 text-sm ml-2">
                  {faqAbierta === i ? "▲" : "▼"}
                </span>
              </button>
              {faqAbierta === i && (
                <div className="border-t border-white/5 p-3.5 text-[11px] leading-relaxed text-white/60 bg-black/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <MyliliFooter />
    </div>
  );
}
