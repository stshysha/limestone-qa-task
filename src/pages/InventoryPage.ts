import { Page } from '@playwright/test';

export interface ProductInfo {
  name: string;
  price: number;
}

export class InventoryPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  /**
   * Returns price of the first visible inventory item and adds it to cart.
   */
  async addItemToCartByIndex(index: number): Promise<ProductInfo> {
    const items = this.page.locator('.inventory_item');
    const item = items.nth(index);

    const name = await item.locator('.inventory_item_name').innerText();
    const priceText = await item.locator('.inventory_item_price').innerText();
    const price = parseFloat(priceText.replace('$', ''));

    await item.getByRole('button', { name: /add to cart/i }).click();

    return { name, price };
  }
}
