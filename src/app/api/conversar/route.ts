import { NextRequest, NextResponse } from "next/server";
import { responderConversar } from "@/lib/conversar/engine";
import type { Role } from "@/lib/conversar/guardrails";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const mensaje = String(body?.mensaje ?? "").slice(0, 2000);
  const role: Role = body?.role === "owner" ? "owner" : "follower";
  const ownerName = String(body?.ownerName ?? "tu profesor");
  const ownerId = body?.ownerId ? String(body.ownerId) : undefined;
  const followerId = body?.followerId ? String(body.followerId) : undefined;
  const marcas = Array.isArray(body?.marcas) ? body.marcas : [];
  const marcaYaMencionada = Boolean(body?.marcaYaMencionada);
  const historial = Array.isArray(body?.historial) ? body.historial : undefined;
  const idiomaEnsenanza = String(body?.idiomaEnsenanza ?? "inglés");
  const nivelAlumno = String(body?.nivelAlumno ?? "B1/B2");

  if (!mensaje.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  const resultado = await responderConversar({
    mensaje,
    role,
    ownerName,
    ownerId,
    followerId,
    marcas,
    marcaYaMencionada,
    historial,
    idiomaEnsenanza,
    nivelAlumno,
  });
  return NextResponse.json(resultado);
}
