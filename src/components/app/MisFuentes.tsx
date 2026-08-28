"use client";

import { useState } from "react";
import type { Sources } from "@/lib/demo/localTwin";
import { calcularFidelidadDemo } from "@/lib/fidelity/calcularDemo";
import { useTwin } from "@/lib/session/useTwin";

const MILESTONES = ["S1", "S2", "S3+Voz", "+Email", "+Docs", "95%"];

function Card({ children, activo = true }: { children: React.ReactNode; activo?: boolean }) {
  return (
    <div className={"rounded-xl border p-3.5 " + (activo ? "border-[#1abc9c]/25" : "border-white/10")} style={{ background: "rgba(0,0,0,0.22)" }}>
      {children}
    </div>
  );
}

function EstadoDot({ estado }: { estado: "done" | "n3" | "n4" | "empty" }) {
  const color = { done: "#1abc9c", n3: "#fbbf24", n4: "#f87171", empty: "rgba(255,255,255,0.15)" }[estado];
  return <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color, boxShadow: estado !== "empty" ? `0 0 8px ${color}` : "none" }} />;
}

const CONECTORES_EXTERNOS: Array<{
  key: keyof Sources; nombre: string; icon: string; queCaptura: string; mecanismo: string; filosofos: string; gain: string;
}> = [
  {
    key: "google", nombre: "Google Suite · YouTube + Drive + Gmail", icon: "🔷",
    queCaptura: "YouTube: transcripciones de lecciones y pronunciación oral. Drive: documentos de gramática y guías. Gmail: patrones y comunicación con alumnos.",
    mecanismo: "OAuth conecta los 3 simultáneamente (scopes youtube.readonly + drive.readonly + gmail.readonly).",
    filosofos: "Gorgias +++ · Homero ++ · Aristóteles + · Platón + · Sócrates + · Séneca +",
    gain: "+10% (3-4% / 3% / 4%)",
  },
  {
    key: "instagram", nombre: "Instagram Profesional", icon: "📸",
    queCaptura: "Reels pedagógicos, stories y comentarios de alumnos. Imagen pública y estilo de comunicación corta.",
    mecanismo: "Conexión vía Zernio / Meta API para cuentas profesionales.",
    filosofos: "Gorgias ++ · Homero ++",
    gain: "+2–3%",
  },
  {
    key: "tiktok", nombre: "TikTok Educativo", icon: "🎵",
    queCaptura: "Vídeos cortos de vocabulario, pronunciación y tips de idiomas en registro dinámico.",
    mecanismo: "Creator API / sincronización de canal docente.",
    filosofos: "Gorgias +++ · Homero ++ · Heráclito +",
    gain: "+3–4%",
  },
  {
    key: "whatsapp", nombre: "WhatsApp Alumnos", icon: "💬",
    queCaptura: "Consultas frecuentes de alumnos, dudas habituales y registro conversacional cercano.",
    mecanismo: "Exportación .txt de chats o canal oficial Zernio.",
    filosofos: "Sócrates ++ · Heráclito ++",
    gain: "+4%",
  },
  {
    key: "wearables", nombre: "Materiales y Documentos", icon: "📚",
    queCaptura: "Dosiers PDF, transcripciones fonéticas IPA y temarios por nivel MCER.",
    mecanismo: "Subida directa de archivos PDF / Word.",
    filosofos: "Aristóteles ++ · Platón +",
    gain: "+1–2%",
  },
];

export default function MisFuentes() {
  const { twin, guardar } = useTwin();
  const [modalKey, setModalKey] = useState<keyof Sources | null>(null);
  const [inputVal, setInputVal] = useState("");

  const fidelidad = twin ? calcularFidelidadDemo(twin) : 0.95;
  const porcentaje = Math.round(fidelidad * 100);

  function toggleFuente(k: keyof Sources) {
    if (!twin) return;
    const nuevo = { ...twin, sources: { ...twin.sources, [k]: !twin.sources[k] } };
    guardar(nuevo);
  }

  return (
    <div className="relative mx-auto max-w-5xl space-y-6 pb-12">
      {/* Cabecera y Barra de Progreso */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1abc9c]">Fidelidad del Teacher MindTwin</p>
            <h2 className="font-playfair text-2xl font-bold text-white">Todas las fuentes calibradas</h2>
          </div>
          <div className="text-right">
            <span className="font-mono text-3xl font-extrabold text-[#1abc9c]">{porcentaje}%</span>
            <span className="block text-[10px] uppercase text-white/40">Techo del sistema: 95%</span>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-[#1abc9c] to-[#0e9f85]" style={{ width: `${porcentaje}%` }} />
        </div>

        <div className="mt-3 flex justify-between text-[11px] text-white/40">
          {MILESTONES.map((m, idx) => (
            <span key={idx} className="font-semibold text-emerald-400">✓ {m}</span>
          ))}
        </div>
      </div>

      {/* Bloque 1: Fuentes Internas Automáticas */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
          Fuentes Internas Automáticas (Docencia & Metodología)
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card activo={true}>
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🧠</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">EGO ID — Perfil Pedagógico</p>
                <p className="text-[10px] text-white/40">6 dimensiones de personalidad docente y empatía</p>
              </div>
              <EstadoDot estado="done" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Calibra el estilo de enseñanza: paciencia, motivación, rigor y modulación socrática.
            </p>
          </Card>

          <Card activo={true}>
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🎙️</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Voz y Pronunciación — Clonación ElevenLabs</p>
                <p className="text-[10px] text-white/40">Voz clonada y evaluación fonética Azure Speech</p>
              </div>
              <EstadoDot estado="done" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Permite a los alumnos practicar speaking con tu voz real y corrección fonética IPA.
            </p>
          </Card>

          <Card activo={true}>
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📚</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Packs Didácticos & MCER</p>
                <p className="text-[10px] text-white/40">Niveles A1 a C2 · Business English · Exámenes</p>
              </div>
              <EstadoDot estado="done" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Directrices de contenido y temarios para que el MindTwin responda según el nivel del alumno.
            </p>
          </Card>

          <Card activo={true}>
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📊</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Historial y Constancia Lingüística</p>
                <p className="text-[10px] text-white/40">Seguimiento de sesiones y errores recurrentes</p>
              </div>
              <EstadoDot estado="done" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Detección de patrones de error en los alumnos y personalización de las siguientes clases.
            </p>
          </Card>
        </div>
      </div>

      {/* Bloque 2: Fuentes Externas Conectadas */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
          Conexión de Fuentes Externas (Redes, Documentos y Mensajería)
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {CONECTORES_EXTERNOS.map((con) => {
            const activo = twin?.sources ? twin.sources[con.key] : true;
            return (
              <div
                key={con.key}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{con.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{con.nombre}</h4>
                    <p className="text-xs text-white/60 max-w-xl">{con.queCaptura}</p>
                    <p className="text-[10px] text-[#1abc9c] mt-0.5">Impacto: {con.gain} · {con.filosofos}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${activo ? "text-emerald-400" : "text-white/40"}`}>
                    {activo ? "● Conectado" : "○ No conectado"}
                  </span>
                  <button
                    onClick={() => toggleFuente(con.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      activo
                        ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-300"
                        : "bg-[#1abc9c] text-black hover:bg-[#16a085]"
                    }`}
                  >
                    {activo ? "Desconectar" : "Conectar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
