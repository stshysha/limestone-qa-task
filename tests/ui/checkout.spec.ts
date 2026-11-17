import { test, expect } from '../../src/fixtures';
import { LoginPage } from '../../src/pages/LoginPage';
import { config } from '../../src/config';

/**
 * Checkout suite
 *
 * standard_user:  runs against stored auth state (login done once in setup).
 * problem_user:   logs in independently because it uses different credentials
 *                 and the test is expected to expose a known defect.
 *
 * The test for problem_user is annotated with { tag: '@known-defect' } and
 * is NOT skipped. Skipping a known defect hides it from the report; instead
 * we mark it and let it fail visibly so the team can track it. The annotation
 * makes it easy to exclude from blocking CI gates while keeping it reported.
 */

test.describe('Checkout – standard_user', () => {
  // storageState injected by playwright.config → no login step here
  test('item total, tax and overall total are mathematically consistent', async ({
    inventoryPage,
    cartPage,
    checkoutInfoPage,
    checkoutOverviewPage,
  }) => {
    await inventoryPage.goto();

    const item1 = await inventoryPage.addItemToCartByIndex(0);
    const item2 = await inventoryPage.addItemToCartByIndex(1);
    const expectedItemTotal = parseFloat((item1.price + item2.price).toFixed(2));

    await cartPage.goto();
    await cartPage.proceedToCheckout();

    await checkoutInfoPage.fillInfo('Test', 'User', '12345');

    const summary = await checkoutOverviewPage.getSummary();

    // Item total must equal the sum of the two item prices (calculated, not hardcoded)
    expect(summary.itemTotal).toBeCloseTo(expectedItemTotal, 2);

    // Tax + item total must equal the displayed total
    const expectedTotal = parseFloat((summary.itemTotal + summary.tax).toFixed(2));
    expect(summary.total).toBeCloseTo(expectedTotal, 2);
  });
});

test.describe('Checkout – problem_user @known-defect', () => {
  /**
   * Design decision: problem_user is a known-broken persona on saucedemo.
   * We do NOT skip this test. Skipping means the defect disappears from
   * reports entirely — the team loses visibility. Instead we run it and let
   * it fail, tagged as @known-defect. CI can exclude the tag from blocking
   * the build while keeping full traceability of the issue.
   */
  test(
    'checkout total calculation is broken for problem_user',
    { tag: ['@known-defect'] },
    async ({ page, cartPage, checkoutInfoPage, checkoutOverviewPage }) => {
      // problem_user needs its own login — different credentials, can't reuse storageState
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(
        config.saucedemo.problemUser.username,
        config.saucedemo.problemUser.password,
      );
      await page.waitForURL('**/inventory.html');

      // Add two items
      const items = page.locator('.inventory_item');
      const prices: number[] = [];
      for (let i = 0; i < 2; i++) {
        const priceText = await items.nth(i).locator('.inventory_item_price').innerText();
        prices.push(parseFloat(priceText.replace('$', '')));
        await items.nth(i).getByRole('button', { name: /add to cart/i }).click();
      }
      const expectedItemTotal = parseFloat((prices[0] + prices[1]).toFixed(2));

      await cartPage.goto();
      await cartPage.proceedToCheckout();
      await checkoutInfoPage.fillInfo('Test', 'User', '12345');

      const summary = await checkoutOverviewPage.getSummary();

      // This assertion is expected to fail — that IS the defect being documented
      expect(summary.itemTotal).toBeCloseTo(expectedItemTotal, 2);
      const expectedTotal = parseFloat((summary.itemTotal + summary.tax).toFixed(2));
      expect(summary.total).toBeCloseTo(expectedTotal, 2);
    },
  );
});
