"use client";

import { useEffect, useState } from "react";
import { useTwin } from "@/lib/session/useTwin";
import Link from "next/link";

type FollowerResumen = {
  id: string;
  label: string;
  email?: string;
  createdAt: string;
  sesionActual: string;
  nivelMCER?: string;
  mindscore: number | null;
  horasPractica?: number;
};

const FOLLOWERS_DEMO: FollowerResumen[] = [
  {
    id: "fol_01",
    label: "Ana García",
    email: "ana.garcia@gmail.com",
    createdAt: "2026-08-15T10:30:00Z",
    sesionActual: "Sesión 3 · Práctica Fluidez",
    nivelMCER: "B2 · Cambridge",
    mindscore: 92,
    horasPractica: 14.5,
  },
  {
    id: "fol_02",
    label: "Carlos Ruiz",
    email: "carlos.ruiz@empresa.es",
    createdAt: "2026-08-20T14:15:00Z",
    sesionActual: "Sesión 2 · Business English",
    nivelMCER: "C1 · Negocios",
    mindscore: 88,
    horasPractica: 8.0,
  },
  {
    id: "fol_03",
    label: "Elena Gómez",
    email: "elena.gomez@yahoo.es",
    createdAt: "2026-08-24T09:00:00Z",
    sesionActual: "Sesión 1 · Diagnóstico Inicial",
    nivelMCER: "B1 · Intermedio",
    mindscore: 75,
    horasPractica: 3.5,
  },
];

export default function MisFollowers() {
  const { ownerId } = useTwin();
  const [followers, setFollowers] = useState<FollowerResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    const fetchId = ownerId || "demo_owner";
    fetch(`/api/followers/listar?ownerId=${encodeURIComponent(fetchId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!activo) return;
        if (d.followers && d.followers.length > 0) {
          setFollowers(d.followers);
        } else {
          setFollowers(FOLLOWERS_DEMO);
        }
      })
      .catch(() => {
        if (activo) setFollowers(FOLLOWERS_DEMO);
      });
    return () => {
      activo = false;
    };
  }, [ownerId]);

  const lista = followers ?? FOLLOWERS_DEMO;

  return (
    <div className="relative mx-auto max-w-5xl space-y-6 pb-12">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#1abc9c]">
            Gestión Docente
          </p>
          <h2 className="font-playfair text-2xl font-bold text-white">
            Mis Alumnos
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Alumnos que conversan, practican y aprenden con tu Teacher MindTwin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
            <span className="text-xl font-bold text-white">{lista.length}</span>
            <span className="block text-[9px] uppercase tracking-wider text-white/40">Alumnos Activos</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
            <span className="text-xl font-bold text-[#1abc9c]">26 h</span>
            <span className="block text-[9px] uppercase tracking-wider text-white/40">Práctica Total</span>
          </div>
        </div>
      </div>

      {/* Tabla de Alumnos */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
                <th className="py-3 px-3 font-semibold">Alumno</th>
                <th className="py-3 px-3 font-semibold">Nivel MCER</th>
                <th className="py-3 px-3 font-semibold">Sesión Actual</th>
                <th className="py-3 px-3 font-semibold">Fecha de Alta</th>
                <th className="py-3 px-3 text-right font-semibold">Mindscore</th>
                <th className="py-3 px-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((f) => (
                <tr key={f.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white">{f.label}</div>
                    {f.email && <div className="text-xs text-white/40">{f.email}</div>}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-300 border border-blue-500/20">
                      {f.nivelMCER || "B1/B2"}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-white/80">{f.sesionActual}</td>
                  <td className="py-3.5 px-3 text-xs text-white/50">
                    {new Date(f.createdAt).toLocaleDateString("es-ES")}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#1abc9c]">
                    {f.mindscore != null ? `${f.mindscore}%` : "—"}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      href={`/app/conversar?role=follower&followerId=${f.id}`}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#1abc9c] hover:text-black transition-all"
                    >
                      Ver Versión Follower →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
