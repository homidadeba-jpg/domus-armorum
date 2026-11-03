import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = resolve('.codex-attachments/67778845-4a20-45b4-bda5-81ac0159fbc5');
const logo = resolve(base, '71e8ee65-12d8-49cb-9aab-3e81d08c3dd6/1002527351.jpg');
await mkdir('public/brand', { recursive: true });
await copyFile(logo, 'public/brand/original-enviado.jpg');
await sharp(logo).trim({ threshold: 30 }).resize({ height: 1000, withoutEnlargement: true }).webp({ quality: 90 }).toFile('public/brand/domus-original.webp');
await sharp(logo).trim({ threshold: 30 }).resize(64, 64, { fit: 'contain', background: '#ffffff' }).png().toFile('public/brand/favicon.png');
const badge = await sharp(logo).trim({ threshold: 30 }).resize({ height: 450 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f0f1ed' } }).composite([{ input: badge, gravity: 'centre' }]).jpeg({ quality: 90 }).toFile('public/brand/social.jpg');
console.log('Brand assets prepared from user-provided originals.');
