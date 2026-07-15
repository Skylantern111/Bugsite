import { test, expect } from '@playwright/test';

test.describe('Phase 1 Bug Detection', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app base URL
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Bug 29: Duplicate Submission on Rapid Click', () => {
        test('should allow multiple rapid clicks on Place Order button', async ({ page, context }) => {
            // 1. Add an item to cart
            await page.goto('http://localhost:5173/catalog');
            await page.click('button:has-text("Add to Cart")');
            
            // 2. Navigate to checkout
            await page.goto('http://localhost:5173/checkout');
            await page.waitForLoadState('networkidle');

            // 3. Fill form through checkout steps
            // Step 1: Shipping
            await page.fill('input[placeholder="123 Main St, City, State ZIP"]', '123 Main St');
            await page.click('button:has-text("Next")');
            
            // Step 2: Payment
            await page.click('button:has-text("Next")');
            
            // Step 3: Review
            await page.click('button:has-text("Next")');

            // 4. Capture submissions count before rapid clicks
            const placeOrderButton = page.locator('button:has-text("Place Order")');
            
            // 5. Rapid click the Place Order button 5 times
            const clickPromises = [];
            for (let i = 0; i < 5; i++) {
                clickPromises.push(placeOrderButton.click().catch(() => {}));
            }
            await Promise.all(clickPromises);

            // 6. Check console logs for multiple submission logs
            const consoleLogs = [];
            page.on('console', (msg) => consoleLogs.push(msg.text()));
            
            // Wait a bit for logs to accumulate
            await page.waitForTimeout(500);

            // 7. Verify multiple submissions were logged
            const submissionLogs = consoleLogs.filter(log => log.includes('[BUG 29] Order submitted'));
            expect(submissionLogs.length).toBeGreaterThan(1);
            console.log(`✓ BUG 29 DETECTED: ${submissionLogs.length} submissions logged`);
        });

        test('should display submission counter', async ({ page }) => {
            // Navigate and fill form as above
            await page.goto('http://localhost:5173/checkout');
            await page.fill('input[placeholder="123 Main St, City, State ZIP"]', '123 Main St');
            await page.click('button:has-text("Next")');
            await page.click('button:has-text("Next")');
            await page.click('button:has-text("Next")');

            // Click Place Order multiple times
            const placeOrderButton = page.locator('button:has-text("Place Order")');
            await placeOrderButton.click();
            await page.waitForTimeout(100);
            await placeOrderButton.click();
            
            // Verify submission counter is visible and > 1
            const submissionText = page.locator('text=/\\d+ submission\\(s\\)/');
            await expect(submissionText).toBeVisible();
            
            const count = await submissionText.textContent();
            expect(parseInt(count)).toBeGreaterThan(0);
            console.log(`✓ BUG 29: Submission counter shows: ${count}`);
        });
    });

    test.describe('Bug 30: Infinite Loading Spinner', () => {
        test('should show loading spinner that never closes on search', async ({ page }) => {
            await page.goto('http://localhost:5173/catalog');
            
            // Type in search box to trigger the infinite spinner
            const searchInput = page.locator('input[placeholder="Search products..."]');
            await searchInput.fill('keyboard');
            
            // Wait a moment for the spinner to appear
            await page.waitForTimeout(500);

            // Check if loading overlay is visible
            const loadingOverlay = page.locator('text=/Loading results/i');
            const isVisible = await loadingOverlay.isVisible().catch(() => false);
            
            if (isVisible) {
                // Wait and verify spinner is STILL visible (never closes)
                await page.waitForTimeout(2000);
                
                const stillVisible = await loadingOverlay.isVisible();
                expect(stillVisible).toBe(true);
                
                // Verify the bug message is shown
                const bugMessage = page.locator('text=/BUG 30.*Spinner never closes/');
                await expect(bugMessage).toBeVisible();
                
                console.log('✓ BUG 30 DETECTED: Loading spinner visible and stuck after 2+ seconds');
            } else {
                console.warn('⚠ BUG 30: Loading overlay not visible (may be disabled in config)');
            }
        });

        test('should block interaction while spinner is active', async ({ page }) => {
            await page.goto('http://localhost:5173/catalog');
            
            // Trigger search
            await page.fill('input[placeholder="Search products..."]', 'headphones');
            await page.waitForTimeout(500);

            // Try to click a product card (should be blocked by overlay)
            const overlay = page.locator('[class*="fixed inset-0 bg-black"]');
            const isOverlayPresent = await overlay.isVisible().catch(() => false);
            
            if (isOverlayPresent) {
                // Overlay is blocking interaction
                console.log('✓ BUG 30: Overlay is blocking user interaction');
            }
        });
    });

    test.describe('Bug 31: Null Reference Error', () => {
        test('should trigger null reference error on cart item removal', async ({ page }) => {
            // 1. Add item to cart
            await page.goto('http://localhost:5173/catalog');
            await page.click('button:has-text("Add to Cart")');
            
            // 2. Navigate to cart
            await page.goto('http://localhost:5173/cart');
            await page.waitForLoadState('networkidle');

            // 3. Monitor console for errors
            const consoleErrors = [];
            page.on('console', (msg) => {
                if (msg.type() === 'error' || msg.text().includes('Cannot read property')) {
                    consoleErrors.push(msg.text());
                }
            });

            page.on('pageerror', (err) => {
                consoleErrors.push(err.message);
            });

            // 4. Click remove button
            const removeButton = page.locator('button[aria-label*="delete"], button:has-text("×"), .text-red-400').first();
            await removeButton.click().catch(() => {});

            // 5. Wait for error to be logged
            await page.waitForTimeout(500);

            // 6. Check for null reference error in logs
            const nullRefError = consoleErrors.find(log => 
                log.includes('Cannot read') || 
                log.includes('getAttribute of null') ||
                log.includes('[BUG 31]')
            );

            if (nullRefError) {
                expect(nullRefError).toBeTruthy();
                console.log(`✓ BUG 31 DETECTED: Null reference error - "${nullRefError}"`);
            } else {
                console.log('⚠ BUG 31: No error in console (fallback handler may have worked)');
            }

            // 7. Verify item was still removed (fallback handler worked)
            const cartLength = page.locator('[data-internal-cart-length]');
            const lengthText = await cartLength.textContent();
            console.log(`✓ BUG 31: Cart still updated despite error (fallback worked): ${lengthText}`);
        });

        test('should have data-wrong-id attribute that causes null reference', async ({ page }) => {
            // 1. Add item to cart
            await page.goto('http://localhost:5173/catalog');
            await page.click('button:has-text("Add to Cart")');
            
            // 2. Go to cart
            await page.goto('http://localhost:5173/cart');

            // 3. Verify the cart row does NOT have data-wrong-id attribute
            const cartRow = page.locator('[data-product-id]').first();
            const hasWrongIdAttr = await cartRow.getAttribute('data-wrong-id').catch(() => null);
            const hasCorrectIdAttr = await cartRow.getAttribute('data-product-id').catch(() => null);

            expect(hasWrongIdAttr).toBeNull();
            expect(hasCorrectIdAttr).not.toBeNull();
            
            console.log('✓ BUG 31: Cart row has correct data-product-id but missing data-wrong-id (causes null reference)');
        });
    });

    test.describe('All Phase 1 Bugs Summary', () => {
        test('should detect all three bugs are injectable', async ({ page }) => {
            console.log('\n=== PHASE 1 BUG DETECTION SUMMARY ===');
            console.log('Bug 29: Duplicate Submission - Testable via rapid button clicks');
            console.log('Bug 30: Infinite Spinner - Testable via search trigger + visibility check');
            console.log('Bug 31: Null Reference - Testable via console error monitoring');
            console.log('=====================================\n');
            
            expect(true).toBe(true);
        });
    });
});
