#!/usr/bin/env node
/**
 * Re-export every illustration from Figma at higher pixel density.
 *
 *   FIGMA_TOKEN=figd_xxx npm run assets:hd
 *
 * Writes assets/redy/<name>@2x.png and <name>@3x.png next to the 1x files.
 * React Native / Expo automatically pick the best density for each device,
 * so no code changes are needed.
 * Token: Figma → Settings → Security → Personal access tokens (scope: file_content:read).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const token = process.env.FIGMA_TOKEN;
if (!token) {
  console.error('Missing FIGMA_TOKEN env var.');
  process.exit(1);
}
const { fileKey, assets } = JSON.parse(await readFile(join(root, 'scripts/figma-assets.json'), 'utf8'));
const entries = Object.entries(assets);

for (const scale of [2, 3]) {
  const ids = entries.map(([, id]) => id).join(',');
  const res = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=${scale}`, {
    headers: { 'X-Figma-Token': token },
  });
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`);
  const { images } = await res.json();
  for (const [name, id] of entries) {
    const url = images[id];
    if (!url) {
      console.warn(`! no render for ${name} (${id})`);
      continue;
    }
    const png = Buffer.from(await (await fetch(url)).arrayBuffer());
    await writeFile(join(root, `assets/redy/${name}@${scale}x.png`), png);
    console.log(`✓ ${name}@${scale}x`);
  }
}
