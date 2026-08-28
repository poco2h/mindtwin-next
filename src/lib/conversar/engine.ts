import { buscarEnCache } from "./cache";
import {
  aplicaGuardrailPrecio,
  esPreguntaDePrecio,
  respuestaBloqueadaPorPrecio,
  type Role,
} from "./guardrails";
import { buscarMencionMarca } from "./marcas";
import type { Marca } from "../marcas/types";
import {
  aplicarExtraccion,
  avanzarProgreso,
  esquemaExtraccion,
  estadoTurno,
  instruccionOnboarding,
  twinVacio,
  type ContextoOnboarding,
} from "./onboarding";
import { leerTwinServer, guardarTwinServer } from "../session/twinProfileServer";
import { resolveFollowerUuid } from "../demo/identities";
import { bloqueTalesPrompt } from "./tales";
import { bloqueContextoFollower } from "./followerContext";
import { llamarGemini, type TurnoHistorial } from "./gemini";

export type { TurnoHistorial };

export type ConversarInput = {
  mensaje: string;
  role: Role;
  ownerName: string;
  ownerId?: string;
  followerId?: string;
  marcas?: Marca[];
  marcaYaMencionada?: boolean;
  sportsContextResumen?: string;
  historial?: TurnoHistorial[];
  idiomaEnsenanza?: string;
  nivelAlumno?: string;
};

export type ConversarOutput = {
  respuesta: string;
  capa: "n2-guardrail" | "n1-cache" | "n3-gemini" | "n3-onboarding" | "n3-fallback";
  marcaMencionada?: string;
  correcciones_inline?: Array<{ original: string; correccion: string; explicacion: string }>;
  nota_fonetica_ipa?: string;
  traduccion_es?: string;
  sugerencia_siguiente?: string;
  indicador_ia?: string;
};

const EU_AI_DISCLAIMER = "Lili Speak Teacher MindTwin · AI Generated Content (EU AI Act Art. 50)";

function systemInstructionOwner(ownerName: string, talesBloque?: string): string {
  const bloqueTales = talesBloque ? `\n\n${talesBloque}` : "";
  return (
    `Eres el Asistente de Configuración y Entrenamiento del Teacher MindTwin de ${ownerName}. ` +
    `Tu objetivo es ayudar al profesor a calibrar su gemelo docente en español: definir su metodología de enseñanza, niveles MCER que imparte (A1-C2), estilo de corrección, fonética y materiales recomendados. ` +
    `Habla en español con tono cercano, respetuoso y profesional.${bloqueTales}`
  );
}

function systemInstructionFollower(
  ownerName: string,
  idiomaEnsenanza: string = "inglés",
  nivelAlumno: string = "B1/B2",
  talesBloque?: string
): string {
  const bloqueTales = talesBloque ? `\n\n${talesBloque}` : "";
  return (
    `Eres el Teacher MindTwin de ${ownerName}, profesor y mentor de ${idiomaEnsenanza} en Lili Speak. ` +
    `Tu misión es enseñar, guiar y conversar con tu alumno (nivel aproximado: ${nivelAlumno}) con la máxima calidez y empatía.\n` +
    `DIRECTRICES DOCENTES:\n` +
    `1. Responde de forma conversacional, cercana y humana (2-4 frases).\n` +
    `2. Habla principalmente en ${idiomaEnsenanza} para propiciar la inmersión, usando español solo cuando sea necesario para explicar matices gramaticales o fonéticos.\n` +
    `3. Si el alumno comete algún error, corrígelo con amabilidad constructiva en el bloque de correcciones.${bloqueTales}`
  );
}

function conMencionMarca(
  respuestaBase: string,
  mensaje: string,
  marcas: Marca[] | undefined,
  yaMencionada: boolean | undefined
): { respuesta: string; marcaMencionada?: string } {
  const mencion = buscarMencionMarca(mensaje, marcas ?? [], !yaMencionada);
  if (!mencion) return { respuesta: respuestaBase };
  return { respuesta: respuestaBase + mencion.texto, marcaMencionada: mencion.marca.id };
}

async function turnoOnboarding(
  input: ConversarInput,
  contexto: ContextoOnboarding,
  followerUuid?: string
): Promise<ConversarOutput | null> {
  const { mensaje, ownerName, ownerId, historial } = input;
  if (!ownerId) return null;

  const twin = await leerTwinServer(ownerId, followerUuid);
  const turno = estadoTurno(twin, contexto);
  if (!turno) return null;

  const instruccion = instruccionOnboarding(turno.sesion, turno.pasoActual, turno.pasoSiguiente);
  const systemInstructionText = contexto === "owner"
    ? `${systemInstructionOwner(ownerName)}\n\n${instruccion}`
    : `${systemInstructionFollower(ownerName)}\n\n${instruccion}`;

  const schema = esquemaExtraccion(turno.pasoActual);
  const generada = await llamarGemini(systemInstructionText, mensaje, historial, schema);
  if (!generada) return null;

  if ("errorApiKeyFalta" in generada) {
    return {
      respuesta: `${ownerName} está terminando de calibrar su Teacher MindTwin. Prueba de nuevo en unos minutos.`,
      capa: "n3-fallback",
      indicador_ia: EU_AI_DISCLAIMER,
    };
  }

  const { texto, extraccion } = generada;
  if (extraccion) {
    const actualizado = aplicarExtraccion(twin, turno.pasoActual, extraccion);
    const completadoPaso = avanzarProgreso(actualizado, turno.sesion, turno.pasoActual);
    await guardarTwinServer(completadoPaso, ownerId, followerUuid);
  }

  return {
    respuesta: texto,
    capa: "n3-onboarding",
    indicador_ia: EU_AI_DISCLAIMER,
  };
}

