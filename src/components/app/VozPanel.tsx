"use client";

import { useState } from "react";

export default function VozPanel({ ownerName }: { ownerName: string }) {
  const [estado, setEstado] = useState<"idle" | "grabando" | "procesando" | "reproduciendo">("idle");
  const [textoPrueba, setTextoPrueba] = useState("Hello teacher! Yesterday I go to the cinema with my friends and I have 25 years old.");
  const [feedback, setFeedback] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  async function ejecutarSesionVoz(texto: string) {
    if (!texto.trim() || estado === "procesando") return;
    setEstado("procesando");
    setFeedback(null);
    setAudioUrl(null);

    try {
      // 1. Llamar a endpoint de voz de Lili Speak
      const res = await fetch("/api/conversar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: texto,
          role: "follower",
          ownerName,
        }),
      });

      const data = await res.json();
      setFeedback(data);

      // Si hay audio sintetizado o respuesta para voz
      if (data.respuesta) {
        setEstado("reproduciendo");
      } else {
        setEstado("idle");
      }
    } catch (err) {
      console.error("Error en sesión de voz:", err);
      setEstado("idle");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-4 p-6 overflow-y-auto">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1abc9c]/10 text-3xl border border-[#1abc9c]/30 shadow-lg shadow-[#1abc9c]/10">
        🎙️
      </div>
      
      <div className="text-center max-w-md">
        <h3 className="font-bold text-white text-base">Canal de Voz · Teacher MindTwin de {ownerName}</h3>
        <p className="text-xs text-white/60 mt-1">
          Evaluación fonética de pronunciación con Azure Speech y síntesis de voz en tiempo real con ElevenLabs.
        </p>
      </div>

      {/* Selector de frases de prueba / práctica */}
      <div className="w-full max-w-lg bg-white/5 rounded-2xl border border-white/10 p-4 space-y-3">
        <label className="block text-xs font-bold text-white/80 uppercase tracking-wider">
          Práctica de voz (Transcripción del Alumno):
        </label>
        <textarea
          value={textoPrueba}
          onChange={(e) => setTextoPrueba(e.target.value)}
          rows={2}
          className="w-full rounded-xl bg-black/40 border border-white/10 p-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#1abc9c]/50"
        />

        <div className="flex flex-wrap gap-1.5">
          {[
            "Yesterday I go to the cinema and I have 25 years.",
            "Tower, Iberia 345, requesting line up and wait runway 25L.",
            "I would like to schedule a business meeting for next Tuesday.",
          ].map((sug, i) => (
            <button
              key={i}
              onClick={() => setTextoPrueba(sug)}
              className="text-[10px] bg-white/5 hover:bg-white/10 text-white/70 px-2.5 py-1 rounded-full border border-white/5 transition"
            >
              {sug.slice(0, 38)}...
            </button>
          ))}
        </div>

        <button
          onClick={() => ejecutarSesionVoz(textoPrueba)}
          disabled={estado === "procesando"}
          className="w-full rounded-xl bg-[#1abc9c] py-2.5 text-xs font-bold text-black hover:bg-[#16a085] transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {estado === "procesando" ? "Procesando con Azure & Gemini..." : "🎙️ Evaluar Voz y Pronunciación"}
        </button>
      </div>

      {/* Resultados de pronunciación y feedback */}
      {feedback && (
        <div className="w-full max-w-lg bg-[#1abc9c]/[0.06] rounded-2xl border border-[#1abc9c]/20 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-[#1abc9c]">Respuesta del Teacher Twin</span>
            <span className="text-[10px] text-white/40">Gemini Flash 2.5 + ElevenLabs</span>
          </div>

          <p className="text-xs text-white/90 leading-relaxed">{feedback.respuesta}</p>

          {feedback.correcciones_inline && feedback.correcciones_inline.length > 0 && (
            <div className="rounded-lg bg-black/40 border border-emerald-500/30 p-2.5 text-xs space-y-1">
              <div className="font-bold text-emerald-400 text-[10px] uppercase">💡 Correcciones Gramaticales</div>
              {feedback.correcciones_inline.map((c: any, i: number) => (
                <div key={i} className="text-white/80 text-[11px]">
                  <span className="line-through text-red-400 mr-1">{c.original}</span>
                  <span className="font-bold text-emerald-300 mr-1">➜ {c.correccion}</span>
                  <span className="text-white/50">({c.explicacion})</span>
                </div>
              ))}
            </div>
          )}

          {feedback.nota_fonetica_ipa && (
            <div className="text-[11px] text-cyan-300 font-mono bg-cyan-950/40 p-2 rounded border border-cyan-500/20">
              🗣️ <span className="font-bold">Fonética IPA:</span> {feedback.nota_fonetica_ipa}
            </div>
          )}

          <div className="text-[9px] text-white/30 text-right pt-1">
            ⚖️ {feedback.indicador_ia || "Lili Speak Teacher MindTwin (EU AI Act Art. 50)"}
          </div>
        </div>
      )}
    </div>
  );
}
