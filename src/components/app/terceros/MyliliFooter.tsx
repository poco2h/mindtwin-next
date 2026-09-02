"use client";

import React from "react";
import { ANT_PHOTO_URL } from "./MyliliLogoHeader";

export default function MyliliFooter() {
  return (
    <footer className="mt-auto flex items-center justify-center gap-3 py-4 border-t border-white/5 bg-[#0d0d10]/90 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ANT_PHOTO_URL}
        alt=""
        aria-hidden="true"
        className="h-4 w-4 object-contain opacity-70"
      />
      <span className="font-serif text-[11px] font-semibold tracking-[0.25em] text-[#f0f0f0]/60 uppercase">
        MYLILI
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ANT_PHOTO_URL}
        alt=""
        aria-hidden="true"
        className="h-4 w-4 object-contain opacity-70"
      />
    </footer>
  );
}
