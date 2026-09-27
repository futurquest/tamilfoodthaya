import sharp from 'sharp';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const images = [
  ['home-hero.png', 1680],
  ['menu-bg.png', 1600],
  ['contact-hero-bg.png', 1600],
  ['catering-hero-bg.png', 1600],
  ['catering_invitation_bg.png', 900],
  ['hero-catering2.jpg', 1000],
  ['thayapaalan.png', 900],
  ...Array.from({ length: 14 }, (_, index) => [`events/event-${String(index + 1).padStart(2, '0')}.png`, 1200]),
];

for (const [file, width] of images) {
  const source = join(publicDir, file);
  const target = join(publicDir, parse(file).dir, `${parse(file).name}.webp`);
  await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 78, effort: 6 }).toFile(target);
  console.log(`${file} -> ${parse(target).base}`);
}
