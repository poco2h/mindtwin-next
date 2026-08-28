"use client";

import { useState } from "react";
import { useTwin } from "@/lib/session/useTwin";

const MODULOS = [
  { key: "speaking", label: "🗣️ Práctica Oral (Speaking)" },
  { key: "listening", label: "🎧 Comprensión (Listening)" },
  { key: "vocabulario", label: "📚 Vocabulario & Gramática" },
  { key: "recordatorios", label: "🔔 Recordatorios & Alertas" },
] as const;

type Modulo = (typeof MODULOS)[number]["key"];

const HABITOS_SUGERIDOS: Record<Modulo, Array<{ nombre: string; desc: string; duracion: string }>> = {
  speaking: [
    { nombre: "Conversación con Teacher MindTwin", desc: "Práctica de fluidez oral en inglés de 15-20 min.", duracion: "20 min/día" },
    { nombre: "Lectura en voz alta con IPA", desc: "Enfoque en entonación y pronunciación de vocales complejas.", duracion: "10 min/día" },
    { nombre: "Simulación de Roleplay / Entrevista", desc: "Casos prácticos de trabajo y reuniones internacionales.", duracion: "15 min/sesión" },
  ],
  listening: [
    { nombre: "Podcast nativo por nivel MCER", desc: "Escucha activa sin subtítulos para acostumbrar el oído.", duracion: "15 min/día" },
    { nombre: "Transcripción de fragmentos de audio", desc: "Anotar lo escuchado para fijar estructuras gramaticales.", duracion: "10 min/sesión" },
  ],
  vocabulario: [
    { nombre: "5 nuevas palabras en contexto", desc: "Creación de frases propias con el nuevo léxico del día.", duracion: "5 min/día" },
    { nombre: "Repaso de notas fonéticas", desc: "Revisar los términos corregidos por el MindTwin.", duracion: "5 min/día" },
  ],
  recordatorios: [],
};

const FRECUENCIAS = [1, 2, 3, 5, 7];

