# PHASE2_PLAN: Core Infrastructure

**Last Updated:** 2025-11-19  
**Status:** Completed  
**Owner:** Development Team

## Overview

Build the core infrastructure layer that all features depend on: TypeScript type definitions, HTTP client wrapper, API client modules, and React contexts for authentication and cart state management.

## Goals

- Define all TypeScript types from Technical Specification Section 4
- Implement HTTP client wrapper with error handling per Section 8
- Create API clients for Catalog API and ShoppingCart API per Section 5
- Implement AuthContext for authentication state per Section 7.1
- Implement CartContext for cart state and persistence per Sections 7.2-7.3
- Create storage utility for localStorage persistence
- Implement validation utilities per Section 8

## Scope

### In Scope

- All type definitions: Catalog, Customer, Orders, Cart, Auth, Errors
- `src/utils/httpClient.ts` with token injection and error handling
- `src/api/catalogApi.ts` (all Catalog API methods)
- `src/api/shoppingCartApi.ts` (all ShoppingCart API methods)
- `src/contexts/AuthContext.tsx` with state and methods
- `src/contexts/CartContext.tsx` with state, methods, and derived values
- `src/utils/storage.ts` for localStorage cart persistence
- `src/utils/validation.ts` for client-side validation helpers
- Configuration integration for API base URLs

### Out of Scope

- Actual authentication implementation (OIDC flow in Phase 5)
- Page implementations (Phases 3-8)
- UI components beyond contexts
- Testing (Phase 9)

## Dependencies

- **Prerequisites:** Phase 1 complete (project setup, folder structure)
- **External:** Backend services running (for manual testing):
  - Catalog API on port 5001
  - ShoppingCart API on port 5000
  - IdentityServer on port 5002

## Technical Details

### Type Definitions

Per Technical Specification Section 4, create:

**`src/types/Catalog.ts`:**
- `CatalogItem`
- `PagedResult<T>`

**`src/types/Customer.ts`:**
- `Customer`
- `CustomerInput`

**`src/types/Orders.ts`:**
- `OrderStatus` type
- `Address`
- `OrderItem`
- `Order`

**`src/types/Cart.ts`:**
- `CartItem`
- `CartState`

**`src/types/Auth.ts`:**
- `AuthUser`
- `AuthState`

**`src/types/Errors.ts`:**
- `ErrorModel`
- `ErrorsModel`

### HTTP Client

Per Technical Specification Sections 6.6 and 8.1.1, implement:

**`src/utils/httpClient.ts`:**

```typescript
interface HttpRequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  requiresAuth?: boolean;
}

async function get<TResponse>(url: string, options?: HttpRequestOptions): Promise<TResponse>;
async function post<TBody, TResponse>(url: string, body: TBody, options?: HttpRequestOptions): Promise<TResponse>;
async function put<TBody, TResponse>(url: string, body: TBody, options?: HttpRequestOptions): Promise<TResponse>;
```

**Behavior:**
- If `requiresAuth: true`, inject `Authorization: Bearer {token}` header
- On 4xx with `ErrorsModel`, parse and return structured errors
- On 401, throw AuthError to trigger re-login
- On 5xx, throw ServerError with generic message
- Support query parameters via `params` option

### Catalog API Client

Per Technical Specification Section 5.1, implement:

**`src/api/catalogApi.ts`:**

```typescript
export async function listItems(params: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
}): Promise<PagedResult<CatalogItem>>;

export async function getItemBySku(sku: string): Promise<CatalogItem>;
```

**Configuration:** Read `catalogApi.url` from config loaded via `src/utils/config.ts`

### ShoppingCart API Client

Per Technical Specification Section 5.2, implement:

**`src/api/shoppingCartApi.ts`:**

```typescript
// Customers
export async function createCustomer(customer: CustomerInput): Promise<Customer>;
export async function getCustomer(id: string): Promise<Customer>;
export async function updateCustomer(id: string, customer: CustomerInput): Promise<Customer>;

// Orders
export async function createOrderForNewCustomer(payload: {
  customer: CustomerInput;
  address: Address;
  items: { sku: string; quantity: number }[];
}): Promise<Order>;

export async function createOrderForExistingCustomer(
  customerResourceId: string,
  payload: {
    address: Address;
    items: { sku: string; quantity: number }[];
  }
): Promise<Order>;

export async function listOrders(params: {
  CustomerResourceId: string;
  PageNumber?: number;
  PageSize?: number;
  Sort?: string;
}): Promise<PagedResult<Order>>;

export async function getOrder(id: string): Promise<Order>;
```

