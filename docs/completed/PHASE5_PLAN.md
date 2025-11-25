# PHASE5_PLAN: Authentication & Protected Routes

**Last Updated:** 2025-11-20  
**Status:** Completed  
**Owner:** Development Team

## Overview

Implement OpenID Connect authentication with IdentityServer, protect routes that require authentication, and ensure proper redirect flow after login.

## Goals

- Integrate OIDC implicit flow with IdentityServer
- Implement login flow with redirect to IdentityServer
- Handle authentication callback and token extraction
- Update AuthContext with real authentication state
- Protect routes: `/checkout`, `/account/orders`, `/account/orders/:orderId`, `/account/profile`
- Implement redirect-back-to-origin after login
- Add logout functionality
- Display auth state in Header (Login/Logout, user info)

## Scope

### In Scope

- OIDC client implementation per Technical Specification Section 6
- Login page that redirects to IdentityServer
- Auth callback handler to parse tokens
- RequireAuth wrapper component for protected routes
- Update AuthContext with real OIDC integration
- Protected route enforcement (Checkout, Orders, Profile)
- Logout functionality
- Header updates to show auth state
- Token storage (in-memory with optional session storage)
- Redirect preservation (FR-013A)

### Out of Scope

- Silent token renewal (can be added later if needed)
- Customer resource ID mapping (handled in Phase 6 during checkout)
- Actual page implementations for Checkout, Orders, Profile (Phases 6-8)

## Dependencies

- **Prerequisites:**
  - Phase 1 complete (project structure)
  - Phase 2 complete (AuthContext placeholder)
- **External:** IdentityServer running on port 5002

## Technical Details

### OIDC Integration

Per Technical Specification Section 6.1:

**Flow:** Implicit Flow

**Libraries:** Consider using `oidc-client-ts` or manual implementation

**Configuration:**
- Authority: `http://localhost:5002` (from config)
- Client ID: `shoppingcart-web` (from config)
- Redirect URI: `http://localhost:5173/auth/callback`
- Post Logout Redirect URI: `http://localhost:5173`
- Scope: `openid profile shoppingcart-api catalog-api`
- Response Type: `id_token token`

### OIDC Client

**Location:** `src/auth/oidcClient.ts`

```typescript
export async function initiateLogin(returnUrl?: string): Promise<void>;
export async function handleCallback(): Promise<{ accessToken: string; idToken: string; user: AuthUser }>;
export async function initiateLogout(): Promise<void>;
```

**Behavior:**

`initiateLogin()`:
- Store returnUrl in sessionStorage (for redirect after login)
- Construct authorize URL with all params
- Redirect browser to IdentityServer `/authorize`

`handleCallback()`:
- Parse URL fragment for `access_token`, `id_token`
- Decode id_token to get user claims (sub, name, email)
- Return tokens and user object
- Throw error if tokens missing or invalid

`initiateLogout()`:
- Clear tokens from storage
- Redirect to IdentityServer `/connect/endsession` (optional)

### AuthContext Updates

**Location:** `src/contexts/AuthContext.tsx`

Update from Phase 2 placeholder to real implementation:

```typescript
const login = () => {
  const currentPath = window.location.pathname;
  initiateLogin(currentPath);
};

const logout = () => {
  initiateLogout();
  setAuthState({
    isAuthenticated: false,
    accessToken: null,
    idToken: null,
    user: null,
    customerResourceId: null
  });
};
```

**Token Storage:**
- In-memory: store in AuthContext state
- Optional: sessionStorage for persistence across refreshes
- Do NOT use localStorage for tokens (security best practice)

### Login Page

**Location:** `src/pages/Login/index.tsx`

**Behavior:**
- Immediately call `initiateLogin()` when mounted
- Shows "Redirecting to login..." message briefly
- No form needed (IdentityServer handles login UI)

### Auth Callback Page

**Location:** `src/pages/AuthCallback/index.tsx`

**Behavior:**
- Call `handleCallback()` to parse tokens
- Update AuthContext with tokens and user
- Retrieve returnUrl from sessionStorage
- Redirect to returnUrl or default to `/`
- Show loading spinner during processing
- Handle errors (display message if callback fails)

### RequireAuth Component

**Location:** `src/auth/RequireAuth.tsx`

```typescript
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};
```

### Protected Routes

Update `src/routes/AppRoutes.tsx`:

