# ShoppingCart Web - Copilot Agent Instructions

> **Additional Resources**: See `.github/instructions/` for detailed coding standards (TypeScript, performance, security, workflow). This file provides quick-start essentials only.

## Repository Overview

**Purpose**: Angular 18 SPA for e-commerce shopping cart with authentication, item browsing, cart management, and checkout.

**Tech Stack**: Angular 18.2.x (TypeScript 5.4.5) • Angular Material • Tailwind CSS 3.1 • OIDC Auth • Jasmine/Karma • Cypress 12 • ESLint • Prettier

**Key Directories**: `src/app/` (modules), `projects/core/` (shared auth library), `src/environments/` (config), `cypress/` (e2e tests)

## Critical Prerequisites

### ALWAYS Required Before Build/Test
1. **config.local.json MUST exist**: `src/config.local.json` with minimum `{}` content
   ```powershell
   if(!(Test-Path ".\src\config.local.json")) { New-Item -path ".\src" -name "config.local.json" -type "file" -value "{}" }
   ```

2. **Core library built first**: Commands like `npm run build` and `npm start` automatically build `projects/core/` before the main app. If using `ng` directly, run `ng build core` first.

3. **Git Operations**: AI agents MUST NOT run git commands that modify state (add, commit, push, merge, mv, etc.). Only read-only commands allowed (status, diff, log). See `.github/instructions/workflow.instructions.md`.

## Essential Commands

### Install & Build
```powershell
npm ci                 # Clean install (~60s) - use after clone or dependency changes
npm run build          # Build core + main app (~25s) - ng build core && ng build shoppingcart-web
npm start              # Dev server at localhost:4200 - ng build core && ng serve
```

**Expected Build Warnings** (safe to ignore):
- Bundle budget exceeded (933KB > 512KB) - optimization opportunity, not a failure
- CommonJS dependencies (lodash, yup, property-expr) - already allowed in angular.json
- Tailwind darkMode deprecation - non-breaking

### Testing
```powershell
npm run test:ci        # Unit tests CI mode (~3s, 21/22 pass, 1 skipped)
npm test               # Unit tests watch mode (Karma + Chrome)
npm run cypress:open   # E2E interactive (requires dev server running)
```

**Expected Test Warnings** (safe to ignore):
- NG0304 'app-header' error - component declaration in test, tests still pass
- 404 for test image files - expected, tests pass

### Code Quality
```powershell
npm run lint           # ESLint check (~2s) - strict TypeScript rules
npm run lint:fix       # Auto-fix linting issues
npm run prettier:fix   # Format all files (65 files currently need formatting)
.\clean.ps1            # Remove node_modules, dist, coverage (use when corrupted)
```

**Linting**: Enforces `@typescript-eslint/no-explicit-any: error`, component prefix `app`, SonarJS rules. Config: `.eslintrc.json`  
**Formatting**: Single quotes, 4-space tabs, 375-char width. Config: `.prettierrc`

## Key Configuration Files

**Application**: `src/config.json` (base), `src/config.local.json` (overrides, REQUIRED), `src/environments/environment*.ts`  
**Build**: `angular.json` (2 projects: app + core lib), `tsconfig.json` (ES2022, strict mode), `karma.conf.js`, `cypress.config.ts`  
**Quality**: `.eslintrc.json`, `.prettierrc`, `.editorconfig`  
**Path Alias**: `@muziehdesign/core` → `dist/core` (in tsconfig.json)

## Project Architecture

**Modules**: `api/` (clients), `cart/` (facade), `checkout/` (lazy), `core/` (services), `item/` (lazy), `layout/` (shell), `order/` (lazy), `profile/`  
**Core Library** (`projects/core/`): Shared auth/authz - `identityserver/` (OIDC), `authorization/` (policies), `logger/`  
**Patterns**: Facades (business logic), Observable Store (state), Route Guards (`requireAuthentication`), HTTP Interceptors (tokens), Lazy Loading  
**Auth Flow**: `main.ts` initializes → `app-initializer.ts` sets up authz → guards protect routes → interceptor adds tokens

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Cannot find module '@muziehdesign/core'" | Run `ng build core` first or use `npm run build`/`npm start` |
| Build fails (config.local.json) | Create `src/config.local.json` with `{}` |
| Auth errors in private browsing | Allow third-party cookies in browser |
| Bundle budget warning (933KB > 512KB) | Expected, not a failure - optimization opportunity |
| CommonJS warnings (lodash, yup) | Expected, already allowed in angular.json |
| NG0304 'app-header' test error | Tests pass, safe to ignore |

## Pre-Commit Validation

```powershell
# Ensure prerequisites
if(!(Test-Path ".\src\config.local.json")) { New-Item -path ".\src" -name "config.local.json" -type "file" -value "{}" }
npm ci  # If package.json changed

# Validate changes
npm run lint && npm run prettier:fix && npm run build && npm run test:ci
```

**Expected**: Lint passes, prettier fixes 65 files, build completes with warnings, tests 21/22 pass (1 skipped)

## Quick Reference

**VS Code Extensions**: Angular Language Service, Prettier, Tailwind CSS IntelliSense  
**File Nesting** (`.vscode/settings.json`): `*.component.ts` nests `.html`, `.scss`, `.spec.ts`  
**Git Ignored**: `*.local.json`, `src/build.json`, `node_modules/`, `dist/`, `.angular/cache`, `coverage/`  
**Docker**: `.\build-dockerimages.ps1 -local true` (uses `deploy/docker/Dockerfile.alpine`, `repository.json`)

## Working with This Repo

✅ **Trust these instructions** - all commands validated  
✅ **Follow build order** - core library before main app  
✅ **Expect documented warnings** - they're safe to ignore  
✅ **Check `.github/instructions/`** for detailed standards (TypeScript, workflow, security, performance)  
✅ **Refer to `package.json`** for all available commands  
❌ **Don't run git commands** that modify state (see workflow.instructions.md)
