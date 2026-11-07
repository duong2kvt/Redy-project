import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

// Give each logo a distinct URL so browser tabs refresh their cached favicon.
const icon = await readFile('dist/favicon.ico');
const hash = createHash('sha256').update(icon).digest('hex').slice(0, 12);
const filename = `favicon-${hash}.ico`;
await writeFile(`dist/${filename}`, icon);
const html = await readFile('dist/index.html', 'utf8');
if (!html.includes('favicon.ico')) throw new Error('Exported favicon link is missing');
await writeFile('dist/index.html', html.replaceAll('favicon.ico', filename));
