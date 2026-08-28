"use client";

import ConversarChat from "@/components/app/ConversarChat";
import { useUserRole } from "@/lib/demo/roleContext";

export default function ConversarPage() {
  const [role] = useUserRole();

  return (
    <div className="mt-app">
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-104px)] max-w-3xl flex-col p-4">
        <ConversarChat
          ownerName="Juan Moll"
          role={role}
        />
      </div>
    </div>
  );
}
