import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { generateToken } from "./auth";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { token },
    include: { admin: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return { id: session.admin.id, username: session.admin.username, name: session.admin.name };
}

export { generateToken };
