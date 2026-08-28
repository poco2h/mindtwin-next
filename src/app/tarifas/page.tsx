"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";

export default function TarifasPage() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Sliders state
  const [numAlumnos, setNumAlumnos] = useState(10);
  const [horasMes, setHorasMes] = useState(8);
  const [precioHora, setPrecioHora] = useState(20);

  // Cálculos económicos reales (Arquitectura Sección 07: Coste fijo Lili = 6 €/hora)
  const COSTE_FIJO_LILI_HORA = 6;
  const horasTotalesMes = numAlumnos * horasMes;
  const ingresosBrutos = horasTotalesMes * precioHora;
  const costeLili = horasTotalesMes * COSTE_FIJO_LILI_HORA;
  const margenNeto = ingresosBrutos - costeLili;
  const porcentajeMargen = precioHora > 0 ? Math.round(((precioHora - COSTE_FIJO_LILI_HORA) / precioHora) * 100) : 0;

  return (
    <div className="mt-landing min-h-screen bg-white text-black">
      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-black/10 bg-white/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={30} />
            <div>
              <div className="text-[12px] font-bold tracking-tight text-black">MINDTWINS · LILI SPEAK</div>
              <div className="text-[9px] leading-tight text-[rgb(99,99,99)] uppercase">Para profesores de idiomas</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-[11px] text-[rgb(99,99,99)]">
            <Link href="/#school" className="hover:text-black">Cómo funciona</Link>
            <Link href="/tarifas" className="font-bold text-black border-b border-black pb-0.5">Tarifas</Link>
            <Link href="/#canales" className="hover:text-black">Canales</Link>
            <Link href="/app/conversar" className="font-bold text-[#1abc9c] hover:text-black">Demo</Link>
            <Link href="/profesionales" className="hover:text-black">Para profesores</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/profesionales/contratar"
              className="hidden rounded-full bg-black px-[24px] py-[10px] text-[10px] font-semibold text-white hover:bg-[#1abc9c] transition-colors md:inline-block uppercase tracking-wider"
            >
              Crear mi Teacher MindTwin
            </Link>
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              aria-label="Abrir menú"
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg border border-black/15 md:hidden"
            >
              <span className="h-[1.5px] w-5 bg-black" />
              <span className="h-[1.5px] w-5 bg-black" />
              <span className="h-[1.5px] w-5 bg-black" />
            </button>
          </div>
        </div>
        {menuAbierto && (
          <nav className="mt-3 flex flex-col gap-4 border-t border-black/10 pt-3 text-sm md:hidden">
            <Link href="/#school" onClick={() => setMenuAbierto(false)} className="text-black/70">Cómo funciona</Link>
            <Link href="/tarifas" onClick={() => setMenuAbierto(false)} className="font-bold text-black">Tarifas</Link>
            <Link href="/#canales" onClick={() => setMenuAbierto(false)} className="text-black/70">Canales</Link>
            <Link href="/app/conversar" onClick={() => setMenuAbierto(false)} className="font-bold text-[#1abc9c]">Demo</Link>
            <Link href="/profesionales" onClick={() => setMenuAbierto(false)} className="text-black/70">Para profesores</Link>
            <Link
              href="/profesionales/contratar"
              onClick={() => setMenuAbierto(false)}
              className="rounded-full bg-black px-[30px] py-[13px] text-center text-[11px] font-semibold text-white uppercase tracking-wider"
            >
              Crear mi Teacher MindTwin
            </Link>
          </nav>
        )}
      </header>

      <main className="pt-28 pb-24">
        {/* SECCIÓN 1: CABECERA */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[rgb(99,99,99)] mb-4">
              Tu modelo de negocio
            </p>
            <h1 className="font-serif text-[48px] leading-[1.05] font-normal text-black md:text-[64px]">
              Más alumnos.
              <br />
              <em className="font-normal italic text-[rgb(99,99,99)]">Sin más horas.</em>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[15px] font-light leading-relaxed text-[rgb(99,99,99)]">
              Monetiza el conocimiento de tus clases con tu gemelo cerebral. Configuras tu precio por hora, Lili gestiona la tecnología a coste fijo y tú te llevas el margen neto íntegro.
            </p>
          </div>
        </section>

        {/* SECCIÓN 2: TABLA COMPARATIVA */}
        <section className="px-6 py-10">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              {/* COLUMNA 1: LO QUE PAGAS */}
              <div className="rounded-2xl border border-black/10 bg-[#fafafa] p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[rgb(99,99,99)] mb-6">
                  Lo que pagas
                </p>
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-black/5 pb-4">
                    <span className="text-sm font-light text-black/70">Licencia mensual LS Speak</span>
                    <span className="font-semibold text-black text-sm">Fija</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-black/5 pb-4">
                    <span className="text-sm font-light text-black/70">Permanencia</span>
                    <span className="font-semibold text-black text-sm">Ninguna</span>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-sm font-light text-black/70">Coste de servidor / IA</span>
                    <span className="font-semibold text-black text-sm">6 € / hora activa</span>
                  </div>
                </div>
              </div>

              {/* COLUMNA 2: LO QUE COBRAS */}
              <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1abc9c] mb-6">
                  Lo que cobras
                </p>
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-black/5 pb-4">
                    <span className="text-sm font-light text-black/70">Precio por hora</span>
                    <span className="font-semibold text-black text-sm">Tú lo fijas</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-black/5 pb-4">
                    <span className="text-sm font-light text-black/70">Alumnos simultáneos</span>
                    <span className="font-semibold text-black text-sm">Sin límite</span>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-sm font-light text-black/70">Disponibilidad</span>
                    <span className="font-semibold text-black text-sm">24/7 · 365</span>
                  </div>
                </div>
              </div>
            </div>

            {/* EJEMPLO DESTACADO */}
            <div className="mt-8 rounded-2xl border border-black/10 bg-black p-6 text-center text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#1abc9c] mb-2">
                Ejemplo práctico
              </p>
              <p className="font-serif text-lg md:text-xl font-normal">
                10 alumnos × 8 h/mes × 20 € = <strong className="font-bold text-white">1.600 €/mes</strong> en ingresos pasivos
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: CALCULADORA INTERACTIVA */}
        <section className="px-6 py-14">
          <div className="mx-auto max-w-5xl rounded-3xl border border-black/10 bg-[#fafafa] p-8 md:p-12 shadow-sm">
            <div className="text-center mb-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[rgb(99,99,99)] mb-2">
                Calculadora de ingresos docentes
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-black font-normal">
                Calcula tu beneficio mensual con Lili Speak
              </h2>
            </div>

            {/* 3 SLIDERS */}
            <div className="grid gap-8 md:grid-cols-3">
              {/* SLIDER 1 */}
              <div className="bg-white p-6 rounded-2xl border border-black/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(99,99,99)]">
                    Nº de alumnos
                  </span>
                  <span className="text-xl font-bold text-black">{numAlumnos}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={numAlumnos}
                  onChange={(e) => setNumAlumnos(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer h-2 bg-black/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-black/40 mt-2">
                  <span>1 alumno</span>
                  <span>50 alumnos</span>
                </div>
              </div>

              {/* SLIDER 2 */}
              <div className="bg-white p-6 rounded-2xl border border-black/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(99,99,99)]">
                    Horas/mes alumno
                  </span>
                  <span className="text-xl font-bold text-black">{horasMes} h</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={horasMes}
                  onChange={(e) => setHorasMes(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer h-2 bg-black/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-black/40 mt-2">
                  <span>1 h/mes</span>
                  <span>30 h/mes</span>
                </div>
              </div>

              {/* SLIDER 3 */}
              <div className="bg-white p-6 rounded-2xl border border-black/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(99,99,99)]">
                    Precio por hora
                  </span>
                  <span className="text-xl font-bold text-black">{precioHora} €</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="60"
                  value={precioHora}
                  onChange={(e) => setPrecioHora(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer h-2 bg-black/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-black/40 mt-2">
                  <span>7 €/h</span>
                  <span>60 €/h</span>
                </div>
              </div>
            </div>

            {/* MÉTRICAS RECALCULADAS EN TIEMPO REAL */}
            <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4 pt-8 border-t border-black/10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[rgb(99,99,99)] mb-1">
                  Ingresos Brutos
                </p>
                <p className="font-serif text-2xl md:text-3xl text-black">
                  {ingresosBrutos.toLocaleString("es-ES")} €<span className="text-xs font-sans text-black/50">/mes</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[rgb(99,99,99)] mb-1">
                  Coste Lili (6€/hora)
                </p>
                <p className="font-serif text-2xl md:text-3xl text-black/60">
                  {costeLili.toLocaleString("es-ES")} €<span className="text-xs font-sans text-black/40">/mes</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#1abc9c] mb-1">
                  Tu Margen Neto
                </p>
                <p className="font-serif text-2xl md:text-3xl text-black font-semibold">
                  {margenNeto.toLocaleString("es-ES")} €<span className="text-xs font-sans text-black/50">/mes</span>
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[rgb(99,99,99)] mb-1">
                  Margen %
                </p>
                <p className="font-serif text-2xl md:text-3xl text-black">
                  {porcentajeMargen}%
                </p>
              </div>
            </div>

            {/* BOTÓN FINAL */}
            <div className="mt-10 text-center">
              <Link
                href="/profesionales/contratar"
                className="inline-block rounded-full bg-black px-10 py-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#1abc9c] transition-colors shadow-md"
              >
                Quiero estos ingresos →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer dark />
    </div>
  );
}
