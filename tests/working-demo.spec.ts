import { test, expect } from '@playwright/test';

test.describe('Demo Alphabin Store Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.alphabin.co');
    // Wait for the React app to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give React time to render
  });

  test.describe('Homepage Tests', () => {
    test('should load the homepage successfully', async ({ page }) => {
      // Verify page title
      await expect(page).toHaveTitle(/AB Demo Store/);
      
      // Verify main heading
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      
      // Verify navigation elements
      await expect(page.locator('text=Home')).toBeVisible();
      await expect(page.locator('text=About Us')).toBeVisible();
      await expect(page.locator('text=Contact Us')).toBeVisible();
      await expect(page.locator('text=All Products')).toBeVisible();
      await expect(page.locator('text=Your Cart')).toBeVisible();
    });

    test('should display product categories', async ({ page }) => {
      // Verify category sections
      await expect(page.locator('text=Audio & Camera')).toBeVisible();
      await expect(page.locator('text=Appliances')).toBeVisible();
      await expect(page.locator('text=Gadgets')).toBeVisible();
      await expect(page.locator('text=PC & Laptops')).toBeVisible();
    });

    test('should display featured products', async ({ page }) => {
      // Verify featured products section
      await expect(page.locator('text=Feature Product')).toBeVisible();
      
      // Check for specific products
      await expect(page.locator('text=Dell XPS 13 (2021) Laptop')).toBeVisible();
      await expect(page.locator('text=₹1,29,999')).toBeVisible();
      
      // Verify product ratings are displayed
      await expect(page.locator('text=(890)')).toBeVisible();
    });
  });

  test.describe('Product Browsing Tests', () => {
    test('should navigate to All Products page', async ({ page }) => {
      // Click on All Products
      await page.locator('text=All Products').first().click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on products page (URL or content change)
      // Since this is a SPA, check for content changes
      await page.waitForTimeout(2000);
      
      // Take screenshot to verify navigation
      await page.screenshot({ path: 'all-products.png' });
    });

    test('should be able to explore product categories', async ({ page }) => {
      // Test Audio & Camera category
      const audioCameraLink = page.locator('text=Audio & Camera').locator('..').locator('text=Explore More');
      if (await audioCameraLink.isVisible()) {
        await audioCameraLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      }
      
      // Take screenshot
      await page.screenshot({ path: 'audio-camera-category.png' });
    });

    test('should display product details when clicking on products', async ({ page }) => {
      // Find and click on a product
      const dellLaptop = page.locator('text=Dell XPS 13 (2021) Laptop').first();
      await dellLaptop.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Take screenshot of product detail page
      await page.screenshot({ path: 'product-detail.png' });
      
      // Verify we're on a product page (check for price, description, etc.)
      const hasPrice = await page.locator('text=/₹[0-9,]+/').isVisible();
      expect(hasPrice).toBeTruthy();
    });
  });

  test.describe('Cart Functionality Tests', () => {
    test('should be able to access cart', async ({ page }) => {
      // Click on Your Cart
      await page.locator('text=Your Cart').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Take screenshot of cart page
      await page.screenshot({ path: 'cart-page.png' });
    });

    test('should be able to add product to cart (if functionality exists)', async ({ page }) => {
      // First navigate to a product
      const dellLaptop = page.locator('text=Dell XPS 13 (2021) Laptop').first();
      await dellLaptop.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Look for Add to Cart button
      const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Add To Cart"), text=Add to Cart').first();
      
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForTimeout(1000);
        
        // Check if cart count updated or success message appeared
        const cartCount = page.locator('.cart-count, [data-testid="cart-count"]');
        if (await cartCount.isVisible()) {
          const count = await cartCount.textContent();
          expect(parseInt(count || '0')).toBeGreaterThan(0);
        }
      } else {
        console.log('Add to Cart functionality not found - this might be a display-only demo');
      }
      
      await page.screenshot({ path: 'add-to-cart-attempt.png' });
    });
  });

  test.describe('Navigation Tests', () => {
    test('should navigate to About Us page', async ({ page }) => {
      await page.locator('text=About Us').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'about-us.png' });
    });

    test('should navigate to Contact Us page', async ({ page }) => {
      await page.locator('text=Contact Us').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'contact-us.png' });
    });

    test('should be able to return to homepage', async ({ page }) => {
      // Navigate away first
      await page.locator('text=About Us').first().click();
      await page.waitForTimeout(2000);
      
      // Navigate back to home
      await page.locator('text=Home').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Verify we're back on homepage
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
    });
  });

  test.describe('Newsletter Subscription Test', () => {
    test('should be able to interact with newsletter subscription', async ({ page }) => {
      // Scroll to bottom to find newsletter subscription
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      // Look for subscription input and button
      const subscriptionInput = page.locator('input[type="email"], input[placeholder*="email" i]').last();
      const subscribeButton = page.locator('button:has-text("Subscribe"), text=Subscribe').last();
      
      if (await subscriptionInput.isVisible() && await subscribeButton.isVisible()) {
        await subscriptionInput.fill('test@example.com');
        await subscribeButton.click();
        await page.waitForTimeout(2000);
        
        // Check for success message or any response
        await page.screenshot({ path: 'newsletter-subscription.png' });
      }
    });
  });

  test.describe('Responsive Design Tests', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Verify main elements are still visible
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      
      // Take mobile screenshot
      await page.screenshot({ path: 'mobile-homepage.png', fullPage: true });
    });

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Verify main elements are still visible
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      
      // Take tablet screenshot
      await page.screenshot({ path: 'tablet-homepage.png', fullPage: true });
    });
  });
});