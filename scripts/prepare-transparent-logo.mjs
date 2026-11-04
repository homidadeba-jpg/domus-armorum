import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

// Convert the original monochrome ink to alpha; preserve its pixel geometry.
// White paper becomes transparent, including the mark's negative spaces.
const { data, info } = await sharp('public/brand/domus-original.webp')
  .removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
const rgba = Buffer.alloc(info.width * info.height * 4);
for (let pixel = 0; pixel < data.length; pixel++) {
  const opacity = 255 - data[pixel];
  rgba[pixel * 4 + 3] = opacity <= 6 ? 0 : opacity;
}
const image = await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .webp({ lossless: true }).toBuffer();
const name = `domus-transparente-${createHash('sha256').update(image).digest('hex').slice(0, 8)}.webp`;
await writeFile(`public/brand/${name}`, image);
const main = await readFile('src/main.jsx', 'utf8');
await writeFile('src/main.jsx', main.replace(
  /(<img className="hero-emblem" src=")[^"]+(" alt=\{t.emblemAlt\} width=")\d+(" height=")\d+/,
  `$1/brand/${name}$2${info.width}$3${info.height}`,
));
console.log(JSON.stringify({ name, width: info.width, height: info.height, bytes: image.length }));
