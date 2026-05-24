import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: "postgresql://ozandogru@localhost:5432/masteryn" });
const prisma = new PrismaClient({ adapter });

const DATA = [
  {
    id: "cmpj6rbej000dukkzicqblg0o", // Ali Şahin
    certs: [
      { name: "L'Oréal Professionnel Teknik Eğitimi", issuer: "L'Oréal Professionnel Türkiye", year: 2018, description: "Saç boyama ve röfle teknikleri uzmanlık eğitimi" },
      { name: "TOBB Kuaförlük Meslek Sertifikası", issuer: "TOBB", year: 2016, description: "Ulusal yeterlilik belgesi" },
      { name: "Wella Professionals Renk Uzmanlığı", issuer: "Wella Professionals", year: 2021, description: "İleri renk teknik sertifikası" },
    ],
    workplaces: [
      { salonName: "Glamour Hair Studio", city: "İstanbul", role: "Saç Stilisti", startYear: 2016, endYear: 2019, isCurrent: false, order: 0 },
      { salonName: "Prestige Kuaför", city: "İstanbul", role: "Kıdemli Stilist", startYear: 2019, endYear: 2022, isCurrent: false, order: 1 },
      { salonName: "Ali Şahin Hair Studio", city: "İstanbul", role: "Salon Sahibi", startYear: 2022, endYear: null, isCurrent: true, order: 2 },
    ],
  },
  {
    id: "cmpj6rbgt000qukkzxpbfio5f", // Fuat Binici
    certs: [
      { name: "Schwarzkopf Professional Saç Tasarımı", issuer: "Schwarzkopf Professional", year: 2017, description: "Saç kesimi ve şekillendirme ileri teknikler" },
      { name: "İŞKUR Kuaförlük Uzmanlık Belgesi", issuer: "İŞKUR", year: 2015, description: "Mesleki yeterlilik sertifikası" },
    ],
    workplaces: [
      { salonName: "Style House Ankara", city: "Ankara", role: "Saç Stilisti", startYear: 2015, endYear: 2018, isCurrent: false, order: 0 },
      { salonName: "Binici Kuaför", city: "Ankara", role: "Salon Sahibi", startYear: 2018, endYear: null, isCurrent: true, order: 1 },
    ],
  },
  {
    id: "cmpj6rbi00016ukkz611a152z", // Ahmet Binici
    certs: [
      { name: "Kerastase Saç Bakımı Uzmanlığı", issuer: "Kérastase", year: 2019, description: "Profesyonel saç bakım ve keratin tedavi sertifikası" },
      { name: "Goldwell Saç Boyama Sertifikası", issuer: "Goldwell", year: 2020, description: "Balyaj ve ombre teknikleri uzmanlığı" },
      { name: "İzmir Kuaförler Odası Meslek Belgesi", issuer: "İzmir Kuaförler Odası", year: 2017, description: "Mesleki yeterlilik belgesi" },
    ],
    workplaces: [
      { salonName: "Bella Hair İzmir", city: "İzmir", role: "Asistan Stilist", startYear: 2017, endYear: 2019, isCurrent: false, order: 0 },
      { salonName: "Trend Saç Tasarım", city: "İzmir", role: "Saç Stilisti", startYear: 2019, endYear: 2022, isCurrent: false, order: 1 },
      { salonName: "Ahmet Binici", city: "İzmir", role: "Salon Sahibi", startYear: 2022, endYear: null, isCurrent: true, order: 2 },
    ],
  },
  {
    id: "cmpj6rbj1001lukkzqreszwqx", // Ozan Doğru
    certs: [
      { name: "Redken Renk Uzmanlığı", issuer: "Redken", year: 2018, description: "Saç rengi ve boyama tekniklerinde ileri sertifika" },
      { name: "Tony & Guy Uluslararası Eğitim", issuer: "Tony & Guy International", year: 2020, description: "Uluslararası saç tasarımı eğitim programı" },
    ],
    workplaces: [
      { salonName: "Elite Saç Stüdyo", city: "Bursa", role: "Saç Stilisti", startYear: 2018, endYear: 2021, isCurrent: false, order: 0 },
      { salonName: "Ozan Doğru Hair Designer", city: "Bursa", role: "Salon Sahibi", startYear: 2021, endYear: null, isCurrent: true, order: 1 },
    ],
  },
  {
    id: "cmpj6rbjw0020ukkzgb0ag9w3", // Enes Arslan
    certs: [
      { name: "TOBB Kuaförlük Meslek Sertifikası", issuer: "TOBB", year: 2016, description: "Ulusal yeterlilik belgesi" },
      { name: "Matrix Boya Uzmanlığı", issuer: "Matrix Professional", year: 2019, description: "Saç boyama ve bakım teknikleri sertifikası" },
    ],
    workplaces: [
      { salonName: "Antalya Saç Merkezi", city: "Antalya", role: "Stilist", startYear: 2016, endYear: 2020, isCurrent: false, order: 0 },
      { salonName: "Enes Arslan Kuaför", city: "Antalya", role: "Salon Sahibi", startYear: 2020, endYear: null, isCurrent: true, order: 1 },
    ],
  },
  {
    id: "cmpj6rbkr002eukkzunntlv7e", // Tuğba Kaçmaz
    certs: [
      { name: "L'Oréal Professionnel Bayan Saç Tasarımı", issuer: "L'Oréal Professionnel", year: 2017, description: "Bayan saç kesimi ve şekillendirme uzmanlığı" },
      { name: "Wella Saç Boyama İleri Teknikler", issuer: "Wella Professionals", year: 2019, description: "Balyaj, röfle ve ombre ileri teknik sertifikası" },
      { name: "İstanbul Kuaförler Odası Meslek Belgesi", issuer: "İstanbul Kuaförler Odası", year: 2016, description: "Mesleki yeterlilik belgesi" },
    ],
    workplaces: [
      { salonName: "Chic Hair Salon", city: "İstanbul", role: "Saç Stilisti", startYear: 2016, endYear: 2019, isCurrent: false, order: 0 },
      { salonName: "Vogue Saç Tasarım", city: "İstanbul", role: "Kıdemli Stilist", startYear: 2019, endYear: 2022, isCurrent: false, order: 1 },
      { salonName: "Tuğba Kaçmaz Bayan Kuaförü", city: "İstanbul", role: "Salon Sahibi", startYear: 2022, endYear: null, isCurrent: true, order: 2 },
    ],
  },
  {
    id: "cmpj6rblq002vukkzmnhm0rst", // Emin Usta
    certs: [
      { name: "Schwarzkopf Professional Renk Sertifikası", issuer: "Schwarzkopf Professional", year: 2018, description: "Saç boyama ve renk tasarımı sertifikası" },
      { name: "Kerastase Keratin Uzmanlığı", issuer: "Kérastase", year: 2020, description: "Keratin bakım ve düzleştirme teknikleri" },
    ],
    workplaces: [
      { salonName: "Luxe Hair İstanbul", city: "İstanbul", role: "Stilist", startYear: 2018, endYear: 2021, isCurrent: false, order: 0 },
      { salonName: "Emin Usta Hair Artist", city: "İstanbul", role: "Salon Sahibi", startYear: 2021, endYear: null, isCurrent: true, order: 1 },
    ],
  },
  {
    id: "cmpj6rbmp0038ukkz1maho108", // Veysel Baykal
    certs: [
      { name: "Goldwell Ombre & Balyaj Sertifikası", issuer: "Goldwell", year: 2019, description: "Ombre ve balyaj tekniklerinde ileri uzmanlık" },
      { name: "Ankara Kuaförler Odası Meslek Belgesi", issuer: "Ankara Kuaförler Odası", year: 2017, description: "Mesleki yeterlilik belgesi" },
      { name: "Redken Saç Sağlığı Uzmanlığı", issuer: "Redken", year: 2021, description: "Saç sağlığı ve bakım protokolleri sertifikası" },
    ],
    workplaces: [
      { salonName: "Ankara Hair Design", city: "Ankara", role: "Saç Stilisti", startYear: 2017, endYear: 2020, isCurrent: false, order: 0 },
      { salonName: "Baykal Saç Stüdyo", city: "Ankara", role: "Salon Sahibi", startYear: 2020, endYear: null, isCurrent: true, order: 1 },
    ],
  },
  {
    id: "cmpj6rbnl003oukkznnw0kka4", // Kıvanç Baloğlu
    certs: [
      { name: "L'Oréal Professionnel Teknik Eğitimi", issuer: "L'Oréal Professionnel Türkiye", year: 2017, description: "Saç boyama ve tasarım uzmanlık eğitimi" },
      { name: "İzmir Kuaförler Odası Meslek Belgesi", issuer: "İzmir Kuaförler Odası", year: 2015, description: "Mesleki yeterlilik belgesi" },
    ],
    workplaces: [
      { salonName: "Glamour Saç Tasarım İzmir", city: "İzmir", role: "Asistan Stilist", startYear: 2015, endYear: 2017, isCurrent: false, order: 0 },
      { salonName: "Premier Hair İzmir", city: "İzmir", role: "Saç Stilisti", startYear: 2017, endYear: 2021, isCurrent: false, order: 1 },
      { salonName: "Kıvanç Baloğlu", city: "İzmir", role: "Salon Sahibi", startYear: 2021, endYear: null, isCurrent: true, order: 2 },
    ],
  },
  {
    id: "cmpj6rbob0043ukkz3yrveke7", // Ali Bayan
    certs: [
      { name: "Matrix Saç Tasarımı Sertifikası", issuer: "Matrix Professional", year: 2018, description: "Saç tasarımı ve şekillendirme uzmanlığı" },
      { name: "Adana Kuaförler Odası Meslek Belgesi", issuer: "Adana Kuaförler Odası", year: 2016, description: "Mesleki yeterlilik belgesi" },
    ],
    workplaces: [
      { salonName: "Adana Saç & Güzellik", city: "Adana", role: "Stilist", startYear: 2016, endYear: 2020, isCurrent: false, order: 0 },
      { salonName: "Ali Bayan Kuaförü", city: "Adana", role: "Salon Sahibi", startYear: 2020, endYear: null, isCurrent: true, order: 1 },
    ],
  },
  {
    id: "cmpj6rbp5004iukkzq2id1qsl", // Volume Hair Studio
    certs: [
      { name: "Wella Professionals Renk Uzmanlığı", issuer: "Wella Professionals", year: 2016, description: "Saç renk tasarımı ileri teknik sertifikası" },
      { name: "Kerastase Saç Bakım Uzmanlığı", issuer: "Kérastase", year: 2019, description: "Profesyonel saç bakım protokolleri sertifikası" },
      { name: "Konya Kuaförler Odası Meslek Belgesi", issuer: "Konya Kuaförler Odası", year: 2015, description: "Mesleki yeterlilik belgesi" },
    ],
    workplaces: [
      { salonName: "Konya Saç Stüdyo", city: "Konya", role: "Saç Stilisti", startYear: 2015, endYear: 2018, isCurrent: false, order: 0 },
      { salonName: "Elit Saç Tasarım Konya", city: "Konya", role: "Kıdemli Stilist", startYear: 2018, endYear: 2021, isCurrent: false, order: 1 },
      { salonName: "Volume Hair Studio", city: "Konya", role: "Salon Sahibi", startYear: 2021, endYear: null, isCurrent: true, order: 2 },
    ],
  },
  {
    id: "cmpj6rbq0004wukkzuttfls53", // Murat Deler
    certs: [
      { name: "Schwarzkopf Balyaj Uzmanlığı", issuer: "Schwarzkopf Professional", year: 2019, description: "Balyaj ve açıcı teknikler ileri sertifika" },
      { name: "Gaziantep Kuaförler Odası Meslek Belgesi", issuer: "Gaziantep Kuaförler Odası", year: 2017, description: "Mesleki yeterlilik belgesi" },
    ],
    workplaces: [
      { salonName: "Gaziantep Hair Design", city: "Gaziantep", role: "Stilist", startYear: 2017, endYear: 2021, isCurrent: false, order: 0 },
      { salonName: "Murat Deler", city: "Gaziantep", role: "Salon Sahibi", startYear: 2021, endYear: null, isCurrent: true, order: 1 },
    ],
  },
  {
    id: "cmpj6rbqy005dukkzvpo0hu0g", // Fuat Uykan
    certs: [
      { name: "L'Oréal Professionnel İleri Renk Eğitimi", issuer: "L'Oréal Professionnel", year: 2018, description: "İleri düzey saç rengi ve teknik eğitim sertifikası" },
      { name: "Tony & Guy Saç Tasarımı", issuer: "Tony & Guy International", year: 2020, description: "Uluslararası saç tasarımı programı sertifikası" },
      { name: "İstanbul Kuaförler Odası Meslek Belgesi", issuer: "İstanbul Kuaförler Odası", year: 2016, description: "Mesleki yeterlilik belgesi" },
    ],
    workplaces: [
      { salonName: "Prestige Saç Tasarım", city: "İstanbul", role: "Asistan Stilist", startYear: 2016, endYear: 2018, isCurrent: false, order: 0 },
      { salonName: "Luxe Hair Studio İstanbul", city: "İstanbul", role: "Saç Stilisti", startYear: 2018, endYear: 2022, isCurrent: false, order: 1 },
      { salonName: "Fuat Uykan Hair Dizayn", city: "İstanbul", role: "Salon Sahibi", startYear: 2022, endYear: null, isCurrent: true, order: 2 },
    ],
  },
  {
    id: "cmpj6rbrn005qukkz06hwun2c", // Ali Stylist
    certs: [
      { name: "Redken Balyaj & Ombre Sertifikası", issuer: "Redken", year: 2019, description: "Balyaj ve ombre tekniklerinde uzmanlık sertifikası" },
      { name: "Kayseri Kuaförler Odası Meslek Belgesi", issuer: "Kayseri Kuaförler Odası", year: 2017, description: "Mesleki yeterlilik belgesi" },
    ],
    workplaces: [
      { salonName: "Kayseri Saç Merkezi", city: "Kayseri", role: "Saç Stilisti", startYear: 2017, endYear: 2021, isCurrent: false, order: 0 },
      { salonName: "Ali Stylist", city: "Kayseri", role: "Salon Sahibi", startYear: 2021, endYear: null, isCurrent: true, order: 1 },
    ],
  },
];

async function main() {
  console.log("Sertifikalar ve iş geçmişleri ekleniyor...");

  for (const barber of DATA) {
    for (const cert of barber.certs) {
      await prisma.barberCertificate.create({
        data: { barberId: barber.id, ...cert },
      });
    }
    for (const wp of barber.workplaces) {
      await prisma.barberWorkplace.create({
        data: { barberId: barber.id, ...wp },
      });
    }
    console.log(`✓ ${barber.id.slice(-6)} — ${barber.certs.length} sertifika, ${barber.workplaces.length} iş geçmişi`);
  }

  console.log("\n✅ Tamamlandı!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
