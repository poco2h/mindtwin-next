import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/billing/stripeClient";
import { recargarBolsaMinutos } from "@/lib/billing/wallet";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Canal } from "@/lib/billing/pricing";
import { enviarEmail } from "@/lib/email/send";

/**
 * Webhook de Stripe — fuente de verdad para confirmar pagos reales, nunca el
 * cliente. Verifica la firma con STRIPE_WEBHOOK_SECRET antes de procesar
 * nada. checkout.session.completed:
 * - kind "minutes" -> abona la Bolsa de Minutos del follower.
 * - kind "owner_license" -> marca owners.stripe_conectado = true.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe/webhook no configurado." }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Falta firma de Stripe." }, { status: 400 });
  }

  const rawBody = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json({ error: `Firma inválida: ${String(error)}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      metadata?: Record<string, string>;
      subscription?: string | null;
      customer?: string | null;
    };
    const metadata = session.metadata ?? {};

    if (metadata.kind === "minutes") {
      await recargarBolsaMinutos(
        metadata.followerId,
        metadata.ownerId,
        metadata.canal as Canal,
        Number(metadata.minutos),
        Number(metadata.precioEur),
        "Pago Stripe Checkout"
      );
    } else if (metadata.kind === "owner_license") {
      const supabase = getSupabaseAdmin();
      let ownerEmail = metadata.email;
      let ownerName = "Docente";
      if (supabase && metadata.ownerId) {
        const { data: ownerData } = await supabase
          .from("owners")
          .update({
            stripe_conectado: true,
            stripe_account_id: session.subscription ?? session.customer ?? null,
          })
          .eq("id", metadata.ownerId)
          .select("name, email")
          .single();
        if (ownerData) {
          ownerEmail = ownerData.email || ownerEmail;
          ownerName = ownerData.name || ownerName;
        }
      }
      if (ownerEmail) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        await enviarEmail({
          to: ownerEmail,
          subject: "Confirmación de Suscripción — Acceso a tu MindTwin en Lili Speak",
          html: `<p>Hola ${ownerName},</p><p>Tu pago de suscripción mensual (99€) ha sido confirmado correctamente.</p><p>Ya puedes acceder a tu MindTwin oficial en versión Owner y gestionar tus followers y herramientas desde el siguiente enlace:</p><p><a href="${siteUrl}/app/conversar?owner=${metadata.ownerId}" style="display:inline-block;padding:12px 24px;background:#1abc9c;color:#000;text-decoration:none;font-weight:bold;border-radius:8px;">Acceder a mi Teacher MindTwin →</a></p><p>También puedes iniciar sesión con tu usuario y contraseña en: <a href="${siteUrl}/login">${siteUrl}/login</a></p>`,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
