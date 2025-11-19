# **Acme Shopping Cart Website – Executive Overview**

## **1. Purpose of the Project**

The Acme Shopping Cart website is a modern, customer-facing ecommerce experience designed to make purchasing premium products simple, fast, and intuitive.  
This initiative delivers a streamlined online storefront backed by Acme’s secure APIs and identity platform.

The goal: **Enable customers to easily browse items, manage a cart, check out, and view their order history** — all within a clean, responsive, mobile-ready web application.

---

## **2. Core Features**

### **2.1 Catalog Browsing**

- Public catalog available without login.
    
- Paginated list of products with real-time search and sorting.
    
- Product detail pages with images, descriptions, and pricing.
    

### **2.2 Shopping Cart**

- Add items to cart directly from catalog or item detail pages.
    
- Update quantities or remove items.
    
- Cart persists throughout the session.
    

### **2.3 User Authentication**

- Secure login powered by Acme's existing IdentityServer platform.
    
- Authentication required **only during checkout**.
    
- Customers tied to their unique identity via a standard OIDC "subject" claim.
    

### **2.4 Checkout Experience**

- Simple and guided checkout flow.
    
- Customers enter contact and address information (one address only).
    
- Order is created through the ShoppingCart API.
    
- Payment processing is out of scope for this version.
    

### **2.5 Customer Profile**

- Customers can review and update their personal information.
    
- Profile syncs with the ShoppingCart API customer model.
    

### **2.6 Order History**

- Logged-in users can view past orders.
    
- Order detail pages include items, pricing, and order status.
    

---

## **3. User Experience Highlights**

- **Modern, responsive UI** (optimized for desktop, tablet, and mobile).
    
- **Fast and intuitive navigation** using a single-page application (SPA).
    
- **Minimal friction** — browsing is public, login appears only when necessary.
    
- **Clean, premium design** suited for high-end products.
    
- **Consistency** across catalog, cart, checkout, and profile features.
    

---

## **4. Technology Summary (High-Level)**

Although non-technical, executives may want assurance of modern foundations:

- **React Single-Page Application**
    
- **TypeScript and TailwindCSS** for reliability and rapid UI development
    
- **OpenID Connect authentication** for secure, centralized identity
    
- **API-driven architecture** leveraging:
    
    - Catalog API (items, search, details)
        
    - ShoppingCart API (customers, orders)
        

All services utilize Acme’s existing cloud infrastructure and identity standards.

---

## **5. Project Scope Summary**

This release includes:

|Feature|Included?|
|---|---|
|Catalog browsing|✅|
|Product details|✅|
|Shopping cart|✅|
|Login (OIDC)|✅|
|Checkout|✅|
|Order creation|✅|
|Order history|✅|
|Profile management|✅|
|Payment processing|❌ Future phase|
|Admin features|❌ Out of scope|
