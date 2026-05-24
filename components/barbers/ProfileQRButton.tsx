"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ProfileQRButton({ barberId, barberName }: { barberId: string; barberName: string }) {
  const [open, setOpen]       = useState(false);
  const [copied, setCopied]   = useState(false);
  const [mounted, setMounted] = useState(false);
  const qrSrc = `/api/barber/qr/${barberId}`;

  useEffect(() => { setMounted(true); }, []);

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

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Floating buton */}
      <button
        onPointerDown={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderRadius: "16px",
          fontWeight: 600,
          fontSize: "14px",
          border: "none",
          cursor: "pointer",
          background: "var(--gold)",
          color: "#0a0a0a",
          boxShadow: "0 0 24px rgba(201,169,110,0.4)",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span>▦</span>
        <span>QR Kodumu Göster</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          onPointerDown={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(0,0,0,0.85)",
          }}
        >
          <div
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: "380px",
              borderRadius: "24px 24px 0 0",
              background: "#111111",
              border: "1px solid #2a2a2a",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 40, height: 4, borderRadius: 9999, background: "#333" }} />
            </div>

            <div style={{ padding: "12px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e1e1e" }}>
              <div>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, margin: 0 }}>QR Kodum</p>
                <p style={{ color: "#52525b", fontSize: 12, margin: "2px 0 0" }}>Müşterine tarat, profiline ulaşsın</p>
              </div>
              <button
                onPointerDown={() => setOpen(false)}
                style={{ background: "none", border: "none", color: "#52525b", fontSize: 20, cursor: "pointer", padding: "4px 8px" }}
              >✕</button>
            </div>

            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ borderRadius: 16, padding: 16, background: "#0d0d0d", border: "1px solid #2a2a2a" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="QR Kod" width={200} height={200} style={{ display: "block" }} />
              </div>

              <p style={{ color: "#52525b", fontSize: 12, textAlign: "center", lineHeight: 1.5, margin: 0 }}>
                Müşteri okutunca <span style={{ color: "rgba(251,191,36,0.8)" }}>Müşteri Paylaşımları</span> sayfasına gider
              </p>

              <div style={{ display: "flex", gap: 8, width: "100%" }}>
                <button
                  onPointerDown={download}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer", background: "var(--gold)", color: "#0a0a0a", touchAction: "manipulation" }}
                >
                  İndir / Yazdır
                </button>
                <button
                  onPointerDown={copyLink}
                  style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, border: "1px solid #252525", cursor: "pointer", background: "#161616", color: copied ? "#4ade80" : "#71717a", touchAction: "manipulation" }}
                >
                  {copied ? "✓" : "Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
