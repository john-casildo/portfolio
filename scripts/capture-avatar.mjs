// Captures the hero avatar sticker (default pose, eyes centered) as a transparent PNG for the link preview.
// Usage: node scripts/capture-avatar.mjs [url]   (needs a running server)
import {chromium} from '@playwright/test';

const url = process.argv[2] ?? 'http://localhost:3100/en';
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1280, height: 900}, deviceScaleFactor: 2, reducedMotion: 'reduce'});
await page.goto(url);
await page.addStyleTag({content: '[data-stamp], [data-slot=mascot] > p { display: none !important; } html, body { background: transparent !important; }'});
await page.waitForTimeout(800);
await page.getByRole('button', {name: /change pose|cambiar pose/i}).screenshot({path: 'public/avatar.png', omitBackground: true});
await browser.close();
console.log('wrote public/avatar.png');
