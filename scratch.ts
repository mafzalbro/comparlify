import fs from 'fs';
import path from 'path';

function walk(dir: string, cb: (f: string) => void) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, cb);
    else if (/\.(tsx|ts)$/.test(f)) cb(full);
  }
}

const missing = new Set<string>();

walk('./src', (file) => {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /from ['"](@\/[^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const imp = match[1];
    if (imp.startsWith('@/components') || imp.startsWith('@/lib') || imp.startsWith('@/hooks') || imp.startsWith('@/app/actions')) {
      const rel = imp.replace('@/', 'src/');
      const exists = ['.tsx', '.ts', '/index.tsx', '/index.ts'].some(ext => {
        try { fs.statSync(rel + ext); return true; } catch { return false; }
      });
      if (!exists) missing.add(`${imp}  <-- in: ${file.replace('./src/', 'src/')}`);
    }
  }
});

for (const m of [...missing].sort()) console.log(m);