**Configuration:** Read `shoppingCartApi.url` from config
**Auth:** All methods use `requiresAuth: true`

### AuthContext

Per Technical Specification Section 7.1, implement:

**`src/contexts/AuthContext.tsx`:**

```typescript
interface AuthContextValue {
  // State
  isAuthenticated: boolean;
  accessToken: string | null;
  idToken: string | null;
  user: AuthUser | null;
  customerResourceId: string | null;
  
  // Methods
  login: () => void;  // Placeholder in this phase
  logout: () => void;
  setCustomerResourceId: (id: string) => void;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }>;
export const useAuth: () => AuthContextValue;
```

**Phase 2 Implementation:**
- State management only (useState)
- `login()` is placeholder (real implementation in Phase 5)
- `logout()` clears state
- `setCustomerResourceId()` updates state
- No OIDC integration yet

### CartContext

Per Technical Specification Sections 7.2-7.3, implement:

**`src/contexts/CartContext.tsx`:**

```typescript
interface CartContextValue {
  // State
  items: CartItem[];
  
  // Derived values
  itemCount: number;
  subtotal: number;
  
  // Methods
  addItem: (item: CatalogItem, quantity: number) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
}

export const CartProvider: React.FC<{ children: React.ReactNode }>;
export const useCart: () => CartContextValue;
```

**Behavior:**
- On mount, load cart from localStorage (if exists and not expired)
- On any cart change, persist to localStorage with timestamp
- Cart expiration: 7 days (per FR-023)
- `itemCount` = sum of all quantities
- `subtotal` = sum of (unitPrice × quantity) for all items

### Storage Utility

**`src/utils/storage.ts`:**

```typescript
interface StoredCart {
  items: CartItem[];
  timestamp: number;
}

export function loadCart(): CartItem[] | null;
export function saveCart(items: CartItem[]): void;
export function clearCart(): void;
```

**Behavior:**
- localStorage key: `acme-cart`
- TTL: 7 days (604800000 ms)
- If cart timestamp > 7 days ago, return null

### Validation Utility

**`src/utils/validation.ts`:**

Helper functions for client-side validation per Section 8.2:

```typescript
export function isValidEmail(email: string): boolean;
export function isValidBirthdate(date: string): boolean; // YYYY-MM-DD format
export function isRequired(value: string | undefined | null): boolean;
```

## Deliverables

1. **Type Definitions**
   - `src/types/Catalog.ts`
   - `src/types/Customer.ts`
   - `src/types/Orders.ts`
   - `src/types/Cart.ts`
   - `src/types/Auth.ts`
   - `src/types/Errors.ts`

2. **Utilities**
   - `src/utils/httpClient.ts`
   - `src/utils/storage.ts`
   - `src/utils/validation.ts`

3. **API Clients**
   - `src/api/catalogApi.ts`
   - `src/api/shoppingCartApi.ts`

4. **React Contexts**
   - `src/contexts/AuthContext.tsx`
   - `src/contexts/CartContext.tsx`

5. **App Integration**
   - Updated `src/App.tsx` to wrap with `AuthProvider` and `CartProvider`

## Acceptance Criteria

- [x] All TypeScript types defined and compile without errors
- [x] HTTP client properly injects auth tokens when `requiresAuth: true`
- [x] HTTP client handles 4xx, 401, 5xx errors appropriately
- [ ] Catalog API client can fetch items list (manual test with backend running)
- [ ] Catalog API client can fetch item by SKU (manual test)
- [x] ShoppingCart API methods are defined (will test in later phases)
- [x] AuthContext provides state and methods
- [x] CartContext persists to localStorage on changes
- [x] CartContext loads from localStorage on mount
- [x] Cart expires after 7 days
- [x] Cart derived values (itemCount, subtotal) calculate correctly
- [x] Validation utilities return correct true/false for test cases
- [x] ESLint passes with no errors
- [x] All files follow TypeScript coding standards

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Backend APIs not available for testing | Medium | Use mock data for initial testing; document backend dependency |
| Token injection timing issues | Low | Test with placeholder token first |
| localStorage browser compatibility | Low | Use try/catch around localStorage calls |
| Cart persistence edge cases | Medium | Test expired carts, corrupted data, missing keys |

## References

