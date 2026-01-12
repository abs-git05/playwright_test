import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  // Common selectors - adjust these based on actual site structure
  readonly loginButton: Locator;
  readonly signupButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly phoneInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;
  readonly signupLink: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Login/Signup buttons
    this.loginButton = page.locator('[data-testid="login-btn"], .login-btn, #login-btn, button:has-text("Login"), button:has-text("Sign In")').first();
    this.signupButton = page.locator('[data-testid="signup-btn"], .signup-btn, #signup-btn, button:has-text("Sign Up"), button:has-text("Register")').first();
    
    // Form inputs
    this.emailInput = page.locator('[data-testid="email"], input[type="email"], #email, input[name="email"]').first();
    this.passwordInput = page.locator('[data-testid="password"], input[type="password"], #password, input[name="password"]').first();
    this.confirmPasswordInput = page.locator('[data-testid="confirm-password"], #confirm-password, input[name="confirmPassword"], input[name="password_confirmation"]').first();
    this.firstNameInput = page.locator('[data-testid="first-name"], #firstName, input[name="firstName"], input[name="first_name"]').first();
    this.lastNameInput = page.locator('[data-testid="last-name"], #lastName, input[name="lastName"], input[name="last_name"]').first();
    this.phoneInput = page.locator('[data-testid="phone"], #phone, input[name="phone"], input[type="tel"]').first();
    
    // Submit buttons
    this.submitButton = page.locator('[data-testid="submit"], button[type="submit"], .submit-btn, #submit').first();
    
    // Navigation links
    this.loginLink = page.locator('a:has-text("Login"), a:has-text("Sign In"), .login-link').first();
    this.signupLink = page.locator('a:has-text("Sign Up"), a:has-text("Register"), .signup-link').first();
    
    // Messages
    this.errorMessage = page.locator('.error, .alert-error, [data-testid="error"], .text-red-500').first();
    this.successMessage = page.locator('.success, .alert-success, [data-testid="success"], .text-green-500').first();
  }

  async navigateToLogin() {
    await this.goto('/login');
    await this.waitForPageLoad();
  }

  async navigateToSignup() {
    await this.goto('/signup');
    await this.waitForPageLoad();
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async clickSignupButton() {
    await this.signupButton.click();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async signup(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    await this.emailInput.fill(userData.email);
    await this.passwordInput.fill(userData.password);
    
    if (await this.confirmPasswordInput.isVisible()) {
      await this.confirmPasswordInput.fill(userData.password);
    }
    
    if (userData.firstName && await this.firstNameInput.isVisible()) {
      await this.firstNameInput.fill(userData.firstName);
    }
    
    if (userData.lastName && await this.lastNameInput.isVisible()) {
      await this.lastNameInput.fill(userData.lastName);
    }
    
    if (userData.phone && await this.phoneInput.isVisible()) {
      await this.phoneInput.fill(userData.phone);
    }
    
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async verifyLoginSuccess() {
    // Check for common indicators of successful login
    await expect(this.page).toHaveURL(/dashboard|profile|account|home/);
    // Or check for logout button, user menu, etc.
    const logoutButton = this.page.locator('button:has-text("Logout"), .logout, [data-testid="logout"]').first();
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
  }

  async verifySignupSuccess() {
    // Check for success message or redirect to login/dashboard
    const isSuccessMessageVisible = await this.successMessage.isVisible();
    const isOnDashboard = this.page.url().includes('dashboard') || this.page.url().includes('profile');
    
    expect(isSuccessMessageVisible || isOnDashboard).toBeTruthy();
  }

  async verifyErrorMessage(expectedMessage?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (expectedMessage) {
      await expect(this.errorMessage).toContainText(expectedMessage);
    }
  }
}