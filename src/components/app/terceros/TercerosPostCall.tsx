"use client";

import React, { useState } from "react";
import MyliliLogoHeader from "./MyliliLogoHeader";
import MyliliFooter from "./MyliliFooter";

interface ReporteData {
  score_global: number;
  score_grammar: number;
  score_tones: number;
  score_fluency?: number;
  ling_analysis: Array<{
    id: number;
    tipo: "error" | "correcto" | "sugerencia";
    categoria: string;
    ejemplo: string;
    correccion: string;
    ocurrencias: number;
  }>;
  summary_text: string;
  duration_seconds: number;
  total_turns: number;
  lang_follower: string;
  lang_guest: string;
  interlocutor_name?: string;
  created_at?: string;
}

interface TercerosPostCallProps {
  reporte: ReporteData;
  turnos?: Array<{
    id: string;
    speaker: "follower" | "guest";
    mode?: "yo_hablo" | "twin_habla";
    originalText: string;
    translatedText: string;
    time?: string;
  }>;
  privacy?: boolean;
  onNuevaLlamada: () => void;
}

export default function TercerosPostCall({
  reporte,
  turnos = [],
  privacy = true,
  onNuevaLlamada,
}: TercerosPostCallProps) {
  const [verTodosTurnos, setVerTodosTurnos] = useState(false);
  const [compartido, setCompartido] = useState(false);

  const duracionMin = Math.floor((reporte.duration_seconds || 60) / 60);
  const duracionSeg = (reporte.duration_seconds || 60) % 60;
  const duracionTexto = `${duracionMin} min ${duracionSeg > 0 ? `${duracionSeg} seg` : ""}`;

  const turnosVisibles = verTodosTurnos ? turnos : turnos.slice(-4);

  const handleDescargarPDF = () => {
    window.print();
  };

  const handleCompartirTutor = () => {
    setCompartido(true);
    setTimeout(() => setCompartido(false), 3000);
  };

  return (
    <div className="flex min-h-full flex-col bg-transparent text-[#f0f0f0] print:bg-white print:text-black">
      <div className="print:hidden">
        <MyliliLogoHeader badgeText="Informe de Sesión" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 space-y-6">
        {/* Cabecera del Informe */}
        <div className="border-b border-white/10 pb-6 print:border-black/20">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00bfa5] print:text-teal-700">
            Informe de sesión · MindTwin Lili Speak
          </p>
          <h1 className="mt-1 font-serif text-3xl font-normal text-white print:text-black md:text-4xl">
            Conversación con {reporte.interlocutor_name || "Contacto"}
          </h1>

          {/* Meta bar */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60 print:text-black/70">
            <span>📅 {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>·</span>
            <span>⏱️ Duración: {duracionTexto}</span>
            <span>·</span>
            <span>🌐 Par: {reporte.lang_guest.toUpperCase()} ↔ {reporte.lang_follower.toUpperCase()}</span>
            <span>·</span>
            <span>💬 {turnos.length || reporte.total_turns || 6} turnos</span>
            {privacy && (
              <>
                <span>·</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-[#00bfa5] print:border print:border-black">
                  🔒 Informe Privado
                </span>
              </>
            )}
          </div>
        </div>

        {/* 3 Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Score Global */}
          <div className="rounded-2xl border border-[#00bfa5]/40 bg-[#00bfa5]/10 p-5 text-center shadow-lg print:border-black print:bg-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00bfa5] print:text-teal-800 block mb-1">
              Score Global
            </span>
            <div className="text-4xl font-extrabold font-mono text-[#00bfa5] print:text-black">
              {reporte.score_global}/100
            </div>
            <p className="mt-1.5 text-[10px] text-white/60 print:text-black/60">
              Rendimiento general de la sesión
            </p>
          </div>

          {/* Gramática */}
          <div className="rounded-2xl border border-[#22c55e]/40 bg-[#22c55e]/10 p-5 text-center shadow-lg print:border-black print:bg-gray-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e] print:text-green-800 block mb-1">
              Gramática y Estructura
            </span>
            <div className="text-4xl font-extrabold font-mono text-[#22c55e] print:text-black">
              {reporte.score_grammar}/100
            </div>
            <p className="mt-1.5 text-[10px] text-white/60 print:text-black/60">
              Concordancia y fluidez oracional
            </p>
          </div>

          {/* Tonos / Fonética */}
          <div className={`rounded-2xl border p-5 text-center shadow-lg print:border-black print:bg-gray-100 ${
            reporte.score_tones < 80
              ? "border-[#eab308]/40 bg-[#eab308]/10 text-[#eab308]"
              : "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]"
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
              Tonos y Fonética ({reporte.lang_follower.toUpperCase()})
            </span>
            <div className="text-4xl font-extrabold font-mono">
              {reporte.score_tones}/100
            </div>
            <p className="mt-1.5 text-[10px] opacity-80 print:text-black/60">
              {reporte.score_tones < 80 ? "Área recomendada de refuerzo" : "Precisión tonal excelente"}
            </p>
          </div>
        </div>

        {/* Resumen Pedagógico */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 print:border-black print:bg-transparent">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#00bfa5] print:text-teal-800 mb-2">
            💡 Resumen Pedagógico de la Sesión
          </h3>
          <p className="text-xs leading-relaxed text-white/90 print:text-black">
            {reporte.summary_text}
          </p>
        </div>

        {/* Hallazgos Lingüísticos */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 print:text-black">
            🔍 Hallazgos Lingüísticos y Correcciones
          </h3>
          <div className="space-y-2.5">
            {reporte.ling_analysis.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-all print:border-black ${
                  item.tipo === "error"
                    ? "border-[#eab308]/30 bg-[#eab308]/[0.06]"
                    : "border-[#22c55e]/30 bg-[#22c55e]/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span>{item.tipo === "error" ? "⚠" : "✓"}</span>
                    <span className="font-bold text-white print:text-black">{item.categoria}</span>
                  </div>
                  <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/70 print:text-black">
                    {item.ocurrencias} {item.ocurrencias === 1 ? "ocurrencia" : "ocurrencias"}
                  </span>
                </div>

                <div className="mt-2 text-xs space-y-1">
                  <div className="text-white/60 print:text-black/60">
                    <span className="font-semibold text-red-400 print:text-red-700">Detectado:</span> "{item.ejemplo}"
                  </div>
                  <div className="text-white/90 print:text-black">
                    <span className="font-semibold text-[#00bfa5] print:text-teal-700">Corrección sugerida:</span> {item.correccion}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transcripción de Turnos */}
        {turnos.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 print:text-black">
                📝 Transcripción de la Conversación
              </h3>
              {turnos.length > 4 && (
                <button
                  onClick={() => setVerTodosTurnos(!verTodosTurnos)}
                  className="text-xs font-semibold text-[#00bfa5] hover:underline print:hidden cursor-pointer"
                >
                  {verTodosTurnos ? "Mostrar menos" : `Ver todos (${turnos.length} turnos)`}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {turnosVisibles.map((t, idx) => {
                const esFollower = t.speaker === "follower";
                return (
                  <div
                    key={t.id || idx}
                    className={`rounded-xl border p-3 text-xs print:border-black ${
                      esFollower
                        ? "border-[#00bfa5]/30 bg-[#00bfa5]/5"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-white/50 print:text-black/50 mb-1">
                      <span className="font-bold text-white/80 print:text-black">
                        {esFollower ? `🧑‍🎓 Tú (${t.mode === "twin_habla" ? "Modo Twin" : "Yo hablo"})` : "👤 Interlocutor"}
                      </span>
                      <span>{t.time || ""}</span>
                    </div>
                    <p className="font-medium text-white/90 print:text-black">{t.originalText}</p>
                    <p className="mt-1 text-[11px] text-[#00bfa5] print:text-teal-800 italic">
                      ↳ {t.translatedText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Barra de Acciones CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 print:hidden">
          <button
            onClick={onNuevaLlamada}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            ← Iniciar nueva sesión
          </button>

          <div className="flex items-center gap-2">
            {!privacy && (
              <button
                onClick={handleCompartirTutor}
                className="rounded-xl border border-[#00bfa5]/40 bg-[#00bfa5]/10 px-4 py-2.5 text-xs font-bold text-[#00bfa5] hover:bg-[#00bfa5]/20 transition-all cursor-pointer"
              >
                {compartido ? "✓ ¡Compartido con tutor!" : "👥 Compartir con tutor"}
              </button>
            )}

            <button
              onClick={handleDescargarPDF}
              className="flex items-center gap-1.5 rounded-xl bg-[#00bfa5] px-5 py-2.5 text-xs font-extrabold text-[#0d0d10] hover:bg-[#00d4b7] transition-all shadow-lg shadow-[#00bfa5]/20 cursor-pointer"
            >
              <span>📄</span>
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <MyliliFooter />
      </div>
    </div>
  );
}
