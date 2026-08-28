export type CategoriaMarca =
  | "educacion" | "libros" | "software" | "tecnologia" | "lifestyle";

export type Marca = {
  id: string;
  nombre: string;
  categoria: CategoriaMarca;
  descripcion: string;
  logoUrl: string | null;
  affiliateLink: string;
  promoCode: string | null;
  activaConversaciones: boolean;
  comisionPct: number | null;
};

/** Keywords que activan la mención orgánica de una marca por categoría */
export const KEYWORDS_CATEGORIA: Record<CategoriaMarca, string[]> = {
  educacion: ["curso", "clase", "aprender", "estudio", "idioma"],
  libros: ["libro", "lectura", "gramática", "diccionario"],
  software: ["app", "software", "traductor", "herramienta"],
  tecnologia: ["auriculares", "micrófono", "audio"],
  lifestyle: ["rutina", "hábito", "estilo de vida"],
};
