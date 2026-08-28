import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { DemoTwin } from "@/lib/demo/localTwin";

/** Google redirige aquí tras el consentimiento con ?code=&state={ownerId}. Intercambia el code por tokens y guarda el email conectado. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const code = params.get("code");
  const ownerId = params.get("state");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://lili-speak-demo.vercel.app");
  const destino = new URL("/app/fuentes", appUrl);

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GMAIL_API_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GMAIL_API_CLIENT_SECRET;
  const supabase = getSupabaseAdmin();
  if (!supabase || !code || !ownerId || !clientId || !clientSecret) {
    destino.searchParams.set("google_error", "1");
    return NextResponse.redirect(destino);
  }

  const redirectUri = `${appUrl}/api/fuentes/google/callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    destino.searchParams.set("google_error", "1");
    return NextResponse.redirect(destino);
  }
  const tokens = await tokenRes.json();

  let email = "";
  try {
    const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const info = await infoRes.json();
    email = info.email ?? "";
  } catch {
    // sigue sin email — se guarda la conexión igualmente
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
            sources: { ...fuentesActuales, google: true },
            sources_data: {
              ...fuentesDataActuales,
              google: { detalle: email || "Cuenta de Google conectada (YouTube, Drive, Gmail)", conectadoEn: new Date().toISOString() },
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", teacherExistente.id);
    }
  } catch (err) {
    console.error("Error actualizando teacher profile:", err);
  }

  destino.searchParams.set("google_conectado", "1");
  destino.searchParams.set("email", encodeURIComponent(email));
  return NextResponse.redirect(destino);
}
