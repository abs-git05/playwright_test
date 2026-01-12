import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string = '') {
    await this.page.goto(path);
    // Wait for React app to load
    await this.page.waitForSelector('body', { timeout: 30000 });
    // Wait for loading spinner to disappear
    await this.page.waitForSelector('.MuiLinearProgress-root', { state: 'hidden', timeout: 30000 }).catch(() => {
      // If no loading spinner found, continue
    });
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  async waitForElement(locator: Locator, timeout: number = 10000) {
    await locator.waitFor({ timeout });
  }
}