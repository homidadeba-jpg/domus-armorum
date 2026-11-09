import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

// Extract a clipping boundary; the original image pixels are left untouched.
const { data, info } = await sharp('public/brand/domus-original.webp').removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
const left = [], right = [];
for (let y = 0; y < info.height; y += 3) {
  let low = info.width, high = -1;
  for (let x = 0; x < info.width; x++) if (data[y * info.width + x] < 110) { low = Math.min(low, x); high = x; }
  if (high < low) continue;
  const yy = (y / (info.height - 1) * 100).toFixed(3) + '%';
  left.push((low / (info.width - 1) * 100).toFixed(3) + '% ' + yy);
  right.push((high / (info.width - 1) * 100).toFixed(3) + '% ' + yy);
}
await writeFile('src/data/brand-outline.json', JSON.stringify({ source: 'domus-original.webp', clip: 'polygon(' + [...left, ...right.reverse()].join(',') + ')' }));
console.log('Prepared exact original silhouette for the static fallback.');
