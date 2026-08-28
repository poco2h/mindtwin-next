"use client";

export type HabitoDocente = {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
};

export const HABITOS_IDIOMAS: HabitoDocente[] = [
  { id: "h1", nombre: "Práctica de Listening activa (15 min)", descripcion: "Escucha de audios nativos y podcasts adaptados al nivel MCER.", categoria: "Comprensión" },
  { id: "h2", nombre: "Lectura y nuevo vocabulario (5 palabras/día)", descripcion: "Incorporación y repaso espaciado de léxico clave.", categoria: "Vocabulario" },
  { id: "h3", nombre: "Conversación guiada con Teacher MindTwin (20 min)", descripcion: "Práctica de fluidez oral y corrección fonética en tiempo real.", categoria: "Speaking" },
  { id: "h4", nombre: "Simulación de situaciones reales / Roleplay", descripcion: "Entrevistas de trabajo, viajes y reuniones en inglés.", categoria: "Inmersión" },
];

export const MI_SCHOOL = [
  {
    pregunta: "¿Qué es el Teacher MindTwin?",
    respuesta: "Es el gemelo cerebral pedagógico de tu profesor de idiomas, entrenado con su metodología docente, tono, criterio de corrección y voz real para que puedas practicar 24/7 sin barreras de agenda.",
  },
  {
    pregunta: "¿Qué es el EGO ID Pedagógico?",
    respuesta: "El perfil que define la personalidad docente de tu profesor: paciencia, empatía, enfoque comunicativo, rigor en la corrección y modulación mediante las 10 lentes de TALES.",
  },
  {
    pregunta: "Mis Conversaciones — ¿cómo funciona?",
    respuesta: "Es el espacio de práctica lingüística en texto, voz y videollamada. Como alumno, recibes feedback inmediato: correcciones de frases, pronunciación fonética IPA y notas pedagógicas en español de apoyo.",
  },
  {
    pregunta: "¿Cómo se estructuran los Niveles MCER?",
    respuesta: "Tu Teacher MindTwin adapta automáticamente el vocabulario, la velocidad y la complejidad de las frases según tu nivel: desde A1 (principiante) hasta C2 (maestría).",
  },
  {
    pregunta: "Mis Fuentes — ¿qué representa?",
    respuesta: "Todo el conocimiento que alimenta al MindTwin: guías docentes, audios de clase, documentos de gramática y conexiones con plataformas profesionales.",
  },
  {
    pregunta: "Mis Herramientas — ¿para qué sirve?",
    respuesta: "Centro de control exclusivo para profesores donde gestionar sus 15 servicios académicos: campañas de mailing a alumnos, control de clases y sesiones, cobros y presencia digital.",
  },
];

export const MI_SCHOOL_FOLLOWER = [
  {
    pregunta: "¿Cómo practico con mi profesor?",
    respuesta: "Entra en 'Mis Conversaciones' y escribe o habla por el micrófono. Tu Teacher MindTwin te responderá con su voz y corregirá tus errores amablemente.",
  },
  {
    pregunta: "¿Cómo se mide mi progreso?",
    respuesta: "A través del MindScore y las autoevaluaciones de fluidez, vocabulario incorporado y horas acumuladas de práctica conversacional.",
  },
  {
    pregunta: "¿Qué incluye mi bolsa de minutos?",
    respuesta: "Los minutos contratados para hablar y practicar con el gemelo de tu profesor. Puedes recargar cuando lo necesites.",
  },
];

export const DEPORTES = ["Inglés General", "Business English", "Preparación Cambridge/IELTS", "Pronunciación & Fonética"];
export const RESTAURANTES = [];
export const HABITOS_POR_DEPORTE = {};
export const HABITOS_MICROBIOMA = [];

export function generarAgendaFallback() {
  return [];
}
