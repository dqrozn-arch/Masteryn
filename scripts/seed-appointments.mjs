import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable",
});
const prisma = new PrismaClient({ adapter });

const BARBER_ID = "cmp9qs0a000019hlpz6m0stc4";

async function main() {
  const customers = await prisma.customerProfile.findMany({
    take: 5,
    select: { id: true, name: true, surname: true },
  });

  if (customers.length < 5) {
    console.error("Yeterli müşteri yok:", customers.length);
    return;
  }

  const now = new Date();
  const d = (daysOffset, hour) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + daysOffset);
    dt.setUTCHours(hour, 0, 0, 0);
    return dt;
  };

  const appointments = [
    {
      customerId: customers[0].id,
      service: "Saç Kesimi",
      date: d(-3, 10),  // 3 gün önce
      status: "COMPLETED",
      note: "Üstten kısa, yandan uzun istiyor.",
    },
    {
      customerId: customers[1].id,
      service: "Saç Boyama",
      date: d(-1, 14),  // dün
      status: "CANCELLED",
      note: "Balayage denemek istiyorum.",
      cancelNote: "Müşteri randevuyu iptal etti.",
    },
    {
      customerId: customers[2].id,
      service: "Modern Kesim",
      date: d(0, 11),   // bugün
      status: "CONFIRMED",
      note: null,
    },
    {
      customerId: customers[3].id,
      service: "Keratin",
      date: d(2, 13),   // 2 gün sonra
      status: "PENDING",
      note: "Saçlarım çok kuru, nem bakımı da yapabilir misiniz?",
    },
    {
      customerId: customers[4].id,
      service: "Saç Bakımı",
      date: d(5, 15),   // 5 gün sonra
      status: "CONFIRMED",
      note: "Hafif röfle de ekleyebilirsiniz.",
    },
  ];

  for (const appt of appointments) {
    const created = await prisma.appointment.create({
      data: {
        barberId: BARBER_ID,
        customerId: appt.customerId,
        service: appt.service,
        date: appt.date,
        duration: 60,
        status: appt.status,
        note: appt.note,
        cancelNote: appt.cancelNote ?? null,
      },
    });
    const customer = customers.find(c => c.id === appt.customerId);
    console.log(`✅ ${appt.status.padEnd(12)} | ${appt.service.padEnd(15)} | ${customer.name} ${customer.surname} | ${appt.date.toLocaleString("tr-TR")}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
