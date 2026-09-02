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
  langFollower = "en",
  langGuest = "es",
  privacy = true,
  agoraChannel = "",
  agoraTokenFollower = "",
  appId = "a3ff88591ae541f8994a8c59ef302fcd",
  onColgar,
}: TercerosFollowerRoomProps) {
  const [modo, setModo] = useState<"yo_hablo" | "twin_habla">("yo_hablo");
  const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTwinGenerating, setIsTwinGenerating] = useState(false);
  const [inputTextFollower, setInputTextFollower] = useState("");
  const [procesando, setProcesando] = useState(false);

  // WebRTC Agora status
  const [isWebRtcConnected, setIsWebRtcConnected] = useState(false);
  const [isRemoteGuestAudioActive, setIsRemoteGuestAudioActive] = useState(false);

  // Paneles de visualización en directo
  const [ultimoGuestDice, setUltimoGuestDice] = useState<string>(
    "Esperando que el interlocutor hable o escriba en español..."
  );
  const [ultimoGuestTraducido, setUltimoGuestTraducido] = useState<string>(
    "Waiting for interlocutor to speak..."
  );

  const [ultimoFollowerDice, setUltimoFollowerDice] = useState<string>("");
  const [ultimoFollowerTraducido, setUltimoFollowerTraducido] = useState<string>("");

  const [chipsActivos, setChipsActivos] = useState<Array<{ tipo: string; status: string; label: string }>>([
    { tipo: "tone", status: "ok", label: "✓ Tono natural" },
    { tipo: "tone_warn", status: "warn", label: langFollower === "zh" ? "⚠ 声调 3→4" : "⚠ Entonación natural" },
    { tipo: "grammar", status: "ok", label: "ℹ Gramática correcta" },
  ]);

  const [turnos, setTurnos] = useState<Turno[]>([]);

  const recognitionRef = useRef<any>(null);
  const agoraClientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);

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

  // 2. Inicializar Agora RTC WebRTC para audio en tiempo real bidireccional
  useEffect(() => {
    let mounted = true;

    async function initAgora() {
      if (!agoraChannel || !appId) return;
      try {
        const AgoraRTCModule = await import("agora-rtc-sdk-ng");
        const AgoraRTC = AgoraRTCModule.default || AgoraRTCModule;
        AgoraRTC.setLogLevel(3);

        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        agoraClientRef.current = client;

        client.on("user-published", async (user: any, mediaType: string) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.play();
            setIsRemoteGuestAudioActive(true);
          }
        });

        client.on("user-unpublished", (user: any, mediaType: string) => {
          if (mediaType === "audio") {
            setIsRemoteGuestAudioActive(false);
          }
        });

        const uid = 1; // Alumno Follower
        await client.join(appId, agoraChannel, agoraTokenFollower || null, uid);
        setIsWebRtcConnected(true);

        try {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          localAudioTrackRef.current = audioTrack;
          await client.publish([audioTrack]);
        } catch (micErr) {
          console.warn("[Agora RTC Mic] Permiso de micro no concedido o en espera:", micErr);
        }
      } catch (err) {
        console.warn("[Agora RTC] Inicialización:", err);
      }
    }

    initAgora();

    return () => {
      mounted = false;
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
      }
      if (agoraClientRef.current) {
        agoraClientRef.current.leave().catch(() => {});
      }
    };
  }, [agoraChannel, agoraTokenFollower, appId]);

  // 3. Polling en tiempo real para sincronizar mensajes de Supabase
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

          // Actualizar último mensaje que dijo el invitado en español
          const ultimosGuest = remoteTurns.filter((t) => t.speaker === "guest");
          if (ultimosGuest.length > 0) {
            const last = ultimosGuest[ultimosGuest.length - 1];
            setUltimoGuestDice(last.originalText);
            setUltimoGuestTraducido(last.translatedText);
          }

          // Actualizar último mensaje que dijo el alumno
          const ultimosFollower = remoteTurns.filter((t) => t.speaker === "follower");
          if (ultimosFollower.length > 0) {
            const lastF = ultimosFollower[ultimosFollower.length - 1];
            setUltimoFollowerDice(lastF.originalText);
            setUltimoFollowerTraducido(lastF.translatedText);
            if (lastF.chips && lastF.chips.length > 0) {
              setChipsActivos(lastF.chips);
            }
          }
        }
      } catch (e) {
        // Fallback silencioso
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [roomId]);

  // 4. Reconocimiento de voz nativo en navegador
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
      const promptDemo =
        modo === "yo_hablo"
          ? (langFollower === "zh" ? "你好，很高兴与你通话。" : "Hello, very glad to speak with you today.")
          : "Quiero explicarte el plan de trabajo del proyecto formativo.";
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

        setUltimoFollowerDice(txt);
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

  const reproducirAudioBase64 = (b64: string) => {
    try {
      const snd = new Audio("data:audio/mp3;base64," + b64);
      snd.play().catch(() => {});
    } catch (e) {
      console.warn("Error reproducción audio:", e);
    }
  };

  const handleColgar = () => {
    if (localAudioTrackRef.current) localAudioTrackRef.current.close();
    if (agoraClientRef.current) agoraClientRef.current.leave().catch(() => {});
    onColgar({
      duracionSegundos: segundosTranscurridos,
      turnos,
    });
  };

  return (
    <div className="flex min-h-full flex-col bg-[#0d0d10] text-[#f0f0f0]">
      <MyliliLogoHeader enLlamada timer={formatearTimer(segundosTranscurridos)} />

      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isRemoteGuestAudioActive || isWebRtcConnected ? "bg-[#22c55e] animate-pulse" : "bg-amber-400"}`} />
          <span className="font-semibold text-white/90">
            Interlocutor conectado · {langGuest.toUpperCase()} ↔ {langFollower.toUpperCase()}
          </span>
          {isWebRtcConnected && (
            <span className="rounded bg-[#22c55e]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#22c55e]">
              WebRTC Audio Conectado
            </span>
          )}
        </div>
        <span className="text-white/40 font-mono text-[10px]">
          Sala ID: {roomId.slice(0, 8)}
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-between p-4 md:p-6 space-y-4">
        {/* 1. Paneles de lo que dice el interlocutor traducido para el alumno */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-[#16171d] p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              <span>👤 Interlocutor dice ({langGuest.toUpperCase()})</span>
              <span className="text-[#22c55e]">● En directo</span>
            </div>
            <p className="text-sm font-medium text-white leading-relaxed">
              "{ultimoGuestDice}"
            </p>
          </div>

          <div className="rounded-2xl border border-[#00bfa5]/30 bg-[#00bfa5]/[0.08] p-4 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#00bfa5] mb-1.5">
              <span>⚡ Traducido al {langFollower === "zh" ? "chino" : langFollower.toUpperCase()} · IA</span>
              <span className="text-[10px] font-mono text-[#00bfa5]/70">Azure Translator</span>
            </div>
            <p className="text-sm font-semibold text-[#f0f0f0] leading-relaxed">
              {ultimoGuestTraducido}
            </p>
          </div>
        </div>

        {/* 2. Selector de Modo: "Yo hablo" vs "Mi Twin habla" */}
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

        {/* 3. Área de entrada de voz y texto del Alumno */}
        <div className="flex-1 flex flex-col justify-center items-center py-3 space-y-4">
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
                  title={`Pulsar para hablar en ${langFollower.toUpperCase()}`}
                >
                  {isRecording ? "⏹️" : "🎙️"}
                </button>
              </div>

              <p className="text-xs font-semibold text-white/80">
                {isRecording
                  ? `Escuchando tu pronunciación en ${langFollower.toUpperCase()}...`
                  : `Pulsa el micrófono o escribe abajo en ${langFollower.toUpperCase()}`}
              </p>

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

              {/* Campo de texto para escribir en idioma objetivo si no usa micro */}
              <div className="w-full max-w-md pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputTextFollower}
                    onChange={(e) => setInputTextFollower(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEnviarTurnoFollower(inputTextFollower)}
                    placeholder={`Escribe aquí lo que dices en ${langFollower.toUpperCase()}...`}
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
                  ℹ️ Tu Twin traducirá tu dictado al {langFollower.toUpperCase()} y lo emitirá con tu voz clonada.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. Barra de acciones y botón Colgar */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>{privacy ? "Privada 🔒" : "Visible para tutor 👥"}</span>
            <span>·</span>
            <span className="text-[#00bfa5]">{turnos.length} turnos</span>
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
