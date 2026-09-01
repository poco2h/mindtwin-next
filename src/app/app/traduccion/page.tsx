import { Suspense } from "react";
import TraduccionSimultaneaPanel from "@/components/app/TraduccionSimultaneaPanel";

export default function TraduccionPage() {
  return (
    <div className="mt-app">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-104px)] max-w-4xl flex-col p-4">
        <div className="relative mx-auto flex h-[calc(100vh-140px)] w-full flex-col rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl shadow-2xl">
          <Suspense fallback={<div className="text-center py-10 text-xs text-white/50">Cargando traducción simultánea...</div>}>
            <TraduccionSimultaneaPanel />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
