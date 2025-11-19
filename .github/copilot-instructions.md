# ShoppingCart Web - Copilot Agent Instructions

> **Additional Resources**: See `.github/instructions/` for detailed coding standards (TypeScript, performance, security, workflow). See `docs/` for comprehensive project documentation (Overview, Requirements, Technical Specification).

## Repository Overview

**Purpose**: React SPA for e-commerce shopping cart with authentication, item browsing, cart management, and checkout.

**Tech Stack**: React • TypeScript • TailwindCSS • React Router • OIDC Auth

**Status**: ⚠️ **In Development - React Rewrite** (replacing legacy Angular implementation)

**Key Documentation**:
- `docs/requirements/Overview.md` - Executive summary of features and scope
- `docs/requirements/Functional & Behavioral Requirements.md` - User stories, functional requirements, acceptance criteria
- `docs/architecture/Technical & Architectural Specification.md` - Implementation guide with data models, API contracts, architecture decisions

## Critical Prerequisites

### ALWAYS Required
1. **Git Operations**: AI agents MUST NOT run git commands that modify state (add, commit, push, merge, mv, etc.). Only read-only commands allowed (status, diff, log). See `.github/instructions/workflow.instructions.md`.

2. **Backend Services**: The React app requires three backend services to be running:
   - Catalog API (port 5001)
   - ShoppingCart API (port 5000)
   - Identity Server (port 5002)

## Project Structure (Planned React Implementation)

Based on Technical Specification (Section 2.1):

```
src/
  api/              # HTTP clients for backend services
  auth/             # OIDC auth provider
  components/       # Reusable components
  contexts/         # React contexts (Auth, Cart)
  pages/            # Route-level page components
  routes/           # Route configuration
  types/            # TypeScript type definitions
  utils/            # Utility functions
```

## Key Architectural Patterns

From Technical Specification:

- **Client-Side Cart Storage**: Cart exists in browser memory/localStorage until checkout
- **Authentication Gating**: Login required only for Checkout, Orders, Profile
- **Protected Routes**: `RequireAuth` wrapper checks authentication
- **State Management**: React Contexts for Auth and Cart state
- **HTTP Interceptor**: Automatic bearer token injection for authenticated requests

## Backend API Integration

### Service Endpoints (Section 12.1)
- **Catalog API**: `http://localhost:5001` (public, no auth)
- **ShoppingCart API**: `http://localhost:5000` (requires auth)
- **Identity Server**: `http://localhost:5002` (OIDC provider)

### Key API Contracts (Section 5)
- `GET /items` - List catalog with pagination, search, sort
- `GET /items/{sku}` - Item details
- `POST /v1/customers` - Create customer
- `POST /v1/orders` - Create order (new customer)
- `POST /v1/customers/{id}/orders` - Create order (existing customer)
- `GET /v1/orders` - List orders for customer

Full API documentation in Technical Specification Section 5.

## Authentication & Authorization (Section 6)

- **Flow**: OIDC Implicit Flow with IdentityServer
- **Routes**: `/login`, `/auth/callback`, `/logout`
- **Protected Pages**: Checkout, Order History, Profile
- **Token Storage**: In-memory preferred (security best practice)
- **Silent Renewal**: Implement token refresh for seamless sessions
- **Browser Note**: Private/incognito mode requires third-party cookies enabled

## State Management (Section 7)

### AuthContext
- `isAuthenticated`, `accessToken`, `idToken`, `user`, `customerResourceId`
- Methods: `login()`, `logout()`, `setCustomerResourceId()`

### CartContext
- `items[]`, `itemCount`, `subtotal`
- Methods: `addItem()`, `updateQuantity()`, `removeItem()`, `clearCart()`
- **Persistence**: Use localStorage with 7-day expiration

## Routing (Section 3)

| Route | Auth Required | Description |
|-------|---------------|-------------|
| `/` | No | Redirect to `/catalog` |
| `/catalog` | No | Browse products |
| `/product/:sku` | No | Product detail |
| `/cart` | No | View/edit cart |
| `/checkout` | Yes | Complete order |
| `/account/orders` | Yes | Order history |
| `/account/orders/:orderId` | Yes | Order detail |
| `/account/profile` | Yes | User profile |

## Key Features & Requirements

See Functional & Behavioral Requirements (Section 3) for complete list:

- **FR-001 to FR-004**: Catalog browsing with pagination, search, sort
- **FR-005 to FR-006**: Product detail and add to cart
- **FR-007 to FR-011**: Cart management with subtotal
- **FR-012 to FR-013**: Authentication with redirect-back
- **FR-014 to FR-018**: Checkout with customer prefill and order creation
- **FR-019 to FR-022**: Order history and profile management

## Common Issues & Troubleshooting (Section 14)

**Authentication Issues**:
- Private browsing fails → Allow third-party cookies
- Token expired errors → Verify silent renewal implementation

**API Connection Issues**:
- Cannot connect → Verify all services running on correct ports
- CORS errors → Check backend CORS configuration

**Configuration Issues**:
- App fails to load → Verify config files exist with valid JSON

## Code Quality Standards

**TypeScript**: See `.github/instructions/typescript.instructions.md`
- Strict mode enabled
- No `any` types (use proper typing)
- Prefer functional components with hooks

**Security**: See `.github/instructions/security.instructions.md`
- Never commit secrets
- Validate all user input
- Use parameterized queries
- Token storage best practices

**Performance**: See `.github/instructions/performance.instructions.md`
- Lazy load routes
- Memoize expensive computations
- Virtualize long lists
- Optimize bundle size

**Workflow**: See `.github/instructions/workflow.instructions.md`
- Branch naming conventions
- Commit message standards
- PR guidelines
- Code review practices

## Working with This Repo

✅ **Reference `docs/` for architecture** - Technical Specification has all implementation details  
✅ **Follow TypeScript standards** - See `.github/instructions/typescript.instructions.md`  
✅ **Check Functional Requirements** - User stories and acceptance criteria in `docs/`  
✅ **Review API contracts** - Full specifications in Technical Specification Section 5  
❌ **Don't run git commands** that modify state (see workflow.instructions.md)  
❌ **Don't duplicate documentation** - Reference existing docs instead of repeating