```typescript
<Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
<Route path="/account/orders" element={<RequireAuth><Orders /></RequireAuth>} />
<Route path="/account/orders/:orderId" element={<RequireAuth><OrderDetail /></RequireAuth>} />
<Route path="/account/profile" element={<RequireAuth><Profile /></RequireAuth>} />
```

### Header Updates

**Location:** `src/components/layout/Header.tsx`

**Display:**

When `isAuthenticated === false`:
- "Login" link → `/login`

When `isAuthenticated === true`:
- Display user name (from `user.name` or `user.email`)
- "Logout" button → calls `logout()`
- "My Account" dropdown with:
  - "Orders" → `/account/orders`
  - "Profile" → `/account/profile`

## Deliverables

1. **OIDC Integration**
   - `src/auth/oidcClient.ts`

2. **Auth Pages**
   - `src/pages/Login/index.tsx`
   - `src/pages/AuthCallback/index.tsx`

3. **Route Protection**
   - `src/auth/RequireAuth.tsx`

4. **Updated Components**
   - `src/contexts/AuthContext.tsx` (real implementation)
   - `src/routes/AppRoutes.tsx` (protected routes)
   - `src/components/layout/Header.tsx` (auth state display)

## Acceptance Criteria

Per Functional Requirements FR-012, FR-013, FR-013A:

- [x] When I try to access `/checkout` without being logged in, I'm redirected to login
- [x] After logging in, I'm redirected back to `/checkout` (or original URL)
- [x] When I log in, I see my name/email in the header
- [x] "Logout" button clears auth state and returns to public pages
- [x] Protected routes (`/checkout`, `/account/*`) require authentication
- [x] Public routes (`/catalog`, `/product/:sku`, `/cart`) work without auth
- [x] Auth callback correctly parses tokens from URL fragment
- [x] Tokens are stored securely (in-memory or sessionStorage, not localStorage)
- [x] Login flow works in normal and private/incognito mode (with third-party cookies enabled)
- [x] ESLint passes with no errors
- [x] All tests passing (128/128 tests)
- [x] Code review completed with accessibility improvements
- [x] Comprehensive test coverage for all auth features (54 tests)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Private browsing blocks third-party cookies | High | Document requirement in troubleshooting section |
| Token parsing errors from IdentityServer | Medium | Validate token format, add error handling |
| Redirect loop if auth check fails | High | Ensure login route is not protected |
| Token expiration during session | Medium | Consider implementing silent renewal (future) |
| CORS issues with IdentityServer | Medium | Verify IdentityServer CORS configuration |

## References

- Technical Specification Section 6 (Authentication & Authorization)
- Functional Requirements FR-012, FR-013, FR-013A
- Technical Specification Section 6.5 (Browser Considerations)
- Security best practices (`.github/instructions/security.instructions.md`)

## Todo List

### OIDC Client Implementation (Tasks 1-2)

- [x] **Task 1:** Implement OIDC client utilities
  - Status: Completed
  - Files: `src/auth/oidcClient.ts`
  - Content: `initiateLogin()`, `handleCallback()`, `initiateLogout()`
  
- [x] **Task 2:** Update AuthContext with real auth logic
  - Status: Completed
  - Files: `src/contexts/AuthContext.tsx`
  - Content: Integrate oidcClient, manage token state
  - Dependencies: Task 1

### Auth Pages (Tasks 3-4)

- [x] **Task 3:** Implement Login page
  - Status: Completed
  - Files: `src/pages/Login/index.tsx`
  - Content: Call initiateLogin(), show loading message
  - Dependencies: Task 1
  
- [x] **Task 4:** Implement AuthCallback page
  - Status: Completed
  - Files: `src/pages/AuthCallback/index.tsx`
  - Content: Parse tokens, update context, redirect
  - Dependencies: Task 2

### Route Protection (Task 5)

- [x] **Task 5:** Create RequireAuth wrapper
  - Status: Completed
  - Files: `src/auth/RequireAuth.tsx`
  - Content: Check auth, redirect if needed
  - Dependencies: Task 2

### Protected Routes Setup (Task 6)

- [x] **Task 6:** Wrap protected routes with RequireAuth
  - Status: Completed
  - Files: `src/routes/AppRoutes.tsx`
  - Action: Wrap `/checkout`, `/account/*` routes
  - Dependencies: Task 5

### Header Updates (Task 7)

- [x] **Task 7:** Update Header with auth UI
  - Status: Completed
  - Files: `src/components/layout/Header.tsx`
  - Content: Login/Logout buttons, user name display, account dropdown
  - Dependencies: Task 2

### Testing & Quality Assurance (Tasks 8-10)

