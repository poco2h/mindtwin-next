export type AlumnoResumen = {
  id: string;
  nombre: string;
  idioma: string;
  nivel: string;
  progreso: number;
  proximaSesion: string;
  alertasActivas: number;
  diasSinActividad: number;
  racha: number;
  sesionesTotales: number;
  minutos: { texto: number; voz: number; video: number };
  sesionesSemana: Record<"lun" | "mar" | "mie" | "jue" | "vie", { canal: "T" | "V" | "Vid"; minutos: number } | null>;
};

export type ClienteResumen = AlumnoResumen;

export const PRECIO_MIN: Record<"T" | "V" | "Vid", number> = { T: 0.376, V: 0.746, Vid: 1.166 };

export function minutosMes(c: AlumnoResumen): number {
  return c.minutos.texto + c.minutos.voz + c.minutos.video;
}

export function facturadoMes(c: AlumnoResumen): number {
  return c.minutos.texto * PRECIO_MIN.T + c.minutos.voz * PRECIO_MIN.V + c.minutos.video * PRECIO_MIN.Vid;
}

export const CLIENTES_DEMO: AlumnoResumen[] = [
  {
    id: "a1",
    nombre: "Ana Martínez",
    idioma: "Inglés",
    nivel: "B2 Negocios",
    progreso: 87,
    proximaSesion: "Lun 25 ago · 09:00",
    alertasActivas: 0,
    diasSinActividad: 1,
    racha: 8,
    sesionesTotales: 52,
    minutos: { texto: 40, voz: 30, video: 77 },
    sesionesSemana: {
      lun: { canal: "V", minutos: 20 },
      mar: null,
      mie: { canal: "V", minutos: 15 },
      jue: null,
      vie: { canal: "V", minutos: 22 },
    },
  },
  {
    id: "a2",
    nombre: "Carlos Ruiz",
    idioma: "Francés",
    nivel: "B1 Profesional",
    progreso: 72,
    proximaSesion: "Mar 26 ago · 11:30",
    alertasActivas: 1,
    diasSinActividad: 3,
    racha: 3,
    sesionesTotales: 17,
    minutos: { texto: 30, voz: 20, video: 32 },
    sesionesSemana: {
      lun: { canal: "T", minutos: 30 },
      mar: { canal: "T", minutos: 20 },
      mie: null,
      jue: { canal: "V", minutos: 15 },
      vie: null,
    },
  },
  {
    id: "a3",
    nombre: "Laura Pérez",
    idioma: "Inglés",
    nivel: "C1 Aeronáutico",
    progreso: 94,
    proximaSesion: "Mié 27 ago · 16:00",
    alertasActivas: 0,
    diasSinActividad: 0,
    racha: 12,
    sesionesTotales: 40,
    minutos: { texto: 20, voz: 45, video: 135 },
    sesionesSemana: {
      lun: null,
      mar: { canal: "Vid", minutos: 40 },
      mie: null,
      jue: null,
      vie: { canal: "Vid", minutos: 60 },
    },
  },
  {
    id: "a4",
    nombre: "Miguel García",
    idioma: "Alemán",
    nivel: "A2 Conversación",
    progreso: 48,
    proximaSesion: "Jue 28 ago · 10:00",
    alertasActivas: 2,
    diasSinActividad: 6,
    racha: 1,
    sesionesTotales: 4,
    minutos: { texto: 10, voz: 12, video: 0 },
    sesionesSemana: {
      lun: { canal: "V", minutos: 12 },
      mar: null,
      mie: null,
      jue: null,
      vie: null,
    },
  },
  {
    id: "a5",
    nombre: "Sofía Blanco",
    idioma: "Italiano",
    nivel: "B2 Turismo",
    progreso: 81,
    proximaSesion: "Vie 29 ago · 17:30",
    alertasActivas: 0,
    diasSinActividad: 1,
    racha: 5,
    sesionesTotales: 28,
    minutos: { texto: 15, voz: 18, video: 22 },
    sesionesSemana: {
      lun: { canal: "V", minutos: 8 },
      mar: { canal: "T", minutos: 15 },
      mie: null,
      jue: { canal: "T", minutos: 11 },
      vie: { canal: "Vid", minutos: 22 },
    },
  },
];

export function ordenarClientes(alumnos: AlumnoResumen[]): AlumnoResumen[] {
  return [...alumnos].sort((a, b) => {
    if (a.alertasActivas !== b.alertasActivas) return b.alertasActivas - a.alertasActivas;
    if (a.diasSinActividad !== b.diasSinActividad) return b.diasSinActividad - a.diasSinActividad;
    return b.racha - a.racha;
  });
}
