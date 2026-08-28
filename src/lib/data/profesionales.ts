export type Profesional = {
  slug: string;
  nombre: string;
  especialidad: string;
  ciudad: string;
  bio: string;
  precioTextoMin: number;
};

export const PROFESIONALES: Profesional[] = [
  {
    slug: "maria-lopez",
    nombre: "María López",
    especialidad: "Profesora de Inglés C2",
    ciudad: "Madrid",
    bio: "Especializada en preparación de exámenes oficiales C1/C2 y fluidez profesional.",
    precioTextoMin: 2.83,
  },
  {
    slug: "laura-garcia",
    nombre: "Laura García",
    especialidad: "Docente de Francés & Fonética",
    ciudad: "Barcelona",
    bio: "Clases dinámicas de conversación y corrección fonética personalizada.",
    precioTextoMin: 2.9,
  },
  {
    slug: "carlos-ruiz",
    nombre: "Carlos Ruiz",
    especialidad: "Profesor de Alemán Técnico",
    ciudad: "Valencia",
    bio: "Alemán para ingenieros y profesionales de la salud con metodología práctica.",
    precioTextoMin: 2.75,
  },
  {
    slug: "ana-torres",
    nombre: "Ana Torres",
    especialidad: "Profesora de Italiano & Cultura",
    ciudad: "Madrid",
    bio: "Inmersión conversacional y vocabulario para viajes, negocios y vida profesional.",
    precioTextoMin: 2.95,
  },
];
