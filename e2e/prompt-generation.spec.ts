import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Prompt Generation
 * Tests AI prompt generation and validation
 */

test.describe('Prompt Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Load the extension popup
  });

  test('should display Generate button in header', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /generate/i });
    await expect(generateButton).toBeVisible();

    // Should have sparkle icon
    const sparkleIcon = generateButton.locator('svg');
    await expect(sparkleIcon).toBeVisible();
  });

  test('should show empty state when no prompts exist', async ({ page }) => {
    // Assert
    const emptyStateHeading = page.getByText(/no prompts yet/i);
    await expect(emptyStateHeading).toBeVisible();

    // Should have call-to-action buttons
    const generateButton = page.getByRole('button', { name: /generate prompts/i });
    const importButton = page.getByRole('button', { name: /import csv/i });

    await expect(generateButton).toBeVisible();
    await expect(importButton).toBeVisible();
  });

  test('should open generate modal when Generate button is clicked', async ({ page }) => {
    // Act
    const generateButton = page.getByRole('button', { name: /generate/i }).first();
    await generateButton.click();

    // Assert
    // TODO: Update selector based on actual modal implementation
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
  });

  test('should validate required fields in generate form', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: /generate/i }).first().click();

    // Act - Try to submit without filling context
    const submitButton = page.getByRole('button', { name: /generate prompts/i });
    await submitButton.click();

    // Assert - Should show validation error
    const errorMessage = page.getByText(/context prompt is required/i);
    await expect(errorMessage).toBeVisible();
  });

  test('should generate prompts with valid input', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: /generate/i }).first().click();

    // Fill in the form
    const contextInput = page.getByPlaceholder(/describe what you want to create/i);
    await contextInput.fill('Cinematic shots of futuristic cities');

    // Select batch size
    const batchSizeSelect = page.getByLabel(/batch size/i);
    await batchSizeSelect.selectOption('10');

    // Act
    const generateButton = page.getByRole('button', { name: /generate prompts/i });
    await generateButton.click();

    // Assert - Should show loading state
    const loadingText = page.getByText(/generating/i);
    await expect(loadingText).toBeVisible();

    // Should close modal on completion (with timeout for API call)
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 30000 });

    // Should show prompts in the list
    const promptCards = page.locator('.prompt-card, [class*="Card"]');
    await expect(promptCards.first()).toBeVisible();
  });

  test('should display character count for context input', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: /generate/i }).first().click();
    const contextInput = page.getByPlaceholder(/describe what you want to create/i);

    // Act
    await contextInput.fill('Test prompt');

    // Assert
    const charCount = page.getByText(/\/500 characters/i);
    await expect(charCount).toBeVisible();
    await expect(charCount).toContainText('11/500');
  });

  test('should enforce character limit on context input', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: /generate/i }).first().click();
    const contextInput = page.getByPlaceholder(/describe what you want to create/i);

    // Act - Try to enter more than 500 characters
    const longText = 'a'.repeat(600);
    await contextInput.fill(longText);

    // Assert - Should be truncated to 500
    const value = await contextInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(500);
  });
});
