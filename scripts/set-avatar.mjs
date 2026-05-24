/**
 * Kullanım:
 *   node scripts/set-avatar.mjs "Hüseyin" huseyin.jpg
 *   node scripts/set-avatar.mjs "Ali" ali.mp4
 *
 * Fotoğraf/video public/images/ veya public/videos/ klasöründe olmalı.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { existsSync } from "fs";
import { join } from "path";

const adapter = new PrismaPg({ connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable" });
const prisma = new PrismaClient({ adapter });

const [,, barberName, filename] = process.argv;

if (!barberName || !filename) {
  console.log('Kullanım: node scripts/set-avatar.mjs "Hüseyin" huseyin.jpg');
  console.log('          node scripts/set-avatar.mjs "Ali" ali.mp4');
  process.exit(1);
}

const candidates = [
  join(process.cwd(), "public", "images", filename),
  join(process.cwd(), "public", "videos", filename),
];
const filePath = candidates.find(existsSync);
if (!filePath) {
  console.error(`❌ Dosya bulunamadı: public/images/${filename} veya public/videos/${filename}`);
  process.exit(1);
}
const folder = filePath.includes("/videos/") ? "videos" : "images";

const [firstName, ...rest] = barberName.trim().split(" ");
const surname = rest.join(" ");
const barber = await prisma.barberProfile.findFirst({
  where: surname
    ? { name: { contains: firstName, mode: "insensitive" }, surname: { contains: surname, mode: "insensitive" } }
    : { name: { contains: firstName, mode: "insensitive" } },
});

if (!barber) {
  console.error(`❌ "${barberName}" adında usta bulunamadı.`);
  process.exit(1);
}

await prisma.barberProfile.update({
  where: { id: barber.id },
  data: { avatar: `/${folder}/${filename}` },
});

console.log(`✅ ${barber.name} ${barber.surname} → /${folder}/${filename}`);
await prisma.$disconnect();
