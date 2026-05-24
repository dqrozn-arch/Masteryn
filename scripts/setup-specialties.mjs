import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable" });
const prisma = new PrismaClient({ adapter });

// 14 barber — 5 Saç Kesimi, 5 Boya Uzmanı, 4 Bakım Uzmanı
// 3 tanesi Masteryn Ödüllü (score >= 9.0)
const UPDATES = [
  // ── SAÇ KESİMİ (5 kişi) ──────────────────────────────────────────
  {
    id: "cmon7u7ii00051vlpgny2crkl", // Hüseyin Usta
    specialties: ["Saç Kesimi", "Klasik Kesim"],
    overallScore: 8.4, reviewCount: 12,
    avgVisualFidelity: 4.1, avgTechnical: 4.3, avgTransparency: 4.0, avgExpectation: 4.2, avgCompensation: 4.5,
  },
  {
    id: "cmonv4pgz0005odi5bfpg7kfo", // Zeynep Arslan — ÖDÜLLÜ
    specialties: ["Saç Kesimi", "Modern Kesim"],
    overallScore: 9.3, reviewCount: 28,
    avgVisualFidelity: 4.7, avgTechnical: 4.6, avgTransparency: 4.6, avgExpectation: 4.7, avgCompensation: 4.7,
  },
  {
    id: "cmonv4pif0007odi55barv8ll", // Merve Demir
    specialties: ["Saç Kesimi", "Çocuk Kesimi"],
    overallScore: 7.8, reviewCount: 8,
    avgVisualFidelity: 3.9, avgTechnical: 3.8, avgTransparency: 4.0, avgExpectation: 3.9, avgCompensation: 3.8,
  },
  {
    id: "cmonv4pjo0009odi5siec85lg", // İpek Şahin
    specialties: ["Saç Kesimi", "Stilist"],
    overallScore: 8.1, reviewCount: 15,
    avgVisualFidelity: 4.0, avgTechnical: 4.1, avgTransparency: 4.1, avgExpectation: 4.0, avgCompensation: 4.2,
  },
  {
    id: "cmopbdw050003t8i5kgp58mvr", // Ceren Özkan
    specialties: ["Saç Kesimi", "Perma"],
    overallScore: 8.7, reviewCount: 19,
    avgVisualFidelity: 4.4, avgTechnical: 4.3, avgTransparency: 4.4, avgExpectation: 4.3, avgCompensation: 4.4,
  },

  // ── BOYA UZMANI (5 kişi) ──────────────────────────────────────────
  {
    id: "cmon8f4gz0001oklpkbgwc3lz", // Fatma Yılmaz
    specialties: ["Saç Boyama", "Röfle"],
    overallScore: 8.6, reviewCount: 22,
    avgVisualFidelity: 4.3, avgTechnical: 4.3, avgTransparency: 4.3, avgExpectation: 4.3, avgCompensation: 4.3,
  },
  {
    id: "cmonv4phq0006odi5cprqgr8p", // Elif Çelik
    specialties: ["Balayage", "Ombre"],
    overallScore: 7.5, reviewCount: 6,
    avgVisualFidelity: 3.7, avgTechnical: 3.8, avgTransparency: 3.7, avgExpectation: 3.8, avgCompensation: 3.8,
  },
  {
    id: "cmonv4pj10008odi5nn0h2tzm", // Ali Usta
    specialties: ["Saç Boyama", "Balayage"],
    overallScore: 6.8, reviewCount: 5,
    avgVisualFidelity: 3.3, avgTechnical: 3.5, avgTransparency: 3.4, avgExpectation: 3.4, avgCompensation: 3.4,
  },
  {
    id: "cmopbdvz70002t8i53ybciy52", // Büşra Koç — ÖDÜLLÜ
    specialties: ["Balayage", "Saç Boyama", "Ombre"],
    overallScore: 9.6, reviewCount: 41,
    avgVisualFidelity: 4.8, avgTechnical: 4.8, avgTransparency: 4.8, avgExpectation: 4.8, avgCompensation: 4.8,
  },
  {
    id: "cmopbdw5m000ct8i5y6l4g5i6", // Gamze Çetin
    specialties: ["Ombre", "Röfle"],
    overallScore: 8.2, reviewCount: 11,
    avgVisualFidelity: 4.1, avgTechnical: 4.1, avgTransparency: 4.1, avgExpectation: 4.1, avgCompensation: 4.1,
  },

  // ── BAKIM UZMANI (4 kişi) ──────────────────────────────────────────
  {
    id: "cmopbdw3o0009t8i5hjy6l1nd", // Naz Aydın
    specialties: ["Saç Bakımı", "Keratin"],
    overallScore: 8.9, reviewCount: 17,
    avgVisualFidelity: 4.5, avgTechnical: 4.4, avgTransparency: 4.5, avgExpectation: 4.4, avgCompensation: 4.5,
  },
  {
    id: "cmopbdw4d000at8i5y15u7m6x", // Hande Kurt — ÖDÜLLÜ
    specialties: ["Keratin", "Saç Bakımı", "Nem Bakımı"],
    overallScore: 9.1, reviewCount: 24,
    avgVisualFidelity: 4.6, avgTechnical: 4.5, avgTransparency: 4.6, avgExpectation: 4.5, avgCompensation: 4.6,
  },
  {
    id: "cmopbdw50000bt8i5rwr5h2tb", // Tuğba Yıldız
    specialties: ["Saç Bakımı", "Perma"],
    overallScore: 7.2, reviewCount: 7,
    avgVisualFidelity: 3.6, avgTechnical: 3.6, avgTransparency: 3.6, avgExpectation: 3.6, avgCompensation: 3.6,
  },
  {
    id: "cmopbdw69000dt8i515wbcb19", // Ahmet Usta
    specialties: ["Saç Bakımı", "Nem Bakımı"],
    overallScore: 8.3, reviewCount: 14,
    avgVisualFidelity: 4.1, avgTechnical: 4.2, avgTransparency: 4.1, avgExpectation: 4.2, avgCompensation: 4.2,
  },
];

async function main() {
  for (const u of UPDATES) {
    await prisma.barberProfile.update({
      where: { id: u.id },
      data: {
        specialties:        u.specialties,
        overallScore:       u.overallScore,
        reviewCount:        u.reviewCount,
        avgVisualFidelity:  u.avgVisualFidelity,
        avgTechnical:       u.avgTechnical,
        avgTransparency:    u.avgTransparency,
        avgExpectation:     u.avgExpectation,
        avgCompensation:    u.avgCompensation,
      },
    });
    const awarded = u.overallScore >= 9.0 ? " ★ ÖDÜLLÜ" : "";
    console.log(`✅ ${u.id.slice(-6)} — ${u.specialties.join(", ")} — ${u.overallScore}${awarded}`);
  }
  console.log("\n14 usta güncellendi.");
  console.log("Masteryn Ödüllü: Zeynep (9.3), Büşra (9.6), Hande (9.1)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