- Technical Specification Section 4 (Data Models)
- Technical Specification Section 5 (API Contracts)
- Technical Specification Sections 6.6, 7, 8 (Auth, State, Errors)
- Functional Requirements FR-023 (Cart Persistence)
- `.github/instructions/typescript.instructions.md`

## Todo List

### Type Definitions (Tasks 1-6)

- [x] **Task 1:** Create Catalog types
  - Status: Completed
  - Files: `src/types/Catalog.ts`
  - Content: `CatalogItem`, `PagedResult<T>`
  
- [x] **Task 2:** Create Customer types
  - Status: Completed
  - Files: `src/types/Customer.ts`
  - Content: `Customer`, `CustomerInput`
  
- [x] **Task 3:** Create Orders types
  - Status: Completed
  - Files: `src/types/Orders.ts`
  - Content: `OrderStatus`, `Address`, `OrderItem`, `Order`
  
- [x] **Task 4:** Create Cart types
  - Status: Completed
  - Files: `src/types/Cart.ts`
  - Content: `CartItem`, `CartState`
  
- [x] **Task 5:** Create Auth types
  - Status: Completed
  - Files: `src/types/Auth.ts`
  - Content: `AuthUser`, `AuthState`
  
- [x] **Task 6:** Create Error types
  - Status: Completed
  - Files: `src/types/Errors.ts`
  - Content: `ErrorModel`, `ErrorsModel`

### Utilities (Tasks 7-9)

- [x] **Task 7:** Implement HTTP client
  - Status: Completed
  - Files: `src/utils/httpClient.ts`
  - Content: `get()`, `post()`, `put()` with auth injection and error handling
  - Notes: Token provider pattern integrated with AuthContext
  
- [x] **Task 8:** Implement storage utility
  - Status: Completed
  - Files: `src/utils/storage.ts`
  - Content: `loadCart()`, `saveCart()`, `clearCart()` with 7-day TTL
  
- [x] **Task 9:** Implement validation utility
  - Status: Completed
  - Files: `src/utils/validation.ts`
  - Content: `isValidEmail()`, `isValidBirthdate()`, `isRequired()`

### API Clients (Tasks 10-11)

- [x] **Task 10:** Implement Catalog API client
  - Status: Completed
  - Files: `src/api/catalogApi.ts`
  - Content: `listItems()`, `getItemBySku()`
  
- [x] **Task 11:** Implement ShoppingCart API client
  - Status: Completed
  - Files: `src/api/shoppingCartApi.ts`
  - Content: Customer and Order methods

### React Contexts (Tasks 12-13)

- [x] **Task 12:** Implement AuthContext
  - Status: Completed
  - Files: `src/contexts/AuthContext.tsx`
  - Content: State management, placeholder login method, token provider integration
  
- [x] **Task 13:** Implement CartContext
  - Status: Completed
  - Files: `src/contexts/CartContext.tsx`
  - Content: State, localStorage persistence, derived values, methods

### Integration (Task 14)

- [x] **Task 14:** Update App.tsx with providers
  - Status: Completed
  - Files: `src/App.tsx`
  - Action: Wrapped with `<AuthProvider><CartProvider>...</CartProvider></AuthProvider>`

### Validation (Tasks 15-16)

- [x] **Task 15:** Build verification
  - Status: Completed
  - Action: TypeScript compiles successfully, ESLint passes with no errors

- [x] **Task 16:** Unit testing infrastructure
  - Status: Completed
  - Files: 
    - `tests/setup.ts` - Test configuration with MSW
    - `tests/api/catalogApi.test.ts` - 15 comprehensive tests
    - `tests/mocks/catalogData.ts` - Mock data helpers
    - `tests/mocks/handlers.ts` - MSW request handlers
    - `tests/mocks/server.ts` - MSW server setup
    - `vitest.config.ts` - Test framework config
    - `tsconfig.app.json` - Updated for path aliases in tests
  - Content: Full test coverage for catalogApi with MSW mocking
  - Tests: Happy path, pagination, search, sorting, error handling, edge cases, data validation
  - Result: All 15 tests passing, build successful
  - Notes: Testing standards added to `.github/instructions/typescript.instructions.md`

## Notes

- AuthContext login() is placeholder; real OIDC implementation in Phase 5
- Cart persistence uses localStorage key `acme-cart`
- All API calls that need auth use `requiresAuth: true` in httpClient
- Manual testing requires backend services running
