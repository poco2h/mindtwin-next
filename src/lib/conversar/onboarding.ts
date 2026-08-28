import type { LikertItem, Respuestas } from "@/lib/ego/types";
import { SESIONES } from "@/lib/ego/items";
import { calcularEgoId } from "@/lib/ego/scoring";
import { calcularTalesWeights } from "@/lib/ego/talesWeights";
import {
  ONBOARDING_PROGRESS_INICIAL,
  SOURCES_VACIO,
  type DemoTwin,
} from "@/lib/demo/localTwin";

export type PasoLikert = { tipo: "likert"; items: LikertItem[] };
export type PasoPedagogico = { tipo: "pedagogico"; campo: string; pregunta: string };
export type Paso = PasoLikert | PasoPedagogico;

function agruparPorDimension(items: LikertItem[]): LikertItem[][] {
  const porDimension = new Map<string, LikertItem[]>();
  for (const item of items) {
    const grupo = porDimension.get(item.dimension) ?? [];
    grupo.push(item);
    porDimension.set(item.dimension, grupo);
  }
  const grupos = [...porDimension.values()];
  const dimensionesUnicas = grupos.every((g) => g.length === 1);
  if (!dimensionesUnicas) return grupos;

  const bloques: LikertItem[][] = [];
  for (let i = 0; i < items.length; i += 4) bloques.push(items.slice(i, i + 4));
  return bloques;
}

const PREGUNTAS_DOCENTE_S2: Array<{ campo: string; pregunta: string }> = [
  { campo: "idiomas_impartidos", pregunta: "Qué idiomas impartes principalmente (inglés, francés, alemán, español para extranjeros, etc.)" },
  { campo: "niveles_mcer", pregunta: "Qué niveles del MCER trabajas habitualmente con tus alumnos (A1 principiante hasta C2 maestría)" },
  { campo: "especialidades", pregunta: "Tus especialidades docentes (Business English, preparación exámenes oficiales Cambridge/IELTS/TOEFL, conversación, pronunciación, viajes)" },
];

const PREGUNTAS_DOCENTE_S3: Array<{ campo: string; pregunta: string }> = [
  { campo: "estilo_correccion", pregunta: "Cómo prefieres corregir a tus alumnos: corrección inmediata en cada frase, feedback suave al final, o explicaciones fonéticas detalladas" },
  { campo: "enfoque_idioma", pregunta: "Si prefieres que tu gemelo hable 100% en el idioma meta o que use español de apoyo para aclarar dudas gramaticales difíciles" },
];

const PREGUNTAS_DOCENTE_S4: Array<{ campo: string; pregunta: string }> = [
  { campo: "metodologia_propia", pregunta: "Qué metodología o directrices pedagógicas especiales definen tu estilo como profesor" },
  { campo: "materiales_recomendados", pregunta: "Qué libros, ejercicios o recursos sueles recomendar a tus alumnos para que tu MindTwin los prescriba" },
];

export type ContextoOnboarding = "owner" | "follower";

function pasosDeSesion(sesion: "S1" | "S2" | "S3" | "S4", contexto: ContextoOnboarding): Paso[] {
  if (sesion === "S1") {
    return agruparPorDimension(SESIONES.S1).map((items) => ({ tipo: "likert", items }));
  }
  if (sesion === "S2") {
    const likert = agruparPorDimension(SESIONES.S2).map((items): Paso => ({ tipo: "likert", items }));
    if (contexto === "follower") return likert;
    const docente = PREGUNTAS_DOCENTE_S2.map((p): Paso => ({ tipo: "pedagogico", campo: p.campo, pregunta: p.pregunta }));
    return [...likert, ...docente];
  }
  if (sesion === "S3") {
    const likert = agruparPorDimension(SESIONES.S3).map((items): Paso => ({ tipo: "likert", items }));
    if (contexto === "follower") return likert;
    const docente = PREGUNTAS_DOCENTE_S3.map((p): Paso => ({ tipo: "pedagogico", campo: p.campo, pregunta: p.pregunta }));
    return [...likert, ...docente];
  }
  return PREGUNTAS_DOCENTE_S4.map((p): Paso => ({ tipo: "pedagogico", campo: p.campo, pregunta: p.pregunta }));
}

export type EstadoTurno = {
  sesion: "S1" | "S2" | "S3" | "S4";
  pasoActual: Paso | null;
  pasoSiguiente: Paso | null;
};

export function estadoTurno(twin: DemoTwin | null, contexto: ContextoOnboarding): EstadoTurno | null {
  const sesion = (twin?.sesion_actual ?? "S1") as DemoTwin["sesion_actual"];
  if (sesion === "completo") return null;
  if (contexto === "follower" && sesion === "S4") return null;

  const progreso = twin?.onboarding_progress ?? ONBOARDING_PROGRESS_INICIAL;
  const pasos = pasosDeSesion(sesion, contexto);

  if (!progreso.iniciado) {
    return { sesion, pasoActual: null, pasoSiguiente: pasos[0] ?? null };
  }

  const idxActual = progreso.pasoIdx;
  if (idxActual >= pasos.length) return null;

  const pasoActual = pasos[idxActual];
  const idxSiguiente = idxActual + 1;
  const pasoSiguiente = idxSiguiente < pasos.length ? pasos[idxSiguiente] : null;

  return { sesion, pasoActual, pasoSiguiente };
}

