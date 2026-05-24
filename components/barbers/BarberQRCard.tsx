"use client";

import { useState } from "react";

export default function BarberQRCard({ barberId, barberName }: { barberId: string; barberName: string }) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const qrSrc = `/api/barber/qr/${barberId}`;

  function download() {
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = `${barberName.replace(/\s+/g, "-")}-qr.svg`;
    a.click();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/profile/barber/${barberId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Küçük buton */}
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white transition-colors"
        style={{ background: "#161616", border: "1px solid #252525" }}
        title="QR Kodumu Göster"
      >
        ▦
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="rounded-3xl w-full max-w-xs overflow-hidden"
            style={{ background: "#111111", border: "1px solid #2a2a2a" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Başlık */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #1e1e1e" }}>
              <div>
                <p className="text-white font-semibold text-sm">QR Kodum</p>
                <p className="text-zinc-600 text-xs mt-0.5">Müşteriler tarayıp profiline ulaşır</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-zinc-600 hover:text-white transition-colors text-lg leading-none">✕</button>
            </div>

            {/* QR */}
            <div className="px-5 py-6 flex flex-col items-center gap-4">
              <div className="rounded-2xl p-3" style={{ background: "#0d0d0d", border: "1px solid #2a2a2a" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="QR Kod" width={180} height={180} style={{ display: "block" }} />
              </div>

              <p className="text-zinc-600 text-xs text-center leading-relaxed">
                Müşteri okutunca <span className="text-amber-400/80">Müşteri Paylaşımları</span> sayfasına gider
              </p>

              <div className="flex gap-2 w-full">
                <button
                  onClick={download}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "var(--gold)", color: "#0a0a0a" }}
                >
                  İndir / Yazdır
                </button>
                <button
                  onClick={copyLink}
                  className="px-4 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ background: "#161616", border: "1px solid #252525", color: copied ? "#4ade80" : "#71717a" }}
                >
                  {copied ? "✓" : "Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
