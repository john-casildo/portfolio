import {chromium} from '@playwright/test';

const url = process.argv[2] ?? 'http://localhost:3100/en';
const browser = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
const page = await browser.newPage({viewport: {width: 1280, height: 900}, deviceScaleFactor: 1, reducedMotion: 'reduce'});
await page.goto(url);
await page.addStyleTag({content: '[data-testid=bg-canvas]{display:none!important} html,body{background:transparent!important}'});
const target = page.getByTestId('mascot-canvas');
await target.locator('canvas').waitFor();
await page.waitForTimeout(1500);
await target.screenshot({path: 'public/mascot-fallback.png', omitBackground: true});
await browser.close();
console.log('wrote public/mascot-fallback.png');