function describirPaso(paso: Paso): string {
  if (paso.tipo === "pedagogico") return `- Aspecto pedagógico/docente a explorar: ${paso.pregunta} (guárdalo en el campo "${paso.campo}")`;
  return paso.items.map((i) => `- [ID: ${i.id}] Ítem: "${i.texto}" (escala 1=total desacuerdo a 5=total acuerdo)`).join("\n");
}

export function instruccionOnboarding(
  sesion: "S1" | "S2" | "S3" | "S4",
  pasoActual: Paso | null,
  pasoSiguiente: Paso | null
): string {
  const bloqueActual = pasoActual
    ? `\n\nÍTEMS A EVALUAR CON LA RESPUESTA QUE ACABA DE DAR EL USUARIO:\n${describirPaso(pasoActual)}`
    : "";

  const bloqueSiguiente = pasoSiguiente
    ? `\n\nSIGUIENTE TEMA A PREGUNTAR AL USUARIO (hazlo de forma natural, en una sola frase cercana):\n${describirPaso(pasoSiguiente)}`
    : "\n\nHas completado esta sesión. Agradece al usuario sus respuestas y felicítale por calibrar su perfil docente.";

  return (
    `ESTÁS EN LA SESIÓN DE CALIBRACIÓN DOCENTE ${sesion}.\n` +
    "Tu objetivo es conversar con cercanía y calidez humana.\n" +
    "1. Interpreta la respuesta del usuario para extraer los valores numéricos correspondientes.\n" +
    "2. En la misma intervención, formula la pregunta para el siguiente tema de calibración." +
    bloqueActual +
    bloqueSiguiente
  );
}

export function esquemaExtraccion(pasoActual: Paso | null): Record<string, unknown> | null {
  if (!pasoActual) return null;
  if (pasoActual.tipo === "pedagogico") {
    return {
      type: "OBJECT",
      properties: {
        [pasoActual.campo]: { type: "STRING", description: "Resumen de lo que el docente indicó" },
      },
      required: [pasoActual.campo],
    };
  }
  const properties: Record<string, { type: "INTEGER"; minimum: number; maximum: number }> = {};
  for (const item of pasoActual.items) {
    properties[item.id] = { type: "INTEGER", minimum: 1, maximum: 5 };
  }
  return { type: "OBJECT", properties, required: pasoActual.items.map((i) => i.id) };
}

export function twinVacio(): DemoTwin {
  const ego = calcularEgoId({});
  return {
    ego,
    tales_weights: calcularTalesWeights(ego),
    tales_data: { democrito: 0, socrates: 0, aristoteles: 0, epicuro: 0, platon: 0, seneca: 0, gorgias: 0, heraclito: 0, homero: 0, kant: 0.95 },
    sources: SOURCES_VACIO,
    sesion_actual: "S1",
    direcciones: { domicilioPersonal: "", domicilioProfesional: "" },
    respuestas_raw: {},
    onboarding_progress: { iniciado: true, pasoIdx: 0 },
  };
}

export function aplicarExtraccion(
  twin: DemoTwin | null,
  pasoActual: Paso | null,
  extraccion: Record<string, unknown>
): DemoTwin {
  const base = twin ?? twinVacio();
  if (!pasoActual) return base;

  let respuestas = { ...(base.respuestas_raw ?? {}) };

  if (pasoActual.tipo === "likert") {
    for (const item of pasoActual.items) {
      const v = Number(extraccion[item.id]);
      if (Number.isFinite(v) && v >= 1 && v <= 5) respuestas[item.id] = Math.round(v);
    }
  }

  const ego = calcularEgoId(respuestas);
  const tales_weights = calcularTalesWeights(ego);

  return {
    ...base,
    respuestas_raw: respuestas,
    ego,
    tales_weights,
  };
}

export function avanzarProgreso(
  twin: DemoTwin,
  sesion: "S1" | "S2" | "S3" | "S4",
  pasoActual: Paso | null
): DemoTwin {
  const progreso = twin.onboarding_progress ?? ONBOARDING_PROGRESS_INICIAL;
  const pasos = pasosDeSesion(sesion, "owner");
  const siguienteIdx = (progreso.iniciado ? progreso.pasoIdx : -1) + 1;

  if (siguienteIdx >= pasos.length) {
    const orden: Array<DemoTwin["sesion_actual"]> = ["S1", "S2", "S3", "S4", "completo"];
    const sesionIdx = orden.indexOf(sesion);
    const siguienteSesion = orden[sesionIdx + 1] ?? "completo";
    return {
      ...twin,
      sesion_actual: siguienteSesion,
      onboarding_progress: { iniciado: false, pasoIdx: 0 },
    };
  }

  return {
    ...twin,
    onboarding_progress: { iniciado: true, pasoIdx: siguienteIdx },
  };
}