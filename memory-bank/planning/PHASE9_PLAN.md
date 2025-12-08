# PHASE9_PLAN: Testing, Quality Assurance & Polish

**Last Updated:** 2025-11-19  
**Status:** Planning  
**Owner:** Development Team

## Overview

Comprehensive testing, quality assurance, and user experience polish to ensure the application is production-ready. This phase focuses on test coverage, performance optimization, accessibility, and final UX refinements.

## Goals

- Achieve comprehensive test coverage across all features
- Implement end-to-end test scenarios
- Optimize application performance
- Ensure accessibility compliance
- Polish user experience and error handling
- Validate all acceptance criteria met
- Fix bugs and edge cases

## Scope

### In Scope

- Unit tests for critical components and utilities
- Integration tests for API clients
- End-to-end tests for user flows
- Performance optimization (bundle size, load times)
- Accessibility audit and fixes (WCAG 2.1 AA)
- Cross-browser testing
- Mobile responsiveness verification
- Error handling polish
- Loading state improvements
- Documentation updates

### Out of Scope

- Security penetration testing (separate activity)
- Load/stress testing (separate activity)
- Internationalization (i18n)
- Analytics integration
- A/B testing setup

## Dependencies

- **Prerequisites:**
  - Phase 1-8 complete (all features implemented)
- **External:** All backend services running for E2E tests

## Technical Details

### Testing Strategy

**Test Pyramid:**

```
        E2E Tests (10%)
    ────────────────────
   Integration Tests (30%)
  ────────────────────────
  Unit Tests (60%)
────────────────────────────
```

### Unit Testing

**Framework:** Vitest (fast, Vite-integrated)

**Coverage Target:** 80% overall, 100% for critical utilities

**Test Files Location:** Co-located with source files (`*.test.tsx`, `*.test.ts`)

**Priority Areas:**
- Utilities: `src/utils/*.ts` (validation, formatting, cart helpers)
- Contexts: `src/contexts/*.tsx` (CartContext, AuthContext)
- Complex components: Checkout, Product Detail, Cart

**Example Test:**

```typescript
// src/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validateBirthDate } from './validation';

describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test+tag@domain.co.uk')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validateBirthDate', () => {
  it('should accept valid ISO date strings', () => {
    expect(validateBirthDate('1990-01-15')).toBe(true);
  });

  it('should reject invalid date formats', () => {
    expect(validateBirthDate('01/15/1990')).toBe(false);
    expect(validateBirthDate('invalid')).toBe(false);
  });
});
```

**Component Testing Example:**

```typescript
// src/components/common/QuantitySelector.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuantitySelector } from './QuantitySelector';

describe('QuantitySelector', () => {
  it('should render current quantity', () => {
    render(<QuantitySelector quantity={3} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('should call onChange when incremented', () => {
    const handleChange = vi.fn();
    render(<QuantitySelector quantity={1} onChange={handleChange} />);
    
    fireEvent.click(screen.getByText('+'));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('should not decrement below 1', () => {
    const handleChange = vi.fn();
    render(<QuantitySelector quantity={1} onChange={handleChange} />);
    
    fireEvent.click(screen.getByText('-'));
    expect(handleChange).not.toHaveBeenCalled();
  });
});
```

### Integration Testing

**Focus:** API client interactions with mocked HTTP responses

**Tools:** Vitest + MSW (Mock Service Worker)

**Test Files Location:** `src/api/*.test.ts`

**Example:**

```typescript
// src/api/catalogApi.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { listItems, getItemBySku } from './catalogApi';

const server = setupServer(
  rest.get('http://localhost:5001/items', (req, res, ctx) => {
    return res(ctx.json({
      pageNumber: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
      items: [{ sku: 'TEST-001', name: 'Test Item', price: 9.99 }]
    }));
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('catalogApi', () => {
  it('should fetch items with pagination', async () => {
    const result = await listItems({ pageNumber: 1, pageSize: 20 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].sku).toBe('TEST-001');
  });
});
```

### End-to-End Testing

**Framework:** Playwright (cross-browser, reliable)

**Test Files Location:** `e2e/*.spec.ts`

**Critical User Flows:**

1. **Browse & Add to Cart:**
   - Navigate to catalog
   - Search for item
   - View product detail
   - Add to cart
   - Verify cart count updates

2. **Checkout Flow (New Customer):**
   - Add items to cart
   - Go to checkout (redirected to login)
   - Login
   - Fill customer info
   - Fill address
   - Review order
   - Submit
   - Verify confirmation

