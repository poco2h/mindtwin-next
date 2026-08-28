"use client";

import { useState, useRef, useEffect } from "react";

type ItemTraduccion = {
  id: string;
  original: string;
  traducido: string;
  de: string;
  a: string;
  tiempo: string;
  latencia: number;
  motor: string;
  audioBase64?: string | null;
};

export default function TraduccionSimultaneaPanel() {
  const [idiomaOrigen, setIdiomaOrigen] = useState<"es" | "en">("es");
  const [idiomaDestino, setIdiomaDestino] = useState<"es" | "en">("en");
  const [textoInput, setTextoInput] = useState("");
  const [traduciendo, setTraduciendo] = useState(false);
  const [escuchandoAudio, setEscuchandoAudio] = useState(false);
  const [historial, setHistorial] = useState<ItemTraduccion[]>([
    {
      id: "demo_1",
      original: "Hola, me gustaría saber si la reunión de negocios de mañana se mantiene a las diez de la mañana.",
      traducido: "Hello, I would like to know if tomorrow's business meeting is held at ten in the morning.",
      de: "es",
      a: "en",
      tiempo: "11:30",
      latencia: 88,
      motor: "Azure Cognitive Translator v3.0",
    },
  ]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = idiomaOrigen === "es" ? "es-ES" : "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTextoInput(transcript);
          ejecutarTraduccion(transcript, idiomaOrigen, idiomaDestino);
          setEscuchandoAudio(false);
        };

        recognition.onerror = () => {
          setEscuchandoAudio(false);
        };

        recognition.onend = () => {
          setEscuchandoAudio(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [idiomaOrigen, idiomaDestino]);

  function intercambiarIdiomas() {
    const prevOrigen = idiomaOrigen;
    setIdiomaOrigen(idiomaDestino);
    setIdiomaDestino(prevOrigen);
  }

  function toggleDictadoVoz() {
    if (!recognitionRef.current) {
      alert("El reconocimiento de voz funciona en Google Chrome y Microsoft Edge.");
      return;
    }
    if (escuchandoAudio) {
      recognitionRef.current.stop();
      setEscuchandoAudio(false);
    } else {
      recognitionRef.current.lang = idiomaOrigen === "es" ? "es-ES" : "en-US";
      recognitionRef.current.start();
      setEscuchandoAudio(true);
    }
  }

  async function ejecutarTraduccion(texto: string, de: string, a: string) {
    if (!texto.trim() || traduciendo) return;
    const txt = texto.trim();
    setTraduciendo(true);
    setTextoInput("");

    try {
      const res = await fetch("/api/traduccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: txt,
          idiomaOrigen: de,
          idiomaDestino: a,
          generarVoz: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const nuevoItem: ItemTraduccion = {
          id: crypto.randomUUID(),
          original: txt,
          traducido: data.textoTraducido,
          de,
          a,
          tiempo: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          latencia: data.latencyMs || 90,
          motor: data.motor || "Azure Cognitive Translator",
          audioBase64: data.audioBase64,
        };
        setHistorial((prev) => [nuevoItem, ...prev]);
        reproducirTexto(data.textoTraducido, a, data.audioBase64);
      }
    } catch (err) {
      console.error("Error en traducción:", err);
    } finally {
      setTraduciendo(false);
    }
  }

  function reproducirTexto(texto: string, idioma: string, audioBase64?: string | null) {
    if (audioBase64) {
      const snd = new Audio("data:audio/mp3;base64," + audioBase64);
      snd.play().catch(() => hablarNativo(texto, idioma));
    } else {
      hablarNativo(texto, idioma);
    }
  }

  function hablarNativo(texto: string, idioma: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(texto);
      utter.lang = idioma === "es" ? "es-ES" : "en-US";
      utter.rate = 1.0;
      window.speechSynthesis.speak(utter);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    ejecutarTraduccion(textoInput, idiomaOrigen, idiomaDestino);
  }

  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="rounded-lg bg-black/60 px-3 py-1.5 text-white">
            {idiomaOrigen === "es" ? "🇪🇸 Español" : "🇬🇧 English"}
          </span>
          <button
            type="button"
            onClick={intercambiarIdiomas}
            title="Intercambiar idiomas"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-[#1abc9c] hover:text-black transition-all"
          >
            ⇄
          </button>
          <span className="rounded-lg bg-black/60 px-3 py-1.5 text-[#1abc9c]">
            {idiomaDestino === "en" ? "🇬🇧 English" : "🇪🇸 Español"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-white/50">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Azure Cognitive Translator v3.0 · <span className="font-mono text-emerald-300">francecentral</span></span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[calc(100vh-320px)]">
        {historial.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/50 p-4 backdrop-blur-md space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-[11px] text-white/40">
              <span className="font-bold uppercase text-white/60">{item.de.toUpperCase()} ➔ {item.a.toUpperCase()}</span>
              <span>{item.tiempo} · Latencia: <span className="text-[#1abc9c] font-mono">{item.latencia}ms</span></span>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-white/80">
              <span className="text-[10px] uppercase font-bold text-white/40 block mb-0.5">Original:</span>
              <p>{item.original}</p>
            </div>
            <div className="rounded-xl border border-[#1abc9c]/30 bg-[#1abc9c]/10 p-3 text-sm text-white flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#1abc9c] block mb-0.5">Traducción Simultánea:</span>
                <p className="font-medium text-white text-base leading-relaxed">{item.traducido}</p>
              </div>
              <button
                type="button"
                onClick={() => reproducirTexto(item.traducido, item.a, item.audioBase64)}
                title="Escuchar pronunciación"
                className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-[#1abc9c] hover:text-black transition-all"
              >
                🔊
              </button>
            </div>
          </div>
        ))}
        {traduciendo && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-[#1abc9c] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#1abc9c] animate-ping" />
            <span>Traduciendo simultáneamente con Azure Translator...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={toggleDictadoVoz}
          title={escuchandoAudio ? "Detener escucha" : "Hablar por micrófono para traducir"}
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-all ${
            escuchandoAudio
              ? "bg-red-500 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]"
              : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
          }`}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="11" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </button>
        <input
          type="text"
          value={textoInput}
          onChange={(e) => setTextoInput(e.target.value)}
          placeholder={escuchandoAudio ? "Escuchando tu voz en vivo..." : `Escribe o habla en ${idiomaOrigen === "es" ? "español" : "inglés"} para traducir...`}
          disabled={traduciendo}
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-white/40 focus:border-[#1abc9c] focus:outline-none focus:ring-1 focus:ring-[#1abc9c]"
        />
        <button
          type="submit"
          disabled={!textoInput.trim() || traduciendo}
          aria-label="Traducir"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#1abc9c] text-black font-bold transition-all hover:bg-[#16a085] disabled:opacity-30 shadow-lg"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </form>
    </div>
  );
}