import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.admin.findUnique({ where: { username: "ozan" } });
  if (existing) {
    console.log("Admin zaten mevcut:", existing.username);
    return;
  }

  const hashed = await bcrypt.hash("123456", 12);
  const admin = await prisma.admin.create({
    data: { username: "ozan", password: hashed, name: "Ozan" },
  });
  console.log("Superadmin oluşturuldu:", admin.username);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