3. **Checkout Flow (Existing Customer):**
   - Login
   - Add items to cart
   - Checkout (info prefilled)
   - Update address
   - Submit order

4. **Order History:**
   - Login
   - Navigate to order history
   - View orders
   - Click order detail

5. **Profile Management:**
   - Login
   - Navigate to profile
   - Edit profile
   - Save changes
   - Verify updates

**Example E2E Test:**

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow - New Customer', () => {
  test('should complete checkout for new customer', async ({ page }) => {
    // 1. Browse catalog
    await page.goto('http://localhost:3000/catalog');
    
    // 2. Add item to cart
    await page.click('text=Premium Widget');
    await page.fill('input[name="quantity"]', '2');
    await page.click('text=Add to Cart');
    
    // 3. Go to cart
    await page.click('text=Cart (2)');
    await expect(page).toHaveURL(/.*\/cart/);
    
    // 4. Proceed to checkout (redirects to login)
    await page.click('text=Proceed to Checkout');
    await expect(page).toHaveURL(/.*\/login/);
    
    // 5. Login
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // 6. Redirected to checkout
    await expect(page).toHaveURL(/.*\/checkout/);
    
    // 7. Fill customer info
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('input[name="birthDate"]', '1990-01-15');
    await page.click('text=Continue to Shipping');
    
    // 8. Fill address
    await page.fill('input[name="street"]', '123 Main St');
    await page.fill('input[name="city"]', 'Springfield');
    await page.fill('input[name="state"]', 'IL');
    await page.fill('input[name="zipCode"]', '62701');
    await page.click('text=Continue to Review');
    
    // 9. Review and submit
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=123 Main St')).toBeVisible();
    await expect(page.locator('text=Premium Widget')).toBeVisible();
    await page.click('text=Place Order');
    
    // 10. Verify confirmation
    await expect(page).toHaveURL(/.*\/checkout\/confirmation/);
    await expect(page.locator('text=Order placed successfully!')).toBeVisible();
  });
});
```

### Performance Optimization

**Bundle Analysis:**

```bash
npm run build
npx vite-bundle-visualizer
```

**Optimization Checklist:**

- [ ] Code splitting by route (lazy loading)
- [ ] Tree-shaking unused code
- [ ] Minimize bundle size (target < 200KB gzipped for main bundle)
- [ ] Optimize images (use WebP, lazy load)
- [ ] Enable HTTP/2
- [ ] Cache static assets (long cache headers)
- [ ] Debounce expensive operations (search input)
- [ ] Memoize heavy computations (useMemo, React.memo)
- [ ] Virtualize long lists (react-window)

**Performance Metrics (Lighthouse):**

- Performance Score: > 90
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Total Blocking Time: < 300ms

### Accessibility Audit

**Tools:**
- axe DevTools (browser extension)
- Lighthouse accessibility audit
- Manual keyboard navigation testing
- Screen reader testing (NVDA/JAWS)

**WCAG 2.1 AA Checklist:**

- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicators visible
- [ ] Color contrast ratios meet 4.5:1 (text) and 3:1 (UI components)
- [ ] Images have alt text
- [ ] Form inputs have labels
- [ ] Error messages associated with inputs (aria-describedby)
- [ ] ARIA landmarks used (header, nav, main, footer)
- [ ] Headings in logical order (h1, h2, h3)
- [ ] Skip to main content link
- [ ] No keyboard traps

**Example Fixes:**

```tsx
// ❌ Bad: No label
<input type="text" placeholder="Search..." />

// ✅ Good: Accessible label
<label htmlFor="search-input" className="sr-only">Search products</label>
<input id="search-input" type="text" placeholder="Search..." />

// ❌ Bad: Button not keyboard accessible
<div onClick={handleClick}>Click me</div>

// ✅ Good: Proper button
<button onClick={handleClick}>Click me</button>

// ❌ Bad: No error association
<input type="email" />
<p className="error">Invalid email</p>

