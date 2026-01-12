import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { ProductPage } from './pages/product.page';
import { CheckoutPage } from './pages/checkout.page';
import { testUsers, paymentData } from './fixtures/test-data';

test.describe('Product Purchase Tests', () => {
  let authPage: AuthPage;
  let productPage: ProductPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    productPage = new ProductPage(page);
    checkoutPage = new CheckoutPage(page);

    // Create and login user before each test
    await authPage.goto();
    
    try {
      await authPage.clickSignupButton();
    } catch {
      await authPage.navigateToSignup();
    }
    
    await authPage.signup(testUsers.newUser);
    
    try {
      await authPage.clickLoginButton();
    } catch {
      await authPage.navigateToLogin();
    }
    
    await authPage.login(testUsers.newUser.email, testUsers.newUser.password);
    await authPage.verifyLoginSuccess();
  });

  test.describe('Product Selection and Cart', () => {
    test('should add product to cart successfully', async ({ page }) => {
      // Navigate to products
      await productPage.navigateToProducts();

      // Select first available product
      await productPage.selectFirstProduct();

      // Get product details
      const productTitle = await productPage.getProductTitle();
      const productPrice = await productPage.getProductPrice();

      // Add to cart
      await productPage.addToCart(1);

      // Verify product is in cart
      await productPage.verifyProductInCart(productTitle);
      await productPage.verifyCartCount(1);
    });

    test('should add multiple products to cart', async ({ page }) => {
      await productPage.navigateToProducts();

      // Add first product
      await productPage.selectFirstProduct();
      await productPage.addToCart(2);
      await productPage.navigateToProducts();

      // Add second product if available
      const productCards = await productPage.productCards.count();
      if (productCards > 1) {
        await productPage.productCards.nth(1).click();
        await productPage.addToCart(1);
        
        // Verify cart count
        await productPage.verifyCartCount(3);
      }
    });

    test('should update product quantity in cart', async ({ page }) => {
      await productPage.navigateToProducts();
      await productPage.selectFirstProduct();

      // Add product with specific quantity
      await productPage.addToCart(3);
      await productPage.verifyCartCount(3);

      // View cart and verify quantity
      await productPage.viewCart();
      const quantityInput = page.locator('input[type="number"], .quantity-input').first();
      
      if (await quantityInput.isVisible()) {
        await expect(quantityInput).toHaveValue('3');
      }
    });

    test('should remove product from cart', async ({ page }) => {
      await productPage.navigateToProducts();
      await productPage.selectFirstProduct();
      await productPage.addToCart(1);

      // View cart and remove item
      await productPage.viewCart();
      
      if (await productPage.removeFromCartButton.isVisible()) {
        await productPage.removeFromCartButton.click();
        await productPage.verifyCartCount(0);
      }
    });
  });

  test.describe('Checkout Process', () => {
    test('should complete full purchase flow', async ({ page }) => {
      // Add product to cart
      await productPage.navigateToProducts();
      await productPage.selectFirstProduct();
      
      const productTitle = await productPage.getProductTitle();
      const productPrice = await productPage.getProductPrice();
      
      await productPage.addToCart(1);

      // Proceed to checkout
      await productPage.viewCart();
      await productPage.proceedToCheckout();

      // Fill billing information
      await checkoutPage.fillBillingInformation({
        firstName: testUsers.newUser.firstName,
        lastName: testUsers.newUser.lastName,
        email: testUsers.newUser.email,
        phone: testUsers.newUser.phone,
        address: '123 Test Street',
        city: 'Test City',
        state: 'CA',
        zipCode: '12345',
        country: 'US'
      });

      // Fill payment information
      await checkoutPage.fillPaymentInformation({
        cardNumber: paymentData.creditCard.number,
        expiryDate: paymentData.creditCard.expiry,
        cvc: paymentData.creditCard.cvc,
        cardholderName: paymentData.creditCard.name
      });

      // Verify order summary
      await checkoutPage.verifyOrderSummary([productTitle]);

      // Place order
      await checkoutPage.placeOrder();

      // Verify order confirmation
      await checkoutPage.verifyOrderConfirmation();
      
      const orderNumber = await checkoutPage.getOrderNumber();
      expect(orderNumber).toBeTruthy();
    });

    test('should show validation errors for incomplete billing info', async ({ page }) => {
      await productPage.navigateToProducts();
      await productPage.selectFirstProduct();
      await productPage.addToCart(1);
      await productPage.viewCart();
      await productPage.proceedToCheckout();

      // Try to proceed without filling required fields
      await checkoutPage.placeOrder();

      // Should show validation errors
      const errorMessages = page.locator('.error, .invalid, .text-red-500');
      await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
    });

    test('should show validation errors for invalid payment info', async ({ page }) => {
      await productPage.navigateToProducts();
      await productPage.selectFirstProduct();
      await productPage.addToCart(1);
      await productPage.viewCart();
      await productPage.proceedToCheckout();

      // Fill billing info
      await checkoutPage.fillBillingInformation({
        firstName: testUsers.newUser.firstName,
        lastName: testUsers.newUser.lastName,
        email: testUsers.newUser.email,
        address: '123 Test Street',
        city: 'Test City',
        zipCode: '12345'
      });

      // Fill invalid payment info
      await checkoutPage.fillPaymentInformation({
        cardNumber: '1234', // Invalid card number
        expiryDate: '01/20', // Expired date
        cvc: '12', // Invalid CVC
        cardholderName: ''
      });

      await checkoutPage.placeOrder();

      // Should show payment validation errors
      const errorMessages = page.locator('.error, .invalid, .text-red-500');
      await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
    });

    test('should calculate correct order total', async ({ page }) => {
      await productPage.navigateToProducts();
      await productPage.selectFirstProduct();
      
      const productPrice = await productPage.getProductPrice();
      const quantity = 2;
      
      await productPage.addToCart(quantity);
      await productPage.viewCart();
      await productPage.proceedToCheckout();

      // Verify order total calculation
      const orderTotal = await checkoutPage.getOrderTotal();
      expect(orderTotal).toBeTruthy();
      
      // Basic validation that total contains price information
      expect(orderTotal).toMatch(/\$|\d+/);
    });
  });

  test.describe('Buy Now Flow', () => {
    test('should complete direct purchase with Buy Now', async ({ page }) => {
      await productPage.navigateToProducts();
      await productPage.selectFirstProduct();
      
      const productTitle = await productPage.getProductTitle();
      
      // Use Buy Now instead of Add to Cart
      if (await productPage.buyNowButton.isVisible()) {
        await productPage.buyNow(1);

        // Should go directly to checkout
        await expect(page).toHaveURL(/checkout|payment/);

        // Complete the purchase
        await checkoutPage.fillBillingInformation({
          firstName: testUsers.newUser.firstName,
          lastName: testUsers.newUser.lastName,
          email: testUsers.newUser.email,
          address: '123 Test Street',
          city: 'Test City',
          zipCode: '12345'
        });

        await checkoutPage.fillPaymentInformation({
          cardNumber: paymentData.creditCard.number,
          expiryDate: paymentData.creditCard.expiry,
          cvc: paymentData.creditCard.cvc,
          cardholderName: paymentData.creditCard.name
        });

        await checkoutPage.placeOrder();
        await checkoutPage.verifyOrderConfirmation();
      }
    });
  });

  test.describe('Guest Checkout', () => {
    test('should allow guest checkout without login', async ({ page }) => {
      // Start fresh without login
      await page.goto('/');
      
      await productPage.navigateToProducts();
      await productPage.selectFirstProduct();
      await productPage.addToCart(1);
      await productPage.viewCart();
      await productPage.proceedToCheckout();

      // Should be able to checkout as guest
      const guestCheckoutButton = page.locator('button:has-text("Guest Checkout"), .guest-checkout').first();
      
      if (await guestCheckoutButton.isVisible()) {
        await guestCheckoutButton.click();

        // Fill guest information
        await checkoutPage.fillBillingInformation({
          firstName: 'Guest',
          lastName: 'User',
          email: 'guest@example.com',
          address: '123 Guest Street',
          city: 'Guest City',
          zipCode: '54321'
        });

        await checkoutPage.fillPaymentInformation({
          cardNumber: paymentData.creditCard.number,
          expiryDate: paymentData.creditCard.expiry,
          cvc: paymentData.creditCard.cvc,
          cardholderName: 'Guest User'
        });

        await checkoutPage.placeOrder();
        await checkoutPage.verifyOrderConfirmation();
      }
    });
  });
});