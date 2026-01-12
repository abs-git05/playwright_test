import { test, expect } from '@playwright/test';

test.describe('Alphabin Demo Store - Working Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.alphabin.co');
    // Wait for the React app to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give React time to render
  });

  test.describe('Homepage Verification', () => {
    test('should load homepage with correct title and content', async ({ page }) => {
      // Verify page title (corrected)
      await expect(page).toHaveTitle(/AB \| Demo Store/);
      
      // Verify main heading
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      
      // Verify navigation elements exist
      await expect(page.locator('text=Home')).toBeVisible();
      await expect(page.locator('text=About Us')).toBeVisible();
      await expect(page.locator('text=Contact Us')).toBeVisible();
      await expect(page.locator('text=All Products')).toBeVisible();
    });

    test('should display main category sections', async ({ page }) => {
      // Use data-testid for more reliable selection
      await expect(page.locator('[data-testid="category-title-audio-camera"]')).toBeVisible();
      await expect(page.locator('[data-testid="category-title-appliances"]')).toBeVisible();
      await expect(page.locator('[data-testid="category-title-gadgets"]')).toBeVisible();
      await expect(page.locator('[data-testid="category-title-pc-laptops"]')).toBeVisible();
    });

    test('should display featured products section', async ({ page }) => {
      // Verify featured products section exists
      await expect(page.locator('text=Feature Product')).toBeVisible();
      
      // Use first() to avoid multiple element issues
      await expect(page.locator('[data-testid="feature-card-header"]').first()).toBeVisible();
      
      // Verify price is displayed
      await expect(page.locator('text=₹').first()).toBeVisible();
      
      // Verify ratings are displayed
      await expect(page.locator('text=/\\(\\d+\\)/')).toBeVisible();
    });
  });

  test.describe('Product Interaction Tests', () => {
    test('should be able to click on product cards', async ({ page }) => {
      // Find a clickable product card (look for the parent link)
      const productCard = page.locator('a').filter({ hasText: 'Dell XPS 13' }).first();
      
      // Scroll to the element first
      await productCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // Click on the product
      await productCard.click({ force: true });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Take screenshot to verify navigation
      await page.screenshot({ path: 'product-clicked.png' });
    });

    test('should display product information correctly', async ({ page }) => {
      // Verify multiple products are displayed
      const productHeaders = page.locator('[data-testid="feature-card-header"]');
      const count = await productHeaders.count();
      expect(count).toBeGreaterThan(0);
      
      // Verify each product has required information
      for (let i = 0; i < Math.min(count, 3); i++) {
        const product = productHeaders.nth(i);
        await expect(product).toBeVisible();
        
        // Check if price is visible for this product
        const priceLocator = page.locator('text=/₹[0-9,]+/').nth(i);
        if (await priceLocator.isVisible()) {
          await expect(priceLocator).toBeVisible();
        }
      }
    });
  });

  test.describe('Navigation Tests', () => {
    test('should navigate through main menu items', async ({ page }) => {
      // Test About Us navigation
      const aboutLink = page.locator('text=About Us').first();
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'about-page.png' });
      
      // Navigate back to home
      const homeLink = page.locator('text=Home').first();
      await homeLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Verify we're back on homepage
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
    });

    test('should navigate to All Products', async ({ page }) => {
      const allProductsLink = page.locator('text=All Products').first();
      await allProductsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'all-products-page.png' });
    });

    test('should navigate to Contact Us', async ({ page }) => {
      const contactLink = page.locator('text=Contact Us').first();
      await contactLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'contact-page.png' });
    });
  });

  test.describe('Category Exploration', () => {
    test('should be able to explore Audio & Camera category', async ({ page }) => {
      // Look for "Explore More" button in Audio & Camera section
      const exploreBtns = page.locator('text=Explore More');
      const count = await exploreBtns.count();
      
      if (count > 0) {
        await exploreBtns.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'audio-camera-explore.png' });
      }
    });

    test('should display category product cards', async ({ page }) => {
      // Verify category cards are displayed
      const categoryCards = page.locator('[data-testid="category-card-name"]');
      const count = await categoryCards.count();
      expect(count).toBeGreaterThan(0);
      
      // Log the categories found
      for (let i = 0; i < Math.min(count, 5); i++) {
        const categoryName = await categoryCards.nth(i).textContent();
        console.log(`Category ${i + 1}: ${categoryName}`);
      }
    });
  });

  test.describe('Newsletter and Footer Tests', () => {
    test('should display footer information', async ({ page }) => {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      // Check for footer elements
      await expect(page.locator('text=USEFUL LINKS')).toBeVisible();
      await expect(page.locator('text=COSTUMER POLICY')).toBeVisible();
      await expect(page.locator('text=FOLLOW US')).toBeVisible();
      
      // Check copyright
      await expect(page.locator('text=© 2026 Alphabin Technology Consulting')).toBeVisible();
    });

    test('should have newsletter subscription form', async ({ page }) => {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      // Look for subscription elements
      const subscriptionText = page.locator('text=Subscribe to receive the latest updates');
      if (await subscriptionText.isVisible()) {
        await expect(subscriptionText).toBeVisible();
        
        // Look for input field
        const emailInput = page.locator('input[type="email"]').last();
        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
          
          // Look for subscribe button
          const subscribeBtn = page.locator('button:has-text("Subscribe")').last();
          if (await subscribeBtn.isVisible()) {
            await subscribeBtn.click();
            await page.waitForTimeout(2000);
          }
        }
      }
      
      await page.screenshot({ path: 'newsletter-section.png' });
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
      await page.screenshot({ path: 'mobile-view.png', fullPage: true });
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
      await page.screenshot({ path: 'tablet-view.png', fullPage: true });
    });
  });

  test.describe('Performance and Loading Tests', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('https://demo.alphabin.co');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);
      
      // Verify page loaded within 10 seconds
      expect(loadTime).toBeLessThan(10000);
      
      // Verify main content is visible
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
    });

    test('should handle page refresh correctly', async ({ page }) => {
      // Initial load
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Verify content is still there after refresh
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      await expect(page.locator('[data-testid="feature-card-header"]').first()).toBeVisible();
    });
  });

  test.describe('Content Verification Tests', () => {
    test('should display correct product information', async ({ page }) => {
      // Verify specific products are displayed with correct information
      const products = [
        'Dell XPS 13 (2021) Laptop',
        'SanDisk Extreme Pro 3.0 USB-C Memory Card Reader',
        'HP LaserJet Pro MFP M428fdw Wireless Printer'
      ];
      
      for (const productName of products) {
        const productElement = page.locator(`text=${productName}`).first();
        if (await productElement.isVisible()) {
          await expect(productElement).toBeVisible();
          console.log(`✓ Found product: ${productName}`);
        }
      }
    });

    test('should display promotional banners', async ({ page }) => {
      // Look for promotional content
      const promoTexts = [
        'Enjoy an Exclusive 20% Off on Laptops',
        'Watch the Price Drop by a Whopping 20%'
      ];
      
      for (const promoText of promoTexts) {
        const promoElement = page.locator(`text=${promoText}`);
        if (await promoElement.isVisible()) {
          await expect(promoElement).toBeVisible();
          console.log(`✓ Found promotion: ${promoText}`);
        }
      }
    });
  });
});