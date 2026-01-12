import { test, expect } from '@playwright/test';

test.describe('Site Connectivity Check', () => {
  test('should be able to access the demo site', async ({ page }) => {
    // Test basic connectivity to the site
    const response = await page.goto('https://demo.alphabin.co');
    
    // Check if we get a valid response
    expect(response?.status()).toBeLessThan(500);
    
    // Take a screenshot to see what's actually there
    await page.screenshot({ path: 'site-check.png', fullPage: true });
    
    // Log the page content for debugging
    const content = await page.content();
    console.log('Page content:', content);
    
    // Check if page has any meaningful content
    const bodyText = await page.locator('body').textContent();
    console.log('Body text:', bodyText);
  });
});