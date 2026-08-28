import pg from 'pg';
const { Pool } = pg;

let pool = null;

export function getDbPool() {
  if (!pool) {
    const dbUrl =
      process.env.SUPABASE_DB_URL ||
      'postgresql://postgres.zbhevbzgbhvalsboobfz:LiliSpeak2026!@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

    pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

/**
 * 1. Asegurar perfiles de Teacher y Alumno y devolver sus UUIDs
 */
export async function asegurarPerfiles({
  ownerId = 'usr_teacher_maria',
  ownerName = 'María López',
  alumnoId = 'usr_alumno_carlos',
  alumnoName = 'Carlos Mendoza',
  idiomaEnsenanza = 'en',
  nivelAlumno = 'B1',
}) {
  const p = getDbPool();

  const tRes = await p.query(
    `INSERT INTO public.teacher_mindtwin_profiles (owner_id, owner_name, idioma_nativo, idiomas_ensenanza, precio_hora_eur)
     VALUES ($1, $2, 'es', ARRAY[$3]::text[], 15.00)
     ON CONFLICT (owner_id) DO UPDATE SET owner_name = EXCLUDED.owner_name
     RETURNING id;`,
    [ownerId, ownerName, idiomaEnsenanza]
  );

  const aRes = await p.query(
    `INSERT INTO public.follower_mindtwin_profiles (alumno_id, alumno_name, idioma_nativo, idioma_objetivo, nivel_actual)
     VALUES ($1, $2, 'es', $3, $4)
     ON CONFLICT (alumno_id) DO UPDATE SET alumno_name = EXCLUDED.alumno_name
     RETURNING id;`,
    [alumnoId, alumnoName, idiomaEnsenanza, nivelAlumno]
  );

  return {
    teacherUuid: tRes.rows[0].id,
    alumnoUuid: aRes.rows[0].id,
  };
}

/**
 * 2. Iniciar sesión en speak_sesiones
 */
export async function iniciarSesionSupabase({
  teacherId,
  alumnoId,
  servicio = 'lenguaje', // 'lenguaje' | 'lenguaje_tecnico' | 'conversacion_terceros'
  canal = 'texto',       // 'texto' | 'voz' | 'video_webrtc'
  modoControl = 'control_a',
}) {
  const p = getDbPool();

  const res = await p.query(
    `INSERT INTO public.speak_sesiones (
       teacher_id, alumno_id, servicio, canal, estado, modo_control_activo
     )
     VALUES ($1, $2, $3, $4, 'en_progreso', $5)
     RETURNING id, created_at;`,
    [teacherId, alumnoId, servicio, canal, modoControl]
  );

  return {
    sesionId: res.rows[0].id,
    createdAt: res.rows[0].created_at,
  };
}

/**
 * 3. Guardar mensaje en speak_mensajes
 */
export async function guardarMensajeSupabase({
  sesionId,
  emisor, // 'alumno' | 'teacher_twin' | 'interlocutor' | 'sistema'
  textoOriginal,
  textoTraducido = null,
  idiomaDetectado = 'en',
  correccionesInline = [],
  notasFoneticas = [],
}) {
  if (!sesionId) return null;
  const p = getDbPool();

  const res = await p.query(
    `INSERT INTO public.speak_mensajes (
       sesion_id, emisor, texto_original, texto_traducido, idioma_detectado, correcciones_inline, notas_foneticas
     )
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
     RETURNING id, created_at;`,
    [
      sesionId,
      emisor,
      textoOriginal,
      textoTraducido,
      idiomaDetectado,
      JSON.stringify(correccionesInline || []),
      JSON.stringify(notasFoneticas || []),
    ]
  );

  return res.rows[0];
}

/**
 * 4. Guardar evaluación fonética en pronunciacion_historial
 */
export async function guardarPronunciacionSupabase({
  sesionId,
  alumnoId,
  palabraOFrase,
  accuracyScore = 0,
  fluencyScore = 0,
  completenessScore = 0,
  prosodyScore = 0,
  phonemeDetails = [],
  tipoError = 'None',
}) {
  if (!sesionId) return null;
  const p = getDbPool();

  const res = await p.query(
    `INSERT INTO public.pronunciacion_historial (
       sesion_id, alumno_id, palabra_o_frase, accuracy_score, fluency_score, completeness_score, prosody_score, phoneme_details, tipo_error
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)
     RETURNING id;`,
    [
      sesionId,
      alumnoId,
      palabraOFrase,
      accuracyScore,
      fluencyScore,
      completenessScore,
      prosodyScore,
      JSON.stringify(phonemeDetails || []),
      tipoError,
    ]
  );

  return res.rows[0];
}

/**
 * 5. Finalizar sesión, guardar summary_report y actualizar progreso del alumno
 */
export async function finalizarSesionSupabase({
  sesionId,
  alumnoId,
  duracionSegundos = 600,
  precioCobradoEur = 2.50,
  pctModoA = 80,
  pctModoB = 20,
  summaryReport = {},
  vocabularioAdquiridoCount = 3,
  promedioAccuracy = 95.0,
}) {
  if (!sesionId) return null;
  const p = getDbPool();

  const minutos = Math.round((duracionSegundos / 60) * 100) / 100;
  const costeLili = Math.round((duracionSegundos / 3600) * 1.5 * 100) / 100;

  // Actualizar sesión
  const sRes = await p.query(
    `UPDATE public.speak_sesiones
     SET estado = 'completada',
         duracion_segundos = $2,
         minutos_facturados = $3,
         coste_lili_eur = $4,
         precio_cobrado_eur = $5,
         pct_modo_a = $6,
         pct_modo_b = $7,
         summary_report = $8::jsonb,
         ended_at = now()
     WHERE id = $1
     RETURNING id, estado, ended_at;`,
    [
      sesionId,
      duracionSegundos,
      minutos,
      costeLili,
      precioCobradoEur,
      pctModoA,
      pctModoB,
      JSON.stringify(summaryReport || {}),
    ]
  );

  // Actualizar progreso acumulado del alumno
  if (alumnoId) {
    await p.query(
      `INSERT INTO public.progreso_alumno (
         alumno_id, idioma, horas_practica_totales, sesiones_completadas, palabras_vocabulario_adquiridas, pronunciacion_accuracy_promedio
       )
       VALUES ($1, 'en', $2, 1, $3, $4)
       ON CONFLICT (alumno_id, idioma) DO UPDATE
       SET horas_practica_totales = public.progreso_alumno.horas_practica_totales + EXCLUDED.horas_practica_totales,
           sesiones_completadas = public.progreso_alumno.sesiones_completadas + 1,
           palabras_vocabulario_adquiridas = public.progreso_alumno.palabras_vocabulario_adquiridas + EXCLUDED.palabras_vocabulario_adquiridas,
           pronunciacion_accuracy_promedio = (public.progreso_alumno.pronunciacion_accuracy_promedio + EXCLUDED.pronunciacion_accuracy_promedio) / 2,
           updated_at = now();`,
      [alumnoId, duracionSegundos / 3600, vocabularioAdquiridoCount, promedioAccuracy]
    );
  }

  return sRes.rows[0];
}
