"use client";

import { useState, useEffect } from "react";
import type { Sources } from "@/lib/demo/localTwin";
import { calcularFidelidadDemo } from "@/lib/fidelity/calcularDemo";
import { useTwin } from "@/lib/session/useTwin";
import { useSearchParams } from "next/navigation";

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
  return <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color, boxShadow: estado !== "empty" ? "0 0 8px " + color : "none" }} />;
}

type ConectorInfo = {
  key: keyof Sources;
  nombre: string;
  icon: string;
  queCaptura: string;
  mecanismo: string;
  filosofos: string;
  gain: string;
  tipo: "google" | "zernio_instagram" | "zernio_whatsapp" | "tiktok_manual" | "archivos";
};

const CONECTORES_EXTERNOS: ConectorInfo[] = [
  {
    key: "google",
    nombre: "Google Suite · YouTube + Drive + Gmail",
    icon: "🔷",
    queCaptura: "YouTube: transcripciones de lecciones y pronunciación oral. Drive: documentos de gramática y temarios. Gmail: comunicación con alumnos.",
    mecanismo: "OAuth 2.0 unificado (youtube.readonly + drive.readonly + gmail.readonly).",
    filosofos: "Gorgias +++ · Homero ++ · Aristóteles + · Sócrates +",
    gain: "+10% (3-4% / 3% / 4%)",
    tipo: "google",
  },
  {
    key: "instagram",
    nombre: "Instagram Profesional",
    icon: "📸",
    queCaptura: "Reels pedagógicos, stories y comentarios de alumnos. Imagen pública y estilo docente.",
    mecanismo: "Conexión OAuth vía Zernio / Meta API.",
    filosofos: "Gorgias ++ · Homero ++",
    gain: "+2–3%",
    tipo: "zernio_instagram",
  },
  {
    key: "whatsapp",
    nombre: "WhatsApp Alumnos",
    icon: "💬",
    queCaptura: "Consultas de alumnos, dudas habituales de vocabulario y registro conversacional cercano.",
    mecanismo: "Meta WhatsApp Business vía Zernio o exportación .txt.",
    filosofos: "Sócrates ++ · Heráclito ++",
    gain: "+4%",
    tipo: "zernio_whatsapp",
  },
  {
    key: "tiktok",
    nombre: "TikTok Educativo",
    icon: "🎵",
    queCaptura: "Vídeos cortos de vocabulario, pronunciación y tips de idiomas en registro dinámico.",
    mecanismo: "Registro de creador docente / Formulario manual.",
    filosofos: "Gorgias +++ · Homero ++ · Heráclito +",
    gain: "+3–4%",
    tipo: "tiktok_manual",
  },
  {
    key: "wearables",
    nombre: "Materiales y Documentos",
    icon: "📚",
    queCaptura: "Dosiers PDF, transcripciones fonéticas IPA y temarios por nivel MCER.",
    mecanismo: "Subida directa de archivos PDF / Word / Temarios.",
    filosofos: "Aristóteles ++ · Platón +",
    gain: "+1–2%",
    tipo: "archivos",
  },
];

