# Testing Guide

This project uses **Vitest** as its testing framework. Vitest is a blazing fast unit test framework powered by Vite.

## Running Tests

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui
```

## Test Structure

Tests are organized in a separate `tests/` directory that mirrors the `src/` structure:

```
src/
  api/
    catalogApi.ts
  utils/
    validation.ts

tests/
  setup.ts              ← Global test setup
  api/
    catalogApi.test.ts  ← Unit tests for catalogApi
  utils/
    validation.test.ts  ← Unit tests for validation (to be added)
```

## Test Configuration

- **Config:** `vitest.config.ts`
- **Setup:** `tests/setup.ts` - Global test setup, mocks, etc.
- **Test Location:** `tests/` directory (mirrors `src/` structure)
- **Environment:** `happy-dom` - Lightweight DOM simulation for testing

## Writing Tests

### Example: API Client Test

```typescript
import { describe, it, expect } from 'vitest';
import { listItems } from './catalogApi';

describe('catalogApi', () => {
  describe('listItems', () => {
    it('should fetch catalog items successfully', async () => {
      const result = await listItems({
        pageNumber: 1,
        pageSize: 15,
      });

      expect(result).toBeDefined();
      expect(result.totalItems).toBeGreaterThan(0);
      expect(Array.isArray(result.items)).toBe(true);
    });
  });
});
```

### Mocking Configuration

The test setup (`tests/setup.ts`) mocks the config module to avoid network requests during tests:

```typescript
vi.mock('../utils/config', () => ({
  getConfig: vi.fn().mockReturnValue({
    catalogApi: { url: 'https://mockserver.cortside.net/api/v1' },
    // ... other config
  }),
}));
```

## Current Test Coverage

### ✅ Covered

- `tests/api/catalogApi.test.ts` - All Catalog API methods tested (6 tests)
  - List items with pagination
  - Get item by SKU
  - Search functionality
  - Sorting functionality

### 🔜 To Be Added

- `tests/api/shoppingCartApi.test.ts` - Will be tested when auth is implemented
- `tests/utils/validation.test.ts` - Unit tests for validation functions
- `tests/utils/httpClient.test.ts` - Unit tests for HTTP client
- `tests/contexts/AuthContext.test.tsx` - React component tests
- `tests/contexts/CartContext.test.tsx` - React component tests

## Testing Best Practices

1. **Mirror source structure** - `tests/` directory mirrors `src/` structure
2. **Descriptive test names** - Use `it('should ...')` format
3. **Test behavior, not implementation** - Focus on what the code does, not how
4. **Mock external dependencies** - Config, APIs, etc. should be mocked
5. **Keep tests fast** - Unit tests should run in milliseconds
6. **One assertion per test** (when possible) - Makes failures easier to diagnose

## Integration Testing

For API integration tests against live backends:
- Tests run against `https://mockserver.cortside.net/api/v1`
- Real network requests are made (not mocked)
- Helps verify API client implementation is correct

## CI/CD Integration

Tests run automatically in CI/CD pipelines:
- On every commit
- Before merging PRs
- Before deploying to production

Ensure all tests pass before committing code!

---

For more information, see the [Vitest documentation](https://vitest.dev/).
