import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductPage extends BasePage {
  // Product listing selectors
  readonly productGrid: Locator;
  readonly productCards: Locator;
  readonly productTitles: Locator;
  readonly productPrices: Locator;
  readonly addToCartButtons: Locator;
  readonly buyNowButtons: Locator;
  
  // Product detail selectors
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly buyNowButton: Locator;
  
  // Cart selectors
  readonly cartIcon: Locator;
  readonly cartCount: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly removeFromCartButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Product listing
    this.productGrid = page.locator('.products, .product-grid, [data-testid="products"]').first();
    this.productCards = page.locator('.product-card, .product-item, [data-testid="product"]');
    this.productTitles = page.locator('.product-title, .product-name, h3, h4').filter({ hasText: /product|item/i });
    this.productPrices = page.locator('.price, .product-price, [data-testid="price"]');
    this.addToCartButtons = page.locator('button:has-text("Add to Cart"), .add-to-cart, [data-testid="add-to-cart"]');
    this.buyNowButtons = page.locator('button:has-text("Buy Now"), .buy-now, [data-testid="buy-now"]');
    
    // Product details
    this.productTitle = page.locator('h1, .product-title, [data-testid="product-title"]').first();
    this.productPrice = page.locator('.price, .product-price, [data-testid="product-price"]').first();
    this.productDescription = page.locator('.description, .product-description, [data-testid="description"]').first();
    this.quantityInput = page.locator('input[type="number"], .quantity, [data-testid="quantity"]').first();
    this.addToCartButton = page.locator('button:has-text("Add to Cart"), .add-to-cart-btn, [data-testid="add-to-cart-btn"]').first();
    this.buyNowButton = page.locator('button:has-text("Buy Now"), .buy-now-btn, [data-testid="buy-now-btn"]').first();
    
    // Cart
    this.cartIcon = page.locator('.cart, .shopping-cart, [data-testid="cart"]').first();
    this.cartCount = page.locator('.cart-count, .badge, [data-testid="cart-count"]').first();
    this.cartItems = page.locator('.cart-item, [data-testid="cart-item"]');
    this.checkoutButton = page.locator('button:has-text("Checkout"), .checkout-btn, [data-testid="checkout"]').first();
    this.removeFromCartButton = page.locator('button:has-text("Remove"), .remove-btn, [data-testid="remove"]').first();
  }

  async navigateToProducts() {
    await this.goto('/products');
    await this.waitForPageLoad();
  }

  async navigateToProduct(productId: string) {
    await this.goto(`/product/${productId}`);
    await this.waitForPageLoad();
  }

  async selectFirstProduct() {
    await this.productCards.first().click();
    await this.waitForPageLoad();
  }

  async selectProductByName(productName: string) {
    const product = this.productCards.filter({ hasText: productName }).first();
    await product.click();
    await this.waitForPageLoad();
  }

  async addToCart(quantity: number = 1) {
    if (await this.quantityInput.isVisible()) {
      await this.quantityInput.fill(quantity.toString());
    }
    
    await this.addToCartButton.click();
    
    // Wait for cart to update
    await this.page.waitForTimeout(1000);
  }

  async buyNow(quantity: number = 1) {
    if (await this.quantityInput.isVisible()) {
      await this.quantityInput.fill(quantity.toString());
    }
    
    await this.buyNowButton.click();
    await this.waitForPageLoad();
  }

  async viewCart() {
    await this.cartIcon.click();
    await this.waitForPageLoad();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
    await this.waitForPageLoad();
  }

  async verifyProductInCart(productName: string) {
    await this.viewCart();
    const cartItem = this.cartItems.filter({ hasText: productName }).first();
    await expect(cartItem).toBeVisible();
  }

  async verifyCartCount(expectedCount: number) {
    await expect(this.cartCount).toHaveText(expectedCount.toString());
  }

  async getProductPrice(): Promise<string> {
    return await this.productPrice.textContent() || '';
  }

  async getProductTitle(): Promise<string> {
    return await this.productTitle.textContent() || '';
  }
}