export async function responderConversar(input: ConversarInput): Promise<ConversarOutput> {
  const {
    mensaje,
    role,
    ownerName,
    ownerId,
    followerId,
    marcas,
    marcaYaMencionada,
    historial,
    idiomaEnsenanza = "inglés",
    nivelAlumno = "B1/B2",
  } = input;

  if (aplicaGuardrailPrecio(role) && esPreguntaDePrecio(mensaje)) {
    return {
      respuesta: respuestaBloqueadaPorPrecio(ownerName),
      capa: "n2-guardrail",
      indicador_ia: EU_AI_DISCLAIMER,
    };
  }

  const cacheHit = buscarEnCache(mensaje);
  if (cacheHit && role === "follower") {
    const { respuesta: respuestaConMarca, marcaMencionada } = conMencionMarca(
      cacheHit.respuesta,
      mensaje,
      marcas,
      marcaYaMencionada
    );
    return {
      respuesta: respuestaConMarca,
      capa: "n1-cache",
      marcaMencionada,
      indicador_ia: EU_AI_DISCLAIMER,
    };
  }

  const followerUuid = followerId ? resolveFollowerUuid(followerId) : undefined;
  const contexto: ContextoOnboarding = role === "owner" ? "owner" : "follower";
  const onboardingOutput = await turnoOnboarding(input, contexto, followerUuid);
  if (onboardingOutput) return onboardingOutput;

  const twin = ownerId ? await leerTwinServer(ownerId) : null;
  const talesBloque = bloqueTalesPrompt(twin, mensaje);

  if (role === "owner") {
    const promptOwner = `${systemInstructionOwner(ownerName, talesBloque)}\nEres el clon en entrenamiento de ${ownerName}. Conversa con el profesor sobre su metodología pedagógica, sus preferencias de enseñanza y la preparación de sus clases. Responde en español con profesionalismo.`;

    try {
      const res = await llamarGemini(promptOwner, mensaje, historial, null);
      if (res && "texto" in res) {
        return {
          respuesta: res.texto,
          capa: "n3-gemini",
          indicador_ia: EU_AI_DISCLAIMER,
        };
      }
    } catch (err) {
      console.error("[Conversar Owner] Error:", err);
    }

    return {
      respuesta: `Hola ${ownerName}. Como tu Teacher MindTwin, estoy listo para calibrar nuevos aspectos de tu metodología o packs didácticos. ¿Qué te gustaría ajustar hoy?`,
      capa: "n3-fallback",
      indicador_ia: EU_AI_DISCLAIMER,
    };
  }

  // Follower (Alumno aprendiendo idioma)
  const contextoFollowerBloque = followerUuid && twin ? bloqueContextoFollower(twin, followerUuid) : "";
  const promptFollower = `${systemInstructionFollower(ownerName, idiomaEnsenanza, nivelAlumno, talesBloque)}${
    contextoFollowerBloque ? `\n\n${contextoFollowerBloque}` : ""
  }\n\nFORMATO DE RESPUESTA:\nResponde de forma estructurada en JSON válido:\n{\n  "respuesta": "Tu mensaje conversacional pedagógico al alumno...",\n  "traduccion_es": "Traducción de apoyo en español si aplica...",\n  "correcciones_inline": [\n    { "original": "error", "correccion": "forma natural correcta", "explicacion": "explicación breve y amable" }\n  ],\n  "nota_fonetica_ipa": "ej: schedule /ˈʃedʒ.uːl/",\n  "sugerencia_siguiente": "Pregunta de seguimiento..."\n}`;

  try {
    const res = await llamarGemini(promptFollower, mensaje, historial, null);
    if (res && "texto" in res) {
      let parsedTexto = res.texto;
      let correcciones: any[] = [];
      let notaFonetica = "";
      let traduccionEs = "";
      let sugerencia = "";

      try {
        const cleaned = res.texto.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
        const obj = JSON.parse(cleaned);
        if (obj.respuesta) {
          parsedTexto = obj.respuesta;
          correcciones = obj.correcciones_inline || obj.correcciones || [];
          notaFonetica = obj.nota_fonetica_ipa || "";
          traduccionEs = obj.traduccion_es || "";
          sugerencia = obj.sugerencia_siguiente || "";
        }
      } catch {
        parsedTexto = res.texto;
      }

      const { respuesta: respuestaConMarca, marcaMencionada } = conMencionMarca(
        parsedTexto,
        mensaje,
        marcas,
        marcaYaMencionada
      );

      return {
        respuesta: respuestaConMarca,
        capa: "n3-gemini",
        marcaMencionada,
        correcciones_inline: correcciones.length > 0 ? correcciones : undefined,
        nota_fonetica_ipa: notaFonetica || undefined,
        traduccion_es: traduccionEs || undefined,
        sugerencia_siguiente: sugerencia || undefined,
        indicador_ia: EU_AI_DISCLAIMER,
      };
    }
  } catch (err) {
    console.error("[Conversar Follower] Error:", err);
  }

  return {
    respuesta: `Hello! That's an interesting topic. Let's keep practicing! How would you describe your goals with languages this month?`,
    capa: "n3-fallback",
    indicador_ia: EU_AI_DISCLAIMER,
  };
}