import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable" });
const prisma = new PrismaClient({ adapter });

// barber16-21: erkek fotoğrafları (6 adet)
// barber4,6,7,8,15: kadın fotoğrafları (5 adet)

const UPDATES = [
  // ── ERKEKLER (11 kişi) ──────────────────────────────────────────
  { id: "cmon7u7ii00051vlpgny2crkl", name: "Çağlar",   surname: "Çağlayan", salonName: "Çağlar Çağlayan Hair Artist",      avatar: "/images/barber16.jpg" },
  { id: "cmon8f4gz0001oklpkbgwc3lz", name: "Ali",      surname: "Şahin",   salonName: "Ali Şahin Saç Tasarımcısı",        avatar: "/images/barber17.jpg" },
  { id: "cmonv4phq0006odi5cprqgr8p", name: "Fuat",     surname: "Binici",  salonName: "Fuat Binici Hair Studio",           avatar: "/images/barber18.jpg" },
  { id: "cmonv4pif0007odi55barv8ll", name: "Ahmet",    surname: "Binici",  salonName: "Ahmet Binici Hair Design",          avatar: "/images/barber19.jpg" },
  { id: "cmonv4pj10008odi5nn0h2tzm", name: "Veysel",   surname: "Baykal",  salonName: "Veysel Baykal Hair Design",         avatar: "/images/barber20.jpg" },
  { id: "cmonv4pjo0009odi5siec85lg", name: "Doğucan",  surname: "Aydın",   salonName: "Doğucan Aydın Hair Artist",         avatar: "/images/barber21.jpg" },
  { id: "cmopbdw050003t8i5kgp58mvr", name: "Emin",     surname: "Usta",    salonName: "Emin Usta Master Barber",           avatar: "/images/barber16.jpg" },
  { id: "cmopbdw3o0009t8i5hjy6l1nd", name: "Ali",      surname: "Kuaför",  salonName: "Ali Kuaför",                        avatar: "/images/barber17.jpg" },
  { id: "cmopbdw50000bt8i5rwr5h2tb", name: "Enes",     surname: "Arslan",  salonName: "Enes Arslan Hair",                  avatar: "/images/barber18.jpg" },
  { id: "cmopbdw5m000ct8i5y6l4g5i6", name: "Mesut",    surname: "Yılmaz",  salonName: "Mesut Yılmaz Hair Studio",          avatar: "/images/barber19.jpg" },
  { id: "cmopbdw69000dt8i515wbcb19", name: "Ozan",     surname: "Doğru",   salonName: "Ozan Doğru Hair Design",            avatar: "/images/barber20.jpg" },

  // ── KADINLAR (3 kişi — hepsi Masteryn Ödüllü) ───────────────────
  { id: "cmonv4pgz0005odi5bfpg7kfo", name: "Zeynep",  surname: "Arslan",  salonName: "Zeynep Arslan Hair Studio", avatar: "/images/barber4.jpg"  },
  { id: "cmopbdvz70002t8i53ybciy52", name: "Büşra",   surname: "Koç",     salonName: "Büşra Koç Güzellik",        avatar: "/images/barber6.jpg"  },
  { id: "cmopbdw4d000at8i5y15u7m6x", name: "Hande",   surname: "Kurt",    salonName: "Hande Kurt Beauty",         avatar: "/images/barber7.jpg"  },
];

async function main() {
  for (const u of UPDATES) {
    await prisma.barberProfile.update({
      where: { id: u.id },
      data: { name: u.name, surname: u.surname, salonName: u.salonName, avatar: u.avatar },
    });
    console.log(`✅ ${u.name} ${u.surname} → ${u.avatar}`);
  }
  console.log("\nErkek: 11 | Kadın: 3 (Zeynep, Büşra, Hande)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
