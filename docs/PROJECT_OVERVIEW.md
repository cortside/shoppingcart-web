# ShoppingCart Web - Project Overview

**Last Updated:** November 18, 2025  
**Status:** Active  
**Owner:** Development Team

A modern, production-ready Angular 18 single-page application (SPA) that provides a complete e-commerce shopping cart experience with secure authentication, product browsing, cart management, and order processing capabilities.

## What This Application Does

**ShoppingCart Web** is a frontend web application that enables users to:

- **Browse Products**: View a catalog of available items with details and pricing
- **Manage Shopping Cart**: Add items to cart, adjust quantities, and remove items with persistent local storage
- **Secure Authentication**: Login using OpenID Connect (OIDC) with IdentityServer integration
- **Place Orders**: Complete checkout process with customer information and shipping address
- **View Order History**: Access previously placed orders with full details
- **User Profile Management**: View and manage authenticated user profile information

The application follows enterprise-grade patterns including facade architecture, lazy-loaded modules, route guards, and centralized state management through an Observable Store pattern.

## Architecture Overview

### Frontend Application

This Angular SPA communicates with two backend services:

1. **Catalog API** (port 5001): Product/item catalog service
2. **ShoppingCart API** (port 5000): Shopping cart and order management service
3. **Identity Server** (port 5002): Authentication and authorization provider

### Key Features

- **Authentication & Authorization**:
  - OIDC/OAuth2 authentication flow
  - JWT bearer token-based API communication
  - Route guards protecting authenticated pages
  - Silent token renewal for seamless user experience

- **Shopping Cart**:
  - Client-side cart storage (localStorage)
  - Real-time cart updates using RxJS observables
  - Persistent across browser sessions

- **Modular Design**:
  - Lazy-loaded feature modules (checkout, orders, items)
  - Shared core library for authentication/authorization
  - Facade pattern for business logic encapsulation
  - Separation of concerns between UI and domain logic

- **Responsive UI**:
  - Angular Material components
  - Tailwind CSS for styling
  - Muzieh Design System integration
  - Mobile-friendly responsive layouts

### Application Routes

- `/` - Redirects to items list
- `/items` - Browse product catalog (lazy-loaded)
- `/items/:sku` - View item details
- `/cart` - View shopping cart contents
- `/checkout` - Complete order checkout (lazy-loaded)
- `/orders` - View order history (lazy-loaded, authenticated)
- `/orders/:id` - View order details (authenticated)
- `/profile` - User profile page (authenticated)

## Technology Stack

- **Framework**: Angular 18.2.x with TypeScript 5.4.5
- **UI/UX**: Angular Material, Tailwind CSS 3.1, Muzieh Design System
- **Authentication**: OIDC Client (oidc-client library)
- **State Management**: RxJS observables with custom Observable Store
- **Testing**: Jasmine/Karma (unit), Cypress 12 (e2e)
- **Code Quality**: ESLint with SonarJS, Prettier
- **Build**: Angular CLI 18.2.x, npm

## Project Structure

```
src/app/
├── api/                  # HTTP clients for backend services
│   ├── catalog/         # Catalog API client (items)
│   └── shopping-cart/   # ShoppingCart API client (orders)
├── cart/                # Shopping cart feature (facade, components)
├── checkout/           # Checkout flow (lazy-loaded module)
├── core/               # Core services (item, order, error handling)
├── item/               # Item browsing/details (lazy-loaded routes)
├── layout/             # Shell components (header, footer)
├── order/              # Order management (lazy-loaded module)
├── profile/            # User profile component
└── models/             # Shared models and types

projects/core/          # Shared library for auth/authz
├── identityserver/     # OIDC authentication service, guards, interceptors
├── authorization/      # Authorization service, policies, guards
└── logger/             # Logger abstraction
```

## Configuration

### Environment Files

- `src/config.json` - Base configuration (API URLs, identity settings)
- `src/config.local.json` - Local overrides (git-ignored, required)
- `src/environments/environment.ts` - Development environment
- `src/environments/environment.prod.ts` - Production environment

### API Configuration

The application connects to backend services via configuration in `config.json`:

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

## Key Architectural Patterns

### Facade Pattern

Business logic is encapsulated in facade services:

- `CartFacade` - Shopping cart operations
- `ItemFacade` - Product browsing and cart additions
- `LayoutFacade` - Layout and navigation concerns

### Observable Store

Centralized state management using RxJS `BehaviorSubject`:

- `ShoppingCart` - Persistent cart state with localStorage backing
- Observable streams for reactive UI updates

### Route Guards

Authentication protection via `@muziehdesign/core`:

- `requireAuthentication` - Protects authenticated routes
- Automatic redirect to login when unauthenticated

### HTTP Interceptors

`AuthenticationTokenInterceptor` automatically adds JWT bearer tokens to API requests marked with `AUTHENTICATED_REQUEST` context.

### Lazy Loading

Feature modules load on-demand to optimize initial bundle size:

- Item module (routes)
- Checkout module
- Order module

## Authentication Flow

1. User accesses protected route
2. Route guard checks authentication status
3. If unauthenticated, redirects to IdentityServer login
4. After successful login, returns to original route
5. HTTP interceptor adds bearer token to API calls
6. Silent token renewal maintains session

**Important Note**: When testing in private/incognito mode, allow third-party cookies to avoid authentication errors.

## Development Guidelines

### Code Quality Standards

- **TypeScript**: See `.github/instructions/typescript.instructions.md`
- **Security**: See `.github/instructions/security.instructions.md`
- **Performance**: See `.github/instructions/performance.instructions.md`
- **Workflow**: See `.github/instructions/workflow.instructions.md`

### Design System

This project follows [Muzieh Design System](https://ruifang.github.io/designsystem)

### Recommended VS Code Extensions

1. Angular Language Service - IntelliSense for Angular templates
2. Prettier - Code formatter
3. Tailwind CSS IntelliSense - CSS class autocomplete

## Troubleshooting

### Common Issues

1. **Build fails with "Cannot find module '@muziehdesign/core'"**
   - The core library must be built first
   - Use `npm run build` or `npm start` (both build core automatically)

2. **Build fails without clear error**
   - Ensure `src/config.local.json` exists (even if empty `{}`)

3. **Authentication errors in private browsing**
   - Allow third-party cookies in browser settings

4. **Port 4200 already in use**
   - Stop other Angular dev servers or change port in `angular.json`

## Related Documentation

- **Quick Start**: [Root README.md](../README.md)
- **Copilot Instructions**: `.github/copilot-instructions.md`
- **Coding Standards**: `.github/instructions/`
- **Design System**: [Muzieh Design System](https://ruifang.github.io/designsystem)
