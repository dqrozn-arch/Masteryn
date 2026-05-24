import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = req.nextUrl.origin;
  const url = `${origin}/profile/barber/${id}`;

  const svg = await QRCode.toString(url, {
    type: "svg",
    width: 256,
    margin: 2,
    color: { dark: "#f5c842", light: "#111111" },
  });

  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
  });
}
