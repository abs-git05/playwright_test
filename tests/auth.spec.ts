import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { testUsers } from './fixtures/test-data';

test.describe('Authentication Tests', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
  });

  test.describe('User Signup', () => {
    test('should successfully sign up a new user', async ({ page }) => {
      await authPage.goto();
      
      // Try to find and click signup button/link
      try {
        await authPage.clickSignupButton();
      } catch {
        // If no signup button on homepage, try navigating to signup page
        await authPage.navigateToSignup();
      }

      // Fill signup form
      await authPage.signup(testUsers.newUser);

      // Verify successful signup
      await authPage.verifySignupSuccess();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await authPage.goto();
      
      try {
        await authPage.clickSignupButton();
      } catch {
        await authPage.navigateToSignup();
      }

      // Try signup with invalid email
      await authPage.signup({
        ...testUsers.newUser,
        email: 'invalid-email'
      });

      // Verify error message appears
      await authPage.verifyErrorMessage();
    });

    test('should show error for weak password', async ({ page }) => {
      await authPage.goto();
      
      try {
        await authPage.clickSignupButton();
      } catch {
        await authPage.navigateToSignup();
      }

      // Try signup with weak password
      await authPage.signup({
        ...testUsers.newUser,
        password: '123'
      });

      // Verify error message appears
      await authPage.verifyErrorMessage();
    });

    test('should show error for duplicate email', async ({ page }) => {
      await authPage.goto();
      
      try {
        await authPage.clickSignupButton();
      } catch {
        await authPage.navigateToSignup();
      }

      // First signup
      await authPage.signup(testUsers.newUser);
      
      // Try to signup again with same email
      await authPage.navigateToSignup();
      await authPage.signup(testUsers.newUser);

      // Verify error message appears
      await authPage.verifyErrorMessage();
    });
  });

  test.describe('User Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      // First create a user account
      await authPage.goto();
      
      try {
        await authPage.clickSignupButton();
      } catch {
        await authPage.navigateToSignup();
      }
      
      await authPage.signup(testUsers.newUser);
      
      // Now try to login
      try {
        await authPage.clickLoginButton();
      } catch {
        await authPage.navigateToLogin();
      }

      await authPage.login(testUsers.newUser.email, testUsers.newUser.password);

      // Verify successful login
      await authPage.verifyLoginSuccess();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await authPage.goto();
      
      try {
        await authPage.clickLoginButton();
      } catch {
        await authPage.navigateToLogin();
      }

      // Try login with invalid credentials
      await authPage.login('invalid@email.com', 'wrongpassword');

      // Verify error message appears
      await authPage.verifyErrorMessage();
    });

    test('should show error for empty fields', async ({ page }) => {
      await authPage.goto();
      
      try {
        await authPage.clickLoginButton();
      } catch {
        await authPage.navigateToLogin();
      }

      // Try login with empty fields
      await authPage.login('', '');

      // Verify error message appears
      await authPage.verifyErrorMessage();
    });

    test('should navigate between login and signup forms', async ({ page }) => {
      await authPage.goto();
      
      // Start with login
      try {
        await authPage.clickLoginButton();
      } catch {
        await authPage.navigateToLogin();
      }

      // Switch to signup
      if (await authPage.signupLink.isVisible()) {
        await authPage.signupLink.click();
        await expect(authPage.page).toHaveURL(/signup|register/);
      }

      // Switch back to login
      if (await authPage.loginLink.isVisible()) {
        await authPage.loginLink.click();
        await expect(authPage.page).toHaveURL(/login|signin/);
      }
    });
  });

  test.describe('Authentication Flow', () => {
    test('should maintain session after login', async ({ page }) => {
      // Create and login user
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

      // Navigate to different page and back
      await authPage.goto('/');
      await authPage.waitForPageLoad();

      // Should still be logged in
      const logoutButton = page.locator('button:has-text("Logout"), .logout, [data-testid="logout"]').first();
      await expect(logoutButton).toBeVisible({ timeout: 5000 });
    });
  });
});