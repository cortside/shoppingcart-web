# Token Renewal Implementation

**Date:** November 21, 2025  
**Status:** Completed  
**Feature:** Silent Token Renewal for OIDC Authentication

## Overview

Implemented automatic token renewal (refresh tokens) to maintain active user sessions without requiring re-authentication when tokens expire. This prevents users from being timed out during active sessions.

## Implementation Details

### 1. Silent Renewal Flow (OIDC Standard Pattern)

**Method:** Hidden iframe with `prompt=none` parameter

**Components:**

- **oidcClient.ts:** Core renewal logic
  - `silentRenew()` - Performs renewal using hidden iframe
  - `getTokenExpiresIn()` - Calculates token expiration time
  
- **SilentCallback Page** (`src/pages/SilentCallback/index.tsx`)
  - Loaded in hidden iframe during renewal
  - Parses tokens from URL fragment
  - Sends tokens back to parent window via `postMessage`

- **AuthContext.tsx:** Automatic renewal scheduling
  - Monitors token expiration
  - Schedules renewal 5 minutes before expiration
  - Automatically updates tokens on successful renewal
  - Clears auth state on renewal failure (requires re-login)

### 2. How It Works

```
1. User logs in → Receives access_token and id_token
2. AuthContext schedules renewal at (expiration - 5 minutes)
3. Timer triggers → silentRenew() called
4. Hidden iframe created with IdentityServer authorize URL
5. IdentityServer checks session cookie
6. If valid: Returns new tokens in URL fragment
7. SilentCallback page parses tokens
8. postMessage sends tokens to parent window
9. AuthContext updates tokens and reschedules next renewal
10. Process repeats automatically
```

### 3. Configuration

**IdentityServer Requirements:**

- Client must allow `prompt=none` for silent renewal
- Redirect URI must include `/auth/silent-callback`
- Session cookie must be maintained (SameSite=Lax or None)

**Renewal Schedule:**

- Tokens renewed 5 minutes before expiration
- Only works with JWT tokens (not reference tokens)
- Reference tokens cannot be validated client-side

### 4. Code Changes

**New Files:**

- `src/pages/SilentCallback/index.tsx` - Silent renewal callback handler
- `docs/completed/TOKEN_RENEWAL_IMPLEMENTATION.md` - This document

**Modified Files:**

- `src/auth/oidcClient.ts`
  - Added `getTokenExpiresIn()` function
  - Added `silentRenew()` function
  
- `src/contexts/AuthContext.tsx`
  - Added token renewal scheduling logic
  - Added `performRenewal()` callback
  - Added `scheduleTokenRenewal()` callback
  - Automatic renewal on token expiration

- `src/routes/AppRoutes.tsx`
  - Added `/auth/silent-callback` route

**Test Files Updated:**

- `tests/auth/RequireAuth.test.tsx`
- `tests/components/layout/Header.test.tsx`
- `tests/contexts/AuthContext.test.tsx`
- `tests/pages/AuthCallback/AuthCallbackPage.test.tsx`
- `tests/pages/Checkout/CheckoutPage.test.tsx`
- `tests/pages/Checkout/components/CustomerInfoForm.test.tsx`
- `tests/pages/Login/LoginPage.test.tsx`

All mocks updated to include `getTokenExpiresIn` and `silentRenew` functions.

### 5. Testing

**All 237 tests passing** ✅

**Test Coverage:**

- Token expiration calculation
- Renewal scheduling
- Successful renewal flow
- Failed renewal handling
- Reference token detection (skips renewal)

**Manual Testing:**

1. Log in to application
2. Token will auto-renew 5 minutes before expiration
3. Check browser console in dev mode:
   - "Token renewal scheduled in X seconds"
   - "Attempting silent token renewal..."
   - "Silent token renewal successful"
4. Session maintains without interruption

### 6. Security Considerations

**✅ Implemented:**

- Hidden iframe removed after renewal
- 10-second timeout for renewal attempts
- Origin verification on postMessage
- Clears auth state on renewal failure
- Only renews JWT tokens (not reference tokens)

**⚠️ Browser Requirements:**

- Third-party cookies must be enabled in private/incognito mode
- IdentityServer session cookie must be accessible

### 7. User Experience

**Before Implementation:**

- ❌ Users timed out after token expiration
- ❌ Required re-login for active sessions
- ❌ Interrupted workflows

**After Implementation:**

- ✅ Seamless sessions during active use
- ✅ Automatic renewal every ~55 minutes (for 1-hour tokens)
- ✅ No user interaction required
- ✅ Only re-login when truly logged out

### 8. Technical Specification Compliance

Implements **Section 6.4 - Silent Token Renewal** from Technical Specification:

> The application SHOULD implement silent token renewal to maintain user sessions without interruption:
> - Monitor token expiration
> - Refresh tokens before expiration
> - Maintain seamless user experience during long sessions

**Status:** ✅ Fully Implemented

## Future Enhancements

**Potential Improvements:**

1. **Configurable renewal timing** - Allow customization of "5 minutes before expiration"
2. **Retry logic** - Retry failed renewals (with exponential backoff)
3. **User notification** - Notify user when renewal fails (optional)
4. **Analytics** - Track renewal success/failure rates
5. **Multiple tabs** - Coordinate renewal across browser tabs

## Known Limitations

1. **Reference tokens:** Cannot be renewed client-side (opaque tokens require backend validation)
2. **Private browsing:** Requires third-party cookies enabled
3. **Server session:** Renewal fails if IdentityServer session expires
4. **Network errors:** Renewal fails without network connectivity

## Related Documentation

- **Technical Specification:** `docs/architecture/Technical & Architectural Specification.md` (Section 6.4)
- **Authentication Implementation:** `docs/completed/PHASE5_PLAN.md`
- **OIDC Client:** `src/auth/oidcClient.ts`
- **Auth Context:** `src/contexts/AuthContext.tsx`

---

_Implementation completed November 21, 2025_  
_All tests passing (237/237)_  
_Feature ready for production use_
