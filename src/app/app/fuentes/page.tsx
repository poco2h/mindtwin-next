import { Suspense } from "react";
import MisFuentes from "@/components/app/MisFuentes";

export default function FuentesPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-xs text-white/50">Cargando fuentes...</div>}>
      <MisFuentes />
    </Suspense>
  );
}
