import { test, expect } from '@playwright/test';

test.describe('Site Exploration', () => {
  test('explore the demo site structure', async ({ page }) => {
    // Navigate to the site
    await page.goto('https://demo.alphabin.co');
    
    // Wait for the React app to load
    await page.waitForTimeout(5000);
    
    // Take a screenshot to see the current state
    await page.screenshot({ path: 'explore-1-initial.png', fullPage: true });
    
    // Wait for any loading to complete
    await page.waitForLoadState('networkidle');
    
    // Take another screenshot after loading
    await page.screenshot({ path: 'explore-2-loaded.png', fullPage: true });
    
    // Log all visible text on the page
    const bodyText = await page.locator('body').textContent();
    console.log('Page content after loading:', bodyText);
    
    // Look for common elements
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    const inputs = await page.locator('input').count();
    const forms = await page.locator('form').count();
    
    console.log(`Found: ${buttons} buttons, ${links} links, ${inputs} inputs, ${forms} forms`);
    
    // Try to find login/signup related elements
    const loginElements = await page.locator('text=/login|sign in|log in/i').count();
    const signupElements = await page.locator('text=/signup|sign up|register/i').count();
    const productElements = await page.locator('text=/product|shop|buy|cart/i').count();
    
    console.log(`Auth elements: ${loginElements} login, ${signupElements} signup`);
    console.log(`Commerce elements: ${productElements} product-related`);
    
    // List all clickable elements
    const clickableElements = await page.locator('button, a, [role="button"]').all();
    console.log('Clickable elements:');
    for (let i = 0; i < Math.min(clickableElements.length, 10); i++) {
      const text = await clickableElements[i].textContent();
      const tagName = await clickableElements[i].evaluate(el => el.tagName);
      console.log(`  ${tagName}: "${text?.trim()}"`);
    }
  });
});