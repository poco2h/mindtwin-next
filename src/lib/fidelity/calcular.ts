import type { TwinProfile } from "@/lib/types/twinProfile";

const TECHO = 0.95;

export function calcularFidelidad(profile: TwinProfile): number {
  let f = 0;
  const s = profile.onboarding_status.sesion_actual;
  if (s === "S1") f = 0.65;
  else if (s === "S2") f = 0.82;
  else if (s === "S3" || s === "completo") f = 0.87;

  if (profile.sources.google) f += 0.04 + 0.03 + 0.03; // YouTube+Drive+Gmail vía OAuth único
  if (profile.sources.instagram) f += 0.02;
  if (profile.sources.tiktok) f += 0.03;
  if (profile.sources.whatsapp) f += 0.04;
  if (profile.sources.wearables) f += 0.01;

  return Math.min(f, TECHO);
}
