# End-to-End Testing Guide for Tokenomics Lab

This guide explains how to run comprehensive E2E tests for the entire Tokenomics Lab website using Playwright.

## 🎯 What Gets Tested

The E2E test suite covers **every page** of the website:

### Public Pages
- ✅ **Landing Page (/)** - Hero section, features, pricing, navigation
- ✅ **Pricing (/pricing)** - All three tiers, features, x402 information
- ✅ **Documentation (/docs)** - Algorithm guides and documentation
- ✅ **Contact (/contact)** - Contact information and forms
- ✅ **Privacy Policy (/privacy)** - Legal content
- ✅ **Terms of Service (/terms)** - Legal content
- ✅ **Portfolio Audit Demo (/portfolio-audit-demo)** - Demo results display

### Authentication Pages
- ✅ **Login (/login)** - Form validation and authentication flow
- ✅ **Signup (/signup)** - Registration form and validation
- ✅ **Premium Signup (/premium-signup)** - Premium registration

### Feature Pages
- ✅ **Token Scan (/scan)** - Analysis interface
- ✅ **Pay-Per-Scan (/pay-per-scan)** - x402 payment interface
- ✅ **Token Search (/token-search)** - Search functionality

### Dashboard Pages (Access Control)
- ✅ **Main Dashboard (/dashboard)** - Redirect behavior
- ✅ **Free Dashboard (/free-dashboard)** - Free tier interface
- ✅ **Premium Dashboard (/premium/dashboard)** - Premium interface
- ✅ **Profile (/profile)** - User settings
- ✅ **Privacy Settings (/privacy-settings)** - Privacy controls

### Admin Pages (Admin Access Control)
- ✅ **Admin Login (/admin/login)** - Admin authentication with 2FA
- ✅ **Admin Dashboard (/admin/dashboard)** - Admin panel access

### Error Handling
- ✅ **404 Not Found** - Invalid routes
- ✅ **Network Errors** - Offline simulation
- ✅ **Form Validation** - Empty submissions and validation

### Responsive Design
- ✅ **Mobile View** - Navigation and layout
- ✅ **Tablet View** - Responsive behavior
- ✅ **Desktop View** - Full functionality

### Performance & Accessibility
- ✅ **Page Load Times** - Performance benchmarks
- ✅ **Basic Accessibility** - Alt text, headings, etc.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Playwright
pnpm add -D @playwright/test

# Install browsers
pnpm run playwright:install
```

### 2. Run Tests

```bash
# Run all E2E tests (headless)
pnpm run test:e2e

# Run with browser visible (for debugging)
pnpm run test:e2e:headed

# Run specific browser only
npx playwright test --project=chromium

# Run with UI mode (interactive)
npx playwright test --ui
```

### 3. View Results

```bash
# Open HTML report
pnpm run playwright:report

# Results are saved to:
# - test-results/html-report/index.html (detailed report)
# - test-results/results.json (JSON data)
# - test-results/ (screenshots, videos, traces)
```

## 📊 Test Configuration

### Environment Variables

```bash
# Base URL (default: http://localhost:3000)
BASE_URL=https://your-domain.com pnpm run test:e2e

# CI mode (enables retries, single worker)
CI=true pnpm run test:e2e

# Headless mode
HEADLESS=false pnpm run test:e2e:headed
```

### Browsers Tested

- ✅ **Chromium** (Chrome/Edge)
- ✅ **Firefox**
- ✅ **WebKit** (Safari)
- ✅ **Mobile Chrome** (Pixel 5)
- ✅ **Mobile Safari** (iPhone 12)

## 🔧 Test Structure

### Test Organization

```
tests/
├── e2e-full-website.spec.js    # Main test suite
└── helpers/                    # Shared utilities

