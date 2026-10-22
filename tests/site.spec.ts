import { test, expect } from '@playwright/test';
import { tools } from '../src/data/tools';

for (const tool of tools) {
  test(`${tool.name}: route and responsive layout`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    // Remote-service availability is separate from local UI verification.
    await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, route => route.abort());
    const response = await page.goto(tool.href);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('main')).toHaveAttribute('id', 'main-content');
    await expect(page.locator('.workspace-nav .active')).toHaveCount(1);
    for (const width of [1440, 900, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow at ${width}px`).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('catalogue search, empty state and category navigation', async ({ page }) => {
  await page.goto('/tools.html');
  await expect(page.locator('.tool-card:visible')).toHaveCount(33);
  await page.getByRole('searchbox', { name: 'Find a tool' }).fill('json');
  await expect(page.locator('.tool-card:visible')).toHaveCount(1);
  await page.getByRole('searchbox').fill('no-such-tool-xyz');
  await expect(page.getByText('No matching tools')).toBeVisible();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(page.locator('.tool-card:visible')).toHaveCount(33);
  await page.locator('.workspace-nav').getByRole('link', { name: 'Convert' }).click();
  await expect(page.locator('.tool-card')).toHaveCount(10);
});

test('appearance persists across routes, resets and remains keyboard accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Custom color', { exact: true }).check();
  await page.locator('#accent-picker').fill('#ff0000');
  await page.getByLabel('Theme', { exact: true }).selectOption('light');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeFocused();
  await page.goto('/case-converter.html');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())).toBe('#ff0000');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Reset to Windows accent' }).click();
  expect(await page.evaluate(() => localStorage.getItem('text-utils-accent'))).toBeNull();
  await expect(page.getByLabel('Use Windows accent color')).toBeChecked();
});

test('tools still transform text, JSON, and Markdown', async ({ page }) => {
  await page.goto('/case-converter.html');
  await page.getByLabel('Input', { exact: true }).fill('Hello Jupiter');
  await expect(page.getByLabel('Output', { exact: true })).toHaveValue('HELLO JUPITER');
  await page.getByLabel('Case', { exact: true }).selectOption('snake');
  await expect(page.getByLabel('Output', { exact: true })).toHaveValue('hello_jupiter');
  await page.getByLabel('Input', { exact: true }).fill('Café élan naïve Zoë');
  await expect(page.getByLabel('Output', { exact: true })).toHaveValue('café_élan_naïve_zoë');
  await page.getByLabel('Case', { exact: true }).selectOption('title');
  await expect(page.getByLabel('Output', { exact: true })).toHaveValue('Café Élan Naïve Zoë');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByLabel('Input', { exact: true })).toHaveValue('');
  await page.goto('/json-tools.html');
  await page.locator('#jtInput').fill('{"name":"Jupiter","n":2}');
  await page.getByRole('button', { name: 'Format', exact: true }).click();
  await expect(page.locator('#jtOutput')).toHaveValue('{\n  "name": "Jupiter",\n  "n": 2\n}');
  await page.locator('#jtInput').fill('{broken');
  await page.getByRole('button', { name: 'Validate', exact: true }).click();
  await expect(page.locator('#jtStatus')).toHaveClass(/bad|error/);
  await page.goto('/markdown-previewer.html');
  await page.locator('#md-editor').fill('# Jupiter\n\n**Hello**');
  await expect(page.locator('#md-preview strong')).toHaveText('Hello');
});

test('legacy JSON links still reach the combined tool', async ({ page }) => {
  for (const route of ['/json-formatter.html', '/json-csv-converter.html']) {
    await page.goto(route); await expect(page).toHaveURL(/json-tools.html$/);
  }
});

test('catalogue works without JavaScript and with blocked storage', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage(); await page.goto('/tools.html');
  await expect(page.locator('.tool-card')).toHaveCount(33);
  await expect(page.locator('noscript .notice')).toBeVisible();
  await context.close();
  const privatePage = await browser.newPage();
  await privatePage.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  await privatePage.goto('/');
  await privatePage.getByRole('button', { name: 'Settings', exact: true }).click();
  await privatePage.getByLabel('Theme', { exact: true }).selectOption('light');
  await expect(privatePage.locator('html')).toHaveAttribute('data-theme', 'light');
  await privatePage.close();
});
