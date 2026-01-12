import { Page } from '@playwright/test';

export class TestHelpers {
  static async waitForNetworkIdle(page: Page, timeout: number = 10000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  static generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test.${timestamp}.${random}@example.com`;
  }

  static generateRandomString(length: number = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  static async scrollToBottom(page: Page) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  static async scrollToTop(page: Page) {
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }

  static async clearAndFill(page: Page, selector: string, text: string) {
    await page.locator(selector).clear();
    await page.locator(selector).fill(text);
  }

  static async waitForElementToBeVisible(page: Page, selector: string, timeout: number = 10000) {
    await page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  static async waitForElementToBeHidden(page: Page, selector: string, timeout: number = 10000) {
    await page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  static async getElementText(page: Page, selector: string): Promise<string> {
    return await page.locator(selector).textContent() || '';
  }

  static async isElementVisible(page: Page, selector: string): Promise<boolean> {
    try {
      await page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  static formatPrice(price: string): number {
    return parseFloat(price.replace(/[^0-9.]/g, ''));
  }

  static async retryAction(action: () => Promise<void>, maxRetries: number = 3, delay: number = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await action();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}