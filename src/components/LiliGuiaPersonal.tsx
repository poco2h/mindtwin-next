"use client";

import React, { useState, useRef } from "react";

const EU_RESPONSES: Record<string, string> = {
  funciona:
    "Te unes a Lili Speak, encuentras a tu profesor y en 20 minutos creas tu perfil EGO ID. A partir de ahí puedes hablar con el Teacher MindTwin de tu profesor cuando quieras — texto o voz — y el sistema usa tu perfil para personalizar cada respuesta a tu estilo de aprendizaje.",
  ego:
    "Tu EGO ID es el perfil de aprendizaje que el sistema construye contigo en conversación. Cubre tu Eneagrama, Big Five y estilo de apego. Gracias a él, las respuestas del Teacher MindTwin de tu profesor no son genéricas: están adaptadas a cómo aprendes tú, qué te motiva y cómo procesas la información.",
  terceros:
    "Conversación con Terceros es el servicio de traducción simultánea de Lili Speak. Hablas en tu idioma y la otra persona escucha en el suyo — con tu voz clonada. Funciona en tiempo real y es bidireccional: el Dual Control garantiza que cada participante tenga su propio canal. Ideal para reuniones internacionales o viajes.",
  precio:
    "Los precios los fija tu profesor. Los orientativos son: Lenguaje desde 10 €/hora (texto, voz, 50 idiomas), Lenguaje Técnico desde 18 €/hora (incluye Domain Pack especializado), y Conversación con Terceros desde 25 €/hora (traducción simultánea, voz clonada). Sin suscripción: pagas solo las horas que uses.",
  default:
    "Con Lili Speak accedes al gemelo cerebral de tu profesor de idiomas: texto o voz real, cuando lo necesites. El sistema usa tu perfil EGO ID para personalizar cada sesión. Ofrecemos tres servicios: Lenguaje, Lenguaje Técnico y Conversación con Terceros. ¿Quieres saber más sobre alguno?",
};

export default function LiliGuiaPersonal({ className = "" }: { className?: string }) {
  const [consulta, setConsulta] = useState("");
  const [respuesta, setRespuesta] = useState<string | null>(null);
  const [escribiendo, setEscribiendo] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const procesarPregunta = (texto: string) => {
    const q = texto.toLowerCase().trim();
    if (!q) return;

    if (timerRef.current) clearInterval(timerRef.current);

    setEscribiendo(true);
    setRespuesta("");

    let key = "default";
    if (q.includes("precio") || q.includes("cuesta") || q.includes("coste") || q.includes("tarifa")) key = "precio";
    else if (q.includes("ego") || q.includes("perfil") || q.includes("psicol") || q.includes("aprendiz")) key = "ego";
    else if (q.includes("tercero") || q.includes("traducc") || q.includes("simultán") || q.includes("dual")) key = "terceros";
    else if (q.includes("funciona") || q.includes("cómo") || q.includes("como") || q.includes("empez")) key = "funciona";

    const textoCompleto = EU_RESPONSES[key];

    setTimeout(() => {
      setEscribiendo(false);
      let i = 0;
      timerRef.current = setInterval(() => {
        i++;
        setRespuesta(textoCompleto.slice(0, i));
        if (i >= textoCompleto.length) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 16);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    procesarPregunta(consulta);
  };

  const handleChipClick = (chipText: string) => {
    setConsulta(chipText);
    procesarPregunta(chipText);
  };

  return (
    <section className={`border-y border-white/15 bg-black px-6 py-12 text-white ${className}`}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
            Lili · Tu guía personal
          </p>
          <h2 className="mt-2 font-serif text-2xl md:text-3xl font-normal text-white">
            ¿Tienes alguna pregunta sobre Lili Speak?
          </h2>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.base44.com/images/public/69e0ffbbc97c1312cad2ba89/63a1a7dc5_LILI_CHIC.png"
              alt="Lili"
              className="h-7 w-7 object-contain"
            />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-1 items-center rounded-full border border-white/25 bg-white/5 px-4 py-2 hover:border-white/40 transition-colors">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-3 text-white/50 shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder="¿Cómo funciona? ¿Qué es el EGO ID? ¿Qué es Conversación con Terceros? ¿Cuánto cuesta?"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none font-light"
            />
            <button
              type="submit"
              aria-label="Enviar pregunta"
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black hover:opacity-85 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>
        </div>

        {/* Chips de sugerencias */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "¿Cómo funciona?",
            "¿Qué es el EGO ID?",
            "¿Qué es Conversación con Terceros?",
            "¿Cuánto cuesta?",
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-light text-white/80 hover:border-white/40 hover:bg-white/10 hover:text-white transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Respuesta de Lili */}
        {(escribiendo || respuesta) && (
          <div className="mt-6 border-t border-white/15 pt-6 animate-fadeIn">
            <p className="text-[10px] uppercase tracking-widest text-[#1abc9c] font-semibold mb-2">
              Lili responde
            </p>
            {escribiendo ? (
              <p className="text-sm font-light italic text-white/60">
                Lili está pensando<span className="animate-pulse">...</span>
              </p>
            ) : (
              <p className="text-sm font-light leading-relaxed text-white/90 max-w-3xl">
                {respuesta}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