export default function MisHabitos() {
  const { twin, guardar } = useTwin();
  const [modulo, setModulo] = useState<Modulo>("speaking");
  const [subTab, setSubTab] = useState<"habitos" | "evaluacion" | "estadisticas">("habitos");

  const [recTexto, setRecTexto] = useState("");
  const [recFrecuencia, setRecFrecuencia] = useState(1);
  const [recHora, setRecHora] = useState("09:00");
  const [recCanal, setRecCanal] = useState<"email" | "whatsapp">("email");
  const [recGuardado, setRecGuardado] = useState(false);

  const [confianzaSpeaking, setConfianzaSpeaking] = useState(4);
  const [adherenciaSemanal, setAdherenciaSemanal] = useState(5);
  const [evalGuardada, setEvalGuardada] = useState(false);

  function guardarAlerta(e: React.FormEvent) {
    e.preventDefault();
    if (!recTexto.trim() || !twin) return;
    const nuevo = {
      id: crypto.randomUUID(),
      habito: recTexto.trim(),
      frecuenciaDias: recFrecuencia,
      hora: recHora,
      canal: recCanal,
    };
    guardar({
      ...twin,
      recordatorios: [...(twin.recordatorios ?? []), nuevo],
    });
    setRecTexto("");
    setRecGuardado(true);
    setTimeout(() => setRecGuardado(false), 3000);
  }

  function guardarEvaluacion() {
    setEvalGuardada(true);
    setTimeout(() => setEvalGuardada(false), 3000);
  }

  const recordatorios = twin?.recordatorios ?? [
    { id: "1", habito: "Práctica de Speaking diaria con Teacher MindTwin", frecuenciaDias: 1, hora: "09:00", canal: "email" },
    { id: "2", habito: "Repaso semanal de vocabulario y notas fonéticas", frecuenciaDias: 7, hora: "19:00", canal: "whatsapp" },
  ];

  return (
    <div className="relative mx-auto max-w-4xl space-y-6 pb-12">
      <div className="border-b border-white/10 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1abc9c]">
          Lili Speak · Metodología & Constancia
        </p>
        <h1 className="font-playfair text-3xl font-extrabold text-white">
          Mis Hábitos de Aprendizaje
        </h1>
        <p className="text-xs text-white/60 mt-1">
          Seguimiento de práctica lingüística, autoevaluaciones semanales y recordatorios de estudio.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODULOS.map((m) => (
          <button
            key={m.key}
            onClick={() => setModulo(m.key)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              modulo === m.key
                ? "bg-white text-black shadow-lg"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {modulo !== "recordatorios" && (
        <div className="flex gap-2 border-b border-white/10 pb-2 text-xs">
          <button
            onClick={() => setSubTab("habitos")}
            className={`pb-1 font-semibold ${subTab === "habitos" ? "border-b-2 border-[#1abc9c] text-white" : "text-white/50 hover:text-white"}`}
          >
            📋 Hábitos Sugeridos
          </button>
          <button
            onClick={() => setSubTab("evaluacion")}
            className={`pb-1 font-semibold ${subTab === "evaluacion" ? "border-b-2 border-[#1abc9c] text-white" : "text-white/50 hover:text-white"}`}
          >
            📝 Autoevaluación Semanal
          </button>
          <button
            onClick={() => setSubTab("estadisticas")}
            className={`pb-1 font-semibold ${subTab === "estadisticas" ? "border-b-2 border-[#1abc9c] text-white" : "text-white/50 hover:text-white"}`}
          >
            📊 Estadísticas de Práctica
          </button>
        </div>
      )}

      {modulo === "recordatorios" ? (
        <div className="space-y-6">
          <form onSubmit={guardarAlerta} className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Configurar Nuevo Recordatorio</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs text-white/60 mb-1">Hábito o Tarea:</label>
                <input
                  type="text"
                  value={recTexto}
                  onChange={(e) => setRecTexto(e.target.value)}
                  placeholder="ej: Practicar 15 min de Speaking"
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs text-white placeholder-white/40 focus:border-[#1abc9c] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Hora del aviso:</label>
                <input
                  type="time"
                  value={recHora}
                  onChange={(e) => setRecHora(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:border-[#1abc9c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Frecuencia:</label>
                <select
                  value={recFrecuencia}
                  onChange={(e) => setRecFrecuencia(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-[#151515] p-2.5 text-xs text-white focus:border-[#1abc9c] focus:outline-none"
                >
                  {FRECUENCIAS.map((f) => (
                    <option key={f} value={f}>Cada {f === 1 ? "día" : `${f} días`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Canal de notificación:</label>
                <select
                  value={recCanal}
                  onChange={(e) => setRecCanal(e.target.value as "email" | "whatsapp")}
                  className="w-full rounded-lg border border-white/10 bg-[#151515] p-2.5 text-xs text-white focus:border-[#1abc9c] focus:outline-none"
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[#1abc9c] px-4 py-2 text-xs font-bold text-black hover:bg-[#16a085] transition-all shadow-md"
            >
              Guardar Recordatorio
            </button>
            {recGuardado && <span className="ml-3 text-xs text-emerald-400 font-bold">✓ Recordatorio guardado correctamente</span>}
          </form>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Recordatorios Activos</h3>
            <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl">
              {recordatorios.map((r, i) => (
                <div key={r.id || i} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{r.habito}</p>
                    <p className="text-[11px] text-white/40">Hora: {r.hora} · Cada {r.frecuenciaDias === 1 ? "día" : `${r.frecuenciaDias} días`} · Canal: {r.canal}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/20">Activo</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : subTab === "habitos" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(HABITOS_SUGERIDOS[modulo] ?? []).map((h, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{h.nombre}</h4>
                <span className="rounded-full bg-[#1abc9c]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#1abc9c]">
                  {h.duracion}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      ) : subTab === "evaluacion" ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Autoevaluación Semanal de Idiomas</h3>
          <div>
            <label className="block text-xs text-white/80 mb-2">Confianza y soltura al hablar en inglés esta semana (1 a 5):</label>
            <input
              type="range" min="1" max="5" value={confianzaSpeaking}
              onChange={(e) => setConfianzaSpeaking(Number(e.target.value))}
              className="w-full accent-[#1abc9c]"
            />
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>1 (Muy inseguro)</span>
              <span className="font-bold text-[#1abc9c]">{confianzaSpeaking}/5</span>
              <span>5 (Muy fluido)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/80 mb-2">Adherencia al plan de estudio (días practicados esta semana):</label>
            <input
              type="range" min="1" max="7" value={adherenciaSemanal}
              onChange={(e) => setAdherenciaSemanal(Number(e.target.value))}
              className="w-full accent-[#1abc9c]"
            />
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>1 día</span>
              <span className="font-bold text-[#1abc9c]">{adherenciaSemanal} días / semana</span>
              <span>7 días</span>
            </div>
          </div>

          <button
            onClick={guardarEvaluacion}
            className="rounded-lg bg-[#1abc9c] px-4 py-2 text-xs font-bold text-black hover:bg-[#16a085] transition-all"
          >
            Guardar Autoevaluación
          </button>
          {evalGuardada && <span className="ml-3 text-xs text-emerald-400 font-bold">✓ Calibración semanal actualizada</span>}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Evolución de Práctica Conversacional</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <span className="text-[10px] text-white/40 uppercase">Horas este mes</span>
              <p className="text-2xl font-extrabold text-[#1abc9c] mt-1">12.5 h</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <span className="text-[10px] text-white/40 uppercase">Sesiones con Twin</span>
              <p className="text-2xl font-extrabold text-white mt-1">24</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-4">
              <span className="text-[10px] text-white/40 uppercase">Vocabulario fijado</span>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">+140</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}