"use client";

import { useState, useEffect } from "react";

type EstadoServicio = "activo" | "en_espera";

interface ServicioLili {
  id: string;
  numero: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  estado: EstadoServicio;
  fuenteRequerida?: string;
  accionLabel?: string;
}

const SERVICIOS_INTRANET: ServicioLili[] = [
  {
    id: "creacion_rrss",
    numero: "01",
    nombre: "Creación de contenidos RRSS",
    categoria: "Contenido y Redes",
    descripcion: "Generación asistida de posts, guiones de reels y carruseles educativos de idiomas.",
    estado: "en_espera",
    fuenteRequerida: "Instagram Profesional (en Mis Fuentes)",
    accionLabel: "Configurar Guiones",
  },
  {
    id: "publicacion_rrss",
    numero: "02",
    nombre: "Publicación de contenidos RRSS",
    categoria: "Contenido y Redes",
    descripcion: "Programación y auto-publicación directa en tu feed y stories docentes.",
    estado: "en_espera",
    fuenteRequerida: "Instagram Profesional (en Mis Fuentes)",
    accionLabel: "Programar Fechas",
  },
  {
    id: "respuestas_comentarios_ig",
    numero: "03",
    nombre: "Respuestas a comentarios IG",
    categoria: "Atención y Conversión",
    descripcion: "Respuesta pedagógica y filtro anti-spam a dudas en tus publicaciones de Instagram.",
    estado: "activo",
    fuenteRequerida: "Instagram Profesional (en Mis Fuentes)",
    accionLabel: "Gestionar Comentarios",
  },
  {
    id: "respuestas_dms_ig",
    numero: "04",
    nombre: "Respuestas a DMs IG",
    categoria: "Atención y Conversión",
    descripcion: "Atención automática 24/7 a mensajes directos de alumnos interesados en cursos.",
    estado: "activo",
    fuenteRequerida: "Instagram Profesional (en Mis Fuentes)",
    accionLabel: "Bandeja DMs",
  },
  {
    id: "contestacion_emails",
    numero: "05",
    nombre: "Contestación automática de emails",
    categoria: "Atención y Conversión",
    descripcion: "Borradores pedagógicos y respuestas automáticas a emails de consulta y matrícula.",
    estado: "activo",
    fuenteRequerida: "Gmail / Email (en Mis Fuentes)",
    accionLabel: "Bandeja de Emails",
  },
  {
    id: "mailing",
    numero: "06",
    nombre: "Envío de emails automatizados (Mailing)",
    categoria: "Marketing y Comunicación",
    descripcion: "Campañas masivas personalizadas con importación nativa de Excel (.xlsx) y plantillas educativas.",
    estado: "activo",
    accionLabel: "Lanzar Campaña",
  },
  {
    id: "web_propia",
    numero: "07",
    nombre: "Web propia",
    categoria: "Presencia Digital",
    descripcion: "Tu página académica pública con catálogo de packs, niveles MCER y formulario de inscripción.",
    estado: "activo",
    accionLabel: "Gestionar Web",
  },
  {
    id: "presencia_directorio",
    numero: "08",
    nombre: "Presencia en Lili Speak (Directorio & Match)",
    categoria: "Presencia Digital",
    descripcion: "Ficha oficial de profesor en el directorio central y motor de búsqueda de alumnos.",
    estado: "activo",
    accionLabel: "Ficha de Match",
  },
  {
    id: "captacion_alumnos",
    numero: "09",
    nombre: "Captación de alumnos",
    categoria: "Ventas y Monetización",
    descripcion: "Prospección automática de empresas y centros que demandan formación en idiomas.",
    estado: "activo",
    accionLabel: "Prospección B2B",
  },
  {
    id: "materiales_comerciales",
    numero: "10",
    nombre: "Materiales comerciales",
    categoria: "Ventas y Monetización",
    descripcion: "Generador de dosiers de cursos en PDF, fichas por nivel (MCER) y propuestas para empresas.",
    estado: "activo",
    accionLabel: "Generar Dosiers",
  },
  {
    id: "programa_embajadores",
    numero: "11",
    nombre: "Programa de embajadores",
    categoria: "Ventas y Monetización",
    descripcion: "Gestión de comisiones (5% - 35%) y enlaces de afiliación para alumnos prescriptores.",
    estado: "activo",
    accionLabel: "Panel de Afiliados",
  },
  {
    id: "gestion_alumnos_sesiones",
    numero: "12",
    nombre: "Gestión de alumnos y sesiones",
    categoria: "Operaciones",
    descripcion: "Seguimiento centralizado de matrículas, clases reservadas y sesiones con Teacher MindTwin.",
    estado: "activo",
    accionLabel: "Ver Alumnos",
  },
  {
    id: "resumen_semanal",
    numero: "13",
    nombre: "Resumen semanal",
    categoria: "Analítica",
    descripcion: "Métricas semanales de horas impartidas, nuevos alumnos e interacciones en canales.",
    estado: "activo",
    accionLabel: "Ver Analítica",
  },
  {
    id: "cobro_seguro",
    numero: "14",
    nombre: "Cobro seguro",
    categoria: "Finanzas",
    descripcion: "Pasarela de cobro protegida para clases individuales, bonos mensuales y cursos intensivos.",
    estado: "activo",
    accionLabel: "Generar Cobro",
  },
  {
    id: "facturacion_automatica",
    numero: "15",
    nombre: "Facturación automática",
    categoria: "Finanzas",
    descripcion: "Emisión y envío automático de facturas con validez fiscal tras cada pago completado.",
    estado: "activo",
    accionLabel: "Facturas Emitidas",
  },
];

