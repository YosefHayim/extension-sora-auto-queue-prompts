import { test, expect } from '@playwright/test';

/**
 * E2E Tests for UI Validation
 * Tests form validation, error handling, and UI states
 */

test.describe('UI Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Load the extension popup
  });

  test('should display proper UI layout on load', async ({ page }) => {
    // Assert header elements
    const title = page.getByRole('heading', { name: /sora auto queue/i });
    await expect(title).toBeVisible();

    // Assert status bar
    const statusBar = page.locator('[class*="StatusBar"]');
    await expect(statusBar).toBeVisible();

    // Assert buttons
    const generateButton = page.getByRole('button', { name: /generate/i });
    const settingsButton = page.getByRole('button', { name: /settings/i });

    await expect(generateButton).toBeVisible();
    await expect(settingsButton).toBeVisible();
  });

  test('should display loading state correctly', async ({ page }) => {
    // Trigger loading by clicking Generate button
    await page.getByRole('button', { name: /generate/i }).first().click();

    // Fill in minimal form data
    const contextInput = page.getByPlaceholder(/describe what you want to create/i);
    await contextInput.fill('Test prompt for loading state');

    // Click generate to trigger loading
    const generateButton = page.getByRole('button', { name: /generate prompts/i });
    await generateButton.click();

    // Check for loading indicator (Loader2 icon with spin animation)
    const loadingIcon = page.locator('svg.animate-spin');
    await expect(loadingIcon).toBeVisible({ timeout: 2000 });

    // Or check for "Generating..." text
    const loadingText = page.getByText(/generating/i);
    await expect(loadingText).toBeVisible({ timeout: 2000 });
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Open settings dialog
    await page.getByRole('button', { name: /settings/i }).click();

    // Clear API key to trigger error
    const apiKeyInput = page.getByLabel(/openai api key/i);
    await apiKeyInput.clear();

    // Save settings
    await page.getByRole('button', { name: /save/i }).click();

    // Try to generate prompts without API key
    await page.getByRole('button', { name: /generate/i }).first().click();
    const contextInput = page.getByPlaceholder(/describe what you want to create/i);
    await contextInput.fill('Test error handling');
    await page.getByRole('button', { name: /generate prompts/i }).click();

    // Should show error message with destructive styling
    const errorMessage = page.locator('[class*="destructive"], [role="alert"], .text-destructive');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Error message should be descriptive
    const errorText = await errorMessage.textContent();
    expect(errorText).toBeTruthy();
    expect(errorText!.length).toBeGreaterThan(10); // Should have meaningful error text
  });

  test('should validate prompt card actions', async ({ page }) => {
    // Assume we have at least one prompt
    const promptCard = page.locator('.prompt-card, [class*="PromptCard"]').first();

    // Hover to reveal actions
    await promptCard.hover();

    // Assert action buttons are visible
    const editButton = promptCard.getByRole('button', { name: /edit/i });
    const duplicateButton = promptCard.getByRole('button', { name: /duplicate/i });
    const refineButton = promptCard.getByRole('button', { name: /refine/i });
    const moreButton = promptCard.getByRole('button', { name: /more/i });

    await expect(editButton).toBeVisible();
    await expect(duplicateButton).toBeVisible();
    await expect(refineButton).toBeVisible();
    await expect(moreButton).toBeVisible();
  });

  test('should display status badges with correct colors', async ({ page }) => {
    const promptCard = page.locator('.prompt-card, [class*="PromptCard"]').first();

    // Check for status badge
    const statusBadge = promptCard.locator('[class*="badge"], [class*="Badge"]');
    await expect(statusBadge).toBeVisible();

    // Badge should have appropriate color class (yellow for pending, blue for processing, green for completed)
    const badgeClasses = await statusBadge.getAttribute('class');
    expect(badgeClasses).toMatch(/(yellow|blue|green)/);
  });

  test('should display prompt metadata correctly', async ({ page }) => {
    const promptCard = page.locator('.prompt-card, [class*="PromptCard"]').first();

    // Should show media type badge
    const mediaTypeBadge = promptCard.getByText(/video|image/i);
    await expect(mediaTypeBadge).toBeVisible();

    // Should show prompt text
    const promptText = promptCard.locator('p[class*="text"]');
    await expect(promptText).toBeVisible();
    expect((await promptText.textContent())?.length).toBeGreaterThan(0);
  });

  test('should handle empty queue state', async ({ page }) => {
    // When queue is empty, should show empty state component
    const emptyStateIcon = page.locator('svg[class*="inbox"], [class*="Inbox"]');
    const emptyStateHeading = page.getByText(/no prompts yet/i);
    const emptyStateDescription = page.getByText(/generate ai prompts or import from csv/i);

    await expect(emptyStateIcon).toBeVisible();
    await expect(emptyStateHeading).toBeVisible();
    await expect(emptyStateDescription).toBeVisible();
  });

  test('should display queue statistics accurately', async ({ page }) => {
    // Status bar should show correct counts
    const statusBar = page.locator('[class*="StatusBar"]');

    const pendingBadge = statusBar.getByText(/\d+ pending/i);
    const processingBadge = statusBar.getByText(/\d+ processing/i);
    const completedBadge = statusBar.getByText(/\d+ completed/i);

    await expect(pendingBadge).toBeVisible();
    await expect(processingBadge).toBeVisible();
    await expect(completedBadge).toBeVisible();
  });

  test('should maintain responsive layout', async ({ page }) => {
    // Check that popup maintains 600px width constraint
    const container = page.locator('.popup-container');
    await expect(container).toBeVisible();

    const boundingBox = await container.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(600);
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Generate button should be focused
    const generateButton = page.getByRole('button', { name: /generate/i });
    await expect(generateButton).toBeFocused();

    // Continue tabbing
    await page.keyboard.press('Tab');
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await expect(settingsButton).toBeFocused();
  });

  test('should display proper focus indicators', async ({ page }) => {
    // Click first focusable element
    const generateButton = page.getByRole('button', { name: /generate/i });
    await generateButton.focus();

    // Should have visible focus ring
    const focusRing = await generateButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outline || styles.boxShadow;
    });

    expect(focusRing).toBeTruthy();
  });
});
