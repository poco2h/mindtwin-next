"use client";

import React, { useState, useEffect, useRef } from "react";
import MyliliLogoHeader from "./MyliliLogoHeader";
import MyliliFooter from "./MyliliFooter";

interface Turno {
  id: string;
  speaker: "follower" | "guest";
  mode?: "yo_hablo" | "twin_habla";
  originalText: string;
  translatedText: string;
  time: string;
  chips?: Array<{ tipo: string; status: string; label: string }>;
  audioBase64?: string | null;
}

interface TercerosFollowerRoomProps {
  roomId: string;
  langFollower: string;
  langGuest: string;
  privacy: boolean;
  onColgar: (stats: { duracionSegundos: number; turnos: Turno[] }) => void;
}

export default function TercerosFollowerRoom({
  roomId,
  langFollower = "zh",
  langGuest = "es",
  privacy = true,
  onColgar,
}: TercerosFollowerRoomProps) {
  // Modo de habla: 'yo_hablo' (teal) vs 'twin_habla' (purple)
  const [modo, setModo] = useState<"yo_hablo" | "twin_habla">("yo_hablo");

  // Timer de llamada en directo
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);

  // Estados de voz y transcripción
  const [isRecording, setIsRecording] = useState(false);
  const [isTwinGenerating, setIsTwinGenerating] = useState(false);
  const [inputTextFollower, setInputTextFollower] = useState("");
  const [inputGuestSimulado, setInputGuestSimulado] = useState("");
  const [procesando, setProcesando] = useState(false);

  // Últimos paneles activos
  const [ultimoGuestDice, setUltimoGuestDice] = useState<string>(
    "Hola, ¿cómo estás? Qué bueno poder hablar contigo hoy."
  );
  const [ultimoFollowerTraducido, setUltimoFollowerTraducido] = useState<string>(
    langFollower === "zh" ? "你好，我也很高兴能与你交流！" : "Hello, I am also very glad to talk with you!"
  );

  // Chips de feedback lingüístico en vivo (Modo Yo hablo)
  const [chipsActivos, setChipsActivos] = useState<Array<{ tipo: string; status: string; label: string }>>([
    { tipo: "tone", status: "ok", label: "✓ Tono natural" },
    { tipo: "tone_warn", status: "warn", label: langFollower === "zh" ? "⚠ 声调 3→4" : "⚠ Entonación ascendente" },
    { tipo: "grammar", status: "ok", label: "ℹ Gramática correcta" },
  ]);

  // Historial de turnos
  const [turnos, setTurnos] = useState<Turno[]>([
    {
      id: "t_1",
      speaker: "guest",
      originalText: "Hola, ¿cómo estás? Qué bueno poder hablar contigo hoy.",
      translatedText: langFollower === "zh" ? "你好，你今天过得怎么样？" : "Hello, how are you today?",
      time: "00:05",
    },
    {
      id: "t_2",
      speaker: "follower",
      mode: "yo_hablo",
      originalText: langFollower === "zh" ? "我很好，谢谢你。我们开始讨论吧。" : "I am fine, thank you. Let's start discussing.",
      translatedText: "Estoy muy bien, gracias. Empecemos a hablar.",
      time: "00:15",
      chips: [
        { tipo: "tone", status: "ok", label: "✓ Tono natural" },
        { tipo: "grammar", status: "ok", label: "ℹ Gramática correcta" },
      ],
    },
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Timer de llamada
  useEffect(() => {
    const interval = setInterval(() => {
      setSegundosTranscurridos((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatearTimer = (seg: number) => {
    const m = Math.floor(seg / 60).toString().padStart(2, "0");
    const s = (seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Web Speech API para dictado nativo en Chrome / Edge
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = modo === "yo_hablo" ? (langFollower === "zh" ? "zh-CN" : "en-US") : "es-ES";

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleEnviarTurnoFollower(transcript);
          }
          setIsRecording(false);
        };

        rec.onerror = () => setIsRecording(false);
        rec.onend = () => setIsRecording(false);
        recognitionRef.current = rec;
      }
    }
  }, [modo, langFollower]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      // Fallback para navegadores sin SpeechRecognition
      const promptDemo =
        modo === "yo_hablo"
          ? (langFollower === "zh" ? "你好，我想练习中文。" : "Hello, I want to practice English.")
          : "Quiero explicarte cómo va el proyecto formativo.";
      handleEnviarTurnoFollower(promptDemo);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang =
        modo === "yo_hablo" ? (langFollower === "zh" ? "zh-CN" : "en-US") : "es-ES";
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleEnviarTurnoFollower = async (texto: string) => {
    if (!texto.trim() || procesando) return;
    const txt = texto.trim();
    setInputTextFollower("");
    setProcesando(true);

    if (modo === "twin_habla") {
      setIsTwinGenerating(true);
    }

    try {
      const res = await fetch("/api/mindtwin/terceros/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          speaker: "follower",
          mode,
          text: txt,
          lang_follower: langFollower,
          lang_guest: langGuest,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const nuevoTurno: Turno = {
          id: data.turn?.id || crypto.randomUUID(),
          speaker: "follower",
          mode,
          originalText: txt,
          translatedText: data.turn?.translated_text || txt,
          time: formatearTimer(segundosTranscurridos),
          chips: data.turn?.ling_feedback?.chips,
          audioBase64: data.turn?.audio_base64,
        };

        setUltimoFollowerTraducido(data.turn?.translated_text || txt);

        if (data.turn?.ling_feedback?.chips && modo === "yo_hablo") {
          setChipsActivos(data.turn.ling_feedback.chips);
        }

        setTurnos((prev) => [...prev, nuevoTurno]);

        if (data.turn?.audio_base64) {
          reproducirAudioBase64(data.turn.audio_base64);
        }
      }
    } catch (err) {
      console.warn("Error enviando turno follower:", err);
    } finally {
      setProcesando(false);
      setIsTwinGenerating(false);
    }
  };

  const handleEnviarTurnoGuest = async (texto: string) => {
    if (!texto.trim() || procesando) return;
    const txt = texto.trim();
    setInputGuestSimulado("");
    setProcesando(true);

    try {
      const res = await fetch("/api/mindtwin/terceros/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          speaker: "guest",
          text: txt,
          lang_follower: langFollower,
          lang_guest: langGuest,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const nuevoTurno: Turno = {
          id: data.turn?.id || crypto.randomUUID(),
          speaker: "guest",
          originalText: txt,
          translatedText: data.turn?.translated_text || txt,
          time: formatearTimer(segundosTranscurridos),
        };

        setUltimoGuestDice(txt);
        setTurnos((prev) => [...prev, nuevoTurno]);
      }
    } catch (err) {
      console.warn("Error enviando turno guest:", err);
    } finally {
      setProcesando(false);
    }
  };

  const reproducirAudioBase64 = (b64: string) => {
    try {
      const snd = new Audio("data:audio/mp3;base64," + b64);
      snd.play().catch(() => {});
    } catch (e) {
      console.warn("Error reproducción audio:", e);
    }
  };

  const handleColgar = () => {
    onColgar({
      duracionSegundos: segundosTranscurridos,
      turnos,
    });
  };

  return (
    <div className="flex min-h-full flex-col bg-[#0d0d10] text-[#f0f0f0]">
      {/* Header con Timer en Vivo y Pill EN LLAMADA */}
      <MyliliLogoHeader enLlamada timer={formatearTimer(segundosTranscurridos)} />

      {/* Franja de Estado */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="font-semibold text-white/90">
            Interlocutor conectado · {langGuest.toUpperCase()} ↔ {langFollower.toUpperCase()}
          </span>
        </div>
        <span className="text-white/40 font-mono text-[10px]">
          Sala ID: {roomId.slice(0, 8)}
        </span>
      </div>

      {/* Contenedor Principal */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-between p-4 md:p-6 space-y-4">
        {/* Paneles de Subtítulos y Traducción en Tiempo Real */}
        <div className="space-y-3">
          {/* Panel Gris: "Interlocutor dice (ES)" */}
          <div className="rounded-2xl border border-white/10 bg-[#16171d] p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              <span>👤 Interlocutor dice ({langGuest.toUpperCase()})</span>
              <span className="text-[#22c55e]">● En directo</span>
            </div>
            <p className="text-sm font-medium text-white leading-relaxed">
              "{ultimoGuestDice}"
            </p>
          </div>

          {/* Panel Teal: "Traducido al [idioma] · IA" */}
          <div className="rounded-2xl border border-[#00bfa5]/30 bg-[#00bfa5]/[0.08] p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#00bfa5] mb-1.5">
              <span>⚡ Traducido al {langFollower === "zh" ? "chino" : langFollower.toUpperCase()} · IA</span>
              <span className="text-[10px] font-mono text-[#00bfa5]/70">Azure + ElevenLabs</span>
            </div>
            <p className="text-sm font-semibold text-[#f0f0f0] leading-relaxed">
              {ultimoFollowerTraducido}
            </p>
          </div>
        </div>

        {/* Toggle de Modo: "Yo hablo" vs "Mi Twin habla" */}
        <div className="rounded-2xl border border-white/10 bg-black/60 p-1.5 shadow-inner">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setModo("yo_hablo")}
              className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-3 transition-all cursor-pointer ${
                modo === "yo_hablo"
                  ? "bg-[#00bfa5] text-[#0d0d10] font-extrabold shadow-md shadow-[#00bfa5]/30"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-xs">🗣️ Yo hablo</span>
              <span className="text-[10px] opacity-80">
                (en {langFollower === "zh" ? "chino" : langFollower.toUpperCase()})
              </span>
            </button>

            <button
              onClick={() => setModo("twin_habla")}
              className={`flex flex-col items-center justify-center rounded-xl py-2.5 px-3 transition-all cursor-pointer ${
                modo === "twin_habla"
                  ? "bg-purple-600/30 text-[#a78bfa] border border-[#a78bfa]/50 font-extrabold shadow-md"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-xs">🤖 Mi Twin habla</span>
              <span className="text-[10px] opacity-80">(yo dicto en ES)</span>
            </button>
          </div>
        </div>

        {/* Área Interactiva según Modo */}
        <div className="flex-1 flex flex-col justify-center items-center py-4">
          {modo === "yo_hablo" ? (
            /* MODO YO HABLO: Botón Micrófono Teal 68px + Chips Feedback */
            <div className="flex flex-col items-center space-y-4 w-full text-center">
              {/* Botón Micrófono 68px con anillo pulsante */}
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <span className="absolute h-24 w-24 rounded-full bg-[#00bfa5]/30 animate-ping" />
                )}
                <button
                  onClick={toggleMic}
                  className={`relative flex h-[68px] w-[68px] items-center justify-center rounded-full text-2xl transition-all shadow-xl cursor-pointer ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-[#00bfa5] text-[#0d0d10] hover:scale-105 hover:bg-[#00d4b7] shadow-[#00bfa5]/40"
                  }`}
                  title="Pulsar para hablar en el idioma objetivo"
                >
                  {isRecording ? "⏹️" : "🎙️"}
                </button>
              </div>

              <p className="text-xs font-semibold text-white/80">
                {isRecording
                  ? `Escuchando tu pronunciación en ${langFollower === "zh" ? "chino" : langFollower}...`
                  : `Pulsa el micrófono y habla en ${langFollower === "zh" ? "chino" : langFollower}`}
              </p>

              {/* Chips de Feedback Lingüístico en Tiempo Real */}
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {chipsActivos.map((chip, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all shadow-sm ${
                      chip.status === "warn"
                        ? "border border-[#eab308]/40 bg-[#eab308]/15 text-[#eab308]"
                        : "border border-[#22c55e]/40 bg-[#22c55e]/15 text-[#22c55e]"
                    }`}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* MODO MI TWIN HABLA: Dictado en Español + Síntesis ElevenLabs */
            <div className="w-full space-y-3">
              <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#a78bfa]">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>✨</span> MindTwin Traductor Activo
                  </span>
                  {isTwinGenerating && (
                    <span className="flex items-center gap-1 text-[10px] text-purple-300 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                      Twin hablando con ElevenLabs...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputTextFollower}
                    onChange={(e) => setInputTextFollower(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEnviarTurnoFollower(inputTextFollower)}
                    placeholder="Escribe o dicta en español lo que quieres que tu Twin diga..."
                    className="flex-1 rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-[#a78bfa] focus:outline-none"
                  />
                  <button
                    onClick={toggleMic}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer ${
                      isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title="Dictar en español"
                  >
                    🎙️
                  </button>
                  <button
                    onClick={() => handleEnviarTurnoFollower(inputTextFollower)}
                    disabled={!inputTextFollower.trim() || procesando}
                    className="rounded-xl bg-[#a78bfa] px-4 py-2.5 text-xs font-bold text-black hover:bg-purple-300 transition-all disabled:opacity-30 cursor-pointer"
                  >
                    Enviar
                  </button>
                </div>

                <p className="text-[10px] text-white/40 italic">
                  ℹ️ Tu Twin traducirá tu dictado al {langFollower === "zh" ? "chino" : langFollower} y lo emitirá con tu voz clonada. No recibirás corrección fonética en este modo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Simulador auxiliar de interlocutor (útil para pruebas en vivo de 1 persona) */}
        <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
          <details className="group">
            <summary className="text-[10px] font-bold uppercase tracking-wider text-white/40 cursor-pointer hover:text-white/60">
              🛠️ Simular respuesta del Interlocutor (Pruebas en local)
            </summary>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={inputGuestSimulado}
                onChange={(e) => setInputGuestSimulado(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEnviarTurnoGuest(inputGuestSimulado)}
                placeholder="Escribe lo que responde el interlocutor en español..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none"
              />
              <button
                onClick={() => handleEnviarTurnoGuest(inputGuestSimulado)}
                disabled={!inputGuestSimulado.trim()}
                className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/25 transition-all disabled:opacity-30 cursor-pointer"
              >
                Simular
              </button>
            </div>
          </details>
        </div>

        {/* Footer de Sala: Privacidad y Botón Colgar */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>{privacy ? "Privada 🔒" : "Visible para tutor 👥"}</span>
            <span>·</span>
            <span className="text-[#00bfa5]">Ver informe al terminar →</span>
          </div>

          <button
            onClick={handleColgar}
            className="flex items-center gap-2 rounded-xl bg-[#ef4444] px-5 py-2.5 text-xs font-extrabold text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 cursor-pointer"
          >
            <span>📵</span>
            <span>Colgar</span>
          </button>
        </div>
      </div>

      <MyliliFooter />
    </div>
  );
}
