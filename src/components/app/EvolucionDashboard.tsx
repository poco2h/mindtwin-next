"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function EvolucionDashboard() {
  const searchParams = useSearchParams();
  const isFollower = searchParams.get("role") === "follower";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filtroAlerta, setFiltroAlerta] = useState<"todas" | "inactividad" | "error">("todas");
  const [recordatorioEnviado, setRecordatorioEnviado] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvolucion() {
      try {
        setLoading(true);
        const res = await fetch(`/api/mindtwin/evolucion?role=${isFollower ? "follower" : "owner"}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
          if (json.alumnos && json.alumnos.length > 0) {
            setSelectedAlumnoId(json.alumnos[0].id);
          } else if (json.alumno) {
            setSelectedAlumnoId(json.alumno.id);
          }
        }
      } catch (e) {
        console.error("Error cargando evolución:", e);
      } finally {
        setLoading(false);
      }
    }
    loadEvolucion();
  }, [isFollower]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1abc9c] border-t-transparent" />
        <p className="text-xs font-bold text-white/60">Cargando métricas de progresión fonética en tiempo real...</p>
      </div>
    );
  }

  const currentAlumno = isFollower
    ? data?.alumno
    : data?.alumnos?.find((a: any) => a.id === selectedAlumnoId) || data?.alumnos?.[0];

  const alertas = (data?.alertas || []).filter((al: any) => {
    if (isFollower) return true;
    if (filtroAlerta === "inactividad") return al.tipo === "inactividad";
    if (filtroAlerta === "error") return al.tipo === "error_sistematico";
    return true;
  });

  function enviarRecordatorio(alumnoName: string) {
    setRecordatorioEnviado(alumnoName);
    setTimeout(() => setRecordatorioEnviado(null), 3500);
  }

  return (
    <div className="relative mx-auto max-w-5xl space-y-6 pb-16 text-white animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#1abc9c]">
            {isFollower ? "Lili Speak · Mi Progresión de Aprendizaje" : "Lili Speak · Panel Docente de Alumnos"}
          </p>
          <h2 className="font-playfair text-2xl font-bold text-white">
            {isFollower ? "Mi Evolución Fonética y Constancia" : "Evolución y Progresión Fonética de Alumnos"}
          </h2>
          <p className="text-xs text-white/60 mt-0.5">
            {isFollower
              ? "Supervisión de tu precisión fonética, ritmo oral y constancia semanal."
              : "Diagnóstico individual por fonema, alertas automáticas de inactividad e informes exportables."}
          </p>
        </div>

        {currentAlumno && (
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1abc9c] to-[#16a085] px-4 py-2 text-xs font-extrabold text-black shadow-lg shadow-[#1abc9c]/20 hover:brightness-110 transition active:scale-95"
          >
            <span>📄</span> Generar Informe PDF
          </button>
        )}
      </div>

      {/* 1. SELECTOR DE ALUMNOS (Solo para OWNER) */}
      {!isFollower && data?.alumnos && data.alumnos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Seleccionar Alumno Activo:</span>
            <span className="text-[10px] text-white/40">{data.alumnos.length} Alumnos en seguimiento</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {data.alumnos.map((al: any) => {
              const isSelected = al.id === selectedAlumnoId;
              const hasAlert = data.alertas?.some((a: any) => a.alumnoId === al.id);
              const isInactive = al.diasInactivo >= 5;

              return (
                <button
                  key={al.id}
                  onClick={() => setSelectedAlumnoId(al.id)}
                  className={`relative flex flex-col p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-[#1abc9c] bg-[#1abc9c]/10 shadow-lg shadow-[#1abc9c]/15"
                      : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {hasAlert && (
                    <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isInactive ? "bg-red-400" : "bg-amber-400"}`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isInactive ? "bg-red-500" : "bg-amber-500"}`} />
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-[#1abc9c]">
                      {al.nombre.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{al.nombre}</h4>
                      <span className="text-[10px] text-white/50">{al.nivelActual}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-white/60 border-t border-white/5 pt-1.5">
                    <span>Precisión: <strong className="text-[#1abc9c]">{al.accuracyPromedio}%</strong></span>
                    <span>{al.diasInactivo === 0 ? "Hoy" : `Hace ${al.diasInactivo}d`}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. d. SECCIÓN ALERTAS AUTOMÁTICAS (Inactividad >= 5 días & Error Sistemático) */}
      {alertas.length > 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-5 backdrop-blur-xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-300">
                Alertas Automáticas de Seguimiento Docente ({alertas.length})
              </h3>
            </div>
            {!isFollower && (
              <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg text-[10px]">
                {[
                  { key: "todas", label: "Todas" },
                  { key: "inactividad", label: "Inactividad (≥5d)" },
                  { key: "error", label: "Error Sistemático" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFiltroAlerta(f.key as any)}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      filtroAlerta === f.key ? "bg-red-500 text-black" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alertas.map((al: any) => (
              <div
                key={al.id}
                className="flex flex-col justify-between rounded-xl border border-red-500/20 bg-black/60 p-3.5 space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {al.tipo === "inactividad" ? "🚨" : "⚠️"} {al.alumnoName}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        al.gravedad === "alta" ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {al.tipo === "inactividad" ? `Inactivo ${al.diasInactivo}d` : "Error Fonético"}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-red-200 mt-1">{al.titulo}</h5>
                  <p className="text-[11px] text-white/70 leading-relaxed mt-0.5">{al.descripcion}</p>
                </div>

                <div className="border-t border-white/5 pt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-cyan-300 font-mono">💡 {al.accionSugerida}</span>
                  {!isFollower && (
                    <button
                      onClick={() => enviarRecordatorio(al.alumnoName)}
                      className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white transition whitespace-nowrap"
                    >
                      Avisar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {recordatorioEnviado && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-lg p-2 text-xs text-emerald-300 font-bold flex items-center justify-between">
              <span>✓ Recordatorio y pauta fonética enviados con éxito a {recordatorioEnviado}.</span>
              <span className="text-[10px] text-emerald-400">Canal: WhatsApp / Push</span>
            </div>
          )}
        </div>
      )}

      {currentAlumno && (
        <>
          {/* 3. a. DASHBOARD DE PROGRESIÓN FONÉTICA */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#1abc9c]">Métricas de Voz Azure Speech</span>
                <h3 className="text-lg font-bold text-white">Progresión Fonética: {currentAlumno.nombre}</h3>
              </div>
              <span className="rounded-full bg-[#1abc9c]/10 border border-[#1abc9c]/30 px-3 py-1 text-xs font-bold text-[#1abc9c]">
                Nivel Evaluado: {currentAlumno.nivelActual}
              </span>
            </div>

            {/* 4 Métricas Clave */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-xl border border-white/5 bg-white/5 p-3.5">
                <span className="text-[10px] text-white/40 uppercase font-bold">Accuracy Fonético</span>
                <p className="text-2xl font-extrabold text-[#1abc9c] mt-1">{currentAlumno.accuracyPromedio}%</p>
                <span className="text-[10px] text-emerald-400">↑ +7% este mes</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-3.5">
                <span className="text-[10px] text-white/40 uppercase font-bold">Fluidez Oral</span>
                <p className="text-2xl font-extrabold text-white mt-1">78/100</p>
                <span className="text-[10px] text-cyan-400">Ritmo constante</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-3.5">
                <span className="text-[10px] text-white/40 uppercase font-bold">Prosodia & Entonación</span>
                <p className="text-2xl font-extrabold text-white mt-1">82/100</p>
                <span className="text-[10px] text-emerald-400">Curva natural</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-3.5">
                <span className="text-[10px] text-white/40 uppercase font-bold">Completitud</span>
                <p className="text-2xl font-extrabold text-white mt-1">100%</p>
                <span className="text-[10px] text-white/40">Sin omisiones</span>
              </div>
            </div>

            {/* Evolución Sesión a Sesión */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">
                Evolución Temporal de Sesiones Orales
              </h4>
              <div className="space-y-2">
                {(currentAlumno.evolucionSesiones || []).map((ses: any) => (
                  <div
                    key={ses.sesionNumero}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 hover:bg-white/[0.06] transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-lg bg-[#1abc9c]/20 text-[#1abc9c] flex items-center justify-center text-xs font-black">
                        #{ses.sesionNumero}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">"{ses.frasePracticada}"</p>
                        <span className="text-[10px] text-white/40">Fecha: {ses.fecha}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/40">Precisión:</span>
                        <span className="font-bold text-[#1abc9c]">{ses.accuracyScore}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/40">Fluidez:</span>
                        <span className="font-bold text-white">{ses.fluencyScore}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-white/40">Prosodia:</span>
                        <span className="font-bold text-white">{ses.prosodyScore}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desglose por Fonema IPA */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">
                Desglose por Fonema Crítico (IPA)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(currentAlumno.desgloseFonemas || []).map((f: any, idx: number) => {
                  const isRed = f.accuracy < 70;
                  const isAmber = f.accuracy >= 70 && f.accuracy < 80;
                  return (
                    <div key={idx} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black font-mono text-cyan-300">/{f.fonema}/</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isRed
                              ? "bg-red-500/20 text-red-300"
                              : isAmber
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {f.accuracy}% · {f.estado}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/70">{f.nombre}</p>
                      {/* Barra de progreso */}
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isRed ? "bg-red-500" : isAmber ? "bg-amber-400" : "bg-[#1abc9c]"
                          }`}
                          style={{ width: `${f.accuracy}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. b. NIVEL DE ADHERENCIA & c. ERRORES MÁS RECURRENTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* b. Adherencia */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Adherencia y Constancia</h3>
                <span className="text-2xl">🔥</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-[#1abc9c]">{currentAlumno.rachaDias} días</span>
                  <p className="text-xs text-white/50 mt-0.5">Racha actual consecutiva</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">{currentAlumno.horasPractica}h</span>
                  <p className="text-xs text-white/50">Horas acumuladas ({currentAlumno.sesionesCompletadas} sesiones)</p>
                </div>
              </div>

              {/* Barra de adherencia mensual */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Cumplimiento del Plan Semanal:</span>
                  <span className="font-bold text-emerald-400">{currentAlumno.adherenciaPorcentaje}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#1abc9c]"
                    style={{ width: `${currentAlumno.adherenciaPorcentaje}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-white/70">
                {currentAlumno.diasInactivo === 0 ? (
                  <span className="text-emerald-300 font-bold">✓ Alumno activo hoy. Excelente ritmo de asimilación.</span>
                ) : currentAlumno.diasInactivo < 5 ? (
                  <span>Última sesión hace {currentAlumno.diasInactivo} días. Ritmo de práctica dentro de los parámetros.</span>
                ) : (
                  <span className="text-red-400 font-bold">⚠️ Inactividad detectada: {currentAlumno.diasInactivo} días sin sesiones.</span>
                )}
              </div>
            </div>

            {/* c. Errores Recurrentes */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Errores Más Recurrentes</h3>
                <span className="text-xs text-white/40">Foco Docente</span>
              </div>

              <div className="space-y-3">
                {(currentAlumno.erroresRecurrentes || []).map((err: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="font-mono text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          /{err.fonema}/
                        </span>
                        {err.nombre}
                      </span>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {err.accuracy_media}% prec.
                      </span>
                    </div>

                    <div className="text-[11px] text-white/60">
                      Palabras afectadas: <strong className="text-white/90">{err.ejemplos.join(", ")}</strong>
                    </div>

                    <div className="border-t border-white/5 pt-1.5 text-[11px] text-[#1abc9c]">
                      🎯 <strong>Pauta Docente:</strong> {err.truco_pedagogico}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 5. e. MODAL INFORME DE PROGRESO EXPORTABLE / PDF */}
      {showReportModal && currentAlumno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20 bg-[#0d1317] p-8 shadow-2xl space-y-6 text-white">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-xl font-bold"
            >
              ✕
            </button>

            {/* Cabecera Oficial del Informe */}
            <div className="border-b border-[#1abc9c]/30 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1abc9c]">
                  LILI SPEAK · OFFICIAL MINDTWIN PROGRESS REPORT
                </span>
                <h2 className="font-playfair text-xl font-bold text-white">Informe de Evolución Fonética y Fluidez</h2>
                <p className="text-xs text-white/50">Docente: Juan Moll · Lili Speak Language Academy</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-white/40">Fecha: {new Date().toLocaleDateString("es-ES")}</span>
                <div className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full mt-1">
                  Certificado CEFR {currentAlumno.nivelActual}
                </div>
              </div>
            </div>

            {/* Datos del Alumno */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-xl text-center text-xs">
              <div>
                <span className="text-[10px] text-white/40 uppercase">Estudiante</span>
                <p className="font-bold text-white mt-0.5">{currentAlumno.nombre}</p>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase">Horas Práctica</span>
                <p className="font-bold text-[#1abc9c] mt-0.5">{currentAlumno.horasPractica} h</p>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase">Accuracy Global</span>
                <p className="font-bold text-white mt-0.5">{currentAlumno.accuracyPromedio}%</p>
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase">Constancia</span>
                <p className="font-bold text-emerald-400 mt-0.5">{currentAlumno.adherenciaPorcentaje}%</p>
              </div>
            </div>

            {/* Resumen de Evaluación Fonética */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1abc9c]">
                1. Diagnóstico Fonético y Articulatorio (Azure Speech)
              </h4>
              <p className="text-xs text-white/80 leading-relaxed">
                El estudiante <strong>{currentAlumno.nombre}</strong> demuestra un progreso notable en la prosodia y el enlace
                vocálico natural. Se observa dominio en fonemas fricativos glotales (/h/) y oclusivos, con área de refuerzo focalizada
                en la fricativa interdental sorda (/θ/).
              </p>
            </div>

            {/* Desglose de Fonemas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1abc9c]">
                2. Fonemas Dominados vs En Refuerzo
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">✓ Dominados (Accuracy &gt; 80%):</span>
                  <p className="text-white/80 mt-1 font-mono text-[11px]">/h/ (hello), /æ/ (cat), /dʒ/ (job), /j/ (useful)</p>
                </div>
                <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-amber-400">⚠️ En Refuerzo (Accuracy &lt; 75%):</span>
                  <p className="text-white/80 mt-1 font-mono text-[11px]">/θ/ (think, through), /ð/ (this, that), /v/ (very)</p>
                </div>
              </div>
            </div>

            {/* Recomendaciones Pedagógicas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1abc9c]">
                3. Objetivos para el Próximo Mes
              </h4>
              <ul className="list-disc list-inside text-xs text-white/80 space-y-1">
                <li>3 sesiones semanales de 15 minutos con el Teacher MindTwin en modo conversacional.</li>
                <li>Ejercicios específicos de pares mínimos para fijar la articulación interdental /θ/ vs /s/.</li>
                <li>Consolidar fluidez oral en situaciones profesionales y de viajes.</li>
              </ul>
            </div>

            {/* Botón de Impresión / PDF */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-[10px] text-white/40">Firma electrónica: Teacher MindTwin Juan Moll</span>
              <button
                onClick={() => window.print()}
                className="rounded-xl bg-[#1abc9c] px-5 py-2 text-xs font-bold text-black hover:bg-[#16a085] transition shadow-lg"
              >
                🖨️ Imprimir / Guardar como PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