export default function MisFuentes() {
  const { twin, guardar } = useTwin();
  const searchParams = useSearchParams();
  const [modalActivo, setModalActivo] = useState<ConectorInfo | null>(null);
  const [cargandoConexion, setCargandoConexion] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [inputHandle, setInputHandle] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("google_conectado")) {
      const email = searchParams.get("email") || "cuenta.google@gmail.com";
      conectarFuenteDirecta("google", decodeURIComponent(email));
      setMensajeExito("Google Suite conectado con éxito (" + decodeURIComponent(email) + ")");
    } else if (searchParams.get("zernio_conectado")) {
      const plat = searchParams.get("zernio_conectado") as keyof Sources;
      const user = searchParams.get("username") || "cuenta_conectada";
      conectarFuenteDirecta(plat, user);
      setMensajeExito(plat.toUpperCase() + " conectado con éxito vía Zernio (" + user + ")");
    }
  }, [searchParams]);

  const fidelidad = twin ? calcularFidelidadDemo(twin) : 0.95;
  const porcentaje = Math.round(fidelidad * 100);

  function conectarFuenteDirecta(k: keyof Sources, detalle: string) {
    if (!twin) return;
    const nuevo = {
      ...twin,
      sources: { ...twin.sources, [k]: true },
      sources_data: {
        ...(twin.sources_data || {}),
        [k]: { detalle, conectadoEn: new Date().toISOString() },
      },
    };
    guardar(nuevo);
  }

  function desconectarFuente(k: keyof Sources) {
    if (!twin) return;
    const nuevoSources = { ...twin.sources, [k]: false };
    const nuevoSourcesData = { ...(twin.sources_data || {}) };
    delete nuevoSourcesData[k];
    guardar({ ...twin, sources: nuevoSources, sources_data: nuevoSourcesData });
  }

  async function handleIniciarConexion(con: ConectorInfo) {
    const ownerId = twin?.owner_id || "usr_teacher_juanmoll";
    setCargandoConexion(true);

    try {
      if (con.tipo === "google") {
        const res = await fetch("/api/fuentes/google/conectar?ownerId=" + encodeURIComponent(ownerId));
        const data = await res.json();
        if (data.ok && data.url) {
          window.location.href = data.url;
          return;
        }
      } else if (con.tipo === "zernio_instagram" || con.tipo === "zernio_whatsapp") {
        const plat = con.tipo === "zernio_instagram" ? "instagram" : "whatsapp";
        const res = await fetch("/api/fuentes/zernio/conectar?plataforma=" + plat + "&ownerId=" + encodeURIComponent(ownerId));
        const data = await res.json();
        if (data.ok && data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch (err) {
      console.error("Error al iniciar conector:", err);
    } finally {
      setCargandoConexion(false);
    }

    setModalActivo(con);
  }

  function handleGuardarModal() {
    if (!modalActivo) return;
    const k = modalActivo.key;

    if (modalActivo.tipo === "tiktok_manual") {
      conectarFuenteDirecta(k, inputHandle.trim() || "@juanmoll_english");
    } else if (modalActivo.tipo === "archivos") {
      conectarFuenteDirecta(k, archivoSeleccionado || "Temario_Ingles_B2_C1.pdf (32 págs)");
    } else if (modalActivo.tipo === "google") {
      conectarFuenteDirecta(k, inputHandle.trim() || "juanmoll.english@gmail.com");
    } else {
      conectarFuenteDirecta(k, inputHandle.trim() || "@juanmoll_" + modalActivo.key);
    }

    setInputHandle("");
    setArchivoSeleccionado(null);
    setModalActivo(null);
  }

  return (
    <div className="relative mx-auto max-w-5xl space-y-6 pb-12">
      {mensajeExito && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-300 flex items-center justify-between">
          <span>✓ {mensajeExito}</span>
          <button onClick={() => setMensajeExito(null)} className="text-white/60 hover:text-white">✕</button>
        </div>
      )}

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
          <div className="h-full rounded-full bg-gradient-to-r from-[#1abc9c] to-[#0e9f85]" style={{ width: String(porcentaje) + "%" }} />
        </div>

        <div className="mt-3 flex justify-between text-[11px] text-white/40">
          {MILESTONES.map((m, idx) => (
            <span key={idx} className="font-semibold text-emerald-400">✓ {m}</span>
          ))}
        </div>
      </div>

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

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
          Conexión de Fuentes Externas (Redes, Documentos y Mensajería)
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {CONECTORES_EXTERNOS.map((con) => {
            const activo = twin?.sources ? !!twin.sources[con.key] : false;
            const dataConectada = twin?.sources_data ? twin.sources_data[con.key] : null;

            return (
              <div
                key={con.key}
                className={"flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 backdrop-blur-md transition-all " + (activo ? "border-[#1abc9c]/30 bg-black/50" : "border-white/10 bg-black/30")}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{con.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{con.nombre}</h4>
                    <p className="text-xs text-white/60 max-w-xl">{con.queCaptura}</p>
                    {activo && dataConectada?.detalle && (
                      <p className="text-[11px] font-mono text-emerald-300 mt-1">
                        Sincronizado: {dataConectada.detalle}
                      </p>
                    )}
                    <p className="text-[10px] text-[#1abc9c] mt-0.5">Impacto: {con.gain} · {con.filosofos}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={"text-xs font-bold " + (activo ? "text-emerald-400" : "text-white/40")}>
                    {activo ? "● Conectado" : "○ No conectado"}
                  </span>
                  {activo ? (
                    <button
                      onClick={() => desconectarFuente(con.key)}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500/20 hover:text-red-300 transition-all"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleIniciarConexion(con)}
                      disabled={cargandoConexion}
                      className="rounded-lg bg-[#1abc9c] px-3.5 py-1.5 text-xs font-bold text-black hover:bg-[#16a085] transition-all shadow-md disabled:opacity-50"
                    >
                      {cargandoConexion ? "Conectando..." : "Conectar"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-[#111111] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{modalActivo.icon}</span>
                <h3 className="text-base font-bold text-white">{modalActivo.nombre}</h3>
              </div>
              <button
                onClick={() => setModalActivo(null)}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/20 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/70">
              {modalActivo.tipo === "tiktok_manual"
                ? "Introduce tu usuario de creador de TikTok o canal educativo para vincular tus píldoras de vídeo."
                : modalActivo.tipo === "archivos"
                ? "Sube tus documentos docentes (.pdf, .docx, .txt) para nutrir la base de conocimiento pedagógica."
                : "Introduce tu cuenta o identificador para conectar " + modalActivo.nombre + ":"}
            </p>

            {modalActivo.tipo === "archivos" ? (
              <div className="space-y-3">
                <label className="block rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center hover:border-[#1abc9c] cursor-pointer">
                  <span className="text-3xl block mb-2">📁</span>
                  <span className="text-xs text-white/80 font-bold block">Haz clic para seleccionar archivos</span>
                  <span className="text-[10px] text-white/40 block mt-1">PDF, DOCX, TXT hasta 25MB</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setArchivoSeleccionado(e.target.files[0].name);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {archivoSeleccionado && (
                  <p className="text-xs text-emerald-400 font-mono">✓ Archivo preparado: {archivoSeleccionado}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                  {modalActivo.tipo === "tiktok_manual" ? "Usuario de TikTok:" : modalActivo.tipo === "google" ? "Cuenta de Google (Email):" : "Usuario / Teléfono:"}
                </label>
                <input
                  type="text"
                  value={inputHandle}
                  onChange={(e) => setInputHandle(e.target.value)}
                  placeholder={modalActivo.tipo === "tiktok_manual" ? "@tu_tiktok_docente" : modalActivo.tipo === "google" ? "tu.nombre@gmail.com" : "@tu_usuario"}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-[#1abc9c] focus:outline-none"
                />
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => setModalActivo(null)}
                className="rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white/60 hover:bg-white/20 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarModal}
                className="rounded-lg bg-[#1abc9c] px-4 py-2 text-xs font-bold text-black hover:bg-[#16a085] transition-all shadow-md"
              >
                Confirmar y Vincular Fuente ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}