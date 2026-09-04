"use client";

import React, { useState, useEffect, useRef } from "react";
import MyliliLogoHeader from "./MyliliLogoHeader";
import MyliliFooter from "./MyliliFooter";
import { getLanguageName, getSpeechLangCode } from "./TercerosInit";

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
  langFollower?: string;
  langGuest?: string;
  privacy?: boolean;
  agoraChannel?: string;
  agoraTokenFollower?: string;
  appId?: string;
  onColgar: (stats: { duracionSegundos: number; turnos: Turno[] }) => void;
}

export default function TercerosFollowerRoom({
  roomId,
  langFollower = "es",
  langGuest = "en",
  privacy = true,
  onColgar,
}: TercerosFollowerRoomProps) {
  const [modo, setModo] = useState<"yo_hablo" | "twin_habla">("yo_hablo");
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTwinGenerating, setIsTwinGenerating] = useState(false);
  const [inputTextFollower, setInputTextFollower] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Paneles de visualización en directo de la Sala del Alumno
  const [ultimoGuestTraducido, setUltimoGuestTraducido] = useState<string>(
    "Esperando intervención de tu interlocutor..."
  );
  const [ultimoGuestOriginal, setUltimoGuestOriginal] = useState<string>(
    "El audio traducido se reproducirá en tu idioma."
  );

  const [ultimoFollowerOriginal, setUltimoFollowerOriginal] = useState<string>("");
  const [ultimoFollowerTraducido, setUltimoFollowerTraducido] = useState<string>("");

  const [chipsActivos, setChipsActivos] = useState<Array<{ tipo: string; status: string; label: string }>>([
    { tipo: "tone", status: "ok", label: "✓ Pronunciación clara" },
    { tipo: "grammar", status: "ok", label: "ℹ Gramática correcta" },
    { tipo: "fluency", status: "ok", label: "⚡ Fluidez 95%" },
  ]);

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const lastProcessedTurnIdRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const followerLangName = getLanguageName(langFollower);
  const guestLangName = getLanguageName(langGuest);

  // 1. Timer de llamada
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

  // 2. Función para desbloquear y reproducir por síntesis de voz la traducción
  const unlockAudio = () => {
    setAudioUnlocked(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const u = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }
  };

  const reproducirTextoTTS = (texto: string, idiomaCode: string) => {
    if (!autoPlayAudio || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      setAudioUnlocked(true);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = getSpeechLangCode(idiomaCode);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Error en TTS:", e);
    }
  };

  // 3. Polling en tiempo real para sincronizar mensajes de la Doble Sala
  useEffect(() => {
    if (!roomId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mindtwin/terceros/sync/${roomId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.turns && data.turns.length > 0) {
          const remoteTurns: Turno[] = data.turns.map((t: any) => ({
            id: t.id,
            speaker: t.speaker,
            mode: t.mode,
            originalText: t.original_text || t.originalText,
            translatedText: t.translated_text || t.translatedText,
            time: t.created_at
              ? new Date(t.created_at).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })
              : "00:00",
            chips: t.ling_feedback?.chips,
            audioBase64: t.audio_base64,
          }));

          setTurnos(remoteTurns);

          // Si el último turno es del interlocutor (guest) y es nuevo, actualizar y reproducir
          const ultimosGuest = remoteTurns.filter((t) => t.speaker === "guest");
          if (ultimosGuest.length > 0) {
            const lastG = ultimosGuest[ultimosGuest.length - 1];
            setUltimoGuestOriginal(lastG.originalText);
            setUltimoGuestTraducido(lastG.translatedText);

            if (lastG.id !== lastProcessedTurnIdRef.current) {
              lastProcessedTurnIdRef.current = lastG.id;
              // Reproducir la traducción en el idioma del alumno (langFollower)
              reproducirTextoTTS(lastG.translatedText, langFollower);
            }
          }

          // Si el último turno es del alumno (follower)
          const ultimosFollower = remoteTurns.filter((t) => t.speaker === "follower");
          if (ultimosFollower.length > 0) {
            const lastF = ultimosFollower[ultimosFollower.length - 1];
            setUltimoFollowerOriginal(lastF.originalText);
            setUltimoFollowerTraducido(lastF.translatedText);
            if (lastF.chips && lastF.chips.length > 0) {
              setChipsActivos(lastF.chips);
            }
          }
        }
      } catch (e) {
        // Fallback silencioso
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [roomId, langFollower, autoPlayAudio]);

  // 4. Reconocimiento de voz nativo en navegador configurado para el idioma de la sala
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = getSpeechLangCode(langFollower);

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
    unlockAudio();
    if (!recognitionRef.current) {
      const demoPrompt =
        langFollower === "es"
          ? "Hola, muy contento de poder hablar contigo hoy."
          : langFollower === "fr"
          ? "Bonjour, je suis très ravi de parler avec vous aujourd'hui."
          : langFollower === "de"
          ? "Guten Tag, ich freue mich sehr auf unser Gespräch heute."
          : "Hello, very glad to speak with you today.";
      handleEnviarTurnoFollower(demoPrompt);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = getSpeechLangCode(langFollower);
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
    unlockAudio();
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

        setUltimoFollowerOriginal(txt);
        setUltimoFollowerTraducido(data.turn?.translated_text || txt);

        if (data.turn?.ling_feedback?.chips && modo === "yo_hablo") {
          setChipsActivos(data.turn.ling_feedback.chips);
        }

        setTurnos((prev) => [...prev, nuevoTurno]);

        if (data.turn?.audio_base64 && modo === "twin_habla") {
          try {
            const snd = new Audio("data:audio/mp3;base64," + data.turn.audio_base64);
            snd.play().catch(() => {});
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Error enviando turno follower:", err);
    } finally {
      setProcesando(false);
      setIsTwinGenerating(false);
    }
  };

  const handleColgar = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onColgar({
      duracionSegundos: segundosTranscurridos,
      turnos,
    });
  };

  return (
    <div className="flex min-h-full flex-col bg-transparent text-[#f0f0f0]">
      {/* 1. Header Oficial Lili Speak */}
      <MyliliLogoHeader enLlamada timer={formatearTimer(segundosTranscurridos)} />

      {/* 2. Barra de Doble Sala */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/50 px-4 py-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#00bfa5] animate-pulse" />
          <span className="font-bold text-[#00bfa5] uppercase tracking-wider">
            SALA ALUMNO
          </span>
          <span className="text-white/40">·</span>
          <span className="text-white/80">
            Tú ({langFollower.toUpperCase()}) ↔ Interlocutor ({langGuest.toUpperCase()})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              unlockAudio();
              setAutoPlayAudio(!autoPlayAudio);
            }}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
              autoPlayAudio ? "bg-[#00bfa5]/20 text-[#00bfa5]" : "bg-white/10 text-white/40"
            }`}
            title="Auto-reproducir voz de traducción"
          >
            <span>{autoPlayAudio ? "🔊 Voz IA Activada" : "🔇 Voz IA Silenciada"}</span>
          </button>
          <span className="text-white/40 font-mono text-[10px]">
            Sala ID: {roomId ? roomId.slice(0, 8) : "demo"}
          </span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-between p-4 md:p-6 space-y-4">
        {/* 3. Panel de Recepción: Lo que dice tu interlocutor traducido a tu idioma */}
        <div className="space-y-3">
          {/* Panel Principal: Traducción al idioma del alumno */}
          <div className="rounded-2xl border border-[#00bfa5]/40 bg-[#00bfa5]/[0.08] p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#00bfa5] mb-2">
              <span className="flex items-center gap-1.5">
                <span>⚡</span> Interlocutor dice (traducido al {followerLangName}) · IA
              </span>
              <button
                onClick={() => {
                  unlockAudio();
                  reproducirTextoTTS(ultimoGuestTraducido, langFollower);
                }}
                className="flex items-center gap-1 rounded bg-[#00bfa5]/20 px-2 py-0.5 text-[10px] font-bold text-[#00bfa5] hover:bg-[#00bfa5]/30 cursor-pointer"
              >
                <span>🔊</span> Escuchar
              </button>
            </div>
            <p className="text-base font-semibold text-[#f0f0f0] leading-relaxed">
              "{ultimoGuestTraducido}"
            </p>
          </div>

          {/* Panel Secundario: Transcripción original en idioma del interlocutor */}
          <div className="rounded-xl border border-white/10 bg-[#16171d]/80 p-3 shadow backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
              <span>👤 Original del interlocutor (en {guestLangName})</span>
              <span className="text-[10px] text-white/30">Sala Interlocutor</span>
            </div>
            <p className="text-xs font-normal text-white/70 italic leading-relaxed">
              "{ultimoGuestOriginal}"
            </p>
          </div>
        </div>

        {/* 4. Selector de Modo de Habla */}
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
                (en {followerLangName})
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
              <span className="text-[10px] opacity-80">(Voz IA clonada)</span>
            </button>
          </div>
        </div>

        {/* 5. Área de Habla del Alumno */}
        <div className="flex-1 flex flex-col justify-center items-center py-2 space-y-3">
          {modo === "yo_hablo" ? (
            <div className="flex flex-col items-center space-y-3 w-full text-center">
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
                  title={`Pulsar para hablar en ${followerLangName}`}
                >
                  {isRecording ? "⏹️" : "🎙️"}
                </button>
              </div>

              <p className="text-xs font-semibold text-white/80">
                {isRecording
                  ? `Escuchando tu voz en ${followerLangName}...`
                  : `Pulsa el micro o escribe abajo en ${followerLangName}`}
              </p>

              {/* Chips de Feedback Lingüístico en vivo */}
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

              {/* Input para escribir directamente */}
              <div className="w-full max-w-md pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputTextFollower}
                    onChange={(e) => setInputTextFollower(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEnviarTurnoFollower(inputTextFollower)}
                    placeholder={`Escribe lo que dices en ${followerLangName}...`}
                    className="flex-1 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-[#00bfa5] focus:outline-none"
                  />
                  <button
                    onClick={() => handleEnviarTurnoFollower(inputTextFollower)}
                    disabled={!inputTextFollower.trim() || procesando}
                    className="rounded-xl bg-[#00bfa5] px-4 py-2 text-xs font-extrabold text-[#0d0d10] hover:bg-[#00d4b7] transition-all disabled:opacity-30 cursor-pointer"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#a78bfa]">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>✨</span> MindTwin Traductor Activo (Voz Clonada)
                  </span>
                  {isTwinGenerating && (
                    <span className="flex items-center gap-1 text-[10px] text-purple-300 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                      Twin traduciendo y sintetizando...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputTextFollower}
                    onChange={(e) => setInputTextFollower(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEnviarTurnoFollower(inputTextFollower)}
                    placeholder={`Escribe lo que quieres que tu Twin diga en ${guestLangName}...`}
                    className="flex-1 rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-[#a78bfa] focus:outline-none"
                  />
                  <button
                    onClick={toggleMic}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer ${
                      isRecording ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    title="Dictar"
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
                  ℹ️ Tu Twin traducirá tu mensaje al {guestLangName} y lo emitirá en la sala del invitado.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 6. Barra inferior y botón Colgar */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>{privacy ? "Privada 🔒" : "Visible para tutor 👥"}</span>
            <span>·</span>
            <span className="text-[#00bfa5]">{turnos.length} turnos registrados</span>
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
