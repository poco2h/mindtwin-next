"use client";

import { useState } from "react";
import Link from "next/link";

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
    fuenteRequerida: "Instagram Profesional (Conectar en 'Mis Fuentes')",
  },
  {
    id: "publicacion_rrss",
    numero: "02",
    nombre: "Publicación de contenidos RRSS",
    categoria: "Contenido y Redes",
    descripcion: "Programación y auto-publicación directa en tu feed y stories docentes.",
    estado: "en_espera",
    fuenteRequerida: "Instagram Profesional (Conectar en 'Mis Fuentes')",
  },
  {
    id: "respuestas_comentarios_ig",
    numero: "03",
    nombre: "Respuestas a comentarios IG",
    categoria: "Atención y Conversión",
    descripcion: "Respuesta pedagógica y filtro anti-spam a dudas en tus publicaciones de Instagram.",
    estado: "activo",
    fuenteRequerida: "Instagram Profesional (Conectar en 'Mis Fuentes')",
    accionLabel: "Gestionar Comentarios",
  },
  {
    id: "respuestas_dms_ig",
    numero: "04",
    nombre: "Respuestas a DMs IG",
    categoria: "Atención y Conversión",
    descripcion: "Atención automática 24/7 a mensajes directos de alumnos interesados en cursos.",
    estado: "activo",
    fuenteRequerida: "Instagram Profesional (Conectar en 'Mis Fuentes')",
    accionLabel: "Gestionar DMs",
  },
  {
    id: "contestacion_emails",
    numero: "05",
    nombre: "Contestación automática de emails",
    categoria: "Atención y Conversión",
    descripcion: "Borradores pedagógicos y respuestas automáticas a emails de consulta y matrícula.",
    estado: "activo",
    fuenteRequerida: "Gmail / Email (Conectar en 'Mis Fuentes')",
    accionLabel: "Bandeja de Entrada",
  },
  {
    id: "mailing",
    numero: "06",
    nombre: "Envío de emails automatizados (Mailing)",
    categoria: "Marketing y Comunicación",
    descripcion: "Campañas masivas personalizadas con importación nativa de Excel (.xlsx) y plantillas educativas.",
    estado: "activo",
    accionLabel: "Configurar Campaña",
  },
  {
    id: "web_propia",
    numero: "07",
    nombre: "Web propia",
    categoria: "Presencia Digital",
    descripcion: "Tu página académica pública con catálogo de packs, niveles MCER y formulario de inscripción.",
    estado: "activo",
    accionLabel: "Editar Web Docente",
  },
  {
    id: "presencia_directorio",
    numero: "08",
    nombre: "Presencia en Lili Speak (Directorio & Match)",
    categoria: "Presencia Digital",
    descripcion: "Ficha oficial de profesor en el directorio central y motor de búsqueda de alumnos.",
    estado: "activo",
    accionLabel: "Gestionar Ficha",
  },
  {
    id: "captacion_alumnos",
    numero: "09",
    nombre: "Captación de alumnos",
    categoria: "Ventas y Monetización",
    descripcion: "Prospección automática de empresas y centros que demandan formación en idiomas.",
    estado: "activo",
    accionLabel: "Panel de Captación",
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
    accionLabel: "Gestionar Enlaces",
  },
  {
    id: "gestion_alumnos_sesiones",
    numero: "12",
    nombre: "Gestión de alumnos y sesiones",
    categoria: "Operaciones",
    descripcion: "Seguimiento centralizado de matrículas, clases reservadas y sesiones con Teacher MindTwin.",
    estado: "activo",
    accionLabel: "Ver Alumnos y Sesiones",
  },
  {
    id: "resumen_semanal",
    numero: "13",
    nombre: "Resumen semanal",
    categoria: "Analítica",
    descripcion: "Métricas semanales de horas impartidas, nuevos alumnos e interacciones en canales.",
    estado: "activo",
    accionLabel: "Ver Estadísticas",
  },
  {
    id: "cobro_seguro",
    numero: "14",
    nombre: "Cobro seguro",
    categoria: "Finanzas",
    descripcion: "Pasarela de cobro protegida para clases individuales, bonos mensuales y cursos intensivos.",
    estado: "activo",
    accionLabel: "Pasarela de Cobro",
  },
  {
    id: "facturacion_automatica",
    numero: "15",
    nombre: "Facturación automática",
    categoria: "Finanzas",
    descripcion: "Emisión y envío automático de facturas con validez fiscal tras cada pago completado.",
    estado: "activo",
    accionLabel: "Datos Fiscales",
  },
];

