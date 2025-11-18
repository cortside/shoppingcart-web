# ShoppingCart Web - Copilot Agent Instructions

## Repository Overview

**Purpose**: Angular 18 single-page application (SPA) for an e-commerce shopping cart system with authentication, item browsing, cart management, and order checkout.

**Tech Stack**:
- **Framework**: Angular 18.2.x (TypeScript 5.4.5)
- **UI Libraries**: Angular Material, Tailwind CSS 3.1, Muzieh Design System
- **Authentication**: OIDC Client (IdentityServer integration)
- **Testing**: Jasmine/Karma (unit tests), Cypress 12 (e2e tests)
- **Build Tools**: Angular CLI 18.2.x, npm
- **Code Quality**: ESLint (with SonarJS plugin), Prettier
- **Shell**: PowerShell (pwsh.exe) - All scripts use PowerShell

**Project Structure**:
- `src/app/` - Main application code (cart, checkout, item, layout, order modules)
- `projects/core/` - Shared Angular library for authentication/authorization
- `src/environments/` - Environment configurations
- `cypress/` - End-to-end tests
- `deploy/` - Docker and deployment scripts

## Critical Prerequisites

### ALWAYS Required Before ANY Build/Test
1. **config.local.json MUST exist**: Create `src/config.local.json` with at minimum `{}` content. The application will NOT build without this file.
   ```powershell
   if(!(Test-Path ".\src\config.local.json")) { New-Item -path ".\src" -name "config.local.json" -type "file" -value "{}" }
   ```

2. **Core library must be built first**: The `core` library in `projects/core/` MUST be built before the main application. All build/serve commands include this step.

### Node/npm Versions
- Node.js: Compatible with Angular 18 (v18+ recommended)
- npm: Use `npm ci` for clean installs (takes ~60 seconds)

## Build & Development Commands

### Installation (Clean Install)
```powershell
npm ci
```
**Time**: ~60 seconds  
**Purpose**: Clean install from package-lock.json. Use this over `npm install` for consistency.  
**When**: After fresh clone, switching branches, or when dependencies change.

### Build Commands

#### Development Build
```powershell
npm run build
# Expands to: ng build core && ng build shoppingcart-web
```
**Time**: ~25 seconds total (core: ~2s, main: ~23s)  
**Output**: `dist/shoppingcart-web/` and `dist/core/`  
**Critical**: ALWAYS builds core library first, then main app.  
**Warnings Expected**: Bundle budget warnings (933KB exceeds 512KB limit), CommonJS dependency warnings from lodash/yup modules, Tailwind darkMode deprecation warning.

#### Serve (Development Server)
```powershell
npm start
# Expands to: ng build core && ng serve
```
**Port**: http://localhost:4200  
**Hot Reload**: Enabled (watches for file changes)  
**Critical**: Builds core library first, then starts dev server.

#### Production Build
```powershell
ng build --aot --configuration production
```
**Optimizations**: AOT compilation, minification, tree-shaking

### Testing

#### Unit Tests (Interactive)
```powershell
npm test
# Expands to: ng test --project=shoppingcart-web
```
**Runner**: Karma + Chrome  
**Watch Mode**: Enabled by default  
**Tests**: 22 tests (21 pass, 1 skipped)  
**Known Issues**: 
- 404 warnings for test image files (expected, tests still pass)
- NG0304 error for `app-header` component (expected, related to component declarations in test setup)

#### Unit Tests (CI Mode)
```powershell
npm run test:ci
# Expands to: ng test --project=shoppingcart-web --watch=false
```
**Time**: ~3 seconds  
**Output**: Coverage reports in `coverage/shoppingcart-web/`  
**Exit**: Runs once and exits (no watch mode)  
**Use**: For CI/CD pipelines and validation before commits

#### E2E Tests
```powershell
npm run cypress:open   # Interactive UI
npm run cypress:run    # Headless mode
```
**Base URL**: http://localhost:4200 (configured in `cypress.config.ts`)  
**Prerequisite**: Dev server must be running (`npm start` in separate terminal)

### Code Quality

