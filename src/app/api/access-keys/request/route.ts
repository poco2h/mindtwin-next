import { NextRequest, NextResponse } from "next/server";
import { emitirClaveAcceso } from "@/lib/access/accessKeys";
import { enviarEmail } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nombre = String(body?.nombre ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const especialidad = String(body?.especialidad ?? "").trim();
    const colegiado = String(body?.colegiado ?? "").trim();

    if (!nombre || !email || !especialidad) {
      return NextResponse.json({ error: "Faltan campos obligatorios (nombre, email, especialidad)." }, { status: 400 });
    }

    const record = await emitirClaveAcceso(email);

    const emailResult = await enviarEmail({
      to: email,
      subject: "Tu clave de acceso profesional — MindTwins · Lili Speak",
      html: `<p>Hola ${nombre},</p><p>Hemos validado tu solicitud como profesor de ${especialidad}${colegiado ? ` (${colegiado})` : ""}.</p><p>Tu clave de acceso de un solo uso (válida 72 horas) es:</p><p style="font-size:20px;font-weight:bold;letter-spacing:1px;">${record.accessKey}</p><p>Introdúcela en la pantalla de activación de tu cuenta docente para continuar.</p>`,
    });

    return NextResponse.json({
      ok: true,
      simulated: emailResult.simulado,
      expiresAt: record.expiresAt,
      accessKey: emailResult.simulado ? record.accessKey : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: "Error generando clave de acceso", details: String(error) }, { status: 500 });
  }
}
