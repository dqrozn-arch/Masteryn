import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable",
});
const prisma = new PrismaClient({ adapter });

const PICSUM = (seed, w = 400, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  console.log("Demo verisi oluşturuluyor...");

  const pw = await bcrypt.hash("demo123", 12);

  // ── USTA: Ahmet Kaya ──────────────────────────────────
  const barberUser = await prisma.user.upsert({
    where: { email: "ahmet@demo.com" },
    update: {},
    create: { email: "ahmet@demo.com", password: pw, userType: "BARBER" },
  });

  const barberProfile = await prisma.barberProfile.upsert({
    where: { userId: barberUser.id },
    update: {},
    create: {
      userId: barberUser.id,
      name: "Ahmet",
      surname: "Kaya",
      salonName: "Kaya Erkek Kuaförü",
      city: "İstanbul",
      district: "Kadıköy",
      address: "Moda Caddesi No:47",
      phone: "0532 111 22 33",
    },
  });

  // ── MÜŞTERİLER ────────────────────────────────────────
  const customers = [];

  const customerData = [
    { email: "zeynep@demo.com", name: "Zeynep", surname: "Arslan", city: "İstanbul" },
    { email: "can@demo.com",    name: "Can",    surname: "Öztürk", city: "İstanbul" },
    { email: "ayse@demo.com",   name: "Ayşe",   surname: "Demir",  city: "Kadıköy" },
    { email: "emre@demo.com",   name: "Emre",   surname: "Yıldız", city: "Üsküdar" },
  ];

  for (const cd of customerData) {
    const u = await prisma.user.upsert({
      where: { email: cd.email },
      update: {},
      create: { email: cd.email, password: pw, userType: "CUSTOMER" },
    });
    const cp = await prisma.customerProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, name: cd.name, surname: cd.surname, city: cd.city },
    });
    customers.push(cp);
  }

  const [zeynep, can, ayse, emre] = customers;

  // ── PAYLAŞIMLAR ───────────────────────────────────────
  const postSeeds = [
    { cId: zeynep.id, caption: "Harika bir kesim, kesinlikle tavsiye ederim!", imgs: ["barber1", "barber2"] },
    { cId: can.id,    caption: "Saçlarım için en doğru tercih. Teşekkürler Ahmet abi!", imgs: ["barber3"] },
    { cId: ayse.id,   caption: "Saçlarımı bana çok yakıştırdı 🙌", imgs: ["barber4", "barber5"] },
    { cId: emre.id,   caption: null, imgs: ["barber6"] },
  ];

  for (const ps of postSeeds) {
    const existing = await prisma.post.findFirst({
      where: { customerId: ps.cId, barberId: barberProfile.id },
    });
    if (!existing) {
      await prisma.post.create({
        data: {
          customerId: ps.cId,
          barberId: barberProfile.id,
          caption: ps.caption,
          images: { create: ps.imgs.map((s, i) => ({ url: PICSUM(s, 500, 500), order: i })) },
        },
      });
    }
  }

  // ── MÜŞTERİ → USTA DEĞERLENDİRMELERİ ────────────────
  const barberReviews = [
    { cId: zeynep.id, service: 5, quality: 5, price: 4, comment: "Çok güzel bir deneyimdi, ellerine sağlık Ahmet abi!" },
    { cId: can.id,    service: 5, quality: 4, price: 4, comment: "Profesyonel yaklaşımı ve temiz ortamıyla harika bir salon." },
    { cId: ayse.id,   service: 4, quality: 5, price: 3, comment: "İşini çok iyi biliyor, fiyatlar biraz yüksek ama değer." },
    { cId: emre.id,   service: 5, quality: 4, price: 5, comment: null },
  ];

  for (const r of barberReviews) {
    await prisma.customerToBarberReview.upsert({
      where: { customerId_barberId: { customerId: r.cId, barberId: barberProfile.id } },
      update: {},
      create: { customerId: r.cId, barberId: barberProfile.id, service: r.service, quality: r.quality, price: r.price, comment: r.comment },
    });
  }

  // Usta ortalama puanlarını güncelle
  const allRev = await prisma.customerToBarberReview.findMany({ where: { barberId: barberProfile.id } });
  const count = allRev.length;
  const avg = (f) => allRev.reduce((s, r) => s + r[f], 0) / count;
  await prisma.barberProfile.update({
    where: { id: barberProfile.id },
    data: { avgService: avg("service"), avgQuality: avg("quality"), avgPrice: avg("price"), reviewCount: count },
  });

  // ── USTA → MÜŞTERİ DEĞERLENDİRMELERİ ────────────────
  const customerReviews = [
    { cId: zeynep.id, score: 5, late: false, payment: false, noshow: false, comment: "Dakik ve kibar bir müşteri, memnuniyetle ağırladım." },
    { cId: can.id,    score: 4, late: true,  payment: false, noshow: false, comment: "Biraz geç kaldı ama iletişim kurdu, anlayışlı bir müşteri." },
    { cId: ayse.id,   score: 5, late: false, payment: false, noshow: false, comment: "Her zaman zamanında gelir, örnek müşteri!" },
    { cId: emre.id,   score: 3, late: true,  payment: true,  noshow: false, comment: "Geç geldi ve kasada vakit kaybettirdi." },
  ];

  for (const r of customerReviews) {
    await prisma.barberToCustomerReview.upsert({
      where: { barberId_customerId: { barberId: barberProfile.id, customerId: r.cId } },
      update: {},
      create: {
        barberId: barberProfile.id, customerId: r.cId,
        overallScore: r.score, lateArrival: r.late, paymentIssue: r.payment, noShow: r.noshow,
        comment: r.comment,
      },
    });
  }

  console.log("✅ Demo verisi hazır!");
  console.log(`   Usta profil ID : ${barberProfile.id}`);
  console.log(`   Zeynep profil ID: ${zeynep.id}`);
  console.log(`   → /demo adresini ziyaret edebilirsin`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
