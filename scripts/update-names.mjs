import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable" });
const prisma = new PrismaClient({ adapter });

const FEMALE_NAMES = [
  { name: "Ayşe",    surname: "Kaya",    salon: "Ayşe Kaya Güzellik & Saç" },
  { name: "Fatma",   surname: "Yılmaz",  salon: "Fatma Yılmaz Saç Tasarım" },
  { name: "Zeynep",  surname: "Arslan",  salon: "Zeynep Arslan Color Studio" },
  { name: "Elif",    surname: "Çelik",   salon: "Elif Çelik Saç & Güzellik" },
  { name: "Merve",   surname: "Demir",   salon: "Merve Demir Premium Salon" },
  { name: "Seda",    surname: "Güneş",   salon: "Seda Güneş Kuaför & Bakım" },
  { name: "İpek",    surname: "Şahin",   salon: "İpek Şahin Saç Stüdyo" },
  { name: "Büşra",   surname: "Koç",     salon: "Büşra Koç Saç & Makyaj" },
  { name: "Ceren",   surname: "Özkan",   salon: "Ceren Özkan Güzellik Merkezi" },
  { name: "Naz",     surname: "Aydın",   salon: "Naz Aydın Saç Tasarım" },
  { name: "Hande",   surname: "Kurt",    salon: "Hande Kurt Color & Care" },
  { name: "Tuğba",   surname: "Yıldız",  salon: "Tuğba Yıldız Saç Stüdyosu" },
  { name: "Gamze",   surname: "Çetin",   salon: "Gamze Çetin Saç & Stil" },
  { name: "Derya",   surname: "Polat",   salon: "Derya Polat Güzellik Salonu" },
  { name: "Özlem",   surname: "Kara",    salon: "Özlem Kara Saç Tasarım" },
  { name: "Pınar",   surname: "Doğan",   salon: "Pınar Doğan Saç & Bakım" },
  { name: "Gülşen",  surname: "Şimşek",  salon: "Gülşen Şimşek Kuaför" },
  { name: "Sevgi",   surname: "Öztürk",  salon: "Sevgi Öztürk Güzellik Merkezi" },
  { name: "Yasemin", surname: "Acar",    salon: "Yasemin Acar Color Studio" },
  { name: "Dilek",   surname: "Çınar",   salon: "Dilek Çınar Saç Stüdyosu" },
];

async function main() {
  const profiles = await prisma.barberProfile.findMany({ orderBy: { id: "asc" } });
  console.log(`${profiles.length} kuaför profili bulundu.`);

  for (let i = 0; i < profiles.length; i++) {
    const data = FEMALE_NAMES[i % FEMALE_NAMES.length];
    await prisma.barberProfile.update({
      where: { id: profiles[i].id },
      data: { name: data.name, surname: data.surname, salonName: data.salon },
    });
    console.log(`✅ ${profiles[i].name} ${profiles[i].surname} → ${data.name} ${data.surname} (${data.salon})`);
  }

  console.log("\nTüm isimler güncellendi!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
