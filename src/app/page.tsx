"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import ConversarPreview from "@/components/landing/ConversarPreview";
import LiliGuiaPersonal from "@/components/LiliGuiaPersonal";
import { MI_SCHOOL } from "@/lib/habitos/data";

const PASOS = [
  { n: "01", t: "El profesor publica su gemelo cerebral", d: "En 3 sesiones de 20 min, tu profesor de idiomas construye su Teacher MindTwin: EGO ID pedagógico, voz clonada y avatar." },
  { n: "02", t: "Tú activas el servicio MindTwins", d: "Encuentras a tu profesor en Lili Speak y activas el acceso a su gemelo. Practicas sin límite de horario." },
  { n: "03", t: "Generas tu propio perfil de aprendizaje", d: "En conversaciones guiadas construyes tu perfil de idiomas: nivel, intereses y objetivos de fluidez." },
  { n: "04", t: "Practicas en cualquier momento 24/7", d: "El gemelo de tu profesor conoce tu nivel y tus puntos de mejora. Cada sesión es 100% personalizada." },
];

const CANALES = [
  { t: "Texto", d: "Chat interactivo siempre disponible. Pregunta dudas gramaticales, traduce o mantén conversaciones.", tag: "RESPUESTA INSTANTÁNEA · 24/7" },
  { t: "Voz", d: "Habla con tu profesor — con su voz real. Práctica de pronunciación y fluidez oral en tiempo real.", tag: "VOZ REAL · TIEMPO REAL · 24/7" },
  { t: "Videoconferencia", d: "Videollamada en tiempo real con el avatar digital de tu profesor.", tag: "VIDEOLLAMADA REAL · SIN AGENDA" },
];

const SECCIONES = [
  { t: "Conversar", d: "El espacio principal de práctica. Texto o voz — disponible 24/7, adaptado a tu nivel." },
  { t: "Mis Fuentes", d: "El material docente de tu profesor: guías, audios y directrices pedagógicas." },
  { t: "Mi Cerebro", d: "Tu perfil visualizado: estilo de aprendizaje y las 10 lentes filosóficas que modulan las respuestas." },
  { t: "Mi Progreso", d: "Seguimiento activo: autoevaluaciones de fluidez, alertas de errores recurrentes, estadísticas y agenda." },
];

