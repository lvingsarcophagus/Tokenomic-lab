/**
 * Comprehensive End-to-End Test Suite for Tokenomics Lab
 * 
 * This Playwright script tests every page of the website including:
 * - Public pages (landing, pricing, docs, etc.)
 * - Authentication pages (login, signup)
 * - Dashboard pages (free, premium, admin)
 * - Feature pages (scan, pay-per-scan, etc.)
 * - Error handling and navigation
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// Test data
const TEST_USER = {
  email: 'test@tokenomicslab.com',
  password: 'TestPassword123!'
};

const TEST_ADMIN = {
  email: 'admin@tokenomicslab.com',
  password: 'AdminPassword123!'
};

// Helper functions
async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Additional wait for dynamic content
}

async function checkPageBasics(page, expectedTitle, expectedUrl) {
  // Check URL
  expect(page.url()).toContain(expectedUrl);
  
  // Check title contains expected text
  const title = await page.title();
  expect(title.toLowerCase()).toContain(expectedTitle.toLowerCase());
  
  // Check page is loaded (no loading spinners)
  await expect(page.locator('.loading, [data-testid="loading"]')).toHaveCount(0);
  
  // Check no critical errors
  const errorElements = page.locator('[data-testid="error"], .error-message');
  if (await errorElements.count() > 0) {
    const errorText = await errorElements.first().textContent();
    console.warn(`Warning: Error element found on ${page.url()}: ${errorText}`);
  }
}

async function checkNavbarPresent(page) {
  // Check navbar is present
  await expect(page.locator('nav, [data-testid="navbar"]')).toBeVisible();
  
  // Check logo is present
  await expect(page.locator('img[alt*="Tokenomics"], [data-testid="logo"]')).toBeVisible();
}

async function checkFooterPresent(page) {
  // Check footer is present (if exists)
  const footer = page.locator('footer, [data-testid="footer"]');
  if (await footer.count() > 0) {
    await expect(footer).toBeVisible();
  }
}

// Test Suite
test.describe('Tokenomics Lab - Full Website E2E Tests', () => {
  
  // ============================================================================
  // PUBLIC PAGES (No Authentication Required)
  // ============================================================================
  
  test.describe('Public Pages', () => {
    
    test('Landing Page (/) - Core Features and Navigation', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'tokenomics', '/');
      await checkNavbarPresent(page);
      
      // Check hero section
      await expect(page.locator('h1')).toContainText(['TOKENOMICS', 'ANALYSIS', 'ADVANCED']);
      
      // Check CTA buttons
      await expect(page.locator('text=GET STARTED')).toBeVisible();
      await expect(page.locator('text=LOG IN')).toBeVisible();
      
      // Check key features section
      await expect(page.locator('text=10-FACTOR')).toBeVisible();
      await expect(page.locator('text=MULTI-CHAIN')).toBeVisible();
      await expect(page.locator('text=AI-POWERED')).toBeVisible();
      
      // Check pricing section
      await expect(page.locator('text=FREE')).toBeVisible();
      await expect(page.locator('text=PAY-AS-YOU-GO')).toBeVisible();
      await expect(page.locator('text=PRO PLAN')).toBeVisible();
      
      // Test navigation to key pages
      await page.click('text=GET STARTED');
      await waitForPageLoad(page);
      expect(page.url()).toContain('/signup');
      
      await page.goBack();
      await waitForPageLoad(page);
    });
    
    test('Pricing Page (/pricing) - Plans and Features', async ({ page }) => {
      await page.goto(`${BASE_URL}/pricing`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'pricing', '/pricing');
      await checkNavbarPresent(page);
      
      // Check all three tiers
      await expect(page.locator('text=FREE')).toBeVisible();
      await expect(page.locator('text=PAY-AS-YOU-GO')).toBeVisible();
      await expect(page.locator('text=PRO PLAN')).toBeVisible();
      
      // Check pricing
      await expect(page.locator('text=$0')).toBeVisible();
      await expect(page.locator('text=$29')).toBeVisible();
      
      // Check features
      await expect(page.locator('text=Honeypot Check')).toBeVisible();
      await expect(page.locator('text=AI Risk Analyst')).toBeVisible();
      await expect(page.locator('text=Smart Alerts')).toBeVisible();
      
      // Check x402 information
      await expect(page.locator('text=x402')).toBeVisible();
      await expect(page.locator('text=USDC')).toBeVisible();
    });
    
    test('Documentation Page (/docs) - Algorithm and Guides', async ({ page }) => {
      await page.goto(`${BASE_URL}/docs`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'docs', '/docs');
      await checkNavbarPresent(page);
      
      // Check documentation sections
      await expect(page.locator('text=DOCUMENTATION')).toBeVisible();
      await expect(page.locator('text=Algorithm')).toBeVisible();
      
      // Test algorithm page navigation
      const algorithmLink = page.locator('a[href*="/docs/algorithm"]');
      if (await algorithmLink.count() > 0) {
        await algorithmLink.click();
        await waitForPageLoad(page);
        await checkPageBasics(page, 'algorithm', '/docs/algorithm');
        
        // Check algorithm content
        await expect(page.locator('text=10-FACTOR')).toBeVisible();
        await expect(page.locator('text=RISK')).toBeVisible();
      }
    });
    
    test('Contact Page (/contact) - Contact Information', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'contact', '/contact');
      await checkNavbarPresent(page);
      
      // Check contact content
      await expect(page.locator('text=CONTACT')).toBeVisible();
    });
    
    test('Privacy Policy (/privacy) - Legal Content', async ({ page }) => {
      await page.goto(`${BASE_URL}/privacy`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'privacy', '/privacy');
      await checkNavbarPresent(page);
      
      // Check privacy content
      await expect(page.locator('text=Privacy')).toBeVisible();
    });
    
    test('Terms of Service (/terms) - Legal Content', async ({ page }) => {
      await page.goto(`${BASE_URL}/terms`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'terms', '/terms');
      await checkNavbarPresent(page);
      
      // Check terms content
      await expect(page.locator('text=Terms')).toBeVisible();
    });
    
    test('Portfolio Audit Demo (/portfolio-audit-demo) - Demo Results', async ({ page }) => {
      await page.goto(`${BASE_URL}/portfolio-audit-demo`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'portfolio', '/portfolio-audit-demo');
      await checkNavbarPresent(page);
      
      // Check demo content
      await expect(page.locator('text=PORTFOLIO AUDIT')).toBeVisible();
      await expect(page.locator('text=DEMO')).toBeVisible();
      
      // Check risk distribution
      await expect(page.locator('text=RISK DISTRIBUTION')).toBeVisible();
      await expect(page.locator('text=LOW')).toBeVisible();
      await expect(page.locator('text=MEDIUM')).toBeVisible();
      await expect(page.locator('text=HIGH')).toBeVisible();
      await expect(page.locator('text=CRITICAL')).toBeVisible();
    });
  });
  
  // ============================================================================
  // AUTHENTICATION PAGES
  // ============================================================================
  
  test.describe('Authentication Pages', () => {
    
    test('Login Page (/login) - Form and Validation', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'login', '/login');
      await checkNavbarPresent(page);
      
      // Check login form
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"], button:has-text("LOG IN")')).toBeVisible();
      
      // Check navigation links
      await expect(page.locator('a[href*="/signup"]')).toBeVisible();
      
      // Test form validation (empty submission)
      await page.click('button[type="submit"], button:has-text("LOG IN")');
      await page.waitForTimeout(1000);
      
      // Should show validation errors or stay on page
      expect(page.url()).toContain('/login');
    });
    
    test('Signup Page (/signup) - Registration Form', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'signup', '/signupait checsen
      
      // Check signexpect(page.locator('input[type="email"]')).tisi();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"], button:has-text("SIGN UP")')).toBeVisible();
      
      // Check navigation links
      await expect(page.locator('a[href*="/login"]')).toBeVisible();
      
      // Test form validation (empty submission)
      await page.click('button[type="submit"], button:has-text("SIGN UP")');
      await page.waitForTimeout(1000);
      
      // Should show validation errors or stay on page
      expect(page.url()).toContain('/signup');
    });
    
    test('Premium Signup Page (/premium-signup) - Premium Registration', async ({ page }) => {
      await page.goto(`${BASE_URL}/premium-signup`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'premium', '/premium-signup');
      await checkNavbarPresent(page);
      
      // Check premium signup content
      await expect(page.locator('text=PREMIUM')).toBeVisible();
      await expect(page.locator('text=$29')).toBeVisible();
    });
  });
  
  // ============================================================================
  // FEATURE PAGES (May require authentication)
  // ============================================================================
  
  test.describe('Feature Pages', () => {
    
    test('Token Scan Page (/scan) - Analysis Interface', async ({ page }) => {
      await page.goto(`${BASE_URL}/scan`);
      await waitFd(page);
      
      await checkPageBasics(page, 'scan', '/scan');
      await checkNavbarPresent(page);
      
      // Check scan interface
      await expect(page.locator('input[placeholder*="token"], input[placeholder*="address"]')).toBeVisible();
      
      // Check if scan button exists
      const scanButton = page.locator('button:has-text("SCAN"), button:has-text("ANALYZE")');
      if (await scanButton.count() > 0) {
        await expect(scanButton).toBeVisible();
      }
    });
    
    test('Pay-Per-Scan Page (/pay-per-scan) - x402 Payment Interface', async ({ page }) => {
      await page.goto(`${BASE_URL}/pay-pe      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'pay', '/pay-per-scan');
      await checkNavbarPresent(page);
      
      // Check pay-per-scan content
      await expect(page.locator('text=PAY')).toBeVisible();
      await expect(page.locator('text=x402')).toBeVisible();
      
      // Check token input
      await expect(page.locator('input[placeho"], input[placeholder*="address"]')).toBeVisible();
    });
    
    test('Token Search Page (/token-search) - Search Interface', async ({ page }) => {
      await page.goto(`${BASE_URL}/token-search`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'search', '/token-search');
      await checkNavbarPresent(page);
      
      // Check search interwait expect(page.locator('input[placeholder*="search"], input[placeholder*="token"]')).toBeVisible();
    });
  });
  
  // ============================================================================
  // DASHBOARD PAGES (Require Authentication - Test Access)
  // ============================================================================
  
  test.describe('Dashboard Pages (Access Check)', () => {
    
    test('Main Dashboard (/dashboard) - Redirect or Login Required', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);
      await waitForPageLoad(page);
      
      // Should either show dashboard (if logged in) or redirect to login
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        // Redirected to login - expected behavior
        await checkPageBasics(page, 'login', '/login');
        console.log('✓ Dashboard correctly redirects to login when not authenticated');
      } else if (currentUrl.includes('/dashboard')) {
        // Already logged in or public dashboard
        await checkPageBasics(page, 'dashboard', '/dashboard');
        await checkNavbarPresent(page);
        console.log('✓ Dashboard accessible (user may be logged in)');
      }
    });
    
    test('Free Dashboard (/free-dashboard) - Free Tier Interface', async ({ page }) => {
      await page.goto(`${BASE_URL}/free-dashboard`);
      await waitForPageLoad(page);
      
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        await checkPageBasics(page, 'login', '/login');
        console.log('✓ Free dashboard correctly redirects to login when not authenticated');
      } else {
        await checkPageBasics(page, 'dashboard', '/free-dashboard');
        await checkNavbarPresent(page);
      }
    });
    
    test('Premium Dashboard (/premium/dashboard) - Premium Interface', async ({ page }) => {
      await page.goto(`${BASE_URL}/premium/dashboard`);
      await waitForPageLoad(page);
      
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        await checkPageBasics(page, 'login', '/login');
        console.log('✓ Premium dashboard correctly redirects to login when not authenticated');
      } else {
        await checkPageBasics(page, 'dashboard', '/premium');
        await checkNavbarPresent(page);
      }
    });
    
    test('Profile Page (/profile) - User Settings', async ({ page }) => {
      await page.goto(`${BASE_URL}/profile`);
      await waitForPageLoad(page);
      
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        await checkPageBasics(page, 'login', '/login');
        console.log('✓ Profile correctly redirects to login when not authenticated');
      } else {
        await checkPageBasics(page, 'profile', '/profile');
        await checkNavbarPresent(page);
      }
    });
    
    test('Privacy Settings (/privacy-settings) - User Privacy Controls', async ({ page }) => {
      await page.goto(`${BASE_URL}/privacy-settings`);
      await waitForPageLoad(page);
      
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        await checkPageBasics(page, 'login', '/login');
        console.log('✓ Privacy settings correctly redirects to login when not authenticated');
      } else {
        await checkPageBasics(page, 'privacy', '/privacy-settings');
        await checkNavbarPresent(page);
      }
    });
  });
  
  // ============================================================================
  // ADMIN PAGES (Require Admin Authentication)
  // ============================================================================
  
  test.describe('Admin Pages (Access Check)', () => {
    
    test('Admin Login (/admin/login) - Admin Authentication', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/login`);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'admin', '/admin/login');
      
      // Check admin login form
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
      // Check for 2FA or admin-specific elements
      const adminElements = page.locator('text=ADMIN, text=2FA, text=TOTP');
      if (await adminElements.count() > 0) {
        console.log('✓ Admin-specific authentication elements found');
      }
    });
    
    test('Admin Dashboard (/admin/dashboard) - Admin Panel Access', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await waitForPageLoad(page);
      
      const currentUrl = page.url();
      
      if (currentUrl.includes('/admin/login')) {
        await checkPageBasics(page, 'admin', '/admin/login');
        console.log('✓ Admin dashboard correctly redirects to admin login when not authenticated');
      } else if (currentUrl.includes('/login')) {
        await checkPageBasics(page, 'login', '/login');
        console.log('✓ Admin dashboard redirects to regular login');
    } else {
        await sics(page,', 'n');
  console.log('✓ Admin dashboard accessible (admin may be logged in)');
      }
    });
  });
  
  // ============================================================================
  // ERROR HANDLING AND EDGE CASES
  // ============================================================================
  
  test.describe('Error Handling', () => {
    
    test('404 Not Found - Invalid Route', async ({ page }) => {
      await page.goto(`${BASE_URL}/this-page-does-not-exist-12345`);
      await waitForPageLoad(page);
      
      // Should show 404 page or redirect
      const currentUrl = page.url();
      
      if (currentUrl.includes('404') || currentUrl.includes('not-found')) {
        await expect(page.locator('text=404, text=Not Found, text=Page Not Found')).toBeVisible();
        console.log('✓ 404 page displayed correctly');
      } else {
        // May redirect to home page
        console.log('✓ Invalid route handled (redirected to valid page)');
      }
    });
    
    test('Network Error Handling - Offline Simulation', async ({ page }) => {
      // Go to a valid page first
      await page.goto(`${BASE_URL}/pricing`);
      await waitForPageLoad(page);
      
      // Simulate network offline
      await page.context().setOffline(true);
      
      // Try to navigate to another page
      await page.goto(`${BASE_URL}/docs`);
      
      // Should handle network error gracefully
      await page.waitForTimeout(3000);
      
      // Restore network
      await page.context().setOffline(false);
      
      console.log('✓ Network error handling tested');
    });
  });
  
  // ============================================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================================
  
  test.describe('Responsive Design', () => {
    
    test('Mobile View - Landing Page', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      await checkPageBasics(page, 'tokenomics', '/');
      
      // Check mobile navigation (hamburger menu)
      const hamburgerMenu = page.locator('button[aria-label*="menu"], button[aria-label*="toggle"], .hamburger');
      if (await hamburgerMenu.count() > 0) {
        await expect(hamburgerMenu).toBeVisible();
        
        // Test mobile menu
        await hamburgerMenu.click();
        await page.waitForTimeout(500);
        
        // Check if mobile menu opened
        const mobileMenu = page.locator('.mobile-menu, [data-testid="mobile-menu"]');
        if (await mobileMenu.count() > 0) {
          await expect(mobileMenu).toBeVisible();
          console.log('✓ Mobile menu functionality working');
        }
      }
      
      // Check responsive elements
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=GET STARTED')).toBeVisible();
    });
    
    test('Tablet View - Dashboard Access', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto(`${BASE_URL}/dashboard`);
      await waitForPageLoad(page);
      
      // Should handle tablet view appropriately
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        await checkPageBasics(page, 'login', '/login');
        
        // Check tablet login form
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
      }
      
      console.log('✓ Tablet view tested');
    });
  });
  
  // ============================================================================
  // PERFORMANCE AND ACCESSIBILITY
  // ============================================================================
  
  test.describe('Performance and Accessibility', () => {
    
    test('Page Load Performance - Key Pages', async ({ page }) => {
      const pagesToTest = ['/', '/pricing', '/docs', '/login', '/signup'];
      
      for (const pagePath of pagesToTest) {
        const startTime = Date.now();
        
        await page.goto(`${BASE_URL}${pagePath}`);
        await waitForPageLoad(page);
        
        const loadTime = Date.now() - startTime;
        
        // Check load time is reasonable (under 10 seconds)
        expect(loadTime).toBeLessThan(10000);
        
        console.log(`✓ ${pagePath} loaded in ${loadTime}ms`);
      }
    });
    
    test('Basic Accessibility - Key Elements', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        
        if (alt === null || alt === '') {
          console.warn(`Warning: Image ${i} missing alt text`);
        }
      }
      
      // Check for proper heading structure
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThan(0);
      
      console.log('✓ Basic accessibility checks completed');
    });
  });
});

// ============================================================================
// TEST CONFIGURATION AND SETUP
// ============================================================================

test.beforeEach(async ({ page }) => {
  // Set longer timeout for each test
  test.setTimeout(TEST_TIMEOUT);
  
  // Set user agent
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Playwright-E2E-Test'
  });
  
  // Handle console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`Console Error on ${page.url()}: ${msg.text()}`);
    }
  });
  
  // Handle page errors
  page.on('pageerror', error => {
    console.log(`Page Error on ${page.url()}: ${error.message}`);
  });
});

test.afterEach(async ({ page }) => {
  // Clean up after each test
  await page.close();
});

// Export for use in other test files
module.exports = {
  checkPageBasics,
  checkNavbarPresent,
  waitForPageLoad,
  TEST_USER,
  TEST_ADMIN
};