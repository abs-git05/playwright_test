import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  // Billing information
  readonly billingFirstName: Locator;
  readonly billingLastName: Locator;
  readonly billingEmail: Locator;
  readonly billingPhone: Locator;
  readonly billingAddress: Locator;
  readonly billingCity: Locator;
  readonly billingState: Locator;
  readonly billingZipCode: Locator;
  readonly billingCountry: Locator;

  // Payment information
  readonly cardNumber: Locator;
  readonly expiryDate: Locator;
  readonly cvcCode: Locator;
  readonly cardholderName: Locator;
  
  // Order summary
  readonly orderSummary: Locator;
  readonly orderTotal: Locator;
  readonly orderItems: Locator;
  
  // Actions
  readonly placeOrderButton: Locator;
  readonly continueButton: Locator;
  readonly backButton: Locator;
  
  // Confirmation
  readonly orderConfirmation: Locator;
  readonly orderNumber: Locator;
  readonly thankYouMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Billing form fields
    this.billingFirstName = page.locator('#billing-first-name, input[name="billing_first_name"], [data-testid="billing-first-name"]').first();
    this.billingLastName = page.locator('#billing-last-name, input[name="billing_last_name"], [data-testid="billing-last-name"]').first();
    this.billingEmail = page.locator('#billing-email, input[name="billing_email"], [data-testid="billing-email"]').first();
    this.billingPhone = page.locator('#billing-phone, input[name="billing_phone"], [data-testid="billing-phone"]').first();
    this.billingAddress = page.locator('#billing-address, input[name="billing_address"], [data-testid="billing-address"]').first();
    this.billingCity = page.locator('#billing-city, input[name="billing_city"], [data-testid="billing-city"]').first();
    this.billingState = page.locator('#billing-state, select[name="billing_state"], [data-testid="billing-state"]').first();
    this.billingZipCode = page.locator('#billing-zip, input[name="billing_zip"], [data-testid="billing-zip"]').first();
    this.billingCountry = page.locator('#billing-country, select[name="billing_country"], [data-testid="billing-country"]').first();
    
    // Payment fields
    this.cardNumber = page.locator('#card-number, input[name="card_number"], [data-testid="card-number"]').first();
    this.expiryDate = page.locator('#expiry-date, input[name="expiry_date"], [data-testid="expiry-date"]').first();
    this.cvcCode = page.locator('#cvc, input[name="cvc"], [data-testid="cvc"]').first();
    this.cardholderName = page.locator('#cardholder-name, input[name="cardholder_name"], [data-testid="cardholder-name"]').first();
    
    // Order summary
    this.orderSummary = page.locator('.order-summary, [data-testid="order-summary"]').first();
    this.orderTotal = page.locator('.order-total, .total, [data-testid="order-total"]').first();
    this.orderItems = page.locator('.order-item, [data-testid="order-item"]');
    
    // Action buttons
    this.placeOrderButton = page.locator('button:has-text("Place Order"), .place-order, [data-testid="place-order"]').first();
    this.continueButton = page.locator('button:has-text("Continue"), .continue, [data-testid="continue"]').first();
    this.backButton = page.locator('button:has-text("Back"), .back, [data-testid="back"]').first();
    
    // Confirmation elements
    this.orderConfirmation = page.locator('.order-confirmation, [data-testid="order-confirmation"]').first();
    this.orderNumber = page.locator('.order-number, [data-testid="order-number"]').first();
    this.thankYouMessage = page.locator(':has-text("Thank you"), :has-text("Order confirmed"), [data-testid="thank-you"]').first();
  }

  async fillBillingInformation(billingData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state?: string;
    zipCode: string;
    country?: string;
  }) {
    await this.billingFirstName.fill(billingData.firstName);
    await this.billingLastName.fill(billingData.lastName);
    await this.billingEmail.fill(billingData.email);
    
    if (billingData.phone && await this.billingPhone.isVisible()) {
      await this.billingPhone.fill(billingData.phone);
    }
    
    await this.billingAddress.fill(billingData.address);
    await this.billingCity.fill(billingData.city);
    
    if (billingData.state && await this.billingState.isVisible()) {
      await this.billingState.selectOption(billingData.state);
    }
    
    await this.billingZipCode.fill(billingData.zipCode);
    
    if (billingData.country && await this.billingCountry.isVisible()) {
      await this.billingCountry.selectOption(billingData.country);
    }
  }

  async fillPaymentInformation(paymentData: {
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    cardholderName: string;
  }) {
    await this.cardNumber.fill(paymentData.cardNumber);
    await this.expiryDate.fill(paymentData.expiryDate);
    await this.cvcCode.fill(paymentData.cvc);
    await this.cardholderName.fill(paymentData.cardholderName);
  }

  async placeOrder() {
    await this.placeOrderButton.click();
    await this.waitForPageLoad();
  }

  async verifyOrderSummary(expectedItems: string[]) {
    await expect(this.orderSummary).toBeVisible();
    
    for (const item of expectedItems) {
      const orderItem = this.orderItems.filter({ hasText: item }).first();
      await expect(orderItem).toBeVisible();
    }
  }

  async verifyOrderTotal(expectedTotal: string) {
    await expect(this.orderTotal).toContainText(expectedTotal);
  }

  async verifyOrderConfirmation() {
    await expect(this.orderConfirmation).toBeVisible();
    await expect(this.thankYouMessage).toBeVisible();
    
    // Verify order number is present
    await expect(this.orderNumber).toBeVisible();
  }

  async getOrderNumber(): Promise<string> {
    const orderNumberText = await this.orderNumber.textContent();
    return orderNumberText?.replace(/[^\d]/g, '') || '';
  }

  async getOrderTotal(): Promise<string> {
    return await this.orderTotal.textContent() || '';
  }
}