"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ANT_PHOTO_URL } from "@/components/app/terceros/MyliliLogoHeader";
import MyliliFooter from "@/components/app/terceros/MyliliFooter";

interface RoomData {
  room_id: string;
  agora_channel: string;
  agora_token_guest?: string;
  app_id?: string;
  lang_follower: string;
  lang_guest: string;
  follower_display_name: string;
  status: string;
}

export default function GuestRoomPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [cargando, setCargando] = useState(true);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomData | null>(null);

  // WebRTC Agora
  const [isWebRtcConnected, setIsWebRtcConnected] = useState(false);
  const [isFollowerAudioActive, setIsFollowerAudioActive] = useState(false);

  // Timer de llamada
  const [segundos, setSegundos] = useState(0);
  const [llamadaFinalizada, setLlamadaFinalizada] = useState(false);

  // Estados de voz y transcripción del invitado
  const [isRecording, setIsRecording] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [inputTextGuest, setInputTextGuest] = useState("");

  // Mensajes mostrados en vivo
  const [ultimoFollowerDice, setUltimoFollowerDice] = useState<string>(
    "Esperando que tu contacto hable..."
  );
  const [ultimoTraducidoEspañol, setUltimoTraducidoEspañol] = useState<string>(
    "Aquí aparecerá la traducción simultánea en español en tiempo real."
  );

  const recognitionRef = useRef<any>(null);
  const agoraClientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);

  // 1. Cargar metadatos de la sala
  useEffect(() => {
    async function cargarSala() {
      if (!slug) return;
      setCargando(true);
      try {
        const res = await fetch(`/api/guest-room/${slug}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorEstado(data.message || "Este enlace no es válido o ha expirado.");
        } else {
          setRoom(data);
        }
      } catch (err) {
        console.warn("Error cargando sala guest:", err);
        setRoom({
          room_id: "demo-room-123",
          agora_channel: "demo-channel",
          lang_follower: "en",
          lang_guest: "es",
          follower_display_name: "Ana",
          status: "active",
        });
      } finally {
        setCargando(false);
      }
    }

    cargarSala();
  }, [slug]);

  // 2. Inicializar Agora RTC WebRTC para audio bidireccional en el invitado
  useEffect(() => {
    let mounted = true;

    async function initAgoraGuest() {
      if (!room?.agora_channel || !room?.app_id || llamadaFinalizada) return;
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
            setIsFollowerAudioActive(true);
          }
        });

        client.on("user-unpublished", (user: any, mediaType: string) => {
          if (mediaType === "audio") {
            setIsFollowerAudioActive(false);
          }
        });

        const uid = 2; // Interlocutor / Guest
        await client.join(
          room.app_id,
          room.agora_channel,
          room.agora_token_guest || null,
          uid
        );
        setIsWebRtcConnected(true);

        try {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          localAudioTrackRef.current = audioTrack;
          await client.publish([audioTrack]);
        } catch (micErr) {
          console.warn("[Agora RTC Guest] Permiso de micro:", micErr);
        }
      } catch (err) {
        console.warn("[Agora RTC Guest] Error inicialización:", err);
      }
    }

    if (room && !llamadaFinalizada) {
      initAgoraGuest();
    }

    return () => {
      mounted = false;
      if (localAudioTrackRef.current) localAudioTrackRef.current.close();
      if (agoraClientRef.current) agoraClientRef.current.leave().catch(() => {});
    };
  }, [room?.agora_channel, room?.agora_token_guest, room?.app_id, llamadaFinalizada]);

  // 3. Timer en vivo
  useEffect(() => {
    if (llamadaFinalizada || errorEstado) return;
    const interval = setInterval(() => {
      setSegundos((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [llamadaFinalizada, errorEstado]);

  // 4. Polling en tiempo real para sincronizar lo que dice el alumno (Follower)
  useEffect(() => {
    if (!room?.room_id || llamadaFinalizada || errorEstado) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mindtwin/terceros/sync/${room.room_id}`);
        if (!res.ok) return;
        const data = await res.json();

        // Si el alumno cuelga la llamada, reflejar el fin de la sesión
        if (data.room?.status === "ended") {
          setLlamadaFinalizada(true);
          return;
        }

        if (data.turns && data.turns.length > 0) {
          const followerTurns = data.turns.filter((t: any) => t.speaker === "follower");
          if (followerTurns.length > 0) {
            const last = followerTurns[followerTurns.length - 1];
            setUltimoFollowerDice(last.original_text || last.originalText);
            setUltimoTraducidoEspañol(last.translated_text || last.translatedText);

            if (last.audio_base64) {
              reproducirAudioBase64(last.audio_base64);
            }
          }
        }
      } catch (e) {
        // Fallback silencioso
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [room?.room_id, llamadaFinalizada, errorEstado]);

  const reproducirAudioBase64 = (b64: string) => {
    try {
      const snd = new Audio("data:audio/mp3;base64," + b64);
      snd.play().catch(() => {});
    } catch (e) {
      console.warn("Error audio:", e);
    }
  };

  const formatearTimer = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, "0");
    const seg = (s % 60).toString().padStart(2, "0");
    return `${min}:${seg}`;
  };

  // 5. Reconocimiento de voz para el invitado (en español nativo)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "es-ES";

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleHablarEnEspañol(transcript);
          }
          setIsRecording(false);
        };

        rec.onerror = () => setIsRecording(false);
        rec.onend = () => setIsRecording(false);
        recognitionRef.current = rec;
      }
    }
  }, [room]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      const demo = "¡Hola! Te escucho perfectamente y me parece fantástico.";
      handleHablarEnEspañol(demo);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = "es-ES";
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleHablarEnEspañol = async (texto: string) => {
    if (!texto.trim() || procesando) return;
    const txt = texto.trim();
    setInputTextGuest("");
    setProcesando(true);

    try {
      const res = await fetch("/api/mindtwin/terceros/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: room?.room_id || "demo-room-123",
          speaker: "guest",
          text: txt,
          lang_follower: room?.lang_follower || "en",
          lang_guest: "es",
        }),
      });

      if (res.ok) {
        // Turno guardado exitosamente
      }
    } catch (err) {
      console.warn("Error enviando voz guest:", err);
    } finally {
      setProcesando(false);
    }
  };

  const handleColgar = () => {
    if (localAudioTrackRef.current) localAudioTrackRef.current.close();
    if (agoraClientRef.current) agoraClientRef.current.leave().catch(() => {});
    setLlamadaFinalizada(true);
  };

  const followerName = room?.follower_display_name || "Ana";
  const langName = room?.lang_follower === "zh" ? "chino" : "inglés";

  if (cargando) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d10] text-white">
        <div className="h-8 w-8 rounded-full border-2 border-[#00bfa5] border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-white/60">Conectando a la sala de Lili Speak...</p>
      </div>
    );
  }

  if (errorEstado) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0d0d10] text-[#f0f0f0]">
        <header className="border-b border-white/10 bg-[#0d0d10] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ANT_PHOTO_URL} alt="Mylili" className="h-full w-full object-contain" />
            </div>
            <span className="font-serif text-[17px] font-normal text-white">Lili Speak</span>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6 text-center">
          <span className="text-4xl mb-3">⏳</span>
          <h1 className="font-serif text-2xl font-normal text-white">Este enlace no está disponible</h1>
          <p className="mt-2 text-xs text-white/60 leading-relaxed">
            {errorEstado}
          </p>
          <p className="mt-4 text-[11px] text-[#00bfa5]">
            Pídele a tu contacto que te comparta un nuevo enlace desde su app Lili Speak.
          </p>
        </div>

        <MyliliFooter />
      </div>
    );
  }

  if (llamadaFinalizada) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0d0d10] text-[#f0f0f0]">
        <header className="border-b border-white/10 bg-[#0d0d10] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ANT_PHOTO_URL} alt="Mylili" className="h-full w-full object-contain" />
            </div>
            <span className="font-serif text-[17px] font-normal text-white">Lili Speak</span>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center text-xl mb-3">
            ✓
          </div>
          <h1 className="font-serif text-2xl font-normal text-white">Esta llamada ha finalizado</h1>
          <p className="mt-2 text-xs text-white/60 leading-relaxed">
            Gracias por participar en la sesión de conversación con {followerName}.
          </p>
          <p className="mt-4 text-[10px] text-white/40">
            Puedes cerrar esta pestaña en tu navegador con total seguridad.
          </p>
        </div>

        <MyliliFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d10] text-[#f0f0f0]">
      {/* 1. Header con Logo de Hormiga Mylili + Lili Speak + Pill EN LLAMADA */}
      <header className="flex items-center justify-between border-b border-white/10 bg-[#0d0d10] px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ANT_PHOTO_URL} alt="Mylili" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[17px] font-normal tracking-tight text-[#f0f0f0]">
              Lili Speak
            </span>
            <span className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-[#f0f0f0]/50">
              by Mylili
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
          <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-ping" />
          <span>EN LLAMADA</span>
        </div>
      </header>

      {/* 2. Banner de Contexto */}
      <div className="border-b border-white/10 bg-white/[0.02] px-4 py-3 text-center">
        <p className="text-xs font-semibold text-white/90">
          Conversación con <span className="text-[#00bfa5] font-bold">{followerName}</span> · Lili Speak traduce en tiempo real.
        </p>
        <p className="mt-0.5 text-[11px] text-white/50">
          Tu interlocutor está aprendiendo {langName}.
        </p>
      </div>

      {/* 3. Status Bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-2 text-[11px] text-white/60">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isFollowerAudioActive || isWebRtcConnected ? "bg-[#22c55e]" : "bg-amber-400"}`} />
          <span>{followerName} conectada · {room?.lang_follower?.toUpperCase() || "EN"} ↔ ES</span>
          {isWebRtcConnected && (
            <span className="rounded bg-[#22c55e]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#22c55e]">
              Audio WebRTC Activo
            </span>
          )}
        </div>
        <div className="font-mono text-white/80">
          ⏱️ {formatearTimer(segundos)}
        </div>
      </div>

      {/* 4. Contenido Principal / Paneles de Subtítulos */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-between p-4 md:p-6 space-y-4">
        <div className="space-y-3">
          {/* Panel: "[Nombre] dice ([idioma])" */}
          <div className="rounded-2xl border border-white/10 bg-[#16171d] p-4 shadow-lg">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
              <span>🗣️ {followerName} dice ({room?.lang_follower?.toUpperCase() || "EN"})</span>
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-1 bg-[#00bfa5] rounded-full animate-[pulse_1s_ease-in-out_infinite] h-2" />
                <span className="w-1 bg-[#00bfa5] rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-3.5" />
                <span className="w-1 bg-[#00bfa5] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2" />
                <span className="w-1 bg-[#00bfa5] rounded-full animate-[pulse_1.1s_ease-in-out_infinite] h-4" />
                <span className="w-1 bg-[#00bfa5] rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-2.5" />
              </div>
            </div>
            <p className="text-base font-semibold text-white leading-relaxed">
              "{ultimoFollowerDice}"
            </p>
          </div>

          {/* Panel: "Traducido al español · IA" */}
          <div className="rounded-2xl border border-[#00bfa5]/30 bg-[#00bfa5]/[0.08] p-4 shadow-lg">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#00bfa5] mb-1.5">
              <span>⚡ Traducido al español · IA</span>
              <span className="text-[10px] font-mono text-[#00bfa5]/70">Subtítulo en directo</span>
            </div>
            <p className="text-sm font-semibold text-[#f0f0f0] leading-relaxed">
              {ultimoTraducidoEspañol}
            </p>
          </div>
        </div>

        {/* 5. Sección Micrófono y Texto para el Interlocutor */}
        <div className="flex flex-col items-center justify-center py-3 space-y-3 text-center">
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
              title="Pulsar para hablar en español"
            >
              {isRecording ? "⏹️" : "🎙️"}
            </button>
          </div>

          <div>
            <p className="text-xs font-bold text-white">
              {isRecording ? "Escuchando... Habla con normalidad en español" : "Habla en español o escribe abajo — se traduce automáticamente"}
            </p>
            <p className="text-[11px] text-white/50 mt-0.5">
              {followerName} lo escuchará y leerá en su idioma en tiempo real.
            </p>
          </div>

          {/* Input de texto alternativo para escribir si no usa micrófono */}
          <div className="w-full pt-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputTextGuest}
                onChange={(e) => setInputTextGuest(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleHablarEnEspañol(inputTextGuest)}
                placeholder="Escribe aquí tu mensaje en español..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-[#00bfa5] focus:outline-none"
              />
              <button
                onClick={() => handleHablarEnEspañol(inputTextGuest)}
                disabled={!inputTextGuest.trim() || procesando}
                className="rounded-xl bg-[#00bfa5] px-4 py-2 text-xs font-extrabold text-[#0d0d10] hover:bg-[#00d4b7] transition-all disabled:opacity-30 cursor-pointer"
              >
                Enviar
              </button>
            </div>
          </div>

          {/* Botón Colgar */}
          <div className="pt-2 w-full">
            <button
              onClick={handleColgar}
              className="w-full rounded-xl bg-red-600/90 py-3 text-xs font-extrabold text-white hover:bg-red-600 transition-all cursor-pointer shadow-md"
            >
              Colgar llamada
            </button>
          </div>
        </div>

        {/* 6. AVISO LEGAL OBLIGATORIO — EU AI Act Art. 50 */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-center">
          <p className="text-[11px] font-semibold text-amber-300">
            🇪🇺 Esta sesión usa IA para traducción simultánea en tiempo real (EU AI Act, Art. 50). No se graba audio sin consentimiento.
          </p>
        </div>
      </main>

      {/* 7. Footer Corporativo MYLILI */}
      <MyliliFooter />
    </div>
  );
}
