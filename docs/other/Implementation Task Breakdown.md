# Document 3 — Implementation Task Breakdown / Agile Stories
_Acme Shopping Cart_

## Table of Contents
1. Epics
2. User Stories
3. Tasks by Story
4. Acceptance Criteria by Story

---

## 1. Epics

- **EPIC‑001 Catalog Browsing**
- **EPIC‑002 Cart Management**
- **EPIC‑003 Authentication & Authorization**
- **EPIC‑004 Checkout & Order Creation**
- **EPIC‑005 Order History**
- **EPIC‑006 Profile Management**

---

## 2. User Stories (with IDs)

### EPIC‑001 Catalog Browsing

- **STORY‑001 (US‑001/002/003/004):**  
  As a visitor, I can browse, search, sort, and page through catalog items.

### EPIC‑002 Cart Management

- **STORY‑002 (US‑005/006/007):**  
  As a visitor, I can add items to my cart, change quantities, and remove items.

### EPIC‑003 Authentication & Authorization

- **STORY‑003 (US‑008):**  
  As a user, I can log in using IdentityServer so I can perform protected actions.
- **STORY‑004:**  
  As a user, if I try to access a protected page while logged out, I am redirected to log in and then returned.

### EPIC‑004 Checkout & Order Creation

- **STORY‑005 (US‑009/010/011):**  
  As a logged‑in user, I can complete checkout by entering customer and address details and placing an order.

### EPIC‑005 Order History

- **STORY‑006 (US‑012/013):**  
  As a logged‑in user, I can see my past orders and view order details.

### EPIC‑006 Profile Management

- **STORY‑007 (US‑014):**  
  As a logged‑in user, I can view and update my profile.

---

## 3. Tasks by Story

### STORY‑001 — Catalog Browsing

- **TASK‑001‑A:** Implement Catalog page route (`/catalog`).
- **TASK‑001‑B:** Implement `catalogApi.getItems(params)` to call `GET /items`.
- **TASK‑001‑C:** Implement search bar and wire to `search` parameter.
- **TASK‑001‑D:** Implement sort dropdown (name/price asc/desc) and wire to `sort` parameter.
- **TASK‑001‑E:** Implement pagination controls using `totalItems`, `pageNumber`, `pageSize`.
- **TASK‑001‑F:** Implement basic loading and error states for catalog.

### STORY‑002 — Cart Management

- **TASK‑002‑A:** Implement `CartContext` with `CartState`, `addItem`, `updateQuantity`, `removeItem`, `clearCart`.
- **TASK‑002‑B:** Implement add‑to‑cart button on Catalog items.
- **TASK‑002‑C:** Implement Product Detail page route (`/product/:sku`) and add‑to‑cart from detail.
- **TASK‑002‑D:** Implement Cart page route (`/cart`), listing cart items, totals, and controls for quantity and removal.
- **TASK‑002‑E:** Implement empty cart state UI.

### STORY‑003 — Authentication

- **TASK‑003‑A:** Implement `AuthContext` and `AuthState` to store user and tokens.
- **TASK‑003‑B:** Implement `/login` route to initiate OIDC implicit flow.
- **TASK‑003‑C:** Implement `/auth/callback` route to handle OIDC redirect, parse tokens, and update `AuthContext`.
- **TASK‑003‑D:** Implement `/logout` to clear local auth state (and optionally call IdentityServer logout).
- **TASK‑003‑E:** Integrate auth state into header (show login/logout, user name).

### STORY‑004 — Protected Route Handling

- **TASK‑004‑A:** Implement `RequireAuth` component that checks `AuthContext.isAuthenticated`.
- **TASK‑004‑B:** Wrap `/checkout`, `/account/orders`, `/account/orders/:orderId`, `/account/profile` routes with `RequireAuth`.
- **TASK‑004‑C:** Implement redirect‑back mechanism (store original URL, go to login, then return).

### STORY‑005 — Checkout & Order Creation

- **TASK‑005‑A:** Implement `/checkout` page layout with sections:
  - Customer info
  - Shipping address
  - Order summary
- **TASK‑005‑B:** On load, if `customerResourceId` is known, call `GET /v1/customers/{id}` to prefill customer info.
- **TASK‑005‑C:** Implement client‑side validation for customer and address fields.
- **TASK‑005‑D:** Implement order submission:
  - If `customerResourceId` exists → `POST /v1/customers/{resourceId}/orders`
  - Else → `POST /v1/orders` (with customer data)
- **TASK‑005‑E:** On success, clear cart and navigate to confirmation (e.g., `/account/orders/:orderId`).
- **TASK‑005‑F:** Implement basic error handling on order submission (e.g., validation errors from backend).

### STORY‑006 — Order History

- **TASK‑006‑A:** Implement `/account/orders` page, calling `GET /v1/orders?CustomerResourceId={id}&PageNumber=&PageSize=&Sort=`.
- **TASK‑006‑B:** Implement pagination on order history.
- **TASK‑006‑C:** Implement `/account/orders/:orderId` page calling `GET /v1/orders/{id}`.
- **TASK‑006‑D:** Display order details including status, dates, shipping address, and line items.
- **TASK‑006‑E:** Implement order‑history empty state.

### STORY‑007 — Profile Management

- **TASK‑007‑A:** Implement `/account/profile` page route.
- **TASK‑007‑B:** If `customerResourceId` known, call `GET /v1/customers/{id}` and display data.
- **TASK‑007‑C:** Implement form for profile editing (name, email, birthdate).
- **TASK‑007‑D:** On save, call `PUT /v1/customers/{id}`.
- **TASK‑007‑E:** If `customerResourceId` is not known, allow creation via `POST /v1/customers` and update `AuthContext.customerResourceId`.

---

## 4. Acceptance Criteria by Story

### STORY‑001 — Catalog Browsing

- Given there are items in the catalog, when I visit `/catalog`, I see a list of items with name, price, image, and a way to navigate pages.
- Given I enter a search term and submit, I see only items matching name or SKU.
- Given I choose a sort option, the list updates to reflect that ordering.

### STORY‑002 — Cart Management

- Given I click “Add to cart” on a product, when I visit `/cart`, I see that product with the correct quantity.
- Given I change the quantity in the cart, the subtotal updates.
- Given I remove an item, it no longer appears in the cart.

### STORY‑003 — Authentication

- Given I am logged out, when I click “Login”, I am redirected to IdentityServer and, after success, returned with my user shown in the UI.
- Given I am logged in, `AuthContext.isAuthenticated` is true and an access token is available for API calls.

### STORY‑004 — Protected Route Handling

- Given I am not logged in, when I navigate directly to `/checkout`, I am redirected to login and then returned to `/checkout` after successful login.
- Given I am logged in, I can access `/checkout`, `/account/orders`, and `/account/profile` without redirection.

### STORY‑005 — Checkout & Order Creation

- Given I am logged in and have items in my cart, when I complete the checkout form and click “Place order”, an order is created and I see a confirmation screen.
- Given the order is successfully placed, when I return to `/cart`, the cart is empty.

### STORY‑006 — Order History

- Given I am logged in and have placed at least one order, when I visit `/account/orders`, I see my orders.
- Given I select an order, when I visit `/account/orders/:orderId`, I see its details.

### STORY‑007 — Profile Management

- Given I am logged in and have a customer record, when I visit `/account/profile`, I see my current profile information.
- Given I edit and save my profile, when I refresh the page, my changes remain.

