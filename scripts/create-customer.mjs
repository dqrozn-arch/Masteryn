import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "musteri@masteryn.com";
  const plainPassword = "Masteryn2024";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) { console.log("Zaten var:", email); return; }

  const hashed = await bcrypt.hash(plainPassword, 12);

  await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({ data: { email, password: hashed, userType: "CUSTOMER" } });
    await tx.customerProfile.create({
      data: { userId: u.id, name: "Test", surname: "Müşteri", phone: "5559876543", city: "İstanbul" },
    });
  });

  console.log("✅ Müşteri hesabı oluşturuldu!");
  console.log("   E-posta :", email);
  console.log("   Şifre   :", plainPassword);
}

main().catch(console.error).finally(() => prisma.$disconnect());
