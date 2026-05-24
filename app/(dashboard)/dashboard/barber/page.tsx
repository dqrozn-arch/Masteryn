import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BarberPerformanceDashboard from "./BarberPerformanceDashboard";

export default async function BarberDashboard() {
  const session = await getSession();
  if (!session || session.userType !== "BARBER") redirect("/login");

  const profile = await prisma.barberProfile.findUnique({
    where: { userId: session.id },
    include: {
      posts: {
        orderBy: { createdAt: "desc" }, take: 6,
        include: { images: { take: 1, orderBy: { order: "asc" } }, customer: true, barber: true },
      },
      receivedReviews: {
        orderBy: { createdAt: "desc" },
        include: { customer: true, images: { take: 1, orderBy: { order: "asc" } } },
      },
      workplaces: { orderBy: [{ isCurrent: "desc" }, { startYear: "desc" }] },
      certificates: { orderBy: { createdAt: "desc" } },
      _count: { select: { posts: true, receivedReviews: true, favoritedBy: true } },
    },
  });
  if (!profile) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { email: true, createdAt: true },
  });

  // Haftalık trend
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentReviews = profile.receivedReviews.filter((r: typeof profile.receivedReviews[number]) => new Date(r.createdAt) >= oneWeekAgo);
  const olderReviews  = profile.receivedReviews.filter((r: typeof profile.receivedReviews[number]) => new Date(r.createdAt) < oneWeekAgo);

  const calcAvg = (reviews: typeof profile.receivedReviews) =>
    reviews.length === 0 ? null
    : ((reviews.reduce((s: number, r: typeof profile.receivedReviews[number]) =>
        s + (r.visualFidelity + r.technicalSkill + r.processTransparency + r.expectationMgmt + r.compensationScore) / 5
      , 0) / reviews.length) * 2);

  const weeklyTrend = (() => {
    const ra = calcAvg(recentReviews); const oa = calcAvg(olderReviews);
    return ra !== null && oa !== null ? Math.round((ra - oa) * 10) / 10 : null;
  })();

  const telafi = profile.receivedReviews.filter(
    (r: typeof profile.receivedReviews[number]) => Math.min(r.visualFidelity, r.technicalSkill, r.processTransparency, r.expectationMgmt, r.compensationScore) < 3
  );

  // Platform üyelik süresi (yıl)
  const memberYears = user?.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (365 * 24 * 60 * 60 * 1000)))
    : 0;

  return (
    <BarberPerformanceDashboard
      profile={{
        id: profile.id, name: profile.name, surname: profile.surname,
        salonName: profile.salonName, avatar: profile.avatar,
        city: profile.city, district: profile.district, phone: profile.phone,
        bio: profile.bio,
        username: profile.username,
        overallScore:       profile.overallScore,
        reviewCount:        profile.reviewCount,
        avgVisualFidelity:  profile.avgVisualFidelity,
        avgTechnical:       profile.avgTechnical,
        avgTransparency:    profile.avgTransparency,
        avgExpectation:     profile.avgExpectation,
        avgCompensation:    profile.avgCompensation,
        specialties:        profile.specialties,
        postCount:          profile._count.posts,
        favCount:           profile._count.favoritedBy,
        hasVerifiedWork:    profile.workplaces.some((w) => w.isVerified),
        memberYears,
      }}
      reviews={profile.receivedReviews as never}
      recentPosts={profile.posts as never}
      telafi={telafi as never}
      weeklyTrend={weeklyTrend}
      recentReviewCount={recentReviews.length}
      workplaces={profile.workplaces as never}
      certificates={profile.certificates as never}
    />
  );
}
