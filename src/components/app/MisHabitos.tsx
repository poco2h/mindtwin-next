"use client";

import { useState } from "react";
import { useTwin } from "@/lib/session/useTwin";

const TABS = [
  { key: "habitos", label: "📋 Hábitos sugeridos" },
  { key: "constancia", label: "🔥 Constancia" },
  { key: "autoevaluacion", label: "📝 Autoevaluación" },
  { key: "alertas", label: "🔔 Alertas" },
  { key: "estadisticas", label: "📊 Estadísticas" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const HABITOS_DOCENTES = [
  { nombre: "Conversación con Teacher MindTwin", desc: "Práctica de fluidez oral y pronunciación guiada en inglés.", duracion: "20 min/día", nivel: "Todos los niveles" },
  { nombre: "Lectura en voz alta con IPA", desc: "Enfoque en fonética, enlaces de palabras y ritmo natural.", duracion: "10 min/día", nivel: "B1 - C1" },
  { nombre: "Escucha activa de podcast nativo", desc: "Comprensión auditiva contextualizada sin subtítulos.", duracion: "15 min/día", nivel: "A2 - C2" },
  { nombre: "Fijación de 5 palabras en contexto", desc: "Creación de frases prácticas con el vocabulario corregido.", duracion: "5 min/día", nivel: "A1 - C2" },
  { nombre: "Simulación de Roleplay / Entrevista", desc: "Preparación de situaciones laborales, viajes o reuniones.", duracion: "15 min/sesión", nivel: "B2 - C2" },
];

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const FRECUENCIAS = [1, 2, 3, 5, 7];

export default function MisHabitos() {
  const { twin, guardar } = useTwin();
  const [activeTab, setActiveTab] = useState<TabKey>("habitos");

  // Estados Alertas
  const [recTexto, setRecTexto] = useState("");
  const [recFrecuencia, setRecFrecuencia] = useState(1);
  const [recHora, setRecHora] = useState("09:00");
  const [recCanal, setRecCanal] = useState<"email" | "whatsapp">("email");
  const [recGuardado, setRecGuardado] = useState(false);

  // Estados Autoevaluación
  const [confianzaSpeaking, setConfianzaSpeaking] = useState(4);
  const [comprensionAuditiva, setComprensionAuditiva] = useState(4);
  const [diasPracticados, setDiasPracticados] = useState(5);
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
    { id: "2", habito: "Repaso semanal de vocabulario y notas fonéticas IPA", frecuenciaDias: 7, hora: "19:00", canal: "whatsapp" },
  ];

  return (
    <div className="relative mx-auto max-w-4xl space-y-6 pb-12">
      {/* Cabecera con tamaño de letra estándar text-2xl */}
      <div className="border-b border-white/10 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1abc9c]">
          Lili Speak · Metodología & Práctica
        </p>
        <h2 className="font-playfair text-2xl font-bold text-white">
          Mis Hábitos
        </h2>
        <p className="text-xs text-white/60 mt-1">
          Seguimiento de constancia, autoevaluaciones semanales y alertas de estudio.
        </p>
      </div>

      {/* Menú de 5 opciones exactas */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              activeTab === t.key
                ? "bg-white text-black shadow-lg"
                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === "habitos" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {HABITOS_DOCENTES.map((h, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{h.nombre}</h4>
                <span className="rounded-full bg-[#1abc9c]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#1abc9c]">
                  {h.duracion}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">{h.desc}</p>
              <div className="mt-3 border-t border-white/5 pt-2 text-[10px] text-white/40">
                Nivel recomendado: <span className="text-white/70">{h.nivel}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "constancia" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#1abc9c]">Racha Activa</span>
                <h3 className="text-xl font-extrabold text-white">14 días consecutivos de práctica</h3>
              </div>
              <span className="text-3xl">🔥</span>
            </div>
            <p className="text-xs text-white/60">
              Has alcanzado tu objetivo del 85% de constancia este mes. La regularidad es la clave para la fluidez oral.
            </p>

            <div className="grid grid-cols-7 gap-2 pt-2 text-center">
              {DIAS_SEMANA.map((d, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="text-[10px] text-white/40">{d}</span>
                  <div className="mt-2 flex justify-center">
                    <span className={`h-3 w-3 rounded-full ${i < 5 ? "bg-[#1abc9c] shadow-[0_0_8px_#1abc9c]" : "bg-white/20"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "autoevaluacion" && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Autoevaluación Semanal de Idiomas</h3>
          <div>
            <label className="block text-xs text-white/80 mb-2">Confianza y soltura al hablar en inglés (1 a 5):</label>
            <input
              type="range" min="1" max="5" value={confianzaSpeaking}
              onChange={(e) => setConfianzaSpeaking(Number(e.target.value))}
              className="w-full accent-[#1abc9c]"
            />
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>1 (Inseguro)</span>
              <span className="font-bold text-[#1abc9c]">{confianzaSpeaking}/5</span>
              <span>5 (Muy fluido)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/80 mb-2">Comprensión auditiva en conversaciones reales (1 a 5):</label>
            <input
              type="range" min="1" max="5" value={comprensionAuditiva}
              onChange={(e) => setComprensionAuditiva(Number(e.target.value))}
              className="w-full accent-[#1abc9c]"
            />
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>1 (Dificultad alta)</span>
              <span className="font-bold text-[#1abc9c]">{comprensionAuditiva}/5</span>
              <span>5 (Excelente comprensión)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/80 mb-2">Días dedicados a la práctica esta semana:</label>
            <input
              type="range" min="1" max="7" value={diasPracticados}
              onChange={(e) => setDiasPracticados(Number(e.target.value))}
              className="w-full accent-[#1abc9c]"
            />
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>1 día</span>
              <span className="font-bold text-[#1abc9c]">{diasPracticados} días / semana</span>
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
      )}

      {activeTab === "alertas" && (
        <div className="space-y-6">
          <form onSubmit={guardarAlerta} className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Configurar Nueva Alerta o Recordatorio</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs text-white/60 mb-1">Hábito o Tarea:</label>
                <input
                  type="text"
                  value={recTexto}
                  onChange={(e) => setRecTexto(e.target.value)}
                  placeholder="ej: Practicar 20 min de Speaking"
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
              Guardar Alerta
            </button>
            {recGuardado && <span className="ml-3 text-xs text-emerald-400 font-bold">✓ Alerta guardada correctamente</span>}
          </form>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Alertas y Recordatorios Activos</h3>
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
      )}

      {activeTab === "estadisticas" && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Evolución de Práctica Conversacional</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
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
