"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MisHerramientas from "@/components/app/MisHerramientas";

function HerramientasPageContent() {
  const searchParams = useSearchParams();
  const isFollower = searchParams.get("role") === "follower";

  if (isFollower) {
    return (
      <div className="mx-auto max-w-xl text-center py-20">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-md">
          <span className="text-4xl">🔒</span>
          <h2 className="mt-4 font-playfair text-xl font-bold text-white">
            Apartado exclusivo para Profesores (Owner)
          </h2>
          <p className="mt-2 text-xs text-white/60">
            Las herramientas de gestión de la intranet solo están disponibles para el propietario del MindTwin.
          </p>
        </div>
      </div>
    );
  }

  return <MisHerramientas />;
}

export default function HerramientasPage() {
  return (
    <Suspense>
      <HerramientasPageContent />
    </Suspense>
  );
}
