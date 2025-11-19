# ShoppingCart Web

An Angular 18 e-commerce shopping cart application with authentication, product catalog, cart management, and order processing.

## Description

ShoppingCart Web is a single-page application (SPA) that provides a complete online shopping experience including user authentication, product browsing, shopping cart functionality, and order checkout.

**For detailed architecture and features**, see [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)

## Prerequisites

- Node.js 18+ (compatible with Angular 18)
- npm package manager
- Backend services running (Catalog API, ShoppingCart API, IdentityServer)

## Quick Start

1. **Create local configuration** - Create `src/config.local.json` with minimum `{}` content:

   ```bash
   if(!(Test-Path ".\src\config.local.json")) { New-Item -path ".\src" -name "config.local.json" -type "file" -value "{}" }
   ```

2. **Install dependencies**:

   ```bash
   npm ci
   ```

3. **Build and run**:

   ```bash
   npm run build    # Build core library + application
   npm start        # Start dev server at localhost:4200
   ```

4. **Run tests**:

   ```bash
   npm run test:ci  # Unit tests
   npm run lint     # Code quality checks
   ```

## How to Build

```bash
npm run build
```

Builds both the core library (`projects/core/`) and main application. Output in `dist/`.

## How to Test

```bash
npm run test:ci        # Unit tests (CI mode)
npm test               # Unit tests (watch mode)
npm run cypress:open   # E2E tests (requires dev server)
```

## How to Run

```bash
npm start  # Development server at http://localhost:4200
```

Automatically builds core library before starting the dev server.

## Common Commands

```bash
npm ci                  # Clean install dependencies
npm run lint            # Check code quality
npm run lint:fix        # Fix linting issues
npm run prettier:fix    # Auto-format code
```

## Documentation

- **Project Overview**: [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) - Architecture, features, patterns
- **Copilot Instructions**: [.github/copilot-instructions.md](.github/copilot-instructions.md) - Quick reference for AI assistants
- **Coding Standards**: [.github/instructions/](.github/instructions/) - TypeScript, security, performance, workflow

## Design System

This project follows [Muzieh Design System](https://ruifang.github.io/designsystem)

## Recommended VS Code Extensions

- Angular Language Service
- Prettier
- Tailwind CSS IntelliSense

## Contributing

See [.github/instructions/workflow.instructions.md](.github/instructions/workflow.instructions.md) for git workflow and contribution guidelines.

## Todo

-   [ ] css framework, responsiveness
-   [ ] design system
-   [x] local configuration
-   [ ] module configuration
-   [ ] api client
-   [ ] logging
-   [ ] path setup
-   [ ] formatting
-   [ ] schematics
-   [ ] cypress
-   [ ] analytics
-   [x] authentication
-   [ ] authorization
-   [ ] error pages
-   [ ] forms
-   [ ] component styles
-   [ ] layout
-   [ ] health
-   [x] lazy module
-   [ ] commands
-   [ ] build
-   [ ] error handling
-   [ ] bootstrap failure
-   [ ] page service lifecycle
-   [ ] separation of ui and domain
-   [ ] state management

## Tasks

-   module import cleanup

## Notes

### authentication

-   When testing in private mode, allow third-party cookies to avoid authentication errors
-   Need to create signin-oidc.html and add output to angular.json