playwright.config.js             # Playwright configuration
scripts/run-e2e-tests.js        # Test runner script
```

### Test Categories

1. **Public Pages** - No authentication required
2. **Authentication Pages** - Login/signup flows
3. **Feature Pages** - Core functionality
4. **Dashboard Pages** - User-specific content
5. **Admin Pages** - Admin-only access
6. **Error Handling** - Edge cases and errors
7. **Responsive Design** - Mobile/tablet/desktop
8. **Performance** - Load times and accessibility

## 🛠️ Debugging Failed Tests

### 1. View Screenshots
```bash
# Screenshots are automatically taken on failure
open test-results/screenshots/
```

### 2. Watch Test Execution
```bash
# Run with browser visible
pnpm run test:e2e:headed

# Or use UI mode
npx playwright test --ui
```

### 3. View Traces
```bash
# Traces are recorded on retry
npx playwright show-trace test-results/trace.zip
```

### 4. Debug Specific Test
```bash
# Run single test file
npx playwright test tests/e2e-full-website.spec.js

# Run specific test
npx playwright test -g "Landing Page"

# Debug mode
npx playwright test --debug
```

## 📈 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright
        run: pnpm run playwright:install
      
      - name: Run E2E tests
        run: CI=true pnpm run test:e2e
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## 🎯 Test Scenarios Covered

### Authentication Flow
- ✅ Login form validation
- ✅ Signup form validation
- ✅ Redirect behavior for protected pages
- ✅ Admin authentication with 2FA

### Core Functionality
- ✅ Token scanning interface
- ✅ Pay-per-scan x402 integration
- ✅ Portfolio audit demo
- ✅ Dashboard access control

### User Experience
- ✅ Navigation between pages
- ✅ Mobile menu functionality
- ✅ Responsive design
- ✅ Error handling

### Business Logic
- ✅ Pricing tier display
- ✅ Feature availability by plan
- ✅ Admin panel access control
- ✅ Payment interface presence

## 📝 Adding New Tests

### 1. Add New Page Test

```javascript
test('New Page (/new-page) - Description', async ({ page }) => {
  await page.goto(`${BASE_URL}/new-page`);
  await waitForPageLoad(page);
  
  await checkPageBasics(page, 'new page', '/new-page');
  await checkNavbarPresent(page);
  
  // Add specific checks
  await expect(page.locator('text=Expected Content')).toBeVisible();
});
```

### 2. Add New Test Category

```javascript
test.describe('New Feature Tests', () => {
  test('Feature Test 1', async ({ page }) => {
    // Test implementation
  });
  
  test('Feature Test 2', async ({ page }) => {
    // Test implementation
  });
});
```

## 🚨 Common Issues

### 1. Tests Timing Out
- Increase timeout in `playwright.config.js`
- Add more `waitForPageLoad()` calls
- Check for slow API responses

### 2. Elements Not Found
- Use `page.waitForSelector()` for dynamic content
- Check element selectors are correct
- Verify page is fully loaded

### 3. Authentication Issues
- Tests run in isolation (no shared state)
- Each test starts fresh
- Use proper authentication setup if needed

### 4. Network Issues
- Check `BASE_URL` is correct
- Ensure development server is running
- Verify API endpoints are accessible

## 📊 Expected Results

### Success Criteria
- ✅ All public pages load correctly
- ✅ Authentication redirects work
- ✅ Forms validate properly
- ✅ Mobile/responsive design works
- ✅ No critical console errors
- ✅ Load times under 10 seconds

### Performance Benchmarks
- **Page Load**: < 10 seconds
- **Form Validation**: < 1 second
- **Navigation**: < 3 seconds
- **Mobile Menu**: < 500ms

## 🎉 Benefits

1. **Comprehensive Coverage** - Every page tested
2. **Automated Quality Assurance** - Catch issues before deployment
3. **Cross-Browser Compatibility** - Works on all major browsers
4. **Mobile-First Testing** - Responsive design validation
5. **Performance Monitoring** - Load time tracking
6. **Accessibility Checks** - Basic accessibility validation
7. **CI/CD Ready** - Easy integration with deployment pipelines

Run these tests regularly to ensure your Tokenomics Lab website maintains high quality and reliability across all pages and features!