#### Linting
```powershell
npm run lint
# Expands to: ng lint
```
**Time**: ~2 seconds  
**Rules**: 
- ESLint with TypeScript, Angular, and SonarJS plugins
- `@typescript-eslint/no-explicit-any: error` (strict)
- Component prefix: `app` (kebab-case for elements, camelCase for attributes)
- Library prefix: `lib`
**Config**: `.eslintrc.json`  
**Fix**: `npm run lint:fix` to auto-fix issues

#### Code Formatting
```powershell
npm run prettier        # Check formatting
npm run prettier:fix    # Fix formatting
```
**Config**: `.prettierrc` with custom settings:
- Single quotes
- 4-space tabs
- Print width: 375 characters (non-standard, very wide)
- Trailing commas: ES5
**Note**: Currently 65 files fail formatting check. Run `prettier:fix` after making changes.

### Cleanup
```powershell
.\clean.ps1
```
**Removes**: `node_modules/`, `dist/`, `.angular/`, coverage reports, test artifacts  
**Time**: Variable (depends on folder sizes)  
**Use**: When dependencies are corrupted or need fresh start

## Configuration Files

### Application Configuration
- **`src/config.json`**: Base configuration for all environments (API URLs, identity settings, build info)
- **`src/config.local.json`**: Local overrides (git-ignored, REQUIRED for builds)
- **`src/environments/environment.ts`**: Development environment settings
- **`src/environments/environment.prod.ts`**: Production environment (replaced during prod build)

### Build Configuration
- **`angular.json`**: Angular CLI workspace configuration
  - Two projects: `shoppingcart-web` (application) and `core` (library)
  - Budget limits: 500KB warning, 1MB error for initial bundle
  - Assets copied: favicon, config files, OIDC client library
- **`tsconfig.json`**: TypeScript compiler options (ES2022, strict mode)
- **`tsconfig.app.json`**: Application-specific TS config
- **`projects/core/tsconfig.lib.json`**: Library-specific TS config
- **`karma.conf.js`**: Unit test configuration (Chrome browser)
- **`cypress.config.ts`**: E2E test configuration (baseUrl: localhost:4200)
- **`tailwind.config.js`**: Tailwind CSS configuration

### Quality Configuration
- **`.eslintrc.json`**: ESLint rules (TypeScript, Angular, SonarJS)
- **`.prettierrc`**: Prettier formatting rules
- **`.editorconfig`**: Editor settings (4-space indent, UTF-8, single quotes for TS)

## Project Architecture

### Module Structure
```
src/app/
├── api/                    # API clients and models
│   ├── catalog/           # Catalog API integration
│   └── shopping-cart/     # Shopping cart API integration
├── cart/                   # Shopping cart feature (facade pattern)
├── checkout/              # Checkout feature (lazy-loaded module)
├── core/                  # Core services (item, order, error handling)
├── item/                  # Item browsing/detail (lazy-loaded routes)
├── layout/                # Shell components (header, footer)
├── order/                 # Order management (lazy-loaded module)
├── page-not-found/        # 404 component
└── profile/               # User profile component
```

