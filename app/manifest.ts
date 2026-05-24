import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Masteryn — Ustalığın Dijital Sertifikası",
    short_name: "Masteryn",
    description: "Filtresiz kuaförlük fotoğrafları ve şeffaf puanlama sistemi",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#080808",
    theme_color: "#f5c842",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
