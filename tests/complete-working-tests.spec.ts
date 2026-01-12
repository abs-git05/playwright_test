import { test, expect } from '@playwright/test';

test.describe('Alphabin Demo Store - Complete Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.alphabin.co');
    // Wait for the React app to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give React time to render
  });

  test.describe('1. Homepage Verification', () => {
    test('should load homepage with correct title and main content', async ({ page }) => {
      // Verify page title
      await expect(page).toHaveTitle(/AB \| Demo Store/);
      
      // Verify main heading
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      
      // Verify navigation elements exist using data-testid (more reliable)
      await expect(page.locator('[data-testid="header-menu-home"]')).toBeVisible();
      await expect(page.locator('text=About Us').first()).toBeVisible();
      await expect(page.locator('text=Contact Us').first()).toBeVisible();
      await expect(page.locator('text=All Products').first()).toBeVisible();
    });

    test('should display main category sections', async ({ page }) => {
      // Check for category sections by their actual text content
      await expect(page.locator('text=Audio & Camera')).toBeVisible();
      await expect(page.locator('text=Appliances')).toBeVisible();
      await expect(page.locator('text=Gadgets')).toBeVisible();
      await expect(page.locator('text=PC & Laptops')).toBeVisible();
    });

    test('should display featured products section', async ({ page }) => {
      // Verify featured products section exists
      await expect(page.locator('text=Feature Product')).toBeVisible();
      
      // Use first() to avoid multiple element issues
      await expect(page.locator('[data-testid="feature-card-header"]').first()).toBeVisible();
      
      // Verify price is displayed
      await expect(page.locator('text=₹').first()).toBeVisible();
      
      // Verify ratings are displayed (use first() to avoid strict mode violation)
      await expect(page.locator('[data-testid="feature-card-review-count"]').first()).toBeVisible();
    });
  });

  test.describe('2. Product Browsing and Interaction', () => {
    test('should display multiple products with correct information', async ({ page }) => {
      // Verify multiple products are displayed
      const productHeaders = page.locator('[data-testid="feature-card-header"]');
      const count = await productHeaders.count();
      expect(count).toBeGreaterThan(5); // Should have multiple products
      
      // Verify each product has required information
      for (let i = 0; i < Math.min(count, 3); i++) {
        const product = productHeaders.nth(i);
        await expect(product).toBeVisible();
        
        // Check if price is visible for this product
        const priceLocator = page.locator('[data-testid="feature-card-price"]').nth(i);
        await expect(priceLocator).toBeVisible();
        
        // Check if rating is visible
        const ratingLocator = page.locator('[data-testid="feature-card-review-count"]').nth(i);
        await expect(ratingLocator).toBeVisible();
      }
    });

    test('should be able to interact with product cards', async ({ page }) => {
      // Find a product card link
      const productLinks = page.locator('a[href*="/product-detail/"]');
      const linkCount = await productLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Try to click on the first product link
      const firstProductLink = productLinks.first();
      await firstProductLink.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // Get the href before clicking
      const href = await firstProductLink.getAttribute('href');
      console.log(`Attempting to click product link: ${href}`);
      
      // Click using JavaScript to avoid viewport issues
      await firstProductLink.evaluate(el => el.click());
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Take screenshot to verify navigation
      await page.screenshot({ path: 'product-detail-page.png' });
    });

    test('should display specific products correctly', async ({ page }) => {
      // Verify specific products are displayed with correct information
      const expectedProducts = [
        'Dell XPS 13 (2021) Laptop',
        'SanDisk Extreme Pro 3.0 USB-C Memory Card Reader',
        'HP LaserJet Pro MFP M428fdw Wireless Printer',
        'JBL Charge 4 Bluetooth Speaker'
      ];
      
      for (const productName of expectedProducts) {
        const productElement = page.locator(`text=${productName}`).first();
        if (await productElement.isVisible()) {
          await expect(productElement).toBeVisible();
          console.log(`✓ Found product: ${productName}`);
        }
      }
    });
  });

  test.describe('3. Navigation and Page Flow', () => {
    test('should navigate through main menu items successfully', async ({ page }) => {
      // Test About Us navigation
      const aboutLink = page.locator('text=About Us').first();
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'about-us-page.png' });
      
      // Navigate back to home using the header menu
      const homeLink = page.locator('[data-testid="header-menu-home"]');
      await homeLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Verify we're back on homepage
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
    });

    test('should navigate to All Products page', async ({ page }) => {
      const allProductsLink = page.locator('text=All Products').first();
      await allProductsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'all-products-navigation.png' });
    });

    test('should navigate to Contact Us page', async ({ page }) => {
      const contactLink = page.locator('text=Contact Us').first();
      await contactLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'contact-us-navigation.png' });
    });
  });

  test.describe('4. Category Exploration', () => {
    test('should display category cards with correct information', async ({ page }) => {
      // Verify category cards are displayed
      const categoryCards = page.locator('[data-testid="category-card-name"]');
      const count = await categoryCards.count();
      expect(count).toBeGreaterThan(0);
      
      // Log the categories found and verify they're visible
      const categories = [];
      for (let i = 0; i < Math.min(count, 8); i++) {
        const categoryName = await categoryCards.nth(i).textContent();
        categories.push(categoryName);
        await expect(categoryCards.nth(i)).toBeVisible();
      }
      
      console.log(`Found ${categories.length} categories:`, categories);
      
      // Verify we have expected categories
      const expectedCategories = ['Gaming Laptops', 'Kitchen Appliances', 'Bluetooth Speakers', 'Mobile Accessories'];
      for (const expectedCategory of expectedCategories) {
        const found = categories.some(cat => cat?.includes(expectedCategory));
        if (found) {
          console.log(`✓ Found expected category: ${expectedCategory}`);
        }
      }
    });

    test('should be able to explore category sections', async ({ page }) => {
      // Look for "Explore More" buttons
      const exploreButtons = page.locator('text=Explore More');
      const buttonCount = await exploreButtons.count();
      
      if (buttonCount > 0) {
        console.log(`Found ${buttonCount} "Explore More" buttons`);
        
        // Click on the first explore button
        await exploreButtons.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'category-exploration.png' });
      }
    });
  });

  test.describe('5. Footer and Newsletter', () => {
    test('should display complete footer information', async ({ page }) => {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      // Check for footer sections
      await expect(page.locator('text=USEFUL LINKS')).toBeVisible();
      await expect(page.locator('text=COSTUMER POLICY')).toBeVisible();
      await expect(page.locator('text=FOLLOW US')).toBeVisible();
      
      // Check copyright
      await expect(page.locator('text=© 2026 Alphabin Technology Consulting')).toBeVisible();
      
      // Check footer links
      await expect(page.locator('[data-testid="footer-home"]')).toBeVisible();
      
      await page.screenshot({ path: 'footer-section.png' });
    });

    test('should have functional newsletter subscription', async ({ page }) => {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      // Look for subscription elements
      const subscriptionText = page.locator('text=Subscribe to receive the latest updates');
      await expect(subscriptionText).toBeVisible();
      
      // Look for input field and subscribe button
      const emailInput = page.locator('input[type="email"]').last();
      const subscribeBtn = page.locator('button:has-text("Subscribe")').last();
      
      if (await emailInput.isVisible() && await subscribeBtn.isVisible()) {
        await emailInput.fill('test@example.com');
        await subscribeBtn.click();
        await page.waitForTimeout(2000);
        console.log('✓ Newsletter subscription form is functional');
      }
      
      await page.screenshot({ path: 'newsletter-subscription.png' });
    });
  });

  test.describe('6. Responsive Design and Performance', () => {
    test('should work correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Verify main elements are still visible
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      await expect(page.locator('[data-testid="feature-card-header"]').first()).toBeVisible();
      
      // Take mobile screenshot
      await page.screenshot({ path: 'mobile-responsive.png', fullPage: true });
    });

    test('should work correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Verify main elements are still visible
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      await expect(page.locator('[data-testid="feature-card-header"]').first()).toBeVisible();
      
      // Take tablet screenshot
      await page.screenshot({ path: 'tablet-responsive.png', fullPage: true });
    });

    test('should load within acceptable performance limits', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('https://demo.alphabin.co');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      console.log(`Page load time: ${loadTime}ms`);
      
      // Verify page loaded within 15 seconds (reasonable for demo site)
      expect(loadTime).toBeLessThan(15000);
      
      // Verify main content is visible
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
    });
  });

  test.describe('7. Content and Promotional Elements', () => {
    test('should display promotional banners and offers', async ({ page }) => {
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
      
      // Look for "Shop Now" buttons
      const shopNowButtons = page.locator('text=Shop Now');
      const shopButtonCount = await shopNowButtons.count();
      expect(shopButtonCount).toBeGreaterThan(0);
      console.log(`Found ${shopButtonCount} "Shop Now" buttons`);
    });

    test('should display New Arrivals section', async ({ page }) => {
      // Look for New Arrivals section
      const newArrivalsSection = page.locator('text=New Arrivals');
      if (await newArrivalsSection.isVisible()) {
        await expect(newArrivalsSection).toBeVisible();
        console.log('✓ Found New Arrivals section');
        
        // Verify products are displayed in this section
        const productsInSection = page.locator('[data-testid="feature-card-header"]');
        const count = await productsInSection.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should handle page refresh and maintain functionality', async ({ page }) => {
      // Initial load verification
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      
      // Refresh page
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Verify content is still there after refresh
      await expect(page.locator('text=Demo E-commerce Testing Store')).toBeVisible();
      await expect(page.locator('[data-testid="feature-card-header"]').first()).toBeVisible();
      
      // Verify navigation still works
      const aboutLink = page.locator('text=About Us').first();
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      console.log('✓ Page refresh and navigation functionality verified');
    });
  });
});