### Core Library (`projects/core/`)
Shared functionality exported via `public-api.ts`:
- **identityserver/**: OIDC authentication service, guards, interceptors
- **authorization/**: Authorization service, policies, guards
- **logger/**: Logger abstraction and token

### Key Design Patterns
- **Facade Pattern**: `cart.facade.ts`, `layout.facade.ts`, `item.facade.ts` encapsulate business logic
- **Observable Store**: `observable-store.ts` for state management
- **Route Guards**: `requireAuthentication` guard for protected routes
- **HTTP Interceptors**: `AuthenticationTokenInterceptor` adds tokens to requests
- **Lazy Loading**: Checkout, order, and item modules load on demand

### Authentication Flow
1. `main.ts` initializes authentication before Angular bootstrap
2. `app-initializer.ts` runs authorization setup on authenticated users
3. Protected routes use `requireAuthentication` guard
4. `AuthenticationTokenInterceptor` adds bearer tokens to API calls
5. Silent redirect handled via `signin-oidc.html` asset

## Common Issues & Workarounds

### Build Issues

1. **"Cannot find module '@muziehdesign/core'"**
   - **Cause**: Core library not built
   - **Fix**: Always run `ng build core` before building/serving main app (or use `npm run build`/`npm start`)

2. **"config.local.json not found" (implicit error)**
   - **Cause**: Missing local config file
   - **Fix**: Create `src/config.local.json` with `{}` content

3. **Bundle budget exceeded warnings**
   - **Expected**: Main bundle is 933KB (exceeds 500KB warning threshold)
   - **Action**: Not a build failure, but consider for production optimization

4. **CommonJS dependency warnings**
   - **Modules**: lodash, yup, property-expr
   - **Action**: Expected, already configured in `angular.json` allowedCommonJsDependencies

5. **Tailwind darkMode warning**
   - **Message**: `darkMode: false` deprecated, use `media` or remove
   - **Action**: Non-breaking, can be ignored or fixed in `tailwind.config.js`

### Test Issues

1. **NG0304 'app-header' not a known element**
   - **Context**: Unit tests for AppComponent
   - **Impact**: Error logged but tests pass
   - **Cause**: Component declaration not mocked in test setup
   - **Action**: Safe to ignore or add `NO_ERRORS_SCHEMA` to test module

2. **404 warnings for test images**
   - **Files**: `/_karma_webpack_/image%20X`
   - **Impact**: None (tests pass)
   - **Action**: Expected behavior for test image assets

### Runtime Issues

1. **Authentication errors in private browsing**
   - **Cause**: Third-party cookies blocked
   - **Fix**: Allow third-party cookies in browser settings
   - **Note**: Documented in README

## Validation Workflow (Pre-Commit)

Run these commands in sequence to validate changes:

```powershell
# 1. Ensure config exists
if(!(Test-Path ".\src\config.local.json")) { New-Item -path ".\src" -name "config.local.json" -type "file" -value "{}" }

# 2. Install/update dependencies (if package.json changed)
npm ci

# 3. Run linting
npm run lint

# 4. Check code formatting
npm run prettier

# 5. Build application
npm run build

# 6. Run unit tests
npm run test:ci
```

**Expected Results**:
- Lint: All files pass
- Prettier: May show 65 files need formatting (run `npm run prettier:fix` to fix)
- Build: Completes with budget warnings (expected)
- Tests: 21/22 pass, 1 skipped

## Docker Build

### Dockerfile
- **Location**: `deploy/docker/Dockerfile.alpine`
- **Base Images**: 
  - Build: `cortside/ng-cli:16-alpine` (from `repository.json`)
  - Runtime: `cortside/nginx:1.24-alpine`
- **Build Steps**: npm ci → lint → build → test:ci → SonarQube scan
- **Output**: Nginx-served static files with startup.sh for config injection

### Build Script
```powershell
.\build-dockerimages.ps1 -local true
```
**Config**: `repository.json` defines image names, build settings, SonarQube integration

## Additional Notes

### Path Aliases
- `@muziehdesign/core` → `dist/core` (configured in `tsconfig.json`)
- Enables importing from core library: `import { AuthenticationService } from '@muziehdesign/core';`

### VS Code Extensions (Recommended)
- Angular Language Service
- Prettier
- Tailwind CSS IntelliSense

### File Nesting (VS Code)
Configured in `.vscode/settings.json`:
- `*.component.ts` nests `.html`, `.scss`, `.spec.ts` files
- `config.json` nests `config.*.json` files
- `tsconfig.json` nests `tsconfig.*.json` files

### Git Ignored Files
- `*.local.json` (local configurations)
- `src/build.json` (generated build info)
- `node_modules/`, `dist/`, `.angular/cache`
- `coverage/`, `cypress/videos/`

## Trust These Instructions

These instructions have been validated by running all commands and observing their behavior. When working with this repository:
- **Trust the command sequences** provided (especially the build order)
- **Trust the expected warnings/errors** documented above
- Only search for additional information if these instructions are incomplete or incorrect
- When in doubt, refer to `package.json` scripts section for available commands

## Summary Checklist

Before making changes:
- [ ] Ensure `src/config.local.json` exists
- [ ] Run `npm ci` if dependencies changed
- [ ] Build core library first for any build operations

After making changes:
- [ ] Run `npm run lint` (fix with `npm run lint:fix`)
- [ ] Run `npm run prettier:fix` to format code
- [ ] Run `npm run build` to verify build succeeds
- [ ] Run `npm run test:ci` to verify tests pass
- [ ] Check bundle size warnings if adding new dependencies
