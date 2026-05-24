import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable" });
const prisma = new PrismaClient({ adapter });
const pw = await bcrypt.hash("demo123", 12);
const P = (seed, w = 500, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

// ── USTALAR ────────────────────────────────────────────────────────────────
const barbersData = [
  {
    email: "murat@demo.com", name: "Murat", surname: "Arslan",
    salon: "Arslan Barber", city: "İstanbul", district: "Beşiktaş",
    address: "Sinanpaşa Mah. Çırağan Cad. No:12",
    phone: "0532 222 33 44",
    specialties: ["Skin Fade", "Sakal Tıraşı", "Deri Kesim", "Klasik Kesim"],
    reviews: [ { s:5, q:5, p:4, comment: "İstanbul'un en iyi skin fade ustası!" },
               { s:5, q:4, p:5, comment: "Fiyat/performans açısından mükemmel." },
               { s:4, q:5, p:4, comment: "Ellerine sağlık, çok güzel bir kesim." } ],
    posts: [["p1","p2"],["p3"],["p4","p5"]],
  },
  {
    email: "elif@demo.com", name: "Elif", surname: "Yılmaz",
    salon: "Elif Hair Studio", city: "İstanbul", district: "Şişli",
    address: "Halaskargazi Cad. No:78",
    phone: "0533 444 55 66",
    specialties: ["Saç Boyama", "Röfle", "Balayage", "Keratin", "Saç Bakımı", "Ombre"],
    reviews: [ { s:5, q:5, p:3, comment: "Saç boyaması inanılmaz, kesinlikle tavsiye ederim!" },
               { s:5, q:5, p:4, comment: "Balayage tekniği çok başarılı." },
               { s:4, q:5, p:3, comment: "Biraz pahalı ama değer." },
               { s:5, q:5, p:4, comment: "En iyi saç boyacısı!" } ],
    posts: [["c1","c2"],["c3"],["c4"]],
  },
  {
    email: "serkan@demo.com", name: "Serkan", surname: "Çelik",
    salon: "Çelik Berber", city: "İstanbul", district: "Bakırköy",
    address: "İstasyon Cad. No:34",
    phone: "0534 555 66 77",
    specialties: ["Klasik Kesim", "Çocuk Kesimi", "Bıyık Şekillendirme", "Sakal Tıraşı"],
    reviews: [ { s:5, q:4, p:5, comment: "Çocuklarım için en doğru adres, çok sabırlı bir usta." },
               { s:4, q:4, p:5, comment: "Uygun fiyat, kaliteli iş." } ],
    posts: [["d1"],["d2","d3"]],
  },
  {
    email: "kemal@demo.com", name: "Kemal", surname: "Demir",
    salon: "Premium Barber", city: "İstanbul", district: "Beykoz",
    address: "Rıhtım Cad. No:5",
    phone: "0535 666 77 88",
    specialties: ["Skin Fade", "Deri Kesim", "Sakal Tıraşı", "Afro Kesim"],
    reviews: [ { s:5, q:5, p:4, comment: "Afro kesimde çok başarılı, takipçisi oldum." },
               { s:5, q:5, p:5, comment: "Hem usta hem dost, her seferinde muhteşem." },
               { s:4, q:5, p:4, comment: "Skin fade konusunda şehrin en iyisi." } ],
    posts: [["e1","e2"],["e3"],["e4"]],
  },
  {
    email: "ayse_k@demo.com", name: "Ayşe", surname: "Kara",
    salon: "Kara Güzellik", city: "İstanbul", district: "Kadıköy",
    address: "Moda Cad. No:91",
    phone: "0536 777 88 99",
    specialties: ["Saç Boyama", "Keratin", "Saç Bakımı", "Ombre", "Kaş Alma", "Saç Uzatma"],
    reviews: [ { s:5, q:5, p:4, comment: "Keratin işlemi sonrası saçlarım pırıl pırıl!" },
               { s:5, q:5, p:3, comment: "Ombre tekniği mükemmel ama fiyatlar biraz yüksek." },
               { s:5, q:5, p:4, comment: "Ayşe hanım gerçek bir sanat ustası." } ],
    posts: [["f1","f2"],["f3"]],
  },
];

// ── MÜŞTERİLER ─────────────────────────────────────────────────────────────
const customersData = [
  { email: "burak@demo.com",  name: "Burak",  surname: "Şahin",  city: "İstanbul" },
  { email: "selin@demo.com",  name: "Selin",  surname: "Kaya",   city: "Şişli"    },
  { email: "oguz@demo.com",   name: "Oğuz",   surname: "Tekin",  city: "Bakırköy" },
  { email: "merve@demo.com",  name: "Merve",  surname: "Çelik",  city: "Beşiktaş" },
  { email: "tarık@demo.com",  name: "Tarık",  surname: "Doğan",  city: "Beykoz"   },
];

async function upsertBarber(data) {
  const u = await prisma.user.upsert({
    where: { email: data.email }, update: {},
    create: { email: data.email, password: pw, userType: "BARBER" },
  });
  const b = await prisma.barberProfile.upsert({
    where: { userId: u.id }, update: {},
    create: {
      userId: u.id, name: data.name, surname: data.surname,
      salonName: data.salon, city: data.city, district: data.district,
      address: data.address, phone: data.phone,
      specialties: data.specialties, status: "APPROVED", approvedAt: new Date(),
    },
  });
  return b;
}

async function upsertCustomer(data) {
  const u = await prisma.user.upsert({
    where: { email: data.email }, update: {},
    create: { email: data.email, password: pw, userType: "CUSTOMER" },
  });
  const c = await prisma.customerProfile.upsert({
    where: { userId: u.id }, update: {},
    create: { userId: u.id, name: data.name, surname: data.surname, city: data.city },
  });
  return c;
}

async function main() {
  console.log("Ek demo verisi oluşturuluyor...");

  const barbers   = await Promise.all(barbersData.map(upsertBarber));
  const customers = await Promise.all(customersData.map(upsertCustomer));

  // Her usta için müşterilerden post ve yorum ekle
  for (let bi = 0; bi < barbers.length; bi++) {
    const barber = barbers[bi];
    const bd     = barbersData[bi];

    for (let ci = 0; ci < bd.posts.length; ci++) {
      const customer = customers[ci % customers.length];
      const seeds    = bd.posts[ci];
      const ex = await prisma.post.findFirst({ where: { barberId: barber.id, customerId: customer.id } });
      if (!ex) {
        await prisma.post.create({
          data: {
            customerId: customer.id, barberId: barber.id,
            caption: ci === 0 ? `${barber.salonName}'dan çıktım, harika bir deneyim!` : null,
            images: { create: seeds.map((s, i) => ({ url: P(s), order: i })) },
          },
        });
      }
    }

    // Yorumlar
    const reviewers = customers.slice(0, bd.reviews.length);
    for (let ri = 0; ri < bd.reviews.length; ri++) {
      const customer = reviewers[ri];
      const r = bd.reviews[ri];
      await prisma.customerToBarberReview.upsert({
        where: { customerId_barberId: { customerId: customer.id, barberId: barber.id } },
        update: {},
        create: { customerId: customer.id, barberId: barber.id, service: r.s, quality: r.q, price: r.p, comment: r.comment },
      });
    }

    // Ortalama güncelle
    const all = await prisma.customerToBarberReview.findMany({ where: { barberId: barber.id } });
    if (all.length > 0) {
      const avg = f => all.reduce((s, r) => s + r[f], 0) / all.length;
      await prisma.barberProfile.update({
        where: { id: barber.id },
        data: { avgService: avg("service"), avgQuality: avg("quality"), avgPrice: avg("price"), reviewCount: all.length },
      });
    }

    console.log(`✅ ${barber.salonName} — ${bd.posts.length} post, ${bd.reviews.length} yorum`);
  }

  console.log("\n🎉 Tüm demo verisi oluşturuldu!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