export default function MisHerramientas() {
  const [serviciosActivos, setServiciosActivos] = useState<Record<string, boolean>>({});
  const [modalOperar, setModalOperar] = useState<ServicioLili | null>(null);
  const [modalActivar, setModalActivar] = useState<ServicioLili | null>(null);

  // Estados interactivos para modales
  const [mailingEnviado, setMailingEnviado] = useState(false);
  const [asuntoMailing, setAsuntoMailing] = useState("Nuevo Programa de Conversación B2 para Alumnos");
  const [nombreWeb, setNombreWeb] = useState("juan-moll.lilispeak.com");
  const [montoCobro, setMontoCobro] = useState("45");
  const [conceptoCobro, setConceptoCobro] = useState("Pack 4 Clases Speaking B2");
  const [urlCobro, setUrlCobro] = useState("");

  // Cargar estado guardado (por defecto TODO DESACTIVADO {})
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("lili_servicios_activos");
      if (guardado) {
        setServiciosActivos(JSON.parse(guardado));
      } else {
        setServiciosActivos({});
      }
    } catch {
      setServiciosActivos({});
    }
  }, []);

  function toggleActivarServicio(srvId: string, activar: boolean) {
    const nuevo = { ...serviciosActivos, [srvId]: activar };
    setServiciosActivos(nuevo);
    try {
      localStorage.setItem("lili_servicios_activos", JSON.stringify(nuevo));
    } catch (e) {
      console.error(e);
    }
    if (activar && modalActivar?.id === srvId) {
      setModalActivar(null);
    }
  }

  function resetearTodasDesactivadas() {
    setServiciosActivos({});
    try {
      localStorage.removeItem("lili_servicios_activos");
    } catch (e) {
      console.error(e);
    }
  }

  const activasCount = Object.values(serviciosActivos).filter(Boolean).length;

  function generarLinkPago(e: React.FormEvent) {
    e.preventDefault();
    setUrlCobro(`https://lili-speak-demo.vercel.app/pago/jm-${Math.random().toString(36).substring(7)}`);
  }

  return (
    <div className="relative mx-auto max-w-6xl space-y-6 pb-12">
      {/* Cabecera con tamaño de letra estándar text-2xl */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#1abc9c]">
            Lili Speak · Centro de Mando Docente
          </p>
          <h2 className="font-playfair text-2xl font-bold text-white">
            Mis Herramientas
          </h2>
          <p className="text-xs text-white/60 mt-1">
            15 servicios de gestión académica, marketing y operaciones integrados en tu MindTwin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/70">
            Estado: <span className="font-bold text-[#1abc9c]">{activasCount} de 15 activas</span>
          </div>

          <button
            onClick={resetearTodasDesactivadas}
            title="Reiniciar todas las herramientas a estado desactivado"
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all flex items-center gap-1.5"
          >
            <span>🔄 Desactivar Todas</span>
          </button>
        </div>
      </div>

      {/* Rejilla de los 15 Servicios */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SERVICIOS_INTRANET.map((srv) => {
          const estaActivo = !!serviciosActivos[srv.id];

          return (
            <div
              key={srv.id}
              className={`group relative flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-xl transition-all shadow-lg ${
                estaActivo
                  ? "border-[#1abc9c]/40 bg-black/60 hover:border-[#1abc9c]"
                  : "border-white/10 bg-black/30 opacity-90 hover:border-white/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <span className="font-mono text-xs font-bold text-[#1abc9c]">
                    {srv.numero}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      estaActivo
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : "bg-white/10 text-white/40 border border-white/10"
                    }`}
                  >
                    {estaActivo ? "● Activo" : "○ Desactivado"}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-white group-hover:text-[#1abc9c] transition-colors">
                  {srv.nombre}
                </h3>
                <p className="mt-1.5 text-xs text-white/65 leading-relaxed">
                  {srv.descripcion}
                </p>

                {srv.fuenteRequerida && (
                  <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-2 text-[11px] text-white/50">
                    <span className="font-semibold text-white/70">Prerrequisito: </span>
                    {srv.fuenteRequerida}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {srv.categoria}
                </span>

                {estaActivo ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setModalOperar(srv)}
                      className="rounded-lg bg-[#1abc9c] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#16a085] transition-all flex items-center gap-1 shadow-md"
                    >
                      <span>{srv.accionLabel || "Operar"}</span>
                      <span className="text-[10px]">⚙️</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActivarServicio(srv.id, false)}
                      title="Desactivar herramienta"
                      className="rounded-lg bg-white/5 px-2 py-1.5 text-[11px] text-white/40 hover:bg-red-500/20 hover:text-red-300 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalActivar(srv)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1abc9c] hover:text-black transition-all flex items-center gap-1"
                  >
                    <span>Activar Servicio</span>
                    <span className="text-[10px]">⚡</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Activación de Servicio */}
      {modalActivar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-[#111111] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold text-[#1abc9c]">{modalActivar.numero} · {modalActivar.categoria}</span>
                <h3 className="text-lg font-bold text-white">Activar {modalActivar.nombre}</h3>
              </div>
              <button
                onClick={() => setModalActivar(null)}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/20 hover:text-white"
              >
                ✕ Cerrar
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              {modalActivar.descripcion}
            </p>

            {modalActivar.fuenteRequerida ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs space-y-2 text-amber-200">
                <p className="font-bold flex items-center gap-1.5">
                  <span>⚠️ Prerrequisito de Conexión:</span>
                </p>
                <p className="text-white/80">
                  Para que esta herramienta opere con tus datos reales, debe sincronizarse con: <strong>{modalActivar.fuenteRequerida}</strong>.
                </p>
                <div className="pt-2 flex gap-2">
                  <a
                    href="/app/fuentes"
                    className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-300 transition-colors inline-block"
                  >
                    Ir a Mis Fuentes ↗
                  </a>
                  <button
                    onClick={() => toggleActivarServicio(modalActivar.id, true)}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    Activar con Simulación
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
                <p className="font-bold">✓ Esta herramienta está lista para activarse de inmediato.</p>
                <p className="text-white/70 mt-1">No requiere configuración externa previa. Puedes activarla y empezar a utilizarla ahora mismo.</p>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => setModalActivar(null)}
                className="rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white/60 hover:bg-white/20 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => toggleActivarServicio(modalActivar.id, true)}
                className="rounded-lg bg-[#1abc9c] px-4 py-2 text-xs font-bold text-black hover:bg-[#16a085] transition-all shadow-md"
              >
                Confirmar y Activar Herramienta ⚡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Operativo Real In Situ cuando la herramienta está ACTIVA */}
      {modalOperar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl border border-[#1abc9c]/30 bg-[#111111] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold text-[#1abc9c]">{modalOperar.numero} · {modalOperar.categoria}</span>
                <h3 className="text-lg font-bold text-white">{modalOperar.nombre}</h3>
              </div>
              <button
                onClick={() => { setModalOperar(null); setMailingEnviado(false); setUrlCobro(""); }}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/20 hover:text-white"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Contenido funcional real por herramienta */}
            {modalOperar.id === "mailing" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider">Campaña de Email Automatizada</h4>
                <label className="block">
                  <span className="text-white/60">Asunto del correo:</span>
                  <input
                    type="text"
                    value={asuntoMailing}
                    onChange={(e) => setAsuntoMailing(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white focus:border-[#1abc9c] focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-white/60">Importar lista de alumnos (.xlsx o .csv):</span>
                  <input type="file" accept=".xlsx,.csv" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/80" />
                </label>
                <button
                  onClick={() => setMailingEnviado(true)}
                  className="w-full rounded-lg bg-[#1abc9c] py-2 text-xs font-bold text-black hover:bg-[#16a085] transition-colors"
                >
                  {mailingEnviado ? "✓ Campaña Lanzada a 48 Alumnos" : "Lanzar Campaña"}
                </button>
              </div>
            ) : modalOperar.id === "respuestas_comentarios_ig" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Bandeja de Comentarios IG</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-bold">● Modo Auto-Respuesta Activo</span>
                </div>
                <div className="divide-y divide-white/5 rounded-lg border border-white/5 bg-white/5 p-3 space-y-2">
                  <div className="pt-1">
                    <p className="text-white/80"><strong>@laura_bcn:</strong> "¿Cómo sé si mi nivel es B1 o B2?"</p>
                    <p className="text-[#1abc9c] mt-1">🤖 <em>Teacher MindTwin:</em> "¡Hola Laura! Puedes hacer un test diagnóstico oral de 10 min en mi enlace de bio. Te responderé con tu informe de nivel."</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-white/80"><strong>@marcos_eng:</strong> "¿Haces preparación para el examen C1 de Cambridge?"</p>
                    <p className="text-[#1abc9c] mt-1">🤖 <em>Teacher MindTwin:</em> "¡Hola Marcos! Sí, tenemos el Pack C1 Cambridge intensivo con simulacros de Speaking reales."</p>
                  </div>
                </div>
              </div>
            ) : modalOperar.id === "respuestas_dms_ig" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white">Bandeja Directa de DMs de Instagram</h4>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3 space-y-2">
                  <p className="text-white/80"><strong>@carlos_dev:</strong> "Hola Juan, me interesa el curso de Business English para entrevistas de trabajo en UK."</p>
                  <p className="text-emerald-400 font-semibold">Estado: Detección de Intención de Compra Alta (95%)</p>
                  <p className="text-white/60">El asistente ha enviado automáticamente el catálogo con el link de reserva de plaza.</p>
                </div>
              </div>
            ) : modalOperar.id === "contestacion_emails" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white">Bandeja de Contestación de Emails</h4>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3 space-y-2">
                  <div className="flex justify-between"><span className="font-bold text-white">De: maria.navarro@gmail.com</span><span className="text-white/40">Hoy, 10:24</span></div>
                  <p className="text-white/80">"Buenos días Juan, quería consultar si los horarios de las sesiones de speaking son flexibles."</p>
                  <div className="rounded bg-[#1abc9c]/10 border border-[#1abc9c]/20 p-2 text-[#1abc9c]">
                    ✓ Borrador pedagógico respondido con calendario de reservas sincronizado.
                  </div>
                </div>
              </div>
            ) : modalOperar.id === "web_propia" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white">Configuración de tu Web Académica</h4>
                <label className="block">
                  <span className="text-white/60">URL pública de tu academia:</span>
                  <input type="text" value={nombreWeb} onChange={(e) => setNombreWeb(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white" />
                </label>
                <div className="p-3 rounded-lg border border-white/5 bg-white/5">
                  <p className="font-bold text-emerald-400">● Web Publicada y Activa en Google SEO</p>
                  <p className="text-[11px] text-white/60 mt-1">Incluye catálogo de packs A1-C2, checkout Stripe integrado y presentación con tu Teacher MindTwin.</p>
                </div>
              </div>
            ) : modalOperar.id === "presencia_directorio" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white">Ficha en el Directorio Central Lili Speak</h4>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3 space-y-2">
                  <p className="text-white"><strong>Profesor:</strong> Juan Moll</p>
                  <p className="text-white/60"><strong>Especialidades:</strong> Speaking, Business English, Preparación Cambridge/IELTS</p>
                  <p className="text-white/60"><strong>Valoración:</strong> ★★★★★ (4.9 / 5.0 - 32 reseñas)</p>
                  <span className="inline-block rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-300 font-bold">● Visible en Búsquedas de Alumnos</span>
                </div>
              </div>
            ) : modalOperar.id === "captacion_alumnos" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white">Prospección y Captación B2B</h4>
                <p className="text-white/60">Envío asistido de dosiers y propuestas personalizadas a empresas y departamentos de RRHH.</p>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <p className="font-bold text-white">Empresas contactadas este mes: 18</p>
                  <p className="text-[#1abc9c] mt-1">Respuestas recibidas: 6 empresas interesadas en bonos de inglés.</p>
                </div>
              </div>
            ) : modalOperar.id === "materiales_comerciales" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white">Generador de Dosiers y Materiales</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:border-[#1abc9c]">
                    <p className="font-bold text-white">📄 Dosier Cursos 2026 (PDF)</p>
                    <span className="text-[10px] text-[#1abc9c]">Descargar / Compartir</span>
                  </button>
                  <button className="rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:border-[#1abc9c]">
                    <p className="font-bold text-white">📊 Ficha Niveles MCER</p>
                    <span className="text-[10px] text-[#1abc9c]">Descargar / Compartir</span>
                  </button>
                </div>
              </div>
            ) : modalOperar.id === "programa_embajadores" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white">Programa de Embajadores y Afiliados</h4>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3 space-y-2">
                  <div className="flex justify-between"><span>Comisión por alumno recomendado:</span><strong className="text-[#1abc9c]">20% recurrente</strong></div>
                  <div className="flex justify-between"><span>Alumnos embajadores activos:</span><strong>12</strong></div>
                  <div className="flex justify-between"><span>Comisiones generadas este mes:</span><strong className="text-emerald-400">380,00 €</strong></div>
                </div>
              </div>
            ) : modalOperar.id === "gestion_alumnos_sesiones" ? (
              <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
                <h4 className="font-bold text-white">Alumnos y Clases Activas</h4>
                <div className="divide-y divide-white/5">
                  <div className="py-2 flex justify-between"><span>Ana García (B2 Speaking)</span><span className="text-[#1abc9c]">Activa · 14.5 h</span></div>
                  <div className="py-2 flex justify-between"><span>Carlos Ruiz (C1 Business)</span><span className="text-[#1abc9c]">Activa · 8.0 h</span></div>
                  <div className="py-2 flex justify-between"><span>Elena Gómez (B1 Inicial)</span><span className="text-[#1abc9c]">Activa · 3.5 h</span></div>
                </div>
              </div>
            ) : modalOperar.id === "resumen_semanal" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white">Métricas Semanales del Negocio Docente</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white/5 p-3"><span className="text-white/40 block text-[10px]">Horas Clase</span><strong className="text-lg text-white">28 h</strong></div>
                  <div className="rounded-lg bg-white/5 p-3"><span className="text-white/40 block text-[10px]">Alumnos Activos</span><strong className="text-lg text-[#1abc9c]">48</strong></div>
                  <div className="rounded-lg bg-white/5 p-3"><span className="text-white/40 block text-[10px]">Facturación</span><strong className="text-lg text-emerald-400">1.840 €</strong></div>
                </div>
              </div>
            ) : modalOperar.id === "cobro_seguro" ? (
              <form onSubmit={generarLinkPago} className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider">Generar Enlace de Cobro Stripe</h4>
                <label className="block">
                  <span className="text-white/60">Concepto:</span>
                  <input type="text" value={conceptoCobro} onChange={(e) => setConceptoCobro(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white" />
                </label>
                <label className="block">
                  <span className="text-white/60">Importe (€):</span>
                  <input type="number" value={montoCobro} onChange={(e) => setMontoCobro(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white" />
                </label>
                <button type="submit" className="w-full rounded-lg bg-[#1abc9c] py-2 font-bold text-black hover:bg-[#16a085]">
                  Generar Enlace de Pago Seguro
                </button>
                {urlCobro && (
                  <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <p className="font-bold">Enlace listo para enviar al alumno:</p>
                    <p className="font-mono text-[10px] break-all select-all text-white mt-1">{urlCobro}</p>
                  </div>
                )}
              </form>
            ) : modalOperar.id === "facturacion_automatica" ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                <h4 className="font-bold text-white">Facturas Emitidas Automáticamente</h4>
                <div className="divide-y divide-white/5 rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="py-1.5 flex justify-between"><span>FAC-2026-042 · Ana García</span><span className="font-bold text-white">45,00 € (Emitida)</span></div>
                  <div className="py-1.5 flex justify-between"><span>FAC-2026-041 · Carlos Ruiz</span><span className="font-bold text-white">90,00 € (Emitida)</span></div>
                  <div className="py-1.5 flex justify-between"><span>FAC-2026-040 · Elena Gómez</span><span className="font-bold text-white">45,00 € (Emitida)</span></div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs space-y-2">
                <p className="font-bold text-amber-300">Servicio en preparación técnica</p>
                <p className="text-white/60">La conexión con Meta Graph API para auto-publicación se activa tras conectar tu cuenta profesional en Mis Fuentes.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
