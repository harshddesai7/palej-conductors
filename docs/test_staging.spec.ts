/**
 * Playwright E2E Test Suite for Staging App
 * Run: npx playwright test docs/test_staging.spec.ts --headed
 * 
 * Requires: npm install -D @playwright/test
 */

import { test, expect } from '@playwright/test';

const STAGING_URL = 'https://palej-app-staging.vercel.app';
const TEST_EMAIL = 'workwithharshdesai@gmail.com';
const TEST_PASSWORD = 'palej2025';

test.describe('Staging Frontend Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(STAGING_URL);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button:has-text("Log In")');
    await page.waitForURL('**/dashboard/**', { timeout: 10000 });
  });

  test('Sidebar shows calculators and Search Database', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const expectedItems = ['Unified Calculator', 'Factor Calculator', 'Search Database'];
    const unexpectedItems = ['LME Copper', 'Bare Calculator', 'Fabrication List', 'Competitor Rates', 'Work Instructions', 'Die Calculator'];
    
    // Check expected items exist in sidebar
    for (const item of expectedItems) {
      const locator = page.locator(`nav a:has-text("${item}")`);
      await expect(locator).toBeVisible({ timeout: 5000 });
    }
    
    // Check unexpected items don't exist
    for (const item of unexpectedItems) {
      const locator = page.locator(`nav a:has-text("${item}")`);
      await expect(locator).not.toBeVisible({ timeout: 1000 });
    }
  });

  test('Factor Calculator - shows dash when incomplete', async ({ page }) => {
    await page.click('text=Factor Calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Enter incomplete inputs (missing % Increase)
    await page.fill('input[name="width"]', '12');
    await page.fill('input[name="thickness"]', '5');
    await page.fill('input[name="covering"]', '0.50');
    // Leave % Increase as 0
    
    // Wait for calculation to update
    await page.waitForTimeout(500);
    
    // Check output shows dash
    const outputElement = page.locator('.text-7xl').first();
    await expect(outputElement).toBeVisible();
    const output = await outputElement.textContent();
    expect(output?.trim()).toBe('—');
  });

  test('Factor Calculator - calculates correctly', async ({ page }) => {
    await page.click('text=Factor Calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Enter complete inputs
    await page.fill('input[name="width"]', '12');
    await page.fill('input[name="thickness"]', '5');
    await page.fill('input[name="covering"]', '0.50');
    await page.fill('input[name="percentageIncrease"]', '10');
    
    // Wait for calculation to update (wait for output to not be dash)
    const outputElement = page.locator('.text-7xl').first();
    await expect(outputElement).not.toHaveText('—', { timeout: 3000 });
    
    // Get output value
    const output = await outputElement.textContent();
    const factor = parseFloat(output?.trim() || '0');
    expect(factor).toBeGreaterThan(0);
    expect(factor).toBeCloseTo(1.857, 2); // Aluminium factor
  });

  test('Unified Calculator - Mode toggle works', async ({ page }) => {
    await page.click('text=Unified Calculator');
    await page.waitForLoadState('networkidle');
    
    // Verify default is Insulated
    const insulatedButton = page.locator('button:has-text("Insulated")');
    await expect(insulatedButton).toHaveClass(/bg-white/);
    
    // Click Bare mode
    await page.click('button:has-text("Bare")');
    
    // Verify Insulation Preset dropdown is hidden
    await expect(page.locator('label:has-text("Insulation Preset")')).not.toBeVisible();
    
    // Verify Length input appears
    await expect(page.locator('input[name="length"]')).toBeVisible();
  });

  test('Unified Calculator - Bare mode calculation', async ({ page }) => {
    await page.click('text=Unified Calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Switch to Bare mode
    await page.click('button:has-text("Bare")');
    await page.waitForTimeout(500);
    
    // Enter inputs
    await page.fill('input[name="width"]', '10');
    await page.fill('input[name="thickness"]', '2');
    await page.fill('input[name="length"]', '1000');
    
    // Wait for calculation
    await page.waitForTimeout(1000);
    
    // Check results - find Bare Area and Weight in results section
    const resultsSection = page.locator('h2:has-text("Bare Analysis"), h2:has-text("Live Calculations")').locator('..');
    const bareAreaText = await resultsSection.locator('text=/Bare Area/').locator('..').locator('.text-xl').first().textContent();
    const weightText = await resultsSection.locator('text=/Weight/').locator('..').locator('.text-xl').first().textContent();
    
    expect(bareAreaText).toContain('20.0000');
    expect(weightText).toContain('54.180'); // Aluminium
  });

  test('Unified Calculator - kV selector appears for Poly+DFG', async ({ page }) => {
    await page.click('text=Unified Calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Select Poly + Dfg 225
    await page.selectOption('select', 'Poly + Dfg 225');
    await page.waitForTimeout(500);
    
    // Wait for kV toggle to appear - use first() to handle multiple matches
    const kV8Button = page.locator('button:has-text("8 kV")').first();
    const kV18Button = page.locator('button:has-text("18 kV")').first();
    await expect(kV8Button).toBeVisible({ timeout: 5000 });
    await expect(kV18Button).toBeVisible({ timeout: 5000 });
  });

  test('Unified Calculator - Dual layer preset shows 2 inputs + total insulation', async ({ page }) => {
    await page.click('text=Unified Calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Select Poly + Dfg 225 (dual layer)
    await page.selectOption('select', 'Poly + Dfg 225');
    await page.waitForTimeout(500);
    
    // Verify two layer inputs appear
    await expect(page.locator('input[name="polyCov"]')).toBeVisible();
    await expect(page.locator('input[name="dfgCov"]')).toBeVisible();
    
    // Verify total insulation display appears
    const totalInsulationLabel = page.locator('label:has-text("Total Insulation (mm)")');
    await expect(totalInsulationLabel).toBeVisible();
    
    // Enter values and verify total updates
    await page.fill('input[name="polyCov"]', '0.35');
    await page.fill('input[name="dfgCov"]', '0.50');
    await page.waitForTimeout(300);
    
    // Check total insulation shows sum (0.85)
    const totalInsulationDiv = totalInsulationLabel.locator('..').locator('div').last();
    const totalText = await totalInsulationDiv.textContent();
    expect(totalText?.trim()).toBe('0.85');
  });

  test('Unified Calculator - Poly + Paper shows single input + total insulation', async ({ page }) => {
    await page.click('text=Unified Calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Select Poly + Paper (single layer, despite + in name)
    await page.selectOption('select', 'Poly + Paper');
    await page.waitForTimeout(500);
    
    // Verify single insulation input appears (not dual layer inputs)
    await expect(page.locator('input[name="insulationThickness"]')).toBeVisible();
    await expect(page.locator('input[name="polyCov"]')).not.toBeVisible();
    await expect(page.locator('input[name="dfgCov"]')).not.toBeVisible();
    
    // Verify total insulation display appears
    const totalInsulationLabel = page.locator('label:has-text("Total Insulation (mm)")');
    await expect(totalInsulationLabel).toBeVisible();
    
    // Enter value and verify total matches
    await page.fill('input[name="insulationThickness"]', '0.50');
    await page.waitForTimeout(300);
    
    const totalInsulationDiv = totalInsulationLabel.locator('..').locator('div').last();
    const totalText = await totalInsulationDiv.textContent();
    expect(totalText?.trim()).toBe('0.5');
  });

  test('Unified Calculator - Enamel default is 0.12 mm', async ({ page }) => {
    await page.click('text=Unified Calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Select Enamel preset
    await page.selectOption('select', 'Enamel');
    await page.waitForTimeout(500);
    
    // Verify default thickness is 0.12
    const insulationInput = page.locator('input[name="insulationThickness"]');
    await expect(insulationInput).toBeVisible();
    const value = await insulationInput.inputValue();
    expect(value).toBe('0.12');
    
    // Verify total insulation shows 0.12
    const totalInsulationLabel = page.locator('label:has-text("Total Insulation (mm)")');
    await expect(totalInsulationLabel).toBeVisible();
    const totalInsulationDiv = totalInsulationLabel.locator('..').locator('div').last();
    const totalText = await totalInsulationDiv.textContent();
    expect(totalText?.trim()).toBe('0.12');
  });

  test('Unified Calculator - Poly + Paper available for both materials', async ({ page }) => {
    await page.click('text=Unified Calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verify Poly + Paper appears in dropdown for Aluminium (default)
    const select = page.locator('select');
    await expect(select).toContainText('Poly + Paper');
    
    // Select Poly + Paper and verify factor is 0.95
    await page.selectOption('select', 'Poly + Paper');
    await page.waitForTimeout(500);
    
    let factorInput = page.locator('input[name="factor"]');
    let factorValue = await factorInput.inputValue();
    expect(factorValue).toBe('0.95');
    
    // Switch to Copper
    await page.click('button:has-text("Copper")');
    await page.waitForTimeout(500);
    
    // Verify Poly + Paper still appears in dropdown for Copper
    await expect(select).toContainText('Poly + Paper');
    
    // Select Poly + Paper and verify factor is still 0.95
    await page.selectOption('select', 'Poly + Paper');
    await page.waitForTimeout(500);
    
    factorInput = page.locator('input[name="factor"]');
    factorValue = await factorInput.inputValue();
    expect(factorValue).toBe('0.95');
  });

  test('Bare redirect works', async ({ page }) => {
    await page.goto(`${STAGING_URL}/dashboard/bare`);
    
    // Should redirect to calculator with mode=bare
    await page.waitForURL('**/dashboard/calculator?mode=bare', { timeout: 5000 });
    
    // Verify Bare mode is active
    const bareButton = page.locator('button:has-text("Bare")');
    await expect(bareButton).toHaveClass(/bg-white/);
  });

  test('Save functionality works', async ({ page }) => {
    await page.click('text=Factor Calculator');
    await page.waitForLoadState('networkidle');
    
    // Enter valid inputs
    await page.fill('input[name="width"]', '12');
    await page.fill('input[name="thickness"]', '5');
    await page.fill('input[name="covering"]', '0.50');
    await page.fill('input[name="percentageIncrease"]', '10');
    
    // Set up dialog handler
    page.once('dialog', dialog => {
      expect(dialog.message()).toBe('Factor saved!');
      dialog.accept();
    });
    
    // Click save
    await page.click('button:has-text("Save")');
  });

  test('Search Database - navigates and shows database selector', async ({ page }) => {
    await page.click('text=Search Database');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check database selector buttons exist
    await expect(page.locator('button:has-text("Unified Calculator Database")')).toBeVisible();
    await expect(page.locator('button:has-text("Factor Calculator Database")')).toBeVisible();
    
    // Check search input exists
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('Unified Calculator - shows save status after calculation', async ({ page }) => {
    await page.click('text=Unified Calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Fill in valid inputs
    await page.fill('input[name="width"]', '10');
    await page.fill('input[name="thickness"]', '5');
    await page.fill('input[name="length"]', '1000');
    await page.fill('input[name="insulationThickness"]', '0.5');
    await page.fill('input[name="factor"]', '1.05');
    await page.fill('input[name="finalWtReqd"]', '100');
    await page.fill('input[name="qtyPerSpool"]', '25');
    
    // Wait for calculation and auto-save
    await page.waitForTimeout(2000);
    
    // Check for save status (either "Saving...", "Saved", or "Error saving data")
    const saveStatus = page.locator('text=/Saving|Saved|Error saving data/');
    await expect(saveStatus.first()).toBeVisible({ timeout: 5000 });
  });

  test('Factor Calculator - shows save status after calculation', async ({ page }) => {
    await page.click('text=Factor Calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Fill in valid inputs
    await page.fill('input[name="width"]', '12');
    await page.fill('input[name="thickness"]', '5');
    await page.fill('input[name="covering"]', '0.5');
    await page.fill('input[name="percentageIncrease"]', '5');
    
    // Wait for calculation and auto-save
    await page.waitForTimeout(2000);
    
    // Check for save status (either "Saving...", "Saved", or "Error saving data")
    const saveStatus = page.locator('text=/Saving|Saved|Error saving data/');
    await expect(saveStatus.first()).toBeVisible({ timeout: 5000 });
  });
});
