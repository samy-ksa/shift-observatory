import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = await readFile(resolve(root, 'src/data/saudization-decisions.json'), 'utf8');
const rows = JSON.parse(source);
const columns = ['id', 'title', 'announced', 'effective', 'authority', 'scope', 'confidence', 'source_primary', 'source_secondary'];
const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
const csv = [columns.join(','), ...rows.map(row => columns.map(key => csvCell(row[key])).join(','))].join('\n') + '\n';
await mkdir(resolve(root, 'public/data'), { recursive: true });
await writeFile(resolve(root, 'public/data/saudization-decisions.json'), source);
await writeFile(resolve(root, 'public/data/saudization-decisions.csv'), csv);
console.log(`Generated ${rows.length} decisions in JSON and CSV`);
