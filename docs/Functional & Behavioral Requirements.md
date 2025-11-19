# Document 1 — Functional & Behavioral Requirements
_Acme Shopping Cart_

## Table of Contents
1. Overview and Scope
2. Personas
3. User Stories
4. Functional Requirements (FR)
5. Non‑Functional Requirements (NFR)
6. UX & Interaction Requirements
7. Acceptance Criteria (Key Flows)
8. Glossary

---

## 1. Overview and Scope

### 1.1 Purpose

The Acme Shopping Cart website is a customer‑facing e‑commerce front end. It allows users to:

- Browse a catalog of items
- View product details
- Add items to a shopping cart
- Log in and complete a checkout flow (without payment processing)
- View past orders
- Manage their profile information

### 1.2 In‑Scope

- Public catalog browsing (no login required)
- Product detail view
- Shopping cart management (local to the browser until checkout)
- Authentication for checkout and account pages
- Checkout flow (customer info + shipping address + order review + order placement)
- Order history for the logged‑in customer
- Profile view and update for the logged‑in customer

### 1.3 Out‑of‑Scope (for this version)

- Payment processing (no card entry, no external payment gateway)
- Admin / CSR features (searching all orders, publishing customers, publishing orders)
- Inventory management
- Promotions, coupons, discounts
- Multi‑address management
- Multi‑currency or localization beyond basic English

---

## 2. Personas

### 2.1 Persona P1 — Casual Shopper

- **Description:** New or occasional visitor who discovers the site and wants to browse premium items.
- **Goals:**
  - Discover interesting items
  - Add items to cart easily
  - Quickly understand prices and product information
- **Pain points:**
  - Confusing navigation
  - Slow catalog loading
  - Being forced to log in too early

### 2.2 Persona P2 — Returning Customer

- **Description:** Previously created an account and placed at least one order.
- **Goals:**
  - Reorder similar products
  - Quickly see past orders
  - Update personal information if needed
- **Pain points:**
  - Hard to find past orders
  - Re‑entering information that should be saved (address, contact details)

---

## 3. User Stories

### 3.1 Catalog Browsing

- **US‑001:** As a visitor, I want to browse a list of items so that I can see what is available.
- **US‑002:** As a visitor, I want to search by name or SKU so that I can quickly find a specific item.
- **US‑003:** As a visitor, I want to page through results so I can navigate large catalogs.
- **US‑004:** As a visitor, I want to sort items (e.g., by name or price) so that I can order the catalog in a way that suits me.

### 3.2 Product Detail & Cart

- **US‑005:** As a visitor, I want to view details of a specific item so that I can decide whether to purchase it.
- **US‑006:** As a visitor, I want to add an item to my cart so that I can purchase it later.
- **US‑007:** As a visitor, I want to change quantities or remove items from my cart so that I can control exactly what I’m buying.

### 3.3 Authentication & Checkout

- **US‑008:** As a visitor, I want to log in when I’m ready to check out so that I can place an order.
- **US‑009:** As a logged‑in user, I want to provide a shipping address so that my order can be delivered.
- **US‑010:** As a logged‑in user, I want to review my order before placing it so that I can confirm everything is correct.
- **US‑011:** As a logged‑in user, I want to receive a confirmation that my order was placed.

### 3.4 Order History & Profile

- **US‑012:** As a logged‑in user, I want to see my past orders so that I can track or reference what I’ve purchased.
- **US‑013:** As a logged‑in user, I want to view details of a past order so that I can see items, dates, and status.
- **US‑014:** As a logged‑in user, I want to view and edit my profile information so that my details remain accurate.

---

## 4. Functional Requirements (FR)

Each requirement includes an ID for traceability.

### 4.1 Catalog

- **FR‑001 (Catalog List):**  
  The system SHALL display a paginated list of items on the Catalog page.
- **FR‑002 (Catalog Search):**  
  The system SHALL allow users to enter a text query to search items by name or SKU.
- **FR‑003 (Catalog Sort):**  
  The system SHALL allow users to sort catalog results by name and price in ascending and descending order.
- **FR‑004 (Catalog Accessibility):**  
  The catalog page SHALL be accessible without authentication.

### 4.2 Product Detail

- **FR‑005 (Product Detail View):**  
  The system SHALL display an item’s name, SKU, image, and price on the Product Detail page.
- **FR‑006 (Add to Cart from Detail):**  
  The system SHALL allow the user to add an item to the cart from the Product Detail page, specifying quantity.

### 4.3 Cart

- **FR‑007 (View Cart):**  
  The system SHALL provide a Cart page where users can see all items currently in their cart.
- **FR‑008 (Update Quantities):**  
  The system SHALL allow users to modify the quantity of each cart item.
- **FR‑009 (Remove Items):**  
  The system SHALL allow users to remove items from the cart.
- **FR‑010 (Cart Subtotal):**  
  The system SHALL display the cart subtotal (sum of item price × quantity).
- **FR‑011 (Proceed to Checkout):**  
  The system SHALL provide a way to proceed from Cart to Checkout.

### 4.4 Authentication