// ✅ Good: Error associated with input
<input type="email" aria-describedby="email-error" />
<p id="email-error" className="error">Invalid email</p>
```

### Cross-Browser Testing

**Target Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

**Test Matrix:**

| Feature | Chrome | Firefox | Safari | Edge | Mobile |
|---------|--------|---------|--------|------|--------|
| Catalog | ✓ | ✓ | ✓ | ✓ | ✓ |
| Product Detail | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cart | ✓ | ✓ | ✓ | ✓ | ✓ |
| Checkout | ✓ | ✓ | ✓ | ✓ | ✓ |
| Auth | ✓ | ✓ | ✓ | ✓ | ✓ |
| Orders | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | ✓ | ✓ | ✓ | ✓ | ✓ |

### Mobile Responsiveness

**Test Viewports:**
- Mobile: 375px (iPhone SE)
- Mobile Large: 414px (iPhone 12 Pro)
- Tablet: 768px (iPad)
- Desktop: 1280px
- Large Desktop: 1920px

**Responsive Checklist:**

- [ ] Navigation menu collapses to hamburger on mobile
- [ ] Product grid adapts (1 col mobile, 2-3 col tablet, 4 col desktop)
- [ ] Forms stack vertically on mobile
- [ ] Buttons full-width on mobile
- [ ] Tables responsive (scroll or card layout)
- [ ] Images scale properly
- [ ] Text readable without zooming
- [ ] Touch targets minimum 44x44px

### Error Handling Polish

**Scenarios to Cover:**

1. **Network Errors:**
   - API unreachable
   - Timeout
   - Retry mechanism

2. **Validation Errors:**
   - Form field errors displayed inline
   - Error summary at top of form
   - Clear error messages

3. **Authorization Errors:**
   - Token expired → redirect to login
   - Forbidden → show access denied page

4. **Not Found Errors:**
   - Product not found → 404 page
   - Order not found → 404 page

5. **Server Errors:**
   - 500 errors → generic error message
   - Retry option provided

**Error Boundary:**

```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Something went wrong</h1>
          <p>Please refresh the page or contact support.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Loading States

**Standards:**

- Skeleton loaders for content-heavy pages (catalog, orders)
- Spinners for quick operations (form submission)
- Progress indicators for multi-step flows (checkout)
- Disable buttons during submission (prevent double-submit)
- Optimistic updates where appropriate (cart quantity)

### Documentation Updates

**Update Files:**

- `README.md`: Add testing instructions
- `docs/README.md`: Link to test coverage reports
- `package.json`: Add test scripts
- `.github/workflows/`: Add CI test workflow (if applicable)

## Deliverables

1. **Test Suite**
   - Unit tests for utils, contexts, components
   - Integration tests for API clients
   - E2E tests for critical user flows
   - Test configuration files

2. **Performance Optimizations**
   - Bundle size < 200KB gzipped
   - Lighthouse score > 90
   - Lazy loading implemented

3. **Accessibility Fixes**
   - WCAG 2.1 AA compliance
   - Keyboard navigation working
   - ARIA labels added

4. **Cross-Browser Verification**
   - Tested on Chrome, Firefox, Safari, Edge
   - Mobile responsive on iOS and Android

5. **Documentation**
   - Testing guide in README
   - Coverage reports generated

## Acceptance Criteria

Per Non-Functional Requirements NFR-001 through NFR-005 and Section 6.5:

- [ ] Unit test coverage > 80%
- [ ] All critical user flows have E2E tests
- [ ] Lighthouse Performance score > 90
- [ ] WCAG 2.1 AA compliance verified
- [ ] All pages responsive on mobile (375px) to desktop (1920px)
- [ ] Tested on Chrome, Firefox, Safari, Edge (latest versions)
- [ ] All form validations working correctly
- [ ] Error handling polished with clear messages
- [ ] Loading states implemented consistently
- [ ] No console errors in production build
- [ ] ESLint passes with no errors
- [ ] All acceptance criteria from Phase 1-8 verified

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low test coverage | High | Prioritize critical paths, set coverage thresholds |
| E2E tests flaky | Medium | Use Playwright best practices, add retries, wait for elements properly |
| Performance regressions | Medium | Add bundle size checks to CI, monitor metrics |
| Accessibility issues | Medium | Use automated tools + manual testing |
| Browser incompatibilities | Low | Test early on multiple browsers, use polyfills if needed |

## References

- Non-Functional Requirements NFR-001 through NFR-005
- Acceptance Criteria Section 6.5 (Testing Requirements)
- Technical Specification Section 11 (Non-Functional Requirements)
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Playwright Documentation: https://playwright.dev/
- Vitest Documentation: https://vitest.dev/

## Todo List

### Testing Setup (Tasks 1-3)

