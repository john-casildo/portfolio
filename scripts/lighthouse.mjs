import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const base = process.argv[2] ?? 'http://localhost:3100';
let failed = false;
for (const path of ['/en', '/es']) {
  const out = join(tmpdir(), `lh-${path.slice(1)}.json`);
  execFileSync('npx', ['--yes', 'lighthouse', `${base}${path}`, '--quiet', '--chrome-flags=--headless=new',
    '--only-categories=performance,accessibility,best-practices,seo', '--output=json', `--output-path=${out}`], {stdio: 'inherit'});
  const {categories} = JSON.parse(readFileSync(out, 'utf8'));
  for (const [key, {score}] of Object.entries(categories)) {
    const pct = Math.round(score * 100);
    console.log(`${path} ${key}: ${pct}`);
    if (pct < 90) failed = true;
  }
}
process.exit(failed ? 1 : 0);
