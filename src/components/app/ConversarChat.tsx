"use client";

import { useEffect, useState } from "react";
import VideollamadaPanel from "./VideollamadaPanel";
import VozPanel from "./VozPanel";
import { leerMarcas } from "@/lib/demo/marcas";
import { useSessionBilling } from "@/lib/billing/useSessionBilling";
import type { Canal as CanalBilling } from "@/lib/billing/pricing";

type Correccion = { original: string; correccion: string; explicacion: string };

type Msg = {
  who: "MindTwin" | "Tú";
  text: string;
  time: string;
  correcciones?: Correccion[];
  notaFonetica?: string;
  traduccionEs?: string;
  sugerencia?: string;
};

type Canal = "texto" | "voz" | "video";

const CANAL_BILLING: Record<Canal, CanalBilling> = {
  texto: "texto",
  voz: "voz",
  video: "video_rt",
};

function now() {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function saludoOnboardingOwner(ownerName: string) {
  return (
    `Hola, ${ownerName}. Soy tu Teacher MindTwin.\n\n` +
    "Para calibrar tu gemelo pedagógico de idiomas, completaremos 4 sesiones guiadas:\n" +
    "• Sesión 1: Metodología pedagógica · Eneagrama · Apego y motivación\n" +
    "• Sesión 2: Idiomas impartidos · Niveles MCER · Especialidades docentes\n" +
    "• Sesión 3: Estilo de corrección · Fonética IPA · Clonación de voz\n" +
    "• Sesión 4: Tus materiales de clase y packs didácticos\n\n" +
    "Responde con sinceridad — solo tú verás esto. Si te cansas, dímelo y seguimos cuando quieras.\n\n" +
    "¿Empezamos con la Sesión 1?"
  );
}

function saludoOnboardingFollower(ownerName: string) {
  return (
    `Soy el Teacher MindTwin de ${ownerName}, una IA entrenada con su metodología pedagógica real.\n\n` +
    "Antes de nada, voy a conocerte un poco mejor para poder darte respuestas hechas a tu medida. Son unas preguntas " +
    "repartidas en 3 sesiones de unos 20 minutos cada una:\n" +
    "• Sesión 1: Personalidad · Eneagrama · Apego\n" +
    "• Sesión 2: Nivel MCER actual · Objetivos de fluidez\n" +
    "• Sesión 3: Estilo de aprendizaje · Tu voz\n\n" +
    "Responde con sinceridad — solo tú verás esto. Si te cansas, dímelo y seguimos cuando quieras.\n\n" +
    "¿Empezamos con la Sesión 1?"
  );
}

function saludoInicial(role: "owner" | "follower", ownerName: string, onboardingCompleto: boolean) {
  if (role === "follower") {
    return onboardingCompleto
      ? `Hello! I'm ${ownerName}'s Teacher MindTwin. What would you like to practice in English today?`
      : saludoOnboardingFollower(ownerName);
  }
  return onboardingCompleto
    ? `Hola, ${ownerName}. Soy tu Teacher MindTwin. ¿En qué aspecto de tu metodología o packs de clase quieres trabajar hoy?`
    : saludoOnboardingOwner(ownerName);
}

const PROMPTS_SUGERIDOS_FOLLOWER = [
  "Could you explain the difference between 'make' and 'do'?",
  "Yesterday I went to the cinema and I wanted to practice past tense...",
  "I would like to practice vocabulary for a job interview in English.",
];

export default function ConversarChat({
  ownerName,
  role,
  ownerId,
  followerId,
  canalInicial,
  onboardingCompleto = false,
  sesionActual,
}: {
  ownerName: string;
  role: "owner" | "follower";
  ownerId?: string;
  followerId?: string;
  canalInicial?: Canal;
  onboardingCompleto?: boolean;
  sesionActual?: "S1" | "S2" | "S3" | "S4";
}) {
  const [canal, setCanal] = useState<Canal>(canalInicial ?? "texto");
  const [messages, setMessages] = useState<Msg[]>([
    { who: "MindTwin", time: now(), text: saludoInicial(role, ownerName, onboardingCompleto) },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [marcaYaMencionada, setMarcaYaMencionada] = useState(false);
  const billing = useSessionBilling(CANAL_BILLING[canal]);

  useEffect(() => {
    setMessages((m) => (m.length === 1 && m[0].who === "MindTwin" ? [{ ...m[0], text: saludoInicial(role, ownerName, onboardingCompleto) }] : m));
  }, [ownerName, role, onboardingCompleto]);

  async function enviarTexto(mensaje: string) {
    if (!mensaje.trim() || sending) return;
    const txt = mensaje.trim();
    setInput("");
    const userMsg: Msg = { who: "Tú", time: now(), text: txt };
    const historialPrevio = messages.map((m) => ({ who: m.who, text: m.text }));
    setMessages((m) => [...m, userMsg]);
    setSending(true);

    try {
      const res = await fetch("/api/conversar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: txt,
          role,
          ownerName,
          ownerId,
          followerId,
          marcas: leerMarcas(),
          marcaYaMencionada,
          historial: historialPrevio,
          idiomaEnsenanza: "inglés",
          nivelAlumno: "B1/B2",
        }),
      });

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { who: "MindTwin", time: now(), text: "No he podido responder ahora mismo. Inténtalo de nuevo en unos segundos." },
        ]);
        return;
      }

      const data = await res.json();
      if (data.marcaMencionada) setMarcaYaMencionada(true);

      setMessages((m) => [
        ...m,
        {
          who: "MindTwin",
          time: now(),
          text: data.respuesta ?? "",
          correcciones: data.correcciones_inline,
          notaFonetica: data.nota_fonetica_ipa,
          traduccionEs: data.traduccion_es,
          sugerencia: data.sugerencia_siguiente,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { who: "MindTwin", time: now(), text: "Error de conexión. Comprueba tu red e inténtalo de nuevo." },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    enviarTexto(input);
  }

  return (
    <div className="relative mx-auto flex h-[calc(100vh-140px)] max-w-4xl flex-col rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl shadow-2xl">

      {/* Contenido según el canal activo */}
      {canal === "voz" ? (
        <div className="flex-1 overflow-y-auto">
          <VozPanel
            ownerName={ownerName}
            onClose={() => setCanal("texto")}
            onMensajeProcesado={(texto, respuesta) => {
              setMessages((m) => [
                ...m,
                { who: "Tú", time: now(), text: texto },
                { who: "MindTwin", time: now(), text: respuesta },
              ]);
            }}
          />
        </div>
      ) : canal === "video" ? (
        <div className="flex-1 overflow-y-auto">
          <VideollamadaPanel
            ownerName={ownerName}
            onClose={() => setCanal("texto")}
          />
        </div>
      ) : (
        <>
          {/* Mensajes del chat */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.who === "Tú" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 px-1 text-[10px] text-white/40">
                  <span>{m.who}</span>
                  <span>·</span>
                  <span>{m.time}</span>
                </div>
                <div
                  className={`mt-1 max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.who === "Tú"
                      ? "bg-gradient-to-r from-[#1abc9c] to-[#0e9f85] font-medium text-black"
                      : "border border-white/10 bg-white/5 text-white/95 backdrop-blur-md"
                  }`}
                >
                  {m.text}

                  {/* Widgets de correcciones para follower */}
                  {m.correcciones && m.correcciones.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-white/10 pt-2 text-xs">
                      <div className="font-bold text-amber-300">💡 Sugerencia pedagógica:</div>
                      {m.correcciones.map((c, idx) => (
                        <div key={idx} className="rounded bg-amber-500/10 p-2 border border-amber-500/20 text-amber-200">
                          <span className="line-through text-red-300 mr-2">{c.original}</span>
                          <span className="font-bold text-emerald-300">→ {c.correccion}</span>
                          <p className="text-[11px] text-white/80 mt-1">{c.explicacion}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notas fonéticas IPA */}
                  {m.notaFonetica && (
                    <div className="mt-2 flex items-center gap-1.5 rounded bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-200 border border-blue-500/20">
                      <span>🗣️ Guía Fonética:</span>
                      <span className="font-mono font-bold text-white">{m.notaFonetica}</span>
                    </div>
                  )}

                  {/* Traducción de apoyo */}
                  {m.traduccionEs && (
                    <div className="mt-2 text-[11px] italic text-white/60">
                      ℹ️ {m.traduccionEs}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-start">
                <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#1abc9c]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#1abc9c] [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#1abc9c] [animation-delay:0.4s]"></span>
                  <span className="ml-1">Pensando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompts sugeridos solo para el Follower al inicio */}
          {role === "follower" && messages.length <= 2 && (
            <div className="my-2 flex flex-wrap gap-1.5">
              {PROMPTS_SUGERIDOS_FOLLOWER.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => enviarTexto(p)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70 hover:border-[#1abc9c]/50 hover:bg-[#1abc9c]/10 hover:text-white transition-all text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Barra inferior limpia (Referencia exactísima Captura 3) */}
          <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
            {/* Botón Micrófono */}
            <button
              type="button"
              onClick={() => setCanal(canal === "voz" ? "texto" : "voz")}
              title="Práctica de Voz"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="11" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="19" x2="12" y2="22" />
                <line x1="8" y1="22" x2="16" y2="22" />
              </svg>
            </button>

            {/* Input de texto */}
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={sending}
                className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-white/40 focus:border-[#1abc9c] focus:outline-none focus:ring-1 focus:ring-[#1abc9c] disabled:opacity-50"
              />
            </div>

            {/* Botón blanco de enviar con flecha */}
            <button
              type="submit"
              disabled={!input.trim() || sending}
              aria-label="Enviar"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-black font-bold transition-all hover:bg-white/90 disabled:opacity-30 shadow-lg"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          {/* Bolsa de minutos abajo a la derecha */}
          <div className="mt-2 flex items-center justify-end">
            <div className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-white/70 shadow-md">
              Bolsa: <span className="font-bold text-[#1abc9c]">15.67 min</span> disponibles
            </div>
          </div>
        </>
      )}
    </div>
  );
}
