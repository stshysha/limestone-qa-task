import { Page } from '@playwright/test';

export interface CheckoutSummary {
  itemTotal: number;
  tax: number;
  total: number;
}

export class CheckoutOverviewPage {
  constructor(private readonly page: Page) {}

  async getSummary(): Promise<CheckoutSummary> {
    const itemTotalText = await this.page.locator('.summary_subtotal_label').innerText();
    const taxText = await this.page.locator('.summary_tax_label').innerText();
    const totalText = await this.page.locator('.summary_total_label').innerText();

    return {
      itemTotal: this.parsePrice(itemTotalText),
      tax: this.parsePrice(taxText),
      total: this.parsePrice(totalText),
    };
  }

  private parsePrice(text: string): number {
    const match = text.match(/\$?([\d.]+)/);
    if (!match) throw new Error(`Cannot parse price from: "${text}"`);
    return parseFloat(match[1]);
  }
}
