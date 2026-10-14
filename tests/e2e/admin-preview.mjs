// Run against a local Vite server. Set PLAYWRIGHT_PATH to an installed Playwright
// directory, or use the temporary juacil-admin-preview installation on Windows.
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || join(tmpdir(), 'juacil-admin-preview/node_modules/playwright'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const output = join(tmpdir(), 'juacil-admin-captures');
await mkdir(output, { recursive: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
await context.addInitScript(() => localStorage.setItem('juacil_active_user_id_v1.0', 'user-admin-01'));
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173';
const headings = { '': 'Resumen de la plataforma', '/tiendas': 'Tiendas de la comunidad', '/usuarios': 'Usuarios y accesos', '/pedidos': 'Pedidos de la plataforma' };
const results = [];
try {
  for (const width of [320, 360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, heading] of Object.entries(headings)) {
      await page.goto(`${baseUrl}/admin${route}`);
      await page.getByRole('heading', { level: 1, name: heading }).waitFor();
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
      assert(dimensions.page <= dimensions.viewport, `${route} overflows at ${width}: ${JSON.stringify(dimensions)}`);
      results.push({ width, route: `/admin${route}`, overflow: false });
      if ([390, 1440].includes(width)) await page.screenshot({ path: join(output, `admin-${route.slice(1) || 'resumen'}-${width}.png`), fullPage: true });
    }
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${baseUrl}/admin/tiendas`);
  await page.getByRole('button', { name: 'Registrar tienda' }).click();
  await page.getByRole('dialog').waitFor();
  assert(await page.getByLabel('Nombre comercial').evaluate(element => element === document.activeElement));
  const dialogSize = await page.getByRole('dialog').boundingBox();
  assert(dialogSize.x >= 0 && dialogSize.x + dialogSize.width <= 360);
  await page.screenshot({ path: join(output, 'admin-formulario-360.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.goto(`${baseUrl}/admin/pedidos`);
  await page.getByRole('button', { name: /JUA-/ }).first().click();
  await page.getByRole('heading', { name: 'Historial de estados' }).waitFor();
  await page.screenshot({ path: join(output, 'admin-detalle-360.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await page.goto(`${baseUrl}/admin`);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar datos' }).click();
  const download = await downloadPromise;
  assert(download.suggestedFilename().startsWith('juacil-datos-demo-'));
  assert.equal(errors.length, 0, `Browser errors: ${errors.join(', ')}`);
  console.log(JSON.stringify({ views: results, dialogs: 'passed', export: 'passed', browserErrors: errors, captures: output }, null, 2));
} finally {
  await browser.close();
}
