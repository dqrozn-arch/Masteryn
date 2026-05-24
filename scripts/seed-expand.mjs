import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable" });
const prisma = new PrismaClient({ adapter });
const pw = await bcrypt.hash("demo123", 12);
const P = (seed, w = 500, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

// ── YENİ USTALAR ─────────────────────────────────────────────────────────────
const newBarbers = [
  {
    email: "zeynep_usta@demo.com", name: "Zeynep", surname: "Koç",
    salon: "Zeynep Saç Tasarım", city: "İstanbul", district: "Nişantaşı",
    address: "Abdi İpekçi Cad. No:22", phone: "0532 888 99 00",
    specialties: ["Saç Boyama", "Balayage", "Ombre", "Saç Bakımı", "Keratin"],
    reviews: [
      { vf:5,ts:5,pt:5,em:5,cs:5, comment:"Balayage'ı inanılmaz başarılı, hayatımın en iyi saç rengi!" },
      { vf:5,ts:5,pt:4,em:5,cs:5, comment:"Nişantaşı'nın en iyisi kesinlikle. Fiyat biraz yüksek ama değer." },
      { vf:5,ts:4,pt:5,em:5,cs:4, comment:"Ombre tekniği mükemmel, tam istediğim gibi çıktı." },
      { vf:5,ts:5,pt:5,em:4,cs:5, comment:"Saç bakım ürünleri çok kaliteli, önerdiği ürünleri aldım." },
    ],
    posts: [["zk1","zk2"],["zk3"],["zk4","zk5"],["zk6"]],
  },
  {
    email: "furkan@demo.com", name: "Furkan", surname: "Yılmaz",
    salon: "Furkan Barber & Spa", city: "İstanbul", district: "Etiler",
    address: "Nispetiye Cad. No:15", phone: "0533 777 66 55",
    specialties: ["Skin Fade", "Deri Kesim", "Sakal Tıraşı", "Afro Kesim", "Bıyık Şekillendirme"],
    reviews: [
      { vf:5,ts:5,pt:4,em:5,cs:5, comment:"Etiler'in en iyi fade ustası. Her seferinde mükemmel." },
      { vf:4,ts:5,pt:5,em:4,cs:4, comment:"Sakal şekillendirmesi harika, ustanın eli çok hafif." },
      { vf:5,ts:5,pt:5,em:5,cs:5, comment:"Spa ortamında kesim yapmak çok rahatlatıcı." },
    ],
    posts: [["fy1","fy2"],["fy3"],["fy4"],["fy5","fy6"]],
  },
  {
    email: "seda@demo.com", name: "Seda", surname: "Güneş",
    salon: "Seda Güneş Kuaförü", city: "Ankara", district: "Çankaya",
    address: "Tunalı Hilmi Cad. No:88", phone: "0534 555 44 33",
    specialties: ["Saç Boyama", "Röfle", "Keratin", "Saç Uzatma", "Kaş Alma"],
    reviews: [
      { vf:5,ts:4,pt:5,em:5,cs:4, comment:"Ankara'da bu kalitede başka yer yok." },
      { vf:4,ts:5,pt:4,em:4,cs:5, comment:"Röfle konusunda gerçekten uzman, çok doğal durdu." },
      { vf:5,ts:5,pt:5,em:5,cs:5, comment:"Saç uzatma için geldim, sonuç muhteşem." },
    ],
    posts: [["sg1","sg2"],["sg3"],["sg4","sg5"]],
  },
  {
    email: "burak_berber@demo.com", name: "Burak", surname: "Taş",
    salon: "Burak Classic Barber", city: "İzmir", district: "Alsancak",
    address: "Kıbrıs Şehitleri Cad. No:42", phone: "0535 333 22 11",
    specialties: ["Klasik Kesim", "Sakal Tıraşı", "Bıyık Şekillendirme", "Çocuk Kesimi"],
    reviews: [
      { vf:5,ts:5,pt:5,em:5,cs:5, comment:"Alsancak'ın en güvenilir berberi. Müdavimi oldum." },
      { vf:4,ts:4,pt:5,em:5,cs:4, comment:"Klasik kesimde usta gerçekten ustanın ustası." },
      { vf:5,ts:4,pt:4,em:4,cs:5, comment:"Çocuğuma da geliyoruz, çok sabırlı bir usta." },
      { vf:5,ts:5,pt:5,em:5,cs:4, comment:"İzmir'de bu kalitede klasik berber bulmak zor." },
    ],
    posts: [["bt1"],["bt2","bt3"],["bt4"],["bt5"]],
  },
  {
    email: "merve_salon@demo.com", name: "Merve", surname: "Demir",
    salon: "Merve Demir Güzellik", city: "İstanbul", district: "Bağcılar",
    address: "Güneşli İş Merkezi No:5", phone: "0536 111 22 33",
    specialties: ["Saç Boyama", "Saç Bakımı", "Kaş Alma", "Makyaj", "Ombre"],
    reviews: [
      { vf:5,ts:5,pt:4,em:5,cs:5, comment:"Mahallenin en iyisi, fiyatlar çok uygun." },
      { vf:4,ts:4,pt:5,em:4,cs:4, comment:"Saç bakımı sonrası saçlarım çok sağlıklı." },
    ],
    posts: [["md1","md2"],["md3"],["md4"]],
  },
  {
    email: "can_barber@demo.com", name: "Can", surname: "Arslan",
    salon: "Can Arslan Premium Barber", city: "İstanbul", district: "Levent",
    address: "Büyükdere Cad. No:127", phone: "0537 444 55 66",
    specialties: ["Skin Fade", "Klasik Kesim", "Sakal Tıraşı", "Deri Kesim"],
    reviews: [
      { vf:5,ts:5,pt:5,em:5,cs:5, comment:"Levent'in en premium berber deneyimi burada." },
      { vf:5,ts:5,pt:5,em:4,cs:5, comment:"Her seferinde aynı kalite, güvenilir bir usta." },
      { vf:4,ts:5,pt:4,em:5,cs:4, comment:"Skin fade konusunda çok başarılı." },
      { vf:5,ts:4,pt:5,em:5,cs:5, comment:"Salon atmosferi çok premium, beklemeye değer." },
    ],
    posts: [["ca1","ca2"],["ca3","ca4"],["ca5"],["ca6"]],
  },
  {
    email: "ipek@demo.com", name: "İpek", surname: "Şahin",
    salon: "İpek Şahin Color Studio", city: "İstanbul", district: "Şişli",
    address: "Cumhuriyet Cad. No:55", phone: "0538 222 33 44",
    specialties: ["Saç Boyama", "Balayage", "Röfle", "Keratin", "Saç Bakımı", "Ombre"],
    reviews: [
      { vf:5,ts:5,pt:4,em:5,cs:5, comment:"Renklendirmede şehrin en iyisi. Her ton mükemmel çıkıyor." },
      { vf:5,ts:5,pt:5,em:5,cs:4, comment:"Balayage için farklı salonlara gittim, en iyisi İpek hanım." },
      { vf:4,ts:5,pt:4,em:4,cs:5, comment:"Keratin işlemi sonrası saçlarım 3 ay düzgün kaldı." },
    ],
    posts: [["is1","is2"],["is3"],["is4","is5"],["is6"]],
  },
];

// ── YENİ MÜŞTERİLER ──────────────────────────────────────────────────────────
const newCustomers = [
  { email: "ali_k@demo.com",    name: "Ali",    surname: "Kaya",    city: "İstanbul" },
  { email: "elif_a@demo.com",   name: "Elif",   surname: "Arslan",  city: "Ankara"   },
  { email: "mert@demo.com",     name: "Mert",   surname: "Özkan",   city: "İzmir"    },
  { email: "naz@demo.com",      name: "Naz",    surname: "Çelik",   city: "İstanbul" },
  { email: "kerem@demo.com",    name: "Kerem",  surname: "Yıldız",  city: "İstanbul" },
  { email: "beren@demo.com",    name: "Beren",  surname: "Koç",     city: "Ankara"   },
  { email: "umut@demo.com",     name: "Umut",   surname: "Demir",   city: "İzmir"    },
  { email: "ceren@demo.com",    name: "Ceren",  surname: "Taş",     city: "İstanbul" },
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
  return prisma.customerProfile.upsert({
    where: { userId: u.id }, update: {},
    create: { userId: u.id, name: data.name, surname: data.surname, city: data.city },
  });
}

async function main() {
  console.log("Genişletilmiş demo verisi oluşturuluyor...\n");

  const barbers   = await Promise.all(newBarbers.map(upsertBarber));
  const customers = await Promise.all(newCustomers.map(upsertCustomer));

  for (let bi = 0; bi < barbers.length; bi++) {
    const barber = barbers[bi];
    const bd     = newBarbers[bi];

    // Postlar
    for (let pi = 0; pi < bd.posts.length; pi++) {
      const customer = customers[pi % customers.length];
      const existing = await prisma.post.findFirst({ where: { barberId: barber.id, customerId: customer.id } });
      if (!existing) {
        await prisma.post.create({
          data: {
            customerId: customer.id, barberId: barber.id,
            caption: pi === 0 ? `${barber.salonName}'dan harika bir deneyim yaşadım!` : null,
            images: { create: bd.posts[pi].map((s, i) => ({ url: P(s), order: i })) },
          },
        });
      }
    }

    // Yorumlar
    for (let ri = 0; ri < bd.reviews.length; ri++) {
      const customer = customers[(ri + 2) % customers.length];
      const r = bd.reviews[ri];
      await prisma.customerToBarberReview.upsert({
        where: { customerId_barberId: { customerId: customer.id, barberId: barber.id } },
        update: {},
        create: {
          customerId: customer.id, barberId: barber.id,
          visualFidelity: r.vf, technicalSkill: r.ts, processTransparency: r.pt,
          expectationMgmt: r.em, compensationScore: r.cs,
          comment: r.comment,
        },
      });
    }

    // Ortalama güncelle
    const all = await prisma.customerToBarberReview.findMany({ where: { barberId: barber.id } });
    if (all.length > 0) {
      const count = all.length;
      const a = (f) => all.reduce((s, r) => s + r[f], 0) / count;
      const avgs = {
        avgVisualFidelity: a("visualFidelity"), avgTechnical: a("technicalSkill"),
        avgTransparency: a("processTransparency"), avgExpectation: a("expectationMgmt"),
        avgCompensation: a("compensationScore"),
      };
      const overall = (Object.values(avgs).reduce((s, v) => s + v, 0) / 5) * 2;
      await prisma.barberProfile.update({
        where: { id: barber.id },
        data: { ...avgs, overallScore: overall, reviewCount: count },
      });
      console.log(`✅ ${barber.salonName.padEnd(30)} | ${bd.posts.length} post | ${count} yorum | ${overall.toFixed(1)}/10`);
    }
  }

  const totalBarbers  = await prisma.barberProfile.count({ where: { status: "APPROVED" } });
  const totalPosts    = await prisma.post.count();
  const totalReviews  = await prisma.customerToBarberReview.count();
  console.log(`\n🎉 Tamamlandı!`);
  console.log(`   Onaylı usta : ${totalBarbers}`);
  console.log(`   Toplam post : ${totalPosts}`);
  console.log(`   Toplam yorum: ${totalReviews}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
