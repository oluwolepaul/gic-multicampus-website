import { readFileSync, readdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const pages = readdirSync(root).filter((name) => /\.(html|css|js)$/.test(name));
const failures = [];
let count = 0;

for (const page of pages) {
  const source = readFileSync(resolve(root, page), 'utf8');
  const references = source.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']|(?:^|[\s"'(])((?:\.\/)?images\/[\w./% -]+\.(?:jpeg|jpg|png|webp|svg))/gim);
  for (const reference of references) {
    const target = (reference[1] ?? reference[2]).trim();
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)) continue;
    const file = decodeURIComponent(target.split(/[?#]/, 1)[0]).replace(/^\.\//, '');
    if (!/\.(html|css|js|jpeg|jpg|png|webp|svg|ico)$/i.test(file)) continue;
    count += 1;
    let directory = resolve(root);
    const found = file.split('/').every((part) => {
      if (!readdirSync(directory).includes(part)) return false;
      directory += sep + part;
      return true;
    });
    if (!found) failures.push(page + ': ' + target);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Verified ' + count + ' local page and asset references across ' + pages.length + ' files.');
}
