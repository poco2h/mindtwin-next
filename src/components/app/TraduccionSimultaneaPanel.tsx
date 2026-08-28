"use client";

import { useState, useRef, useEffect } from "react";

type TurnoConversacion = {
  id: string;
  emisor: "alumno" | "interlocutor";
  textoOriginal: string;
  textoTraducido: string;
  idiomaOrigen: string;
  idiomaDestino: string;
  tiempo: string;
  latenciaMs: number;
  modo: "modo_a" | "modo_b";
  audioBase64?: string | null;
  susurroTwin?: string | null;
};

type ReporteSesionData = {
  resumen_ejecutivo: string;
  pct_autonomia: number;
  pct_soporte_ia: number;
  vocabulario_absorbido: string[];
  hitos_conseguidos: string[];
  recomendaciones_proxima_sesion: string[];
  indicador_ia: string;
};

export default function TraduccionSimultaneaPanel() {
  // Configuración de Sesión y Agora
  const [canalAgora] = useState("clase-live-usr_alumno_carlos");

  // Estados de Dual Control
  const [tipoControl, setTipoControl] = useState<"control_a" | "control_b">("control_a");
  const [modoActivo, setModoActivo] = useState<"modo_a" | "modo_b">("modo_b");
  const [nivelAlumno] = useState("B1");
  const [followerVoiceId] = useState("21m00Tcm4TlvDq8ikWAM");

  // Idiomas
  const [idiomaAlumno] = useState("es");
  const [idiomaInterlocutor] = useState("en");

  // Inputs y streaming
  const [inputAlumno, setInputAlumno] = useState("");
  const [inputInterlocutor, setInputInterlocutor] = useState("");
  const [procesandoTurno, setProcesandoTurno] = useState(false);
  const [escuchandoVoz, setEscuchandoVoz] = useState(false);

  // Susurro activo del Twin (Coaching silencioso en pantalla)
  const [susurroActivo, setSusurroActivo] = useState<string | null>(
    "💡 Tip del Twin: Para reuniones formales, recuerda usar 'I look forward to our collaboration'."
  );

  // Historial de turnos
  const [turnos, setTurnos] = useState<TurnoConversacion[]>([
    {
      id: "demo_1",
      emisor: "alumno",
      textoOriginal: "Buenos días, me gustaría presentarles la propuesta del nuevo proyecto formativo.",
      textoTraducido: "Good morning, I would like to present the proposal for the new training project.",
      idiomaOrigen: "es",
      idiomaDestino: "en",
      tiempo: "13:30",
      latenciaMs: 142,
      modo: "modo_b",
      susurroTwin: "Frase formal adecuada para apertura B2.",
    },
    {
      id: "demo_2",
      emisor: "interlocutor",
      textoOriginal: "Thank you Carlos. Could you specify the timeline and deliverables for Q3?",
      textoTraducido: "Gracias Carlos. ¿Podrías especificar el cronograma y los entregables para el tercer trimestre?",
      idiomaOrigen: "en",
      idiomaDestino: "es",
      tiempo: "13:31",
      latenciaMs: 110,
      modo: "modo_a",
    },
  ]);

  // Disclosure EU AI Act y Reporte
  const [reproduciendoDisclosure, setReproduciendoDisclosure] = useState(false);
  const [modalReporte, setModalReporte] = useState(false);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [reporteSesion, setReporteSesion] = useState<ReporteSesionData | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "es-ES";

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputAlumno(transcript);
          enviarTurno(transcript, "alumno");
          setEscuchandoVoz(false);
        };

        rec.onerror = () => setEscuchandoVoz(false);
        rec.onend = () => setEscuchandoVoz(false);
        recognitionRef.current = rec;
      }
    }
  }, [modoActivo, tipoControl]);

  function toggleDictadoVoz() {
    if (!recognitionRef.current) {
      alert("El reconocimiento de voz funciona en Google Chrome y navegadores Chromium.");
      return;
    }
    if (escuchandoVoz) {
      recognitionRef.current.stop();
      setEscuchandoVoz(false);
    } else {
      recognitionRef.current.lang = "es-ES";
      recognitionRef.current.start();
      setEscuchandoVoz(true);
    }
  }

  function reproducirDisclosureAudio() {
    setReproduciendoDisclosure(true);
    const audioMsg =
      "Aviso legal obligatorio: Esta sesión utiliza traducción simultánea asistida por inteligencia artificial y síntesis de voz clonada conforme al artículo 50 del Reglamento Europeo de IA.";
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(audioMsg);
      utter.lang = "es-ES";
      utter.rate = 1.05;
      utter.onend = () => setReproduciendoDisclosure(false);
      utter.onerror = () => setReproduciendoDisclosure(false);
      window.speechSynthesis.speak(utter);
    } else {
      setTimeout(() => setReproduciendoDisclosure(false), 3000);
    }
  }

  async function enviarTurno(texto: string, emisor: "alumno" | "interlocutor") {
    if (!texto.trim() || procesandoTurno) return;
    const txt = texto.trim();
    if (emisor === "alumno") setInputAlumno("");
    else setInputInterlocutor("");

    setProcesandoTurno(true);

    try {
      const res = await fetch("/api/mindtwin/conversacion-terceros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textoTranscrito: txt,
          emisor,
          idiomaOrigen: emisor === "alumno" ? idiomaAlumno : idiomaInterlocutor,
          idiomaDestino: emisor === "alumno" ? idiomaInterlocutor : idiomaAlumno,
          tipoControl,
          modoActivo,
          followerVoiceId,
          nivelAlumno,
          alumnoName: "Carlos Mendoza",
          teacherName: "Juan Moll",
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Actualizar modo si el Twin decide cambiar en Control A
        if (tipoControl === "control_a" && data.dualControl?.modo_recomendado) {
          setModoActivo(data.dualControl.modo_recomendado);
        }

        if (data.dualControl?.susurro_alumno) {
          setSusurroActivo(data.dualControl.susurro_alumno);
        }

        const nuevoTurno: TurnoConversacion = {
          id: crypto.randomUUID(),
          emisor,
          textoOriginal: txt,
          textoTraducido: data.textoTraducido,
          idiomaOrigen: data.idiomaOrigen,
          idiomaDestino: data.idiomaDestino,
          tiempo: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          latenciaMs: data.latencyMs || 120,
          modo: modoActivo,
          audioBase64: data.audioFollowerTwin?.audioBase64,
          susurroTwin: data.dualControl?.susurro_alumno,
        };

        setTurnos((prev) => [nuevoTurno, ...prev]);

        // Reproducir audio solo en el lado alumno -> interlocutor si Modo B
        if (emisor === "alumno" && data.audioFollowerTwin?.audioBase64) {
          reproducirAudioBase64(data.audioFollowerTwin.audioBase64);
        }
      }
    } catch (err) {
      console.error("Error en turno de conversación con terceros:", err);
    } finally {
      setProcesandoTurno(false);
    }
  }

  function reproducirAudioBase64(b64: string) {
    try {
      const snd = new Audio("data:audio/mp3;base64," + b64);
      snd.play().catch(() => {});
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }

  async function handleGenerarReporteSesion() {
    setCargandoReporte(true);
    setModalReporte(true);

    try {
      const turnosA = turnos.filter((t) => t.modo === "modo_a").length;
      const turnosB = turnos.filter((t) => t.modo === "modo_b").length;

      const res = await fetch("/api/mindtwin/session-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duracionSegundos: 1200,
          turnosModoA: turnosA || 8,
          turnosModoB: turnosB || 6,
          historialTurnos: turnos.map((t) => ({ emisor: t.emisor, texto: t.textoOriginal })),
          alumnoName: "Carlos Mendoza",
          idiomaPractica: "Inglés",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReporteSesion(data.reporte);
      }
    } catch (err) {
      console.error("Error al generar reporte de sesión:", err);
    } finally {
      setCargandoReporte(false);
    }
  }

  return (
    <div className="flex h-full flex-col space-y-3 pb-2">
      {/* 1. Barra Superior: Estado Agora RTC & Disclosure EU AI Act (Art. 50) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SERVICIO 3 · CONVERSACIÓN CON TERCEROS</span>
          </div>
          <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#1abc9c]">
            Agora RTC: {canalAgora}
          </span>
        </div>

        {/* Badge Persistente EU AI Act Art. 50 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
            <span>🇪🇺 EU AI Act Art. 50</span>
            <span className="text-[10px] text-white/60">· Traducción Simultánea & Síntesis Vocal</span>
          </div>
          <button
            onClick={reproducirDisclosureAudio}
            disabled={reproduciendoDisclosure}
            title="Reproducir audio legal para nuevo interlocutor"
            className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-all disabled:opacity-50"
          >
            {reproduciendoDisclosure ? "🔊 Reproduciendo aviso..." : "📢 Audio Disclosure"}
          </button>
        </div>
      </div>

      {/* 2. Barra de Dual Control (Control A vs Control B) & Toggle Modo A/B */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Selector de Arquitectura de Control */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Tipo de Control</p>
            <p className="text-xs font-medium text-white">
              {tipoControl === "control_a" ? "🤖 Control A: Twin al Mando (Flash 2.5)" : "👤 Control B: Alumno al Mando"}
            </p>
          </div>

          <div className="flex rounded-lg bg-black/40 p-1 border border-white/10">
            <button
              onClick={() => setTipoControl("control_a")}
              className={"rounded px-2.5 py-1 text-xs font-bold transition-all " + (tipoControl === "control_a" ? "bg-[#1abc9c] text-black shadow" : "text-white/60 hover:text-white")}
            >
              Twin Auto
            </button>
            <button
              onClick={() => setTipoControl("control_b")}
              className={"rounded px-2.5 py-1 text-xs font-bold transition-all " + (tipoControl === "control_b" ? "bg-white text-black shadow" : "text-white/60 hover:text-white")}
            >
              Manual
            </button>
          </div>
        </div>

        {/* Toggle de Modo de Habla (Modo A vs Modo B) & Voz Clonada */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Modo de Habla Alumno</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={"h-2 w-2 rounded-full " + (modoActivo === "modo_b" ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-emerald-400")} />
              <span className="text-xs font-bold text-white">
                {modoActivo === "modo_b" ? "Modo B · Traduce con mi Voz Clonada" : "Modo A · Hablo Directo en Inglés"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModoActivo(modoActivo === "modo_a" ? "modo_b" : "modo_a")}
              className={"rounded-lg px-3 py-1.5 text-xs font-extrabold transition-all " + (modoActivo === "modo_b" ? "bg-cyan-400 text-black hover:bg-cyan-300 shadow-md" : "bg-emerald-400 text-black hover:bg-emerald-300 shadow-md")}
            >
              {modoActivo === "modo_b" ? "⚡ Traduce por Mí" : "🗣️ Yo Hablo"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Susurro Privado del Twin en Pantalla (Coaching Silencioso) */}
      {susurroActivo && (
        <div className="flex items-center justify-between rounded-xl border border-[#1abc9c]/30 bg-[#1abc9c]/10 px-4 py-2 text-xs text-[#1abc9c]">
          <div className="flex items-center gap-2">
            <span className="text-base">🤫</span>
            <span className="font-semibold">{susurroActivo}</span>
          </div>
          <button onClick={() => setSusurroActivo(null)} className="text-white/40 hover:text-white">✕</button>
        </div>
      )}

      {/* 4. Flujo de Conversación Bidireccional en Tiempo Real */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {turnos.map((t) => {
          const esAlumno = t.emisor === "alumno";
          return (
            <div
              key={t.id}
              className={"flex flex-col " + (esAlumno ? "items-end" : "items-start")}
            >
              <div className="flex items-center gap-2 px-1 text-[10px] text-white/50">
                <span className="font-bold text-white/80">{esAlumno ? "🧑‍🎓 Tú (Alumno)" : "👤 Interlocutor Internacional"}</span>
                <span>·</span>
                <span>{t.tiempo}</span>
                <span>·</span>
                <span className="font-mono text-[#1abc9c]">{t.latenciaMs}ms</span>
                <span>·</span>
                <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] uppercase font-bold text-white/70">
                  {t.modo === "modo_b" ? "Modo B (Traducción + Voz Clonada)" : "Modo A (Directo)"}
                </span>
              </div>

              <div
                className={"mt-1 max-w-[85%] rounded-2xl p-4 shadow-xl backdrop-blur-md " + (esAlumno ? "border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-black/60 text-white" : "border border-white/10 bg-white/5 text-white/95")}
              >
                {/* Texto Original */}
                <p className="text-xs font-semibold text-white/60 mb-1">
                  {esAlumno ? "Tu voz en español:" : "Interlocutor en inglés:"}
                </p>
                <p className="text-sm font-medium leading-relaxed">{t.textoOriginal}</p>

                {/* Bloque de Traducción en Vivo */}
                <div className="mt-2.5 rounded-xl border border-white/10 bg-black/40 p-2.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 mb-1">
                    <span>
                      {esAlumno ? "⚡ Audio emitido en inglés (Follower Twin Voice):" : "👁️ Overlay visual en español:"}
                    </span>
                    {t.audioBase64 && (
                      <button
                        onClick={() => reproducirAudioBase64(t.audioBase64!)}
                        className="text-cyan-300 hover:text-white font-bold"
                      >
                        🔊 Escuchar síntesis
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-white/90 italic font-sans">{t.textoTraducido}</p>
                </div>
              </div>
            </div>
          );
        })}

        {procesandoTurno && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-[#1abc9c] animate-ping" />
            <span>Azure Translator + Follower Twin Voice procesando en streaming...</span>
          </div>
        )}
      </div>

      {/* 5. Inputs de Prueba Bidireccional (Alumno + Interlocutor Simulado) */}
      <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/10 md:grid-cols-2">
        {/* Input Alumno */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviarTurno(inputAlumno, "alumno");
          }}
          className="flex items-center gap-1.5"
        >
          <button
            type="button"
            onClick={toggleDictadoVoz}
            title="Hablar por micrófono"
            className={"flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all " + (escuchandoVoz ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white/80 hover:bg-white/20")}
          >
            🎤
          </button>
          <input
            type="text"
            value={inputAlumno}
            onChange={(e) => setInputAlumno(e.target.value)}
            placeholder="Habla o escribe en español..."
            disabled={procesandoTurno}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-[#1abc9c] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputAlumno.trim() || procesandoTurno}
            className="rounded-xl bg-[#1abc9c] px-3.5 py-2 text-xs font-bold text-black hover:bg-[#16a085] transition-all disabled:opacity-30"
          >
            Enviar (Alumno)
          </button>
        </form>

        {/* Input Interlocutor Simulado */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviarTurno(inputInterlocutor, "interlocutor");
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            value={inputInterlocutor}
            onChange={(e) => setInputInterlocutor(e.target.value)}
            placeholder="Simular interlocutor en inglés..."
            disabled={procesandoTurno}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputInterlocutor.trim() || procesandoTurno}
            className="rounded-xl bg-white/20 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/30 transition-all disabled:opacity-30"
          >
            Simular Interlocutor
          </button>
        </form>
      </div>

      {/* 6. Barra Inferior con Botón de Reporte de Sesión */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-white/50">
        <span>Voz Follower Twin: Rachel (ElevenLabs)</span>
        <button
          onClick={handleGenerarReporteSesion}
          className="rounded-lg bg-gradient-to-r from-[#1abc9c] to-[#0e9f85] px-3 py-1.5 text-xs font-bold text-black hover:opacity-90 shadow-md transition-all"
        >
          📊 Finalizar y Generar Reporte de Sesión (Flash 2.5)
        </button>
      </div>

      {/* Modal de Reporte Post-Sesión */}
      {modalReporte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-[#111111] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📊</span> Informe Post-Sesión · Conversación con Terceros
              </h3>
              <button
                onClick={() => setModalReporte(false)}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/20 hover:text-white"
              >
                ✕
              </button>
            </div>

            {cargandoReporte ? (
              <div className="py-12 text-center text-xs text-white/60">
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#1abc9c] border-t-transparent mb-2" />
                <p>Generando analítica pedagógica con Gemini 2.5 Flash...</p>
              </div>
            ) : reporteSesion ? (
              <div className="space-y-4 text-xs">
                {/* Resumen */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 leading-relaxed text-white/90">
                  <p className="font-bold text-[#1abc9c] mb-1">Resumen Ejecutivo:</p>
                  <p>{reporteSesion.resumen_ejecutivo}</p>
                </div>

                {/* Métricas de Autonomía vs Asistencia */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
                    <span className="block text-2xl font-mono font-extrabold text-emerald-300">
                      {reporteSesion.pct_autonomia}%
                    </span>
                    <span className="text-[10px] font-bold uppercase text-white/60">Modo A · Autonomía Directa</span>
                  </div>

                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-center">
                    <span className="block text-2xl font-mono font-extrabold text-cyan-300">
                      {reporteSesion.pct_soporte_ia}%
                    </span>
                    <span className="text-[10px] font-bold uppercase text-white/60">Modo B · Soporte Voz Clonada</span>
                  </div>
                </div>

                {/* Vocabulario Absorbido */}
                {reporteSesion.vocabulario_absorbido && reporteSesion.vocabulario_absorbido.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-white/50 mb-1.5">Vocabulario Clave Absorbido:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {reporteSesion.vocabulario_absorbido.map((v, i) => (
                        <span key={i} className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-white">
                          ✓ {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recomendaciones */}
                {reporteSesion.recomendaciones_proxima_sesion && reporteSesion.recomendaciones_proxima_sesion.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="font-bold text-amber-300 mb-1">🎯 Recomendaciones para la Próxima Sesión:</p>
                    <ul className="list-disc list-inside space-y-1 text-white/80">
                      {reporteSesion.recomendaciones_proxima_sesion.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 text-[10px] text-white/40 text-center font-mono">
                  {reporteSesion.indicador_ia}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
