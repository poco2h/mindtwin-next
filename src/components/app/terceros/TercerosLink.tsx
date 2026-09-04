"use client";

import React, { useState, useEffect } from "react";
import MyliliLogoHeader from "./MyliliLogoHeader";
import MyliliFooter from "./MyliliFooter";
import QRCodeSVG from "./QRCodeSVG";

interface TercerosLinkProps {
  guestUrl: string;
  guestSlug: string;
  langFollower: string;
  langGuest: string;
  onEntrarSala: () => void;
  onVolver: () => void;
}

export default function TercerosLink({
  guestUrl,
  guestSlug,
  langFollower,
  langGuest,
  onEntrarSala,
  onVolver,
}: TercerosLinkProps) {
  const [copiado, setCopiado] = useState(false);
  const [interlocutorConectado, setInterlocutorConectado] = useState(false);

  const mensajeCompartir = `¡Hola! Te invito a una llamada con traducción simultánea en tiempo real en Lili Speak. Solo abre este enlace en tu navegador (no necesitas instalar nada): ${guestUrl}`;

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(guestUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (err) {
      console.warn("Error al copiar enlace:", err);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(mensajeCompartir)}`;
    window.open(url, "_blank");
  };

  const handleSMS = () => {
    const url = `sms:?&body=${encodeURIComponent(mensajeCompartir)}`;
    window.open(url, "_blank");
  };

  const handleEmail = () => {
    const url = `mailto:?subject=${encodeURIComponent("Invitación a llamada en Lili Speak")}&body=${encodeURIComponent(mensajeCompartir)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex min-h-full flex-col bg-transparent text-[#f0f0f0]">
      <MyliliLogoHeader badgeText="Enlace de Invitación" />

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-8">
        {/* Cabecera Enlace Listo */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 mb-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <span className="text-xl">✓</span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-white md:text-4xl">
            Enlace listo para invitar
          </h1>
          <p className="mt-2 text-xs text-white/60">
            Comparte este enlace con tu contacto. Entrará directo a la llamada sin registro.
          </p>
        </div>

        {/* Tarjeta de Código QR y Enlace */}
        <div className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center py-2">
            <QRCodeSVG value={guestUrl} size={190} />
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#00bfa5]">
              <span>📱</span>
              <span>Escanea para abrir en el móvil</span>
            </div>
          </div>

          {/* Campo Copiable de URL */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              Enlace directo del invitado
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/60 p-2">
              <input
                type="text"
                readOnly
                value={guestUrl}
                className="flex-1 bg-transparent px-2 text-xs text-white/90 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopiar}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  copiado
                    ? "bg-[#22c55e] text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {copiado ? "✓ ¡Copiado!" : "Copiar"}
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-white/40 text-center">
              ⏳ Válido durante 24 horas · Acceso seguro de un solo uso
            </p>
          </div>

          {/* Botones de Compartir */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
              Compartir invitación rápidamente
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/10 py-2.5 text-xs font-bold text-[#22c55e] hover:bg-[#22c55e]/20 transition-all cursor-pointer"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleSMS}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <span>✉️</span>
                <span>SMS</span>
              </button>

              <button
                onClick={handleEmail}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <span>📧</span>
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* CTA Entrar a la Sala */}
          <div className="pt-2 space-y-2">
            <button
              onClick={onEntrarSala}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00bfa5] py-3.5 text-xs md:text-sm font-extrabold text-[#0d0d10] hover:bg-[#00d4b7] transition-all shadow-lg shadow-[#00bfa5]/20 cursor-pointer"
            >
              <span>🎙️</span>
              <span>Entrar a la sala ahora</span>
            </button>

            <button
              onClick={onVolver}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-medium text-white/50 hover:text-white transition-colors"
            >
              ← Configurar otro par de idiomas
            </button>
          </div>
        </div>
      </div>

      <MyliliFooter />
    </div>
  );
}