export default function MisHerramientas() {
  const [modalActivo, setModalActivo] = useState<ServicioLili | null>(null);
  const [mailingEnviado, setMailingEnviado] = useState(false);

  return (
    <div className="relative mx-auto max-w-6xl space-y-6 pb-12">
      {/* Banner de regla estricta de separación arquitectónica */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Regla de Operación vs. Conexión de Fuentes
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-amber-100/90">
              El onboarding y la conexión de cuentas externas (<strong>Instagram, Gmail/Email, WhatsApp</strong>) se realiza <strong>SIEMPRE en el apartado <Link href="/app/fuentes" className="underline font-bold text-white hover:text-amber-200">"Mis Fuentes"</Link></strong>. 
              El apartado <strong>"Mis Herramientas"</strong> está reservado exclusivamente para <strong>operar, monitorizar y gestionar</strong> las funcionalidades activas de tu intranet.
            </p>
          </div>
        </div>
      </div>

      {/* Cabecera del Centro de Mando de Herramientas (sin botón externo) */}
      <div className="border-b border-white/10 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1abc9c]">
          Lili Speak · Centro de Mando
        </p>
        <h1 className="font-playfair text-3xl font-extrabold text-white">
          Mis Herramientas
        </h1>
        <p className="text-xs text-white/60 mt-1">
          15 servicios de gestión académica, marketing y operaciones integrados directamente en tu MindTwin.
        </p>
      </div>

      {/* Rejilla directa de los 15 Servicios (sin menú de filtros de categorías) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SERVICIOS_INTRANET.map((srv) => (
          <div
            key={srv.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl transition-all hover:border-[#1abc9c]/40 hover:bg-black/60"
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                <span className="font-mono text-xs font-bold text-[#1abc9c]">
                  {srv.numero}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    srv.estado === "activo"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {srv.estado === "activo" ? "Activo" : "En espera"}
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-white group-hover:text-[#1abc9c] transition-colors">
                {srv.nombre}
              </h3>
              <p className="mt-1.5 text-xs text-white/70 leading-relaxed">
                {srv.descripcion}
              </p>

              {srv.fuenteRequerida && (
                <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-2 text-[11px] text-white/50">
                  <span className="font-semibold text-white/70">Fuente: </span>
                  {srv.fuenteRequerida}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                {srv.categoria}
              </span>

              {srv.estado === "activo" ? (
                <button
                  type="button"
                  onClick={() => setModalActivo(srv)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1abc9c] hover:text-black transition-all flex items-center gap-1"
                >
                  <span>{srv.accionLabel || "Operar"}</span>
                  <span className="text-[10px]">⚙️</span>
                </button>
              ) : (
                <span className="text-[11px] italic text-white/30">En pausa técnica</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Operativo In Situ para cada Servicio */}
      {modalActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl border border-[#1abc9c]/30 bg-[#111111] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold text-[#1abc9c]">{modalActivo.numero} · {modalActivo.categoria}</span>
                <h3 className="text-lg font-bold text-white">{modalActivo.nombre}</h3>
              </div>
              <button
                onClick={() => { setModalActivo(null); setMailingEnviado(false); }}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/20 hover:text-white"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-white/80">
              <p className="text-xs text-white/60">{modalActivo.descripcion}</p>

              {modalActivo.id === "mailing" ? (
                <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Campaña de Email Automatizada</h4>
                  <label className="block text-xs">
                    <span className="text-white/60">Asunto del correo:</span>
                    <input type="text" defaultValue="Nuevo Pack de Conversación B2 para Alumnos" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white" />
                  </label>
                  <label className="block text-xs">
                    <span className="text-white/60">Importar lista de alumnos (.xlsx o .csv):</span>
                    <input type="file" accept=".xlsx,.csv" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/80" />
                  </label>
                  <button
                    onClick={() => setMailingEnviado(true)}
                    className="w-full rounded-lg bg-[#1abc9c] py-2 text-xs font-bold text-black hover:bg-[#16a085] transition-colors"
                  >
                    {mailingEnviado ? "✓ Campaña Programada con Éxito" : "Lanzar Campaña"}
                  </button>
                </div>
              ) : modalActivo.id === "gestion_alumnos_sesiones" ? (
                <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
                  <h4 className="font-bold text-white">Alumnos y Clases Activas</h4>
                  <div className="divide-y divide-white/5">
                    <div className="py-2 flex justify-between"><span>Ana García (B2 Speaking)</span><span className="text-[#1abc9c]">Activa · 14.5 h</span></div>
                    <div className="py-2 flex justify-between"><span>Carlos Ruiz (C1 Business)</span><span className="text-[#1abc9c]">Activa · 8.0 h</span></div>
                    <div className="py-2 flex justify-between"><span>Elena Gómez (B1 Inicial)</span><span className="text-[#1abc9c]">Activa · 3.5 h</span></div>
                  </div>
                </div>
              ) : modalActivo.id === "cobro_seguro" ? (
                <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                  <h4 className="font-bold text-white">Pasarela de Cobro Docente</h4>
                  <p className="text-white/60">Configura tarifas por clase de 20, 40 o 60 min y bonos mensuales.</p>
                  <div className="flex items-center justify-between border-t border-white/5 pt-2">
                    <span>Estado Stripe Connect:</span>
                    <span className="font-bold text-emerald-400">● Conectado y Verificado</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                  <p className="font-bold text-white">Panel Operativo Activo</p>
                  <p className="mt-1 text-white/60">Esta herramienta está vinculada a tu Teacher MindTwin y funciona de manera automatizada según las directrices de tu perfil docente.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
