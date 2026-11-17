const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const BASE_URL = 'http://127.0.0.1:8080';
const EMAIL = 'ci-smoke@example.invalid';
const OLD_PASSWORD = 'ci-only-password-123';
const NEW_PASSWORD = 'new-ci-only-password-456';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ baseURL: BASE_URL });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByText('CyberVault', { exact: true }).first().waitFor();

    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('John Doe').fill('CI Smoke Test');
    await page.locator('input[type=email]').fill(EMAIL);
    await page.locator('input[type=password]').nth(0).fill(OLD_PASSWORD);
    await page.locator('input[type=password]').nth(1).fill(OLD_PASSWORD);
    await page.getByRole('button', { name: 'SUBMIT REQUEST' }).click();
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await page.getByText('CyberVault', { exact: true }).first().waitFor();

    await page.goto('/analytics', { waitUntil: 'domcontentloaded' });
    await page.getByText('No devices have been registered yet.').waitFor({ timeout: 30000 });
    const fleet = page.getByRole('heading', { name: 'Endpoint Fleet Health' }).locator('..');
    assert.match(await fleet.innerText(), /0\s+Devices/i);
    assert.doesNotMatch(await fleet.innerText(), /103\s+Devices/i);

    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await page.getByText('Two-factor sign-in is not available yet.').waitFor();
    await page.getByRole('button', { name: 'Update', exact: true }).click();
    await page.locator('#current-password').fill('wrong-password');
    await page.locator('#new-password').fill(NEW_PASSWORD);
    await page.locator('#confirm-new-password').fill(NEW_PASSWORD);
    const badChange = page.waitForResponse((r) => r.url().endsWith('/api/profile/password'));
    await page.getByRole('button', { name: 'Save password' }).click();
    assert.equal((await badChange).status(), 400);
    await page.getByText('Password update failed').first().waitFor();

    await page.locator('#current-password').fill(OLD_PASSWORD);
    const goodChange = page.waitForResponse((r) => r.url().endsWith('/api/profile/password'));
    await page.getByRole('button', { name: 'Save password' }).click();
    assert.equal((await goodChange).status(), 200);
    await page.getByText('Password updated', { exact: true }).first().waitFor();

    const newLogin = await page.request.post('/api/auth/login', {
      data: { email: EMAIL, password: NEW_PASSWORD },
    });
    assert.equal(newLogin.status(), 200, 'New password should authenticate');
    const oldLogin = await page.request.post('/api/auth/login', {
      data: { email: EMAIL, password: OLD_PASSWORD },
    });
    assert.equal(oldLogin.status(), 401, 'Old password should no longer authenticate');

    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Security Policy' }).click();
    await page.getByText('Two-factor sign-in is not available yet.').waitFor();

    await page.goto('/forgot-password', { waitUntil: 'domcontentloaded' });
    await page.getByText(/Email password recovery is not configured yet/).waitFor();

    await page.goto('/detection', { waitUntil: 'domcontentloaded' });
    const runAnalysis = page.getByRole('button', { name: 'Run Analysis' });
    await runAnalysis.waitFor({ timeout: 30000 });
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('button')).some((button) =>
        button.textContent.includes('Run Analysis') && !button.disabled),
      null,
      { timeout: 30000 },
    );
    const prediction = page.waitForResponse((r) => r.url().endsWith('/api/ml/predict'), { timeout: 120000 });
    await runAnalysis.click();
    const predictionResponse = await prediction;
    assert.equal(predictionResponse.status(), 200, 'Sample ML prediction should succeed');
    const payload = await predictionResponse.json();
    assert.equal(payload.success, true);
    assert.ok(payload.prediction && payload.prediction.threat);
    assert.deepEqual(pageErrors, [], 'Unexpected browser runtime errors');
    console.log('PASS: branding, registration, zero-device chart, password change, and ML prediction');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
