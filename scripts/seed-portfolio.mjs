import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable",
});
const prisma = new PrismaClient({ adapter });

const BARBER_ID = "cmp9qs0a000019hlpz6m0stc4"; // Masteryn Studio

// Mevcut upload görselleri
const IMAGES = [
  "/uploads/IMG_0201.jpeg",
  "/uploads/IMG_0202.jpeg",
  "/uploads/IMG_0203.jpeg",
  "/uploads/IMG_0204.jpeg",
  "/uploads/IMG_0205.jpeg",
  "/uploads/IMG_0207.jpeg",
  "/uploads/IMG_0209.jpeg",
];

const CAPTIONS = [
  "Modern kesim — müşterimizin isteğine göre özel tasarım ✂️",
  "Balayage tekniği ile doğal geçişler 🌊",
  "Keratin bakımı sonrası — ipek gibi bir sonuç ✨",
  "Sombre efekti, doğal ve şık 🍂",
  "Fön & şekillendirme — özel gün hazırlığı 💫",
  "Röfle ile ışıltılı ve canlı saçlar ☀️",
  "Freelight tekniği — kişiye özel renk tasarımı 🎨",
];

async function main() {
  // Masteryn Studio'nun müşterileri bul
  const customers = await prisma.customerProfile.findMany({
    take: 7,
    select: { id: true, name: true },
  });

  if (customers.length < 7) {
    console.error("Yeterli müşteri yok:", customers.length);
    return;
  }

  for (let i = 0; i < 7; i++) {
    const post = await prisma.post.create({
      data: {
        barberId: BARBER_ID,
        customerId: customers[i].id,
        caption: CAPTIONS[i],
        images: {
          create: [{ url: IMAGES[i], order: 0 }],
        },
      },
    });
    console.log(`✅ Post ${i + 1}: ${CAPTIONS[i].slice(0, 40)}… [${post.id}]`);
  }

  console.log("\n🎉 7 görsel Masteryn Studio akışına eklendi!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
