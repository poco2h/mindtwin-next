"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ANT_PHOTO_URL } from "@/components/app/terceros/MyliliLogoHeader";
import MyliliFooter from "@/components/app/terceros/MyliliFooter";
import ParticleBackground from "@/components/app/LazyParticleBackground";
import { getLanguageName, getSpeechLangCode } from "@/components/app/terceros/TercerosInit";

interface RoomData {
  room_id: string;
  agora_channel: string;
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

  // Timer de llamada
  const [segundos, setSegundos] = useState(0);
  const [llamadaFinalizada, setLlamadaFinalizada] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Estados de voz y transcripción del invitado
  const [isRecording, setIsRecording] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [inputTextGuest, setInputTextGuest] = useState("");

  // Mensajes mostrados en vivo en la Sala del Interlocutor
  const [ultimoTraducidoGuest, setUltimoTraducidoGuest] = useState<string>(
    "Esperando que tu contacto hable..."
  );
  const [ultimoFollowerOriginal, setUltimoFollowerOriginal] = useState<string>(
    "La traducción en tiempo real aparecerá aquí."
  );

  const recognitionRef = useRef<any>(null);
  const lastProcessedTurnIdRef = useRef<string | null>(null);

  const followerName = room?.follower_display_name || "Tu contacto";
  const guestLang = room?.lang_guest || "en";
  const followerLang = room?.lang_follower || "es";
  const guestLangName = getLanguageName(guestLang);
  const followerLangName = getLanguageName(followerLang);

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
          // Set initial placeholder
          if (data.lang_guest === "en") {
            setUltimoTraducidoGuest("Waiting for your contact to speak...");
            setUltimoFollowerOriginal("Simultaneous translation will appear here in real time.");
          } else if (data.lang_guest === "fr") {
            setUltimoTraducidoGuest("En attente de votre contact...");
            setUltimoFollowerOriginal("La traduction simultanée apparaîtra ici en direct.");
          } else if (data.lang_guest === "de") {
            setUltimoTraducidoGuest("Warten auf Gesprächspartner...");
            setUltimoFollowerOriginal("Die Übersetzung wird hier in Echtzeit angezeigt.");
          } else {
            setUltimoTraducidoGuest("Esperando que tu contacto hable...");
            setUltimoFollowerOriginal("La traducción simultánea aparecerá aquí en tiempo real.");
          }
        }
      } catch (err) {
        console.warn("Error cargando sala guest:", err);
        setRoom({
          room_id: "demo-room-123",
          agora_channel: "demo-channel",
          lang_follower: "es",
          lang_guest: "en",
          follower_display_name: "Ana",
          status: "active",
        });
      } finally {
        setCargando(false);
      }
    }

    cargarSala();
  }, [slug]);

  // 2. Timer en vivo
  useEffect(() => {
    if (llamadaFinalizada || errorEstado) return;
    const interval = setInterval(() => {
      setSegundos((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [llamadaFinalizada, errorEstado]);

  const formatearTimer = (s: number) => {
    const min = Math.floor(s / 60).toString().padStart(2, "0");
    const seg = (s % 60).toString().padStart(2, "0");
    return `${min}:${seg}`;
  };

  // 3. Desbloquear y reproducir por síntesis de voz en el idioma del interlocutor (lang_guest)
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

  // 4. Polling en tiempo real para sincronizar lo que dice el alumno en la Doble Sala
  useEffect(() => {
    if (!room?.room_id || llamadaFinalizada || errorEstado) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/mindtwin/terceros/sync/${room.room_id}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.room?.status === "ended") {
          setLlamadaFinalizada(true);
          return;
        }

        if (data.turns && data.turns.length > 0) {
          const followerTurns = data.turns.filter((t: any) => t.speaker === "follower");
          if (followerTurns.length > 0) {
            const lastF = followerTurns[followerTurns.length - 1];
            setUltimoFollowerOriginal(lastF.original_text || lastF.originalText);
            setUltimoTraducidoGuest(lastF.translated_text || lastF.translatedText);

            if (lastF.id !== lastProcessedTurnIdRef.current) {
              lastProcessedTurnIdRef.current = lastF.id;

              // Si vino con audio clonado de ElevenLabs
              if (lastF.audio_base64) {
                try {
                  const snd = new Audio("data:audio/mp3;base64," + lastF.audio_base64);
                  snd.play().catch(() => {
                    reproducirTextoTTS(lastF.translated_text || lastF.translatedText, guestLang);
                  });
                } catch (e) {
                  reproducirTextoTTS(lastF.translated_text || lastF.translatedText, guestLang);
                }
              } else {
                // Modo estándar: reproducir la traducción en el idioma del interlocutor (guestLang)
                reproducirTextoTTS(lastF.translated_text || lastF.translatedText, guestLang);
              }
            }
          }
        }
      } catch (e) {
        // Fallback silencioso
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [room?.room_id, guestLang, llamadaFinalizada, errorEstado, autoPlayAudio]);

  // 5. Reconocimiento de voz para el invitado (en su idioma configurado: guestLang)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = getSpeechLangCode(guestLang);

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleHablarInterlocutor(transcript);
          }
          setIsRecording(false);
        };

        rec.onerror = () => setIsRecording(false);
        rec.onend = () => setIsRecording(false);
        recognitionRef.current = rec;
      }
    }
  }, [room, guestLang]);

  const toggleMic = () => {
    unlockAudio();
    if (!recognitionRef.current) {
      const demo =
        guestLang === "en"
          ? "Hello! I hear you very clearly, happy to connect."
          : guestLang === "fr"
          ? "Bonjour ! Je vous entends très bien, ravi d'échanger avec vous."
          : guestLang === "de"
          ? "Hallo! Ich höre Sie sehr gut, freut mich sehr."
          : "¡Hola! Te escucho perfectamente y me parece fantástico.";
      handleHablarInterlocutor(demo);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = getSpeechLangCode(guestLang);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleHablarInterlocutor = async (texto: string) => {
    if (!texto.trim() || procesando) return;
    unlockAudio();
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
          lang_follower: followerLang,
          lang_guest: guestLang,
        }),
      });

      if (res.ok) {
        // Turno guardado y traducido exitosamente
      }
    } catch (err) {
      console.warn("Error enviando voz guest:", err);
    } finally {
      setProcesando(false);
    }
  };

  const handleColgar = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setLlamadaFinalizada(true);
  };

  if (cargando) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-2 border-[#00bfa5] border-t-transparent animate-spin mb-3" />
          <p className="text-xs text-white/60">Conectando a la Sala de Interlocutor de Lili Speak...</p>
        </div>
      </div>
    );
  }

  if (errorEstado) {
    return (
      <div className="relative flex min-h-screen flex-col bg-black text-[#f0f0f0]">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-0.5 shadow-sm">
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
      </div>
    );
  }

  if (llamadaFinalizada) {
    return (
      <div className="relative flex min-h-screen flex-col bg-black text-[#f0f0f0]">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white p-0.5 shadow-sm">
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
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-[#f0f0f0]">
      <ParticleBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 1. Header con Logo de Hormiga Mylili + Lili Speak */}
        <header className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl">
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

          <div className="flex items-center gap-2">
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
              <span>{autoPlayAudio ? "🔊 Audio Activado" : "🔇 Audio Silenciado"}</span>
            </button>
            <div className="flex items-center gap-1.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-ping" />
              <span>EN LLAMADA</span>
            </div>
          </div>
        </header>

        {/* 2. Banner de Doble Sala */}
        <div className="border-b border-white/10 bg-black/50 px-4 py-2.5 text-center">
          <p className="text-xs font-bold text-white/90">
            🟢 <span className="text-[#00bfa5]">SALA INTERLOCUTOR</span> · Conversación con <span className="text-white font-bold">{followerName}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-white/50">
            Tú hablas y escuchas en <strong className="text-[#00bfa5]">{guestLangName.toUpperCase()}</strong>. {followerName} habla en {followerLangName.toUpperCase()}. La IA traduce en directo sin solapamientos.
          </p>
        </div>

        {/* Banner de desbloqueo de audio si no está desbloqueado */}
        {!audioUnlocked && (
          <div
            onClick={unlockAudio}
            className="cursor-pointer bg-[#00bfa5]/20 border-b border-[#00bfa5]/40 px-4 py-2 text-center text-xs font-bold text-[#00bfa5] hover:bg-[#00bfa5]/30 transition-all"
          >
            🔊 Toca aquí para activar el audio en directo en tu navegador
          </div>
        )}

        {/* 3. Status Bar */}
        <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-4 py-1.5 text-[11px] text-white/60">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <span>{followerName} conectada · {followerLang.toUpperCase()} ↔ {guestLang.toUpperCase()}</span>
          </div>
          <div className="font-mono text-white/80">
            ⏱️ {formatearTimer(segundos)}
          </div>
        </div>

        {/* 4. Contenido Principal / Paneles de Recepción */}
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-between p-4 md:p-6 space-y-4">
          <div className="space-y-3">
            {/* Panel Principal: Traducción al idioma del interlocutor (guestLang) */}
            <div className="rounded-2xl border border-[#00bfa5]/40 bg-[#00bfa5]/[0.08] p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#00bfa5] mb-2">
                <span className="flex items-center gap-1.5">
                  <span>⚡</span> {followerName} dice (traducido al {guestLangName}) · IA
                </span>
                <button
                  onClick={() => {
                    unlockAudio();
                    reproducirTextoTTS(ultimoTraducidoGuest, guestLang);
                  }}
                  className="flex items-center gap-1 rounded bg-[#00bfa5]/20 px-2 py-0.5 text-[10px] font-bold text-[#00bfa5] hover:bg-[#00bfa5]/30 cursor-pointer"
                >
                  <span>🔊</span> Escuchar
                </button>
              </div>
              <p className="text-base font-semibold text-[#f0f0f0] leading-relaxed">
                "{ultimoTraducidoGuest}"
              </p>
            </div>

            {/* Panel Secundario: Pronunciación original del alumno */}
            <div className="rounded-xl border border-white/10 bg-[#16171d]/80 p-3 shadow backdrop-blur-md">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                <span>🗣️ Pronunciación original de {followerName} (en {followerLangName})</span>
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-[#00bfa5] rounded-full animate-[pulse_1s_ease-in-out_infinite] h-2" />
                  <span className="w-1 bg-[#00bfa5] rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-3.5" />
                  <span className="w-1 bg-[#00bfa5] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2" />
                </div>
              </div>
              <p className="text-xs font-normal text-white/70 italic leading-relaxed">
                "{ultimoFollowerOriginal}"
              </p>
            </div>
          </div>

          {/* 5. Sección Micrófono y Texto para el Interlocutor */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3 text-center">
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
                title={`Pulsar para hablar en ${guestLangName}`}
              >
                {isRecording ? "⏹️" : "🎙️"}
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-white">
                {isRecording ? `Escuchando... Habla en ${guestLangName}` : `Habla o escribe abajo en ${guestLangName}`}
              </p>
              <p className="text-[11px] text-white/50 mt-0.5">
                La IA lo traducirá y reproducirá al instante en {followerLangName} en la sala de {followerName}.
              </p>
            </div>

            {/* Input de texto alternativo para escribir si no usa micrófono */}
            <div className="w-full pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputTextGuest}
                  onChange={(e) => setInputTextGuest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleHablarInterlocutor(inputTextGuest)}
                  placeholder={`Escribe aquí tu mensaje en ${guestLangName}...`}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-[#00bfa5] focus:outline-none"
                />
                <button
                  onClick={() => handleHablarInterlocutor(inputTextGuest)}
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
                className="w-full rounded-xl bg-red-600/90 py-2.5 text-xs font-extrabold text-white hover:bg-red-600 transition-all cursor-pointer shadow-md"
              >
                Colgar llamada
              </button>
            </div>
          </div>

          {/* 6. AVISO LEGAL OBLIGATORIO — EU AI Act Art. 50 */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
            <p className="text-[11px] font-semibold text-amber-300">
              🇪🇺 Esta sesión usa IA para traducción simultánea en tiempo real (EU AI Act, Art. 50). No se graba audio sin consentimiento.
            </p>
          </div>
        </main>

        {/* 7. Footer Corporativo MYLILI */}
        <MyliliFooter />
      </div>
    </div>
  );
}
