"use client";

import React, { useState } from "react";
import MyliliLogoHeader from "./MyliliLogoHeader";
import MyliliFooter from "./MyliliFooter";

const IDIOMAS_DISPONIBLES = [
  { code: "zh", name: "Chino mandarín (中文)", flag: "🇨🇳" },
  { code: "en", name: "Inglés (English)", flag: "🇬🇧" },
  { code: "fr", name: "Francés (Français)", flag: "🇫🇷" },
  { code: "de", name: "Alemán (Deutsch)", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "Japonés (日本語)", flag: "🇯🇵" },
  { code: "pt", name: "Portugués", flag: "🇵🇹" },
  { code: "ru", name: "Ruso", flag: "🇷🇺" },
  { code: "ar", name: "Árabe", flag: "🇸🇦" },
];

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
  const [langFollower, setLangFollower] = useState("zh");
  const [langGuest, setLangGuest] = useState("es");
  const [privacy, setPrivacy] = useState(true);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqAbierta(faqAbierta === index ? null : index);
  };

  const handleCrear = async () => {
    if (cargando || minutosDisponibles <= 0) return;
    await onGenerarEnlace({ langFollower, langGuest, privacy });
  };

  const faqs = [
    {
      q: "¿Qué ve el interlocutor al abrir el enlace?",
      a: "El interlocutor abre el enlace en cualquier navegador (Chrome, Safari, Firefox). No necesita cuenta en Lili Speak ni instalar aplicaciones. Verá una pantalla limpia donde lee lo que dices traducido a su idioma, escucha tu voz clonada en modo Twin y cuenta con su propio micrófono para responder.",
    },
    {
      q: "¿Cuántos minutos consume de mi pack?",
      a: "La llamada consume 1 minuto de tu pack por cada minuto de conversación activa, exactamente igual que las prácticas con tu MindTwin. El contador se descuenta únicamente al finalizar la llamada, no al iniciar.",
    },
    {
      q: "¿Qué significa el modo Privacidad ON?",
      a: "Si activas Privacidad ON, el informe de análisis de errores fonéticos, tonos y la transcripción de la llamada solo serán visibles por ti. Tu tutor u owner no podrá acceder a este informe privado.",
    },
  ];

  return (
    <div className="flex min-h-full flex-col bg-[#0d0d10] text-[#f0f0f0]">
      <MyliliLogoHeader badgeText="Traducción Simultánea" />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-8">
        {/* Eyebrow & H1 */}
        <div className="text-center">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#00bfa5]">
            Conversación con interlocutor
          </p>
          <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[#f0f0f0] md:text-4xl">
            Practica con quien quieras
          </h1>
          <p className="mt-2 text-xs text-[#f0f0f0]/60 max-w-lg mx-auto leading-relaxed">
            Habla en tiempo real con amigos, familiares o clientes. La IA traduce bidireccionalmente y evalúa tu pronunciación en directo.
          </p>
        </div>

        {/* Formulario de Configuración */}
        <div className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
          {/* Selector de Pares de Idiomas */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#f0f0f0]/70 mb-2">
              Par de idiomas de la sesión
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-[10px] font-semibold text-[#00bfa5] uppercase block mb-1">
                  Tu idioma objetivo (el que aprendes)
                </span>
                <select
                  value={langFollower}
                  onChange={(e) => setLangFollower(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:border-[#00bfa5] focus:outline-none"
                >
                  {IDIOMAS_DISPONIBLES.map((idioma) => (
                    <option key={idioma.code} value={idioma.code} className="bg-[#15191e] text-white">
                      {idioma.flag} {idioma.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <span className="text-[10px] font-semibold text-white/50 uppercase block mb-1">
                  Idioma nativo del interlocutor
                </span>
                <select
                  value={langGuest}
                  onChange={(e) => setLangGuest(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white focus:border-[#00bfa5] focus:outline-none"
                >
                  <option value="es" className="bg-[#15191e] text-white">🇪🇸 Español (Nativo)</option>
                  <option value="en" className="bg-[#15191e] text-white">🇬🇧 Inglés</option>
                  <option value="fr" className="bg-[#15191e] text-white">🇫🇷 Francés</option>
                </select>
              </div>
            </div>
          </div>

          {/* Toggle de Privacidad */}
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

          {/* Indicador de Minutos Restantes (Sin precios) */}
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

          {/* Botones CTA */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleCrear}
              disabled={cargando || minutosDisponibles <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00bfa5] py-3.5 text-xs md:text-sm font-extrabold text-[#0d0d10] hover:bg-[#00d4b7] transition-all disabled:opacity-40 shadow-lg shadow-[#00bfa5]/20 cursor-pointer"
            >
              {cargando ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Generando sala segura y tokens...</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span>Generar enlace e invitar ahora</span>
                </>
              )}
            </button>

            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-white/40 cursor-not-allowed"
            >
              <span>📅</span>
              <span>Programar cita para más tarde (Próximamente)</span>
            </button>
          </div>
        </div>

        {/* Acordeón FAQ */}
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
                className="flex w-full items-center justify-between p-3.5 text-left text-xs font-semibold text-white hover:text-[#00bfa5] transition-colors"
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
