import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: "postgresql://ozandogru@localhost:5432/masteryn",
});
const prisma = new PrismaClient({ adapter });

const P = (seed, w = 500, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const BARBERS = [
  { name: "Ahmet",   surname: "Kaya",      salon: "Kaya Erkek Kuaförü",     city: "İstanbul",  district: "Kadıköy",   specialties: ["Saç Kesimi", "Sakal Tıraşı", "Fön"],           score: { comp: 5, exp: 5, trans: 5, tech: 5, vis: 5 } },
  { name: "Mehmet",  surname: "Demir",     salon: "Demir Barber Shop",       city: "Ankara",    district: "Çankaya",   specialties: ["Klasik Kesim", "Sakal Şekillendirme"],          score: { comp: 5, exp: 4, trans: 5, tech: 5, vis: 4 } },
  { name: "Mustafa", surname: "Çelik",     salon: "Çelik Premium Kuaför",    city: "İzmir",     district: "Konak",     specialties: ["Fade", "Deri Tıraş", "Keratin"],               score: { comp: 4, exp: 5, trans: 4, tech: 5, vis: 5 } },
  { name: "Ali",     surname: "Yıldız",    salon: "Yıldız Erkek Salonu",     city: "Bursa",     district: "Nilüfer",   specialties: ["Saç Boyama", "Sakal", "Saç Kesimi"],           score: { comp: 5, exp: 5, trans: 5, tech: 4, vis: 5 } },
  { name: "Hasan",   surname: "Arslan",    salon: "Arslan Barber",           city: "Antalya",   district: "Muratpaşa", specialties: ["Klasik Tıraş", "Saç Bakımı"],                  score: { comp: 4, exp: 4, trans: 5, tech: 5, vis: 4 } },
  { name: "İbrahim", surname: "Koç",       salon: "Koç Erkek Kuaförü",       city: "İstanbul",  district: "Beşiktaş",  specialties: ["Fade", "Sakal Tıraşı", "Saç Şekillendirme"],  score: { comp: 5, exp: 5, trans: 4, tech: 5, vis: 5 } },
  { name: "Emre",    surname: "Öztürk",    salon: "Öztürk Barber Shop",      city: "İstanbul",  district: "Şişli",     specialties: ["Modern Kesim", "Sakal", "Fön"],                score: { comp: 5, exp: 4, trans: 5, tech: 4, vis: 5 } },
  { name: "Burak",   surname: "Şahin",     salon: "Şahin Premium Barber",    city: "Ankara",    district: "Keçiören",  specialties: ["Deri Tıraş", "Saç Boyama"],                    score: { comp: 4, exp: 5, trans: 5, tech: 5, vis: 4 } },
  { name: "Serkan",  surname: "Aydın",     salon: "Aydın Erkek Salonu",      city: "İzmir",     district: "Bornova",   specialties: ["Klasik Kesim", "Sakal Şekillendirme", "Keratin"], score: { comp: 5, exp: 5, trans: 5, tech: 5, vis: 5 } },
  { name: "Tolga",   surname: "Kurt",      salon: "Kurt Barber",             city: "Adana",     district: "Seyhan",    specialties: ["Fade", "Saç Kesimi"],                          score: { comp: 4, exp: 4, trans: 4, tech: 5, vis: 5 } },
  { name: "Kerem",   surname: "Polat",     salon: "Polat Kuaför",            city: "Konya",     district: "Meram",     specialties: ["Sakal Tıraşı", "Saç Bakımı", "Fön"],           score: { comp: 5, exp: 5, trans: 4, tech: 4, vis: 5 } },
  { name: "Oğuz",    surname: "Doğan",     salon: "Doğan Erkek Kuaförü",     city: "Gaziantep", district: "Şahinbey",  specialties: ["Klasik Tıraş", "Sakal", "Saç Kesimi"],         score: { comp: 4, exp: 5, trans: 5, tech: 5, vis: 4 } },
  { name: "Furkan",  surname: "Acar",      salon: "Acar Premium Barber",     city: "İstanbul",  district: "Üsküdar",   specialties: ["Modern Kesim", "Deri Tıraş", "Sakal"],         score: { comp: 5, exp: 4, trans: 5, tech: 5, vis: 5 } },
  { name: "Caner",   surname: "Bulut",     salon: "Bulut Barber Shop",       city: "Kayseri",   district: "Melikgazi", specialties: ["Fade", "Saç Boyama", "Keratin"],               score: { comp: 5, exp: 5, trans: 5, tech: 5, vis: 5 } },
];

const CUSTOMERS = [
  { email: "zeynep@seed.com",  name: "Zeynep",  surname: "Arslan"  },
  { email: "can@seed.com",     name: "Can",     surname: "Öztürk"  },
  { email: "ayse@seed.com",    name: "Ayşe",    surname: "Demir"   },
  { email: "emre@seed.com",    name: "Emre",    surname: "Yıldız"  },
  { email: "selin@seed.com",   name: "Selin",   surname: "Kaya"    },
  { email: "murat@seed.com",   name: "Murat",   surname: "Çelik"   },
];

const REVIEW_COMMENTS = [
  "Harika bir deneyimdi, kesinlikle tavsiye ederim!",
  "Ellerine sağlık, tam istediğim gibi oldu.",
  "Profesyonel yaklaşımı ve temiz ortamıyla çok memnun kaldım.",
  "İşini çok iyi biliyor, fiyatlar da makul.",
  "Her seferinde aynı kalite, çok güvenilir.",
  "Saçlarımı bana çok yakıştırdı, teşekkürler!",
];

const POST_CAPTIONS = [
  "Harika bir kesim, kesinlikle tavsiye ederim!",
  "Saçlarım için en doğru tercih.",
  "Mükemmel sonuç, çok memnun kaldım!",
  "Her zaman kaliteli hizmet.",
  "Ellerine sağlık, tam istediğim gibi!",
  null,
];

async function main() {
  console.log("14 usta verisi oluşturuluyor...");

  const pw = await bcrypt.hash("demo123", 10);

  // Müşterileri oluştur
  const customerProfiles = [];
  for (const cd of CUSTOMERS) {
    const u = await prisma.user.upsert({
      where: { email: cd.email },
      update: {},
      create: { email: cd.email, password: pw, userType: "CUSTOMER" },
    });
    const cp = await prisma.customerProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, name: cd.name, surname: cd.surname, city: "İstanbul" },
    });
    customerProfiles.push(cp);
  }

  for (let i = 0; i < BARBERS.length; i++) {
    const b = BARBERS[i];
    const email = `${b.surname.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")}${i + 1}@seed.com`;

    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password: pw, userType: "BARBER" },
    });

    const avatarSeed = `barber-avatar-${i + 1}`;
    const barber = await prisma.barberProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        name: b.name,
        surname: b.surname,
        salonName: b.salon,
        city: b.city,
        district: b.district,
        phone: `0532 ${String(100 + i).padStart(3, "0")} ${String(10 + i).padStart(2, "0")} ${String(30 + i).padStart(2, "0")}`,
        specialties: b.specialties,
        avatar: P(avatarSeed, 400, 400),
        status: "APPROVED",
        approvedAt: new Date(),
        username: `${b.name.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")}${b.surname.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c")}`,
      },
    });

    // Her ustaya 3-4 post ekle
    const postCount = 3 + (i % 2);
    for (let p = 0; p < postCount; p++) {
      const customer = customerProfiles[p % customerProfiles.length];
      const existing = await prisma.post.findFirst({
        where: { barberId: barber.id, customerId: customer.id, caption: POST_CAPTIONS[p % POST_CAPTIONS.length] },
      });
      if (!existing) {
        await prisma.post.create({
          data: {
            barberId: barber.id,
            customerId: customer.id,
            caption: POST_CAPTIONS[p % POST_CAPTIONS.length],
            images: {
              create: [
                { url: P(`post-${i}-${p}-a`, 600, 600), order: 0 },
                ...(p % 2 === 0 ? [{ url: P(`post-${i}-${p}-b`, 600, 600), order: 1 }] : []),
              ],
            },
          },
        });
      }
    }

    // Her ustaya 3-5 yorum ekle
    const reviewCount = 3 + (i % 3);
    let totalComp = 0, totalExp = 0, totalTrans = 0, totalTech = 0, totalVis = 0;
    let reviewsAdded = 0;

    for (let r = 0; r < reviewCount; r++) {
      const customer = customerProfiles[r % customerProfiles.length];
      const existing = await prisma.customerToBarberReview.findFirst({
        where: { barberId: barber.id, customerId: customer.id },
      });
      if (!existing) {
        const scores = {
          compensationScore:   b.score.comp - (r % 2),
          expectationMgmt:     b.score.exp  - (r % 2),
          processTransparency: b.score.trans,
          technicalSkill:      b.score.tech - (r % 2 === 0 ? 0 : 1),
          visualFidelity:      b.score.vis,
        };
        await prisma.customerToBarberReview.create({
          data: {
            barberId: barber.id,
            customerId: customer.id,
            comment: REVIEW_COMMENTS[r % REVIEW_COMMENTS.length],
            ...scores,
          },
        });
        totalComp  += scores.compensationScore;
        totalExp   += scores.expectationMgmt;
        totalTrans += scores.processTransparency;
        totalTech  += scores.technicalSkill;
        totalVis   += scores.visualFidelity;
        reviewsAdded++;
      }
    }

    if (reviewsAdded > 0) {
      const avg = (v) => parseFloat((v / reviewsAdded).toFixed(2));
      const avgComp  = avg(totalComp);
      const avgExp   = avg(totalExp);
      const avgTrans = avg(totalTrans);
      const avgTech  = avg(totalTech);
      const avgVis   = avg(totalVis);
      const overall  = parseFloat(((avgComp + avgExp + avgTrans + avgTech + avgVis) / 5).toFixed(2));
      await prisma.barberProfile.update({
        where: { id: barber.id },
        data: {
          avgCompensation:   avgComp,
          avgExpectation:    avgExp,
          avgTransparency:   avgTrans,
          avgTechnical:      avgTech,
          avgVisualFidelity: avgVis,
          overallScore:      overall,
          reviewCount:       reviewsAdded,
        },
      });
    }

    console.log(`✓ ${b.name} ${b.surname} — ${b.salon}`);
  }

  console.log("\n✅ 14 usta başarıyla eklendi!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
