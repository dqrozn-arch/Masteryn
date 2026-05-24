import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable" });
const prisma = new PrismaClient({ adapter });

const profiles = await prisma.barberProfile.findMany({
  where: { name: { in: ["Hüseyin", "Ali", "Ahmet", "Fuat"] } },
  include: { user: { select: { email: true } } },
});

for (const p of profiles) {
  console.log(`${p.name} ${p.surname} → ${p.user.email}`);
}

await prisma.$disconnect();