export default function FollowerLanding() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null);

  return (
    <div className="mt-landing min-h-screen">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-black/10 bg-white/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={30} />
            <span className="text-[10px] leading-tight text-[rgb(99,99,99)]">Lili Speak</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-[11px] text-[rgb(99,99,99)]">
            <a href="#school" className="hover:text-black">Cómo funciona</a>
            <Link href="/tarifas" className="hover:text-black">Tarifas</Link>
            <a href="#canales" className="hover:text-black">Canales</a>
            <Link href="/app/conversar" className="font-bold text-[#1abc9c] hover:text-black">Demo</Link>
            <Link href="/profesionales" className="hover:text-black">Para profesores</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/app/conversar"
              className="hidden rounded-full bg-black px-[30px] py-[13px] text-[10px] font-semibold text-white hover:bg-[#1abc9c] transition-colors md:inline-block"
            >
              Probar Demo →
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
            <a href="#school" onClick={() => setMenuAbierto(false)} className="text-black/70">Cómo funciona</a>
            <Link href="/tarifas" onClick={() => setMenuAbierto(false)} className="text-black/70">Tarifas</Link>
            <a href="#canales" onClick={() => setMenuAbierto(false)} className="text-black/70">Canales</a>
            <Link href="/app/conversar" onClick={() => setMenuAbierto(false)} className="font-bold text-[#1abc9c]">Demo</Link>
            <Link href="/profesionales" onClick={() => setMenuAbierto(false)} className="text-black/70">Para profesores</Link>
            <Link
              href="/app/conversar"
              onClick={() => setMenuAbierto(false)}
              className="rounded-full bg-black px-[30px] py-[13px] text-center text-[11px] font-semibold text-white"
            >
              Probar Demo →
            </Link>
          </nav>
        )}
      </header>

      <main className="pt-24">
        {/* BLOQUE 1 · HERO + PREVIEW CONVERSAR */}
        <section className="bg-white px-6 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div>
              <p className="text-[10px] text-[rgb(99,99,99)] uppercase tracking-wider">
                Para estudiantes de idiomas · profesionales · viajeros
              </p>
              <h1 className="mt-8 font-serif text-[42px] leading-[1.05] font-normal text-black md:text-[52px] md:leading-[1.05]">
                Tu profesor de idiomas,
                <br />
                <em className="font-normal not-italic text-[rgb(99,99,99)]">sin horario.</em>
              </h1>
              <p className="mt-8 max-w-xl text-[15px] font-light leading-[26.25px] text-[rgb(99,99,99)]">
                Accede al gemelo cerebral de tu profesor de idiomas cuando lo necesites —
                en texto o con su voz real. 24 horas, 7 días, 50 idiomas.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/app/conversar"
                  className="rounded-full bg-black px-[30px] py-[13px] text-[11px] font-semibold text-white hover:bg-[#1abc9c] transition-colors shadow-sm"
                >
                  Entrar a la Sala de Práctica →
                </Link>
                <a
                  href="#school"
                  className="rounded-full border border-black/20 px-[30px] py-[13px] text-[11px] font-semibold text-black hover:border-black"
                >
                  Cómo funciona
                </a>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mindtwin-bustos.jpg"
              alt="Teacher MindTwin Lili Speak"
              className="mx-auto w-full max-w-md rounded-3xl border border-black/10"
            />
          </div>
        </section>

        {/* LILI · TU GUÍA PERSONAL (Justo debajo del hero) */}
        <LiliGuiaPersonal />

        {/* PREVIEW CONVERSAR */}
        <section className="bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(99,99,99)]">
              Una conversación real de Lili Speak
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              Tu profesor te guía paso a paso — pedagogía adaptativa
            </h2>
          </div>
          <ConversarPreview />
        </section>

        {/* BLOQUE 2 · PASOS */}
        <section className="bg-black px-6 py-20 text-white">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              ¿Qué es MindTwins · Lili Speak?
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              Tu profesor de idiomas. Su gemelo digital, disponible 24/7.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {PASOS.map((p) => (
                <div key={p.n} className="rounded-2xl border border-white/15 p-6">
                  <span className="text-xs font-bold text-[#1abc9c]">PASO {p.n}</span>
                  <h3 className="mt-2 text-lg font-semibold">{p.t}</h3>
                  <p className="mt-2 text-sm text-white/60">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BLOQUE 3 · CANALES */}
        <section id="canales" className="bg-white px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(99,99,99)]">Los canales</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Elige cómo quieres practicar hoy.</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {CANALES.map((c) => (
                <div key={c.t} className="rounded-2xl border border-black/10 p-6">
                  <h3 className="text-lg font-semibold">{c.t}</h3>
                  <p className="mt-2 text-sm text-[rgb(99,99,99)]">{c.d}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#1abc9c]">
                    {c.tag}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BLOQUE 4 · MI MINDTWIN (4 áreas) */}
        <section className="bg-black px-6 py-20 text-white">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Mi MindTwin · lo que encuentras dentro
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              Tu gemelo docente. Cuatro espacios, una sola experiencia.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {SECCIONES.map((s) => (
                <div key={s.t} className="rounded-2xl border border-white/15 p-6">
                  <h3 className="text-base font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm text-white/60">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BLOQUE 5 · MI SCHOOL */}
        <section id="school" className="bg-white px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(99,99,99)]">
              Cómo funciona
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Preguntas frecuentes.</h2>
            <div className="mt-8 space-y-3">
              {MI_SCHOOL.map((item, i) => {
                const abierta = faqAbierta === i;
                return (
                  <div key={item.pregunta} className="rounded-2xl border border-black/10">
                    <button
                      onClick={() => setFaqAbierta(abierta ? null : i)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                      aria-expanded={abierta}
                    >
                      <span className="font-semibold text-black">{item.pregunta}</span>
                      <span className="flex-shrink-0 text-xl text-[rgb(99,99,99)]">{abierta ? "−" : "+"}</span>
                    </button>
                    {abierta && (
                      <p className="whitespace-pre-line px-5 pb-5 text-sm text-[rgb(99,99,99)]">
                        {item.respuesta}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BLOQUE 6 · CTA final */}
        <section id="cta" className="bg-black px-6 py-20 text-center text-white">
          <h2 className="font-serif text-3xl md:text-4xl">Tu profesor de idiomas. 24/7.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Aprende a tu propio ritmo con la metodología de tu profesor particular.
          </p>
          <Link
            href="/app/conversar"
            className="mt-6 inline-block rounded-full bg-[#1abc9c] px-8 py-3 text-sm font-semibold text-black hover:opacity-90"
          >
            Probar Demo Ahora →
          </Link>
        </section>

        <footer className="flex items-center justify-between border-t border-black/10 px-6 py-6 text-sm text-[rgb(99,99,99)]">
          <span>Copyright 2026 @ Mylili</span>
          <Link href="/terminos" className="underline">Términos y condiciones</Link>
        </footer>
        <Footer dark={false} />
      </main>
    </div>
  );
}
