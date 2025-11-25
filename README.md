# Acme Shopping Cart Web

A modern React single-page application for e-commerce shopping cart functionality with authentication, catalog browsing, cart management, and checkout.

## Overview

This application provides customers with an intuitive online shopping experience backed by secure APIs and identity platform. Features include:

- **Public Catalog Browsing** - Browse products without login
- **Shopping Cart** - Add, update, and remove items
- **User Authentication** - Secure OIDC-based login (required for checkout)
- **Checkout** - Complete orders with address information
- **Order History** - View past orders
- **Profile Management** - Update customer information

## Technology Stack

- **React 19** with TypeScript
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first styling
- **React Router 6** - Client-side routing
- **OIDC** - OpenID Connect authentication

## Prerequisites

- **Node.js** 18+ and npm
- **Backend Services**: Application is configured to use hosted services at cortside.net. For local development, override in `public/config.local.json` (see Configuration section below).

## Getting Started

### Installation

```bash
npm install
```

### Configuration

The application uses `public/config.json` for base configuration, which points to hosted services:

```json
{
  "catalogApi": { "url": "https://mockserver.cortside.net" },
  "shoppingCartApi": { "url": "https://shoppingcartapi.cortside.net" },
  "identity": {
    "authority": "https://identityserver.cortside.net",
    "clientId": "shoppingcart-web",
    "scope": "openid profile shoppingcart-api catalog-api"
  }
}
```

**For Local Development**: To use local backend services, create `public/config.local.json` (git-ignored):

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

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Code Quality

**Lint:**
```bash
npm run lint
```

**Format:**
```bash
npm run format
```

### Testing

**Run all unit tests:**
```bash
npm test
```

**Watch mode (for development):**
```bash
npm run test:watch
```

**Test with coverage report:**
```bash
npm run test:coverage
```

**Interactive test UI:**
```bash
npm run test:ui
```

**End-to-end tests:**
```bash
npm run test:e2e
```

**E2E tests with UI:**
```bash
npm run test:e2e:ui
```

**E2E tests in headed mode (see browser):**
```bash
npm run test:e2e:headed
```

**Debug E2E tests:**
```bash
npm run test:e2e:debug
```

**Test Coverage:**
- Current coverage: 73%+ overall
- Target: 80% overall coverage
- Critical utilities: 90%+ coverage
- See `coverage/` directory after running `npm run test:coverage`

## Project Structure

```
src/
  api/               # HTTP clients for backend services
  auth/              # OIDC authentication
  components/
    common/          # Reusable components
    layout/          # Header, Footer, Main layout
  hooks/             # Custom React hooks
  contexts/          # React contexts (Auth, Cart)
  pages/             # Route-level page components
  routes/            # Route configuration
  types/             # TypeScript type definitions
  utils/             # Utility functions (config loader, etc.)
```

## Documentation

- [Overview](docs/requirements/Overview.md) - Executive summary
- [Functional Requirements](docs/requirements/Functional%20&%20Behavioral%20Requirements.md) - User stories and acceptance criteria
- [Technical Specification](docs/architecture/Technical%20&%20Architectural%20Specification.md) - Architecture and implementation details

## Development Phases

This project is being built in phases. See `memory-bank/current/` for active development plans.

## License

Copyright © 2025 Acme Shopping. All rights reserved.
