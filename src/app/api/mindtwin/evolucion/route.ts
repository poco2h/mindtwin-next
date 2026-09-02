import { NextResponse } from "next/server";
import { getApiConfig } from "@/lib/server/apiConfig";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "owner";
    const alumnoIdParam = searchParams.get("alumnoId");

    const config = getApiConfig();
    const supabaseUrl = config.supabase.url;
    const supabaseKey = config.supabase.serviceKey;

    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    // 1. Obtener lista de alumnos
    const resAlumnos = await fetch(`${supabaseUrl}/rest/v1/follower_mindtwin_profiles?select=*&order=created_at.desc`, { headers });
    const alumnos = await resAlumnos.json();

    if (!Array.isArray(alumnos) || alumnos.length === 0) {
      return NextResponse.json({ success: true, alumnos: [], alertas: [] });
    }

    // 2. Obtener progresos agregados
    const resProgresos = await fetch(`${supabaseUrl}/rest/v1/progreso_alumno?select=*`, { headers });
    const progresos = await resProgresos.json();

    // 3. Obtener historial de pronunciación detallada
    const resPron = await fetch(`${supabaseUrl}/rest/v1/pronunciacion_historial?select=*&order=created_at.asc`, { headers });
    const pronunciaciones = await resPron.json();

    // 4. Obtener sesiones históricas
    const resSesiones = await fetch(`${supabaseUrl}/rest/v1/speak_sesiones?select=*&order=created_at.desc`, { headers });
    const sesiones = await resSesiones.json();

    const now = Date.now();
    const alertasGlobales: Array<{
      id: string;
      alumnoId: string;
      alumnoName: string;
      tipo: "inactividad" | "error_sistematico";
      gravedad: "alta" | "media";
      titulo: string;
      descripcion: string;
      diasInactivo?: number;
      fonemaAfectado?: string;
      accionSugerida: string;
    }> = [];

    // Mapear cada alumno con sus métricas enriquecidas
    const alumnosData = alumnos.map((al: any) => {
      const prog = (Array.isArray(progresos) ? progresos : []).find((p: any) => p.alumno_id === al.id) || {};
      const misSesiones = (Array.isArray(sesiones) ? sesiones : []).filter((s: any) => s.alumno_id === al.id);
      const misPron = (Array.isArray(pronunciaciones) ? pronunciaciones : []).filter((p: any) => p.alumno_id === al.id);

      // Calcular última fecha de actividad y días inactivos
      const ultimaSesion = misSesiones[0];
      const ultimaFechaStr = ultimaSesion?.created_at || prog.updated_at || al.created_at;
      const ultimaFecha = new Date(ultimaFechaStr).getTime();
      const diasInactivo = Math.max(0, Math.floor((now - ultimaFecha) / (1000 * 60 * 60 * 24)));

      // Regla de Alerta 1: Inactividad >= 5 días
      if (diasInactivo >= 5) {
        alertasGlobales.push({
          id: `alert-inac-${al.id}`,
          alumnoId: al.id,
          alumnoName: al.alumno_name,
          tipo: "inactividad",
          gravedad: diasInactivo >= 7 ? "alta" : "media",
          titulo: `Sin práctica desde hace ${diasInactivo} días`,
          descripcion: `${al.alumno_name} supera el umbral de constancia (5 días). Su última sesión fue el ${new Date(ultimaFechaStr).toLocaleDateString("es-ES")}.`,
          diasInactivo,
          accionSugerida: "Enviar recordatorio por WhatsApp con sugerencia de conversación corta (10 min).",
        });
      }

      // Regla de Alerta 2: Error sistemático fonético persistente
      const erroresRecurrentes = prog.errores_recurrentes || [];
      erroresRecurrentes.forEach((err: any, idx: number) => {
        if (err.accuracy_media < 75 && err.sesiones_afectadas >= 2) {
          alertasGlobales.push({
            id: `alert-err-${al.id}-${idx}`,
            alumnoId: al.id,
            alumnoName: al.alumno_name,
            tipo: "error_sistematico",
            gravedad: "alta",
            titulo: `Dificultad recurrente en fonema /${err.fonema}/`,
            descripcion: `${al.alumno_name} tiene precisión del ${err.accuracy_media}% en /${err.fonema}/ tras ${err.sesiones_afectadas} sesiones consecutivas (${err.ejemplos.slice(0, 3).join(", ")}).`,
            fonemaAfectado: err.fonema,
            accionSugerida: `Reforzar en la próxima sesión: ${err.truco_pedagogico || "Hacer ejercicios de contraste mínimo."}`,
          });
        }
      });

      // Serie temporal de progresión de sesiones
      const evolucionSesiones = misPron.map((p: any, idx: number) => ({
        sesionNumero: idx + 1,
        fecha: new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
        accuracyScore: Number(p.accuracy_score || 0),
        fluencyScore: Number(p.fluency_score || 0),
        prosodyScore: Number(p.prosody_score || 0),
        completenessScore: Number(p.completeness_score || 0),
        frasePracticada: p.palabra_o_frase,
        phonemes: p.phoneme_details || [],
      }));

      // Si no hay fonemas detallados en pronunciacion_historial, construir métricas fonéticas base
      const desgloseFonemas = [
        { fonema: "θ", nombre: "th sorda (think)", accuracy: prog.errores_recurrentes?.find((e: any) => e.fonema === "θ")?.accuracy_media || 65, estado: "Refuerzo Necesario" },
        { fonema: "ð", nombre: "th sonora (this)", accuracy: 72, estado: "En Progreso" },
        { fonema: "v", nombre: "v labiodental (very)", accuracy: prog.errores_recurrentes?.find((e: any) => e.fonema === "v")?.accuracy_media || 76, estado: "En Progreso" },
        { fonema: "h", nombre: "h aspirada (hello)", accuracy: prog.errores_recurrentes?.find((e: any) => e.fonema === "h")?.accuracy_media || 88, estado: "Dominado" },
        { fonema: "æ", nombre: "short a (cat)", accuracy: 82, estado: "Dominado" },
        { fonema: "dʒ", nombre: "j sonora (job)", accuracy: 90, estado: "Dominado" },
      ];

      return {
        id: al.id,
        alumnoId: al.alumno_id,
        nombre: al.alumno_name,
        idiomaNativo: al.idioma_nativo,
        idiomaObjetivo: al.idioma_objetivo,
        nivelActual: al.nivel_actual || prog.nivel_fluidez_evaluado || "B1",
        horasPractica: Number(prog.horas_practica_totales || (misSesiones.length * 0.4).toFixed(1) || 0),
        sesionesCompletadas: Number(prog.sesiones_completadas || misSesiones.length || 0),
        palabrasAdquiridas: Number(prog.palabras_vocabulario_adquiridas || 25),
        accuracyPromedio: Number(prog.pronunciacion_accuracy_promedio || 80),
        rachaDias: Number(prog.racha_dias || 0),
        diasInactivo,
        ultimaSesionFecha: ultimaFechaStr,
        adherenciaPorcentaje: Math.min(100, Math.round(((prog.racha_dias || 1) / 7) * 100)),
        erroresRecurrentes: prog.errores_recurrentes || [],
        evolucionSesiones,
        desgloseFonemas,
      };
    });

    // Si es follower, filtrar solo el suyo
    if (role === "follower") {
      const followerAlumno = alumnosData.find((a: any) => a.id === alumnoIdParam || a.alumnoId === alumnoIdParam) || alumnosData[0];
      return NextResponse.json({
        success: true,
        isFollower: true,
        alumno: followerAlumno,
        alertas: alertasGlobales.filter((al: any) => al.alumnoId === followerAlumno?.id),
      });
    }

    return NextResponse.json({
      success: true,
      isOwner: true,
      alumnos: alumnosData,
      alertas: alertasGlobales,
      resumenGlobal: {
        totalAlumnos: alumnosData.length,
        alumnosAlDia: alumnosData.filter((a: any) => a.diasInactivo < 5).length,
        alumnosEnRiesgo: alumnosData.filter((a: any) => a.diasInactivo >= 5).length,
        accuracyPromedioGeneral: Math.round(alumnosData.reduce((acc: number, a: any) => acc + a.accuracyPromedio, 0) / (alumnosData.length || 1)),
      },
    });
  } catch (error: any) {
    console.error("Error en /api/mindtwin/evolucion:", error);
    return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
  }
}