- **FR‑012 (Login Trigger):**  
  The system SHALL require users to be authenticated before they can access Checkout, Order History, or Profile pages.
- **FR‑013 (Redirect on Protected Access):**  
  When a non‑authenticated user attempts to access a protected page, the system SHALL redirect them to the login flow and, after successful login, back to the originating page.

### 4.5 Checkout

- **FR‑014 (Customer Info at Checkout):**  
  The system SHALL collect or display customer information (name, email, birthdate) during checkout.
- **FR‑015 (Shipping Address):**  
  The system SHALL capture a single shipping address (street, city, state, country, zip code).
- **FR‑016 (Order Review):**  
  The system SHALL present an order review screen with all items, quantities, prices, and shipping address before order submission.
- **FR‑017 (Order Submission):**  
  The system SHALL submit an order and show a confirmation screen upon success.
- **FR‑018 (Cart Clearing on Success):**  
  After a successful order, the system SHALL clear the local cart.

### 4.6 Order History & Profile

- **FR‑019 (Order History List):**  
  The system SHALL display a list of past orders for the logged‑in user, with pagination.
- **FR‑020 (Order Detail View):**  
  The system SHALL display details of a selected order, including items, totals, status, and shipping address.
- **FR‑021 (Profile View):**  
  The system SHALL display the user’s profile information (customer data).
- **FR‑022 (Profile Update):**  
  The system SHALL allow the user to update their profile information (within the supported fields).

---

## 5. Non‑Functional Requirements (NFR)

- **NFR‑001 (Performance):**  
  Catalog pages SHOULD load in under 2 seconds on a typical broadband connection, excluding third‑party network latency.
- **NFR‑002 (Responsiveness):**  
  The UI SHALL be usable and visually coherent on desktop, tablet, and mobile screens.
- **NFR‑003 (Availability):**  
  The site SHOULD handle transient API failures gracefully with user‑friendly error messages.
- **NFR‑004 (Accessibility):**  
  The site SHOULD follow basic accessibility practices, including keyboard navigation and sufficient color contrast.
- **NFR‑005 (Security):**  
  Protected pages SHALL NOT be accessible without authentication, and personal data SHALL NOT be shown to unauthenticated users.

---

## 6. UX & Interaction Requirements

- **UX‑001 (Navigation):**  
  Global navigation SHOULD provide links to Catalog, Cart, and Account (Profile / Orders) when applicable.
- **UX‑002 (Empty States):**  
  - Empty catalog search results SHOULD show a friendly “No items found” message.  
  - An empty cart SHOULD include a link back to the catalog.  
  - No order history SHOULD display “You haven’t placed any orders yet.”
- **UX‑003 (Feedback):**  
  - Adding an item to the cart SHOULD provide immediate visual confirmation (toast or inline message).  
  - Form validation errors SHOULD be shown near the relevant fields.
- **UX‑004 (Consistency):**  
  Buttons, typography, and spacing SHOULD follow a consistent design style across pages.

---

## 7. Acceptance Criteria (Key Flows)

### 7.1 Catalog Browsing (FR‑001 to FR‑004)

- Given I am a visitor, when I navigate to the Catalog page, then I see a list of items.
- Given there are more items than fit on one page, when I click to the next page, then I see a different subset of items.
- Given I enter a search term, when I submit the search, then items are filtered by name or SKU matching that term.
- Given I choose a sort option, when the page reloads, then items are shown in the specified order.

### 7.2 Cart Management (FR‑007 to FR‑011)

- Given I am viewing a product, when I add it to my cart, then I see the item with the correct quantity on the Cart page.
- Given my cart has an item, when I change its quantity, then the subtotal updates accordingly.
- Given my cart has an item, when I remove it, then the item disappears from the cart and the subtotal updates.

### 7.3 Checkout (FR‑012 to FR‑018)

- Given I am not logged in, when I click “Proceed to Checkout,” then I am redirected to login and then brought back to checkout.
- Given I am logged in and have items in my cart, when I complete the checkout forms and submit, then an order is created and I see a confirmation page.
- Given my order is successfully placed, when I go back to my cart, then the cart is empty.

### 7.4 Order History & Profile (FR‑019 to FR‑022)

- Given I am logged in and have placed orders, when I visit the Order History page, then I see a list of my own orders.
- Given I am logged in and select an order, when I view its detail page, then I see items, totals, status, and shipping address.
- Given I am logged in, when I update my profile and save, then my changes are persisted and visible on next visit.

---

## 8. Glossary

- **Catalog:** The list of products available for purchase.
- **Item/Product:** A purchasable unit in the catalog, identified by SKU and itemId.
- **SKU:** Stock Keeping Unit, a unique string identifier for a particular item.
- **Cart:** A temporary collection of items the user intends to purchase in this session.
- **Checkout:** The process of confirming user information, address, and cart contents before placing an order.
- **Order:** A confirmed request to purchase specific items, associated with a customer and address.
- **Profile:** The saved customer information associated with a logged‑in user.
- **Visitor:** A user who is not currently authenticated.
- **Logged‑in User:** A user who has successfully authenticated via IdentityServer.
