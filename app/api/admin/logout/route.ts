export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { token } }).catch(() => {});
  const res = NextResponse.json({ success: true });
  res.cookies.delete("admin_token");
  return res;
}
