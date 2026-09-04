"use client";

import React from "react";

export const ANT_PHOTO_URL = "https://media.base44.com/images/public/69e0fea701f6f900c40af069/1d7c1a17e_image.png";

interface MyliliLogoHeaderProps {
  enLlamada?: boolean;
  timer?: string;
  badgeText?: string;
}

export default function MyliliLogoHeader({
  enLlamada = false,
  timer,
  badgeText,
}: MyliliLogoHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl">
      {/* Logo & Marca */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-md ring-1 ring-white/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ANT_PHOTO_URL}
            alt="Mylili"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-serif text-[17px] font-normal tracking-tight text-[#f0f0f0]">
            Lili Speak
          </span>
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-widest text-[#f0f0f0]/50">
            by Mylili
          </span>
        </div>
      </div>

      {/* Centro / Timer si está en llamada */}
      {timer && (
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs font-semibold text-white/90">
          <span className="h-2 w-2 rounded-full bg-[#00bfa5] animate-pulse" />
          <span>{timer}</span>
        </div>
      )}

      {/* Pill Estado / Badge */}
      <div className="flex items-center gap-2">
        {enLlamada && (
          <div className="flex items-center gap-1.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
            <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-ping" />
            <span>EN LLAMADA</span>
          </div>
        )}
        {badgeText && !enLlamada && (
          <span className="rounded-full border border-[#00bfa5]/30 bg-[#00bfa5]/10 px-2.5 py-1 text-[10px] font-bold text-[#00bfa5]">
            {badgeText}
          </span>
        )}
      </div>
    </header>
  );
}
