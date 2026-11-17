import { test as setup } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { config } from '../../src/config';

const authFile = '.auth/storageState.json';

/**
 * Authentication setup: logs in once as standard_user and saves
 * the session to .auth/storageState.json. All UI tests reuse this
 * state so they start already authenticated — no login step in tests.
 */
setup('authenticate as standard_user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    config.saucedemo.standardUser.username,
    config.saucedemo.standardUser.password,
  );

  // Verify login succeeded before saving state
  await page.waitForURL('**/inventory.html');
  await page.context().storageState({ path: authFile });
});