- [ ] **Task 1:** Configure Vitest for unit/integration tests
  - Status: Not Started
  - Files: `vitest.config.ts`, `package.json`
  - Action: Install Vitest, @testing-library/react, configure test environment
  
- [ ] **Task 2:** Configure Playwright for E2E tests
  - Status: Not Started
  - Files: `playwright.config.ts`, `package.json`
  - Action: Install Playwright, configure browsers, set base URL
  
- [ ] **Task 3:** Add test scripts to package.json
  - Status: Not Started
  - Files: `package.json`
  - Action: Add `test`, `test:e2e`, `test:coverage` scripts

### Unit Tests (Tasks 4-6)

- [ ] **Task 4:** Write unit tests for utilities
  - Status: Not Started
  - Files: `src/utils/*.test.ts`
  - Coverage: validation, formatters, cart helpers
  
- [ ] **Task 5:** Write unit tests for contexts
  - Status: Not Started
  - Files: `src/contexts/*.test.tsx`
  - Coverage: CartContext, AuthContext state management
  
- [ ] **Task 6:** Write component tests
  - Status: Not Started
  - Files: `src/components/**/*.test.tsx`, `src/pages/**/*.test.tsx`
  - Coverage: QuantitySelector, ProductCard, FormInput, critical pages

### Integration Tests (Task 7)

- [ ] **Task 7:** Write API client integration tests
  - Status: Not Started
  - Files: `src/api/*.test.ts`
  - Coverage: catalogApi, shoppingCartApi with MSW mocks

### E2E Tests (Tasks 8-12)

- [ ] **Task 8:** E2E test - Browse & Add to Cart
  - Status: Not Started
  - Files: `e2e/catalog.spec.ts`
  
- [ ] **Task 9:** E2E test - Checkout (New Customer)
  - Status: Not Started
  - Files: `e2e/checkout-new.spec.ts`
  
- [ ] **Task 10:** E2E test - Checkout (Existing Customer)
  - Status: Not Started
  - Files: `e2e/checkout-existing.spec.ts`
  
- [ ] **Task 11:** E2E test - Order History
  - Status: Not Started
  - Files: `e2e/orders.spec.ts`
  
- [ ] **Task 12:** E2E test - Profile Management
  - Status: Not Started
  - Files: `e2e/profile.spec.ts`

### Performance (Tasks 13-15)

- [ ] **Task 13:** Bundle size optimization
  - Status: Not Started
  - Action: Analyze bundle, implement code splitting, tree-shake
  
- [ ] **Task 14:** Lighthouse audit & fixes
  - Status: Not Started
  - Action: Run Lighthouse, fix performance issues
  
- [ ] **Task 15:** Optimize images & assets
  - Status: Not Started
  - Action: Convert to WebP, add lazy loading, compress

### Accessibility (Tasks 16-17)

- [ ] **Task 16:** Accessibility audit
  - Status: Not Started
  - Action: Run axe DevTools, Lighthouse a11y audit, keyboard navigation test
  
- [ ] **Task 17:** Accessibility fixes
  - Status: Not Started
  - Action: Add ARIA labels, fix focus indicators, improve keyboard nav

### Cross-Browser (Task 18)

- [ ] **Task 18:** Cross-browser testing
  - Status: Not Started
  - Action: Test on Chrome, Firefox, Safari, Edge, mobile browsers
  - Notes: Use BrowserStack or manual testing

### Polish (Tasks 19-20)

- [ ] **Task 19:** Error handling polish
  - Status: Not Started
  - Action: Add ErrorBoundary, improve error messages, add retry logic
  
- [ ] **Task 20:** Loading states improvement
  - Status: Not Started
  - Action: Add skeleton loaders, spinners, progress indicators

### Documentation (Task 21)

- [ ] **Task 21:** Update documentation
  - Status: Not Started
  - Files: `README.md`, `docs/README.md`
  - Action: Add testing instructions, link coverage reports

### Verification (Task 22)

- [ ] **Task 22:** Final acceptance criteria verification
  - Status: Not Started
  - Action: Go through all FR acceptance criteria, verify each one
  - Dependencies: All previous tasks

## Notes

- Run tests in CI pipeline before merging to main
- Coverage thresholds enforced: 80% overall, 100% for utils
- E2E tests should run against real backend services in CI
- Performance budget: main bundle < 200KB gzipped
- Consider visual regression testing (Percy, Chromatic) in future
- Accessibility should be tested with real assistive technologies
- Mobile testing on actual devices preferred over emulators
