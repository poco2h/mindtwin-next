"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ConversarChat from "@/components/app/ConversarChat";

function ConversarPageInner() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "follower" ? "follower" : "owner";

  return (
    <div className="mt-app">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-104px)] max-w-4xl flex-col p-4">
        <ConversarChat
          ownerName="Juan Moll"
          role={role}
        />
      </div>
    </div>
  );
}

export default function ConversarPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-white/50">Cargando...</div>}>
      <ConversarPageInner />
    </Suspense>
  );
}
