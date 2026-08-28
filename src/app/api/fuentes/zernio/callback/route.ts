import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { DemoTwin, Sources } from "@/lib/demo/localTwin";

/** Zernio redirige aquí tras el OAuth con ?connected={platform}&accountId=Y&username=Z añadidos a nuestro redirect_url original (que ya llevaba ?ownerId=X). */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const ownerId = params.get("ownerId");
  const plataforma = params.get("connected") as keyof Sources | null;
  const accountId = params.get("accountId");
  const username = params.get("username");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://lili-speak-demo.vercel.app");
  const destino = new URL("/app/fuentes", appUrl);

  const supabase = getSupabaseAdmin();
  if (!supabase || !ownerId || !plataforma || !accountId) {
    destino.searchParams.set("zernio_error", "1");
    return NextResponse.redirect(destino);
  }

  try {
    const { data: teacherExistente } = await supabase
      .from("teacher_mindtwin_profiles")
      .select("id, ego_id")
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (teacherExistente) {
      const egoActual = (teacherExistente.ego_id as Record<string, any>) || {};
      const fuentesActuales = egoActual.sources || {};
      const fuentesDataActuales = egoActual.sources_data || {};

      await supabase
        .from("teacher_mindtwin_profiles")
        .update({
          ego_id: {
            ...egoActual,
            sources: { ...fuentesActuales, [plataforma]: true },
            sources_data: {
              ...fuentesDataActuales,
              [plataforma]: { detalle: username || accountId, conectadoEn: new Date().toISOString() },
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", teacherExistente.id);
    }
  } catch (err) {
    console.error("Error actualizando teacher profile desde Zernio:", err);
  }

  destino.searchParams.set("zernio_conectado", plataforma);
  if (username) destino.searchParams.set("username", encodeURIComponent(username));
  return NextResponse.redirect(destino);
}
