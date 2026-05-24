import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const [totalUsers, totalBarbers, totalCustomers, totalPosts, totalReviews, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.barberProfile.count(),
      prisma.customerProfile.count(),
      prisma.post.count(),
      prisma.customerToBarberReview.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { customerProfile: true, barberProfile: true },
      }),
    ]);

  return NextResponse.json({
    totalUsers,
    totalBarbers,
    totalCustomers,
    totalPosts,
    totalReviews,
    recentUsers,
  });
}
