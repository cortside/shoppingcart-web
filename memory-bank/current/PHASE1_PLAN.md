# PHASE1_PLAN: Project Setup & Tooling

**Last Updated:** 2025-11-19  
**Status:** Active  
**Owner:** Development Team

## Overview

Establish the foundation for the ShoppingCart Web application by setting up the React/TypeScript project structure, configuring essential tooling, and creating the basic application shell with routing and layout.

## Goals

- Initialize React project with TypeScript and TailwindCSS
- Configure development tooling (ESLint, Prettier, Vite/Create React App)
- Set up folder structure per Technical Specification Section 2.1
- Create basic app shell with routing infrastructure
- Configure environment/configuration loading
- Establish build and development workflows

## Scope

### In Scope

- Project initialization with package.json and dependencies
- TypeScript configuration (tsconfig.json)
- TailwindCSS setup and configuration
- ESLint and Prettier configuration per coding standards
- Folder structure: `src/api`, `src/auth`, `src/components`, `src/hooks`, `src/contexts`, `src/pages`, `src/routes`, `src/types`, `src/utils`
- Basic layout components (Header, Footer, Main)
- React Router setup with placeholder routes
- Configuration loading utility (`src/utils/config.ts`)
- Basic App.tsx structure
- Development server setup

### Out of Scope

- Any API integration (Phase 2)
- Authentication implementation (Phase 5)
- Actual page implementations (Phases 3-8)
- Testing implementation (Phase 9)
- Deployment (Phase 10)

## Dependencies

- **Prerequisites:** None (first phase)
- **External:** Node.js, npm/yarn/pnpm installed on development machine

## Technical Details

### Technology Stack

Per Technical Specification Section 1.1:

- React 18+
- TypeScript 5+
- TailwindCSS 3+
- React Router 6+
- Vite (recommended) or Create React App
- ESLint + Prettier

### Folder Structure

Create per Technical Specification Section 2.1:

```
src/
  api/               (empty, ready for Phase 2)
  auth/              (empty, ready for Phase 5)
  components/
    common/          (shared components)
    layout/          (Header, Footer, Main)
  hooks/             (reusable React hooks like useAuth, useCart)
  contexts/          (empty, ready for Phase 2)
  pages/             (placeholder pages)
    Catalog/
    ProductDetail/
    Cart/
    Checkout/
    Orders/
    OrderDetail/
    Profile/
    AuthCallback/
    Login/
  routes/
    AppRoutes.tsx    (route configuration)
  types/             (empty, ready for Phase 2)
  utils/
    config.ts        (configuration loader)
  App.tsx
  main.tsx
  index.css
```

### Configuration Strategy

Per Technical Specification Section 12:

- Create `public/config.json` (base configuration, committed)
- Create `public/config.local.json` (local overrides, gitignored)
- Implement `src/utils/config.ts` to load and merge configurations
- Support environment-specific URLs for Catalog API, ShoppingCart API, IdentityServer

Example `config.json`:

```json
{
  "catalogApi": { "url": "http://localhost:5001" },
  "shoppingCartApi": { "url": "http://localhost:5000" },
  "identity": {
    "authority": "http://localhost:5002",
    "clientId": "shoppingcart-web",
    "scope": "openid profile shoppingcart-api catalog-api"
  }
}
```

### Layout Components

Create basic layout structure per Technical Specification Section 2.2:

- **Header:** Navigation placeholder, cart count placeholder, auth links placeholder
- **Main:** Container for route content
- **Footer:** Simple footer with copyright/links

### Routing Setup

Create `src/routes/AppRoutes.tsx` with all routes from Technical Specification Section 3:

- `/` → redirect to `/catalog`
- `/catalog` → Catalog placeholder
- `/product/:sku` → ProductDetail placeholder
- `/cart` → Cart placeholder
- `/checkout` → Checkout placeholder (will be protected in Phase 5)
- `/account/orders` → Orders placeholder (will be protected in Phase 5)
- `/account/orders/:orderId` → OrderDetail placeholder (will be protected in Phase 5)
- `/account/profile` → Profile placeholder (will be protected in Phase 5)
- `/login` → Login placeholder (implemented in Phase 5)
- `/auth/callback` → AuthCallback placeholder (implemented in Phase 5)

## Deliverables

1. **Project Repository**
   - Initialized React project with all dependencies
   - `.gitignore` configured
   - `package.json` with scripts (dev, build, lint, format)

2. **Configuration Files**
   - `tsconfig.json`
   - `tailwind.config.js`
   - `.eslintrc.json` (per TypeScript coding standards)
   - `.prettierrc.json`
   - `vite.config.ts` or `craco.config.js` (if CRA)

3. **Source Code**
   - Complete folder structure
   - `src/utils/config.ts` implementation
   - `src/components/layout/Header.tsx`
   - `src/components/layout/Footer.tsx`
   - `src/components/layout/Main.tsx`
   - `src/routes/AppRoutes.tsx`
   - `src/App.tsx` with layout structure
   - Placeholder page components (empty shells)

4. **Documentation**
   - Updated root `README.md` with:
     - Project description
     - Prerequisites
     - Installation steps (`npm install`)
     - Development server (`npm run dev`)
     - Build steps (`npm run build`)
     - Linting (`npm run lint`)