- [x] **Task 8:** End-to-end authentication testing
  - Status: Completed
  - Action: Test login flow, protected routes, redirect-back, logout
  - Dependencies: All previous tasks
  - Notes: IdentityServer integration verified, session persistence implemented

- [x] **Task 9:** Create comprehensive test suite
  - Status: Completed
  - Files Created:
    - `tests/auth/oidcClient.test.ts` (14 tests)
    - `tests/contexts/AuthContext.test.tsx` (9 tests)
    - `tests/auth/RequireAuth.test.tsx` (4 tests)
    - `tests/pages/Login/LoginPage.test.tsx` (4 tests)
    - `tests/pages/AuthCallback/AuthCallbackPage.test.tsx` (5 tests)
    - `tests/components/layout/Header.test.tsx` (18 tests)
  - Coverage: 54 new tests for all Phase 5 features
  - Test Results: All 128 tests passing (100%)
  - Dependencies: Tasks 1-8

- [x] **Task 10:** Code review and quality improvements
  - Status: Completed
  - Accessibility Improvements:
    - Added `role="menu"` and `aria-label="Account menu"` to Header dropdown
    - Added `role="menuitem"` to dropdown items
    - Improved user display fallback: `user?.name || user?.email || 'Account'`
  - Files Modified: `src/components/layout/Header.tsx`
  - Dependencies: Task 9

## Implementation Notes

### Test Suite Summary

**Total Test Coverage:** 54 tests for Phase 5 authentication features

**Test Files:**

1. **`tests/auth/oidcClient.test.ts`** (14 tests)
   - Login flow with return URL storage
   - Token parsing and validation
   - User claim extraction
   - Logout with cleanup
   - Error handling for missing tokens

2. **`tests/contexts/AuthContext.test.tsx`** (9 tests)
   - State initialization from session storage
   - Login/logout flows
   - Session persistence across refreshes
   - Error handling for corrupted storage
   - Hook usage validation

3. **`tests/auth/RequireAuth.test.tsx`** (4 tests)
   - Protected route access when authenticated
   - Redirect to login when not authenticated
   - Location preservation for redirect-back
   - Children rendering when authorized

4. **`tests/pages/Login/LoginPage.test.tsx`** (4 tests)
   - Login initiation on mount
   - Return URL handling from navigation state
   - Loading message display
   - Single execution guarantee

5. **`tests/pages/AuthCallback/AuthCallbackPage.test.tsx`** (5 tests)
   - Successful callback processing
   - Error handling for invalid tokens
   - Error handling for missing tokens
   - Navigation after authentication
   - Single callback processing

6. **`tests/components/layout/Header.test.tsx`** (18 tests)
   - Authentication state display
   - Login/logout button visibility
   - User name/email display variations
   - Account dropdown menu behavior
   - Accessibility attributes
   - Keyboard navigation
   - Outside-click handling

**Test Quality:**

- ✅ All tests passing (100% pass rate)
- ✅ Comprehensive coverage of happy paths and error cases
- ✅ Proper mocking of dependencies (sessionStorage, location, OIDC client)
- ✅ Accessibility testing included
- ✅ User interaction testing with @testing-library/user-event
- ✅ No flaky tests or skipped tests

### Code Review Findings & Resolutions

**Accessibility Improvements:**

- Added `role="menu"` to account dropdown in Header
- Added `aria-label="Account menu"` for screen reader support
- Added `role="menuitem"` to all dropdown items
- Improved user display fallback chain: `user?.name || user?.email || 'Account'`

**Test Infrastructure:**

- Fixed sessionStorage mocking by creating proper mock object
- Ensured spies track calls correctly across all test scenarios
- Added proper cleanup in afterEach hooks

### Session Persistence

Authentication state is persisted to `sessionStorage` to maintain login across page refreshes:

- **Storage Key:** `auth_state`
- **Data Stored:** `accessToken`, `idToken`, `user`, `customerResourceId`
- **Location:** `src/contexts/AuthContext.tsx`
- **Behavior:**
  - State loaded from sessionStorage on app initialization
  - State saved to sessionStorage whenever auth state changes
  - State cleared from sessionStorage on logout
  - Uses sessionStorage (not localStorage) per security best practices
  - Session expires when browser tab/window closes

## Notes

- IdentityServer must be configured with `shoppingcart-web` client
- Private browsing requires third-party cookies enabled (document in troubleshooting)
- Consider adding loading state during login redirect
- Token refresh/renewal can be added in a future phase if sessions are long
