import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "usta@masteryn.com";
  const plainPassword = "Masteryn2024";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Hesap zaten mevcut:", email);
    return;
  }

  const hashed = await bcrypt.hash(plainPassword, 12);

  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({ data: { email, password: hashed, userType: "BARBER" } });
    await tx.barberProfile.create({
      data: {
        userId: u.id,
        name: "Ozan",
        surname: "Kuaför",
        phone: "5551234567",
        city: "İstanbul",
        district: "Beşiktaş",
        salonName: "Masteryn Studio",
        status: "APPROVED",
        specialties: ["Saç Kesimi", "Modern Kesim", "Saç Boyama"],
      },
    });
    return u;
  });

  const barber = await prisma.barberProfile.findUnique({ where: { userId: user.id } });

  // Pzt-Cmt 09:00-18:00 müsaitlik
  await Promise.all(
    [1, 2, 3, 4, 5, 6].map((day) =>
      prisma.barberAvailability.create({
        data: { barberId: barber.id, dayOfWeek: day, startTime: "09:00", endTime: "18:00", isActive: true },
      })
    )
  );

  console.log("✅ Usta hesabı oluşturuldu!");
  console.log("   E-posta :", email);
  console.log("   Şifre   :", plainPassword);
  console.log("   Barber ID:", barber.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
