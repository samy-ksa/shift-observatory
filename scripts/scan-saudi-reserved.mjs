import fs from 'fs';

const urls = fs
  .readFileSync('/private/tmp/claude-501/-Users-samyaloulou/b36746f4-78bc-4517-8fcf-4e2ed6885bb7/scratchpad/en-job-urls.txt', 'utf8')
  .trim()
  .split('\n');

const CONCURRENCY = 8;
const reserved = [];
let i = 0;

async function worker() {
  while (i < urls.length) {
    const idx = i++;
    const url = urls[idx];
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      const isReserved = /Reserved for Saudi nationals/i.test(html);
      if (isReserved) {
        reserved.push({ url, title: titleMatch ? titleMatch[1] : '' });
      }
    } catch (e) {
      console.error(`Erreur sur ${url}: ${e.message}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(`\nTotal pages scannées: ${urls.length}`);
console.log(`Pages "Reserved for Saudi nationals": ${reserved.length}\n`);
for (const r of reserved) {
  console.log(`${r.url}\n  ${r.title}`);
}
