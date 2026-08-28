"use server";

import { enviarEmail } from "@/lib/email/send";
import type { ItemAgenda } from "@/lib/habitos/data";

export async function enviarAgendaAlProfesional(emailProfesional: string, agenda: ItemAgenda[]) {
  const filas = agenda
    .map(
      (i) =>
        `<tr><td>${i.dia}</td><td>${i.momento}</td><td>${i.tipo}</td><td>${i.ejercicio}</td></tr>`
    )
    .join("");

  return enviarEmail({
    to: emailProfesional,
    subject: "Agenda pedagógica semanal — Lili Speak MindTwin",
    html: `<h2>Agenda semanal de idiomas</h2><table border="1" cellpadding="6"><tr><th>Día</th><th>Horario</th><th>Tipo</th><th>Sesión</th></tr>${filas}</table>`,
  });
}
