import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable" });
const prisma = new PrismaClient({ adapter });

const MALE_NAMES = [
  { name: "Hüseyin", surname: "Usta",  salonName: "Hüseyin Usta Berber & Saç" },
  { name: "Ali",     surname: "Usta",  salonName: "Ali Usta Suadiye" },
  { name: "Ahmet",   surname: "Usta",  salonName: "Ahmet Usta Berber Salonu" },
  { name: "Fuat",    surname: "Usta",  salonName: "Fuat Usta Saç & Sakal" },
  { name: "Mehmet",  surname: "Usta",  salonName: "Mehmet Usta Classic Barber" },
  { name: "Mustafa", surname: "Usta",  salonName: "Mustafa Usta Erkek Kuaförü" },
];

function idHash(id) {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

async function main() {
  const profiles = await prisma.barberProfile.findMany({ orderBy: { id: "asc" } });

  let maleIdx = 0;
  for (const p of profiles) {
    const photoNum = (idHash(p.id) % 21) + 1; // 1-21
    if (photoNum >= 16) { // barber16-21 = erkek fotoğrafları
      const male = MALE_NAMES[maleIdx % MALE_NAMES.length];
      await prisma.barberProfile.update({
        where: { id: p.id },
        data: { name: male.name, surname: male.surname, salonName: male.salonName },
      });
      console.log(`✅ ${p.name} ${p.surname} → ${male.name} ${male.surname} (fotoğraf: barber${photoNum}.jpg)`);
      maleIdx++;
    } else {
      console.log(`   ${p.name} ${p.surname} → değişmedi (fotoğraf: barber${photoNum}.jpg)`);
    }
  }

  console.log(`\n${maleIdx} erkek ismi atandı.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
