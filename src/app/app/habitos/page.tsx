import { Suspense } from "react";
import MisHabitos from "@/components/app/MisHabitos";

export default function HabitosPage() {
  return (
    <div className="mt-app">
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        <Suspense fallback={<div className="p-8 text-center text-xs text-white/50">Cargando Mis Progresos...</div>}>
          <MisHabitos />
        </Suspense>
      </div>
    </div>
  );
}
