import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Queue Management
 * Tests the start, pause, resume, and stop functionality
 */

test.describe('Queue Management', () => {
  test.beforeEach(async ({ page }) => {
    // Load the extension popup
    // Note: In actual implementation, you'll need to load the extension
    // For now, this is a template structure
  });

  test('should display queue controls', async ({ page }) => {
    // Test that queue control buttons are visible
    const startButton = page.getByRole('button', { name: /start queue/i });
    await expect(startButton).toBeVisible();
  });

  test('should start queue when Start Queue button is clicked', async ({ page }) => {
    // Arrange
    const startButton = page.getByRole('button', { name: /start queue/i });

    // Act
    await startButton.click();

    // Assert
    const runningBadge = page.getByText(/▶ Running/i);
    await expect(runningBadge).toBeVisible();

    // Pause and Stop buttons should now be visible
    const pauseButton = page.getByRole('button', { name: /pause/i });
    await expect(pauseButton).toBeVisible();
  });

  test('should pause queue when Pause button is clicked', async ({ page }) => {
    // Arrange - Start the queue first
    const startButton = page.getByRole('button', { name: /start queue/i });
    await startButton.click();

    // Wait for queue to be running
    await expect(page.getByText(/▶ Running/i)).toBeVisible();

    // Act
    const pauseButton = page.getByRole('button', { name: /pause/i });
    await pauseButton.click();

    // Assert
    const pausedBadge = page.getByText(/⏸ Paused/i);
    await expect(pausedBadge).toBeVisible();

    // Resume button should now be visible
    const resumeButton = page.getByRole('button', { name: /resume/i });
    await expect(resumeButton).toBeVisible();
  });

  test('should resume queue when Resume button is clicked', async ({ page }) => {
    // Arrange - Start then pause the queue
    await page.getByRole('button', { name: /start queue/i }).click();
    await expect(page.getByText(/▶ Running/i)).toBeVisible();

    await page.getByRole('button', { name: /pause/i }).click();
    await expect(page.getByText(/⏸ Paused/i)).toBeVisible();

    // Act
    const resumeButton = page.getByRole('button', { name: /resume/i });
    await resumeButton.click();

    // Assert
    const runningBadge = page.getByText(/▶ Running/i);
    await expect(runningBadge).toBeVisible();
  });

  test('should stop queue when Stop button is clicked', async ({ page }) => {
    // Arrange - Start the queue
    await page.getByRole('button', { name: /start queue/i }).click();
    await expect(page.getByText(/▶ Running/i)).toBeVisible();

    // Act
    const stopButton = page.getByRole('button', { name: /stop/i });
    await stopButton.click();

    // Assert
    const stoppedBadge = page.getByText(/⏹ Stopped/i);
    await expect(stoppedBadge).toBeVisible();

    // Start Queue button should be visible again
    const startButton = page.getByRole('button', { name: /start queue/i });
    await expect(startButton).toBeVisible();
  });

  test('should display progress bar when queue is running', async ({ page }) => {
    // Arrange
    const startButton = page.getByRole('button', { name: /start queue/i });

    // Act
    await startButton.click();

    // Assert
    // Check for progress bar (assuming it has role="progressbar" or similar)
    const progressBar = page.locator('[role="progressbar"], .progress-bar');
    await expect(progressBar).toBeVisible();
  });

  test('should display correct prompt counts in status bar', async ({ page }) => {
    // Assert
    const pendingBadge = page.getByText(/pending/i);
    const processingBadge = page.getByText(/processing/i);
    const completedBadge = page.getByText(/completed/i);

    await expect(pendingBadge).toBeVisible();
    await expect(processingBadge).toBeVisible();
    await expect(completedBadge).toBeVisible();
  });
});
