/**
 * Kullanım:
 *   node scripts/upload-portfolio.mjs "Hüseyin" foto1.jpg foto2.jpg ...
 *
 * Fotoğraflar public/images/ klasöründen veya tam yol ile verilebilir.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { copyFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";

const adapter = new PrismaPg({ connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable" });
const prisma = new PrismaClient({ adapter });

const [,, barberName, ...files] = process.argv;

if (!barberName || files.length === 0) {
  console.log('Kullanım: node scripts/upload-portfolio.mjs "Hüseyin" foto1.jpg foto2.jpg');
  process.exit(1);
}

async function main() {
  // Kuaförü bul
  const barber = await prisma.barberProfile.findFirst({
    where: { name: { contains: barberName, mode: "insensitive" } },
  });
  if (!barber) { console.error(`"${barberName}" adında kuaför bulunamadı.`); process.exit(1); }
  console.log(`✅ Kuaför: ${barber.name} ${barber.surname} (${barber.salonName})`);

  // Sistem müşterisi (admin adına yükleme için)
  const systemCustomer = await prisma.customerProfile.findFirst({ orderBy: { id: "asc" } });
  if (!systemCustomer) { console.error("Hiç müşteri profili yok."); process.exit(1); }

  // uploads klasörü
  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const imageUrls = [];
  for (const file of files) {
    // Tam yol veya public/images/ altında ara
    const candidates = [
      file,
      join(process.cwd(), "public", "images", file),
      join(process.cwd(), "public", file),
    ];
    const src = candidates.find(existsSync);
    if (!src) { console.warn(`⚠️  Dosya bulunamadı: ${file}`); continue; }

    const ext   = basename(src).split(".").pop()?.toLowerCase() || "jpg";
    const fname = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await copyFile(src, join(uploadsDir, fname));
    imageUrls.push(`/uploads/${fname}`);
    console.log(`📷  ${basename(src)} → /uploads/${fname}`);
  }

  if (imageUrls.length === 0) { console.error("Yüklenecek fotoğraf yok."); process.exit(1); }

  // Post oluştur
  const post = await prisma.post.create({
    data: {
      barberId:   barber.id,
      customerId: systemCustomer.id,
      caption:    null,
      images:     { create: imageUrls.map((url, i) => ({ url, order: i })) },
    },
  });

  console.log(`\n✅ ${imageUrls.length} fotoğraf yüklendi. Post ID: ${post.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
