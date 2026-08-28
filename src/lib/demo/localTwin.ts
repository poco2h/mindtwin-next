import type { EgoId, Respuestas } from "@/lib/ego/types";
import type { Filosofo } from "@/lib/ego/talesWeights";
import type { GutData } from "@/lib/gut/types";
import type { RespuestasBaseline } from "@/lib/gut/baseline";

export type Sources = {
  google: boolean;
  instagram: boolean;
  tiktok: boolean;
  whatsapp: boolean;
  wearables: boolean;
};

export const SOURCES_VACIO: Sources = {
  google: false,
  instagram: false,
  tiktok: false,
  whatsapp: false,
  wearables: false,
};

export type Direcciones = {
  domicilioPersonal: string;
  domicilioProfesional: string;
};

export const DIRECCIONES_VACIAS: Direcciones = { domicilioPersonal: "", domicilioProfesional: "" };

export type SportsProfile = {
  deporte?: string;
  nivel?: string;
  objetivo?: string;
  frecuenciaActual?: string;
  frecuenciaObjetivo?: string;
  lesiones?: string;
  edad?: string;
  altura?: string;
  peso?: string;
  pesoObjetivo?: string;
  grasaEstimada?: string;
  restricciones?: string;
};

export const SPORTS_PROFILE_VACIO: SportsProfile = {};

export type OnboardingProgress = {
  iniciado: boolean;
  pasoIdx: number;
};

export const ONBOARDING_PROGRESS_INICIAL: OnboardingProgress = { iniciado: false, pasoIdx: 0 };

export type ConexionFuente = {
  detalle: string;
  fileUrl?: string;
  conectadoEn: string;
};

export type Recordatorio = {
  id: string;
  habito: string;
  frecuenciaDias: number;
  hora: string;
  canal: "email" | "whatsapp" | "ambos";
  telefono?: string;
  ultimoEnvioWhatsapp?: string;
};

export type ConstanciaVertical = "deporte" | "idiomas" | "adicciones" | "nutricion" | "coaching" | "otro";
export type ConstanciaMotivoAbandono = "estres_laboral" | "viaje" | "exito_repentino" | "lesion" | "otro";

export type ConstanciaCheckin = { fecha: string };
export type ConstanciaMicroCompromiso = { texto: string; fecha: string };
export type ConstanciaEpisodioAbandono = { fecha: string; motivo: ConstanciaMotivoAbandono };
export type ConstanciaMensaje = { who: "gemelo" | "follower"; texto: string; fecha: string };

export type ConstanciaState = {
  habitoVertical?: ConstanciaVertical;
  habitoEspecifico?: string;
  checkins: ConstanciaCheckin[];
  microCompromisos: ConstanciaMicroCompromiso[];
  episodiosAbandono: ConstanciaEpisodioAbandono[];
  ultimaAutoevaluacionScore?: number;
  ultimaAutoevaluacionFecha?: string;
  mensajes: ConstanciaMensaje[];
  flagAlerta?: boolean;
};

export const CONSTANCIA_VACIA: ConstanciaState = {
  checkins: [],
  microCompromisos: [],
  episodiosAbandono: [],
  mensajes: [],
};

export type DemoTwin = {
  ego: EgoId;
  tales_weights: Record<Filosofo, number>;
  gut: GutData;
  tales_data: Record<Filosofo, number>;
  sources: Sources;
  sesion_actual: "S1" | "S2" | "S3" | "S4" | "completo";
  direcciones: Direcciones;
  respuestas_raw?: Respuestas;
  gut_respuestas_raw?: RespuestasBaseline;
  onboarding_progress?: OnboardingProgress;
  sports_profile?: SportsProfile;
  avatar_video_url?: string;
  sources_data?: Partial<Record<keyof Sources, ConexionFuente>>;
  recordatorios?: Recordatorio[];
  constancia?: ConstanciaState;
};

export const DEMO_TWIN_DEFAULT: DemoTwin = {
  ego: {
    big_five: { O: 85, C: 90, E: 80, A: 95, N: 20 },
    eneagrama: { tipo: 2, ala: 1, scores: { 1: 75, 2: 95, 3: 60, 4: 50, 5: 70, 6: 65, 7: 80, 8: 55, 9: 65 } },
    apego: "seguro",
    rfq: "promocion",
    teique: { ie_global: 88, bienestar: 90, autocontrol: 85, emocionalidad: 88, sociabilidad: 85 },
    via_top5: ["Amor por aprender", "Juicio", "Curiosidad", "Perspectiva", "Honestidad"],
    indices: { IR: 85, IA: 80, IEj: 88, IC: 90 },
    serialized: "EGO_DEMO_JUAN_MOLL",
  },
  tales_weights: {
    democrito: 0.7,
    socrates: 0.9,
    aristoteles: 0.85,
    epicuro: 0.8,
    platon: 0.75,
    seneca: 0.8,
    gorgias: 0.9,
    heraclito: 0.7,
    homero: 0.85,
    kant: 0.95,
  },
  tales_data: {
    democrito: 0.7,
    socrates: 0.9,
    aristoteles: 0.85,
    epicuro: 0.8,
    platon: 0.75,
    seneca: 0.8,
    gorgias: 0.9,
    heraclito: 0.7,
    homero: 0.85,
    kant: 0.95,
  },
  gut: {
    microbioma: "equilibrado",
    diversidad: 0.85,
    ejeIntestinoCerebro: 0.9,
    gut_baseline_score: 850,
    bacterias_dominantes: ["Lactobacillus", "Bifidobacterium", "Faecalibacterium"],
  },
  sources: {
    google: true,
    instagram: true,
    tiktok: false,
    whatsapp: true,
    wearables: true,
  },
  sesion_actual: "completo",
  direcciones: { domicilioPersonal: "Valencia, España", domicilioProfesional: "Lili Speak Academy" },
};

const KEY = "mindtwin_demo_profile";

export function guardarDemoTwin(twin: DemoTwin) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(twin));
}

export function actualizarSources(patch: Partial<Sources>): DemoTwin | null {
  const actual = leerDemoTwin();
  if (!actual) return null;
  const actualizado = { ...actual, sources: { ...actual.sources, ...patch } };
  guardarDemoTwin(actualizado);
  return actualizado;
}

export function leerDemoTwin(): DemoTwin | null {
  if (typeof window === "undefined") return DEMO_TWIN_DEFAULT;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    guardarDemoTwin(DEMO_TWIN_DEFAULT);
    return DEMO_TWIN_DEFAULT;
  }
  try {
    const parsed = JSON.parse(raw) as DemoTwin;
    return parsed.ego?.big_five?.O ? parsed : DEMO_TWIN_DEFAULT;
  } catch {
    return DEMO_TWIN_DEFAULT;
  }
}