## Acceptance Criteria

- [x] Project initializes and dev server starts without errors
- [x] Navigation to all routes renders placeholder pages
- [x] TailwindCSS styles apply correctly
- [x] ESLint runs without errors on all TypeScript files
- [x] Prettier formats code consistently
- [x] Configuration loads from `config.json` successfully
- [x] Build process completes successfully
- [x] Folder structure matches Technical Specification Section 2.1
- [x] Root README.md includes setup and run instructions

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Vite vs CRA decision unclear | Medium | Default to Vite (faster, modern); document choice in README |
| TailwindCSS configuration complexity | Low | Follow official Tailwind docs for React setup |
| TypeScript strict mode issues | Low | Enable strict mode from start; fix issues incrementally |

## References

- Technical Specification Section 1.1 (Technology Stack)
- Technical Specification Section 2.1 (Folder Layout)
- Technical Specification Section 12 (Environment & Configuration)
- `.github/instructions/typescript.instructions.md` (TypeScript standards)
- `.github/instructions/workflow.instructions.md` (Git workflow)

## Todo List

### Setup & Initialization (Tasks 1-5)

- [x] **Task 1:** Initialize React project with TypeScript
  - Status: Completed
  - Action: Ran `npm create vite@latest . -- --template react-ts`
  - Files: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`

- [x] **Task 2:** Install and configure TailwindCSS
  - Status: Completed
  - Action: Installed `@tailwindcss/postcss`, configured PostCSS
  - Files: `tailwind.config.js`, `postcss.config.js`, `src/index.css`
  - Dependencies: Task 1

- [x] **Task 3:** Install additional dependencies
  - Status: Completed
  - Action: Installed react-router-dom, prettier
  - Files: `package.json`
  - Dependencies: Task 1

- [x] **Task 4:** Configure ESLint and Prettier
  - Status: Completed
  - Files: `.prettierrc.json`, `package.json` (format script)
  - Dependencies: Task 1

- [x] **Task 5:** Create folder structure
  - Status: Completed
  - Action: Created all directories per Section 2.1
  - Directories: `src/api`, `src/auth`, `src/components/common`, `src/components/layout`, `src/hooks`, `src/contexts`, `src/pages/*`, `src/routes`, `src/types`, `src/utils`
  - Dependencies: Task 1

### Configuration & Utilities (Tasks 6-7)

- [x] **Task 6:** Implement configuration loader
  - Status: Completed
  - Files: `src/utils/config.ts`, `public/config.json`
  - Dependencies: Task 5

- [x] **Task 7:** Create .gitignore entries
  - Status: Completed
  - Files: `.gitignore`
  - Action: Added `public/config.local.json` to gitignore
  - Dependencies: Task 1

### Layout Components (Tasks 8-10)

- [x] **Task 8:** Create Header component
  - Status: Completed
  - Files: `src/components/layout/Header.tsx`
  - Content: Basic nav with placeholders for Catalog, Cart, Account links
  - Dependencies: Task 5

- [x] **Task 9:** Create Footer component
  - Status: Completed
  - Files: `src/components/layout/Footer.tsx`
  - Content: Simple footer with copyright
  - Dependencies: Task 5

- [x] **Task 10:** Create Main component
  - Status: Completed
  - Files: `src/components/layout/Main.tsx`
  - Content: Container wrapper for route content
  - Dependencies: Task 5

### Routing & Pages (Tasks 11-13)

- [x] **Task 11:** Create placeholder page components
  - Status: Completed
  - Files: `src/pages/Catalog/index.tsx`, `src/pages/ProductDetail/index.tsx`, `src/pages/Cart/index.tsx`, `src/pages/Checkout/index.tsx`, `src/pages/Orders/index.tsx`, `src/pages/OrderDetail/index.tsx`, `src/pages/Profile/index.tsx`, `src/pages/Login/index.tsx`, `src/pages/AuthCallback/index.tsx`
  - Content: Simple "Page Name - Coming Soon" for each
  - Dependencies: Task 5

- [x] **Task 12:** Implement AppRoutes
  - Status: Completed
  - Files: `src/routes/AppRoutes.tsx`
  - Content: All routes from Technical Specification Section 3
  - Dependencies: Task 11

- [x] **Task 13:** Wire up App.tsx
  - Status: Completed
  - Files: `src/App.tsx`
  - Content: BrowserRouter > Layout > AppRoutes structure per Section 2.2
  - Dependencies: Task 8, Task 9, Task 10, Task 12

### Documentation & Validation (Tasks 14-15)

- [x] **Task 14:** Update root README.md
  - Status: Completed
  - Files: `README.md`
  - Content: Project description, prerequisites, install/dev/build/lint instructions
  - Dependencies: Task 13

- [x] **Task 15:** Verify acceptance criteria
  - Status: Completed
  - Action: Tested dev server (✓), navigation (✓), build (✓), lint (✓)
  - Dependencies: All previous tasks

## Notes

- This phase creates the skeleton; no real functionality yet
- Placeholder pages should be clearly marked "Coming Soon" or similar
- Focus on clean setup and following standards from the start
