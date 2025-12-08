# PHASE6_PLAN: Checkout Flow

**Last Updated:** 2025-11-19  
**Status:** Planning  
**Owner:** Development Team

## Overview

Implement the complete checkout experience where authenticated users provide customer information and shipping address, review their order, and submit to create an order via the ShoppingCart API.

## Goals

- Implement multi-step checkout flow
- Collect customer information (name, email, birthdate)
- Prefill customer info if user has existing customer record
- Collect shipping address
- Display order review with items, quantities, prices, address
- Submit order to ShoppingCart API
- Handle new vs existing customers
- Clear cart after successful order
- Display order confirmation

## Scope

### In Scope

- Checkout page (`/checkout`) per FR-014 through FR-018
- Customer information form (with prefill if exists)
- Shipping address form
- Order review screen
- Order submission logic
- Success confirmation page
- Error handling for order submission failures
- Form validation per Section 8.2
- Integration with ShoppingCart API
- Customer resource ID management in AuthContext

### Out of Scope

- Payment processing
- Order editing after submission
- Multiple shipping addresses

## Dependencies

- **Prerequisites:**
  - Phase 1-2 complete (infrastructure)
  - Phase 4 complete (cart with items)
  - Phase 5 complete (authentication working)
- **External:** ShoppingCart API running on port 5000

## Technical Details

### Checkout Flow

**Steps:**

1. **Customer Information** (if not already have customerResourceId)
2. **Shipping Address**
3. **Order Review**
4. **Submission & Confirmation**

**State Management:**

Use React state or form library (React Hook Form recommended) to manage:
- Customer data: firstName, lastName, email, birthDate
- Address data: street, city, state, country, zipCode
- Current step

### Customer Information Step

**Location:** `src/pages/Checkout/components/CustomerInfoForm.tsx`

**Behavior:**
- On mount, check if `AuthContext.customerResourceId` exists
- If exists: fetch customer via `shoppingCartApi.getCustomer()` and prefill form
- If not: show empty form
- Fields: firstName, lastName, email, birthDate
- Validation: all required, email format, birthDate format (YYYY-MM-DD)
- "Continue to Shipping" button

**Prefill Logic:**

```typescript
const { customerResourceId } = useAuth();

useEffect(() => {
  if (customerResourceId) {
    getCustomer(customerResourceId).then(customer => {
      // Prefill form with customer data
    });
  }
}, [customerResourceId]);
```

### Shipping Address Step

**Location:** `src/pages/Checkout/components/ShippingAddressForm.tsx`

**Fields:**
- street (required)
- city (required)
- state (required)
- country (required, default "USA")
- zipCode (required)

**Validation:**
- All fields required
- ZipCode format validation (simple regex)

**"Continue to Review" button**

### Order Review Step

**Location:** `src/pages/Checkout/components/OrderReview.tsx`

**Display:**
- Customer Info summary (name, email)
- Shipping Address summary
- Items list (from cart):
  - Each item: name, SKU, quantity, unit price, total
- Subtotal
- "Edit Customer Info" link (go back to step 1)
- "Edit Address" link (go back to step 2)
- "Place Order" button

### Order Submission

**Logic:**

```typescript
const handleSubmitOrder = async () => {
  const { customerResourceId, setCustomerResourceId } = useAuth();
  const { items, clearCart } = useCart();
  
  try {
    let order;
    
    if (customerResourceId) {
      // Existing customer flow
      order = await createOrderForExistingCustomer(customerResourceId, {
        address,
        items: items.map(i => ({ sku: i.sku, quantity: i.quantity }))
      });
    } else {
      // New customer flow
      const result = await createOrderForNewCustomer({
        customer: customerInfo,
        address,
        items: items.map(i => ({ sku: i.sku, quantity: i.quantity }))
      });
      
      order = result;
      
      // Extract and store customerResourceId for future orders
      setCustomerResourceId(result.customer.customerResourceId);
    }
    
    // Clear cart
    clearCart();
    
    // Navigate to confirmation
    navigate(`/checkout/confirmation/${order.orderResourceId}`);
  } catch (error) {
    // Handle error
  }
};
```

### Confirmation Page

**Location:** `src/pages/Checkout/components/OrderConfirmation.tsx`

**Display:**
- Success message "Order placed successfully!"
- Order ID (orderResourceId)
- "View Order Details" link → `/account/orders/${orderResourceId}`
- "Continue Shopping" link → `/catalog`

### Form Validation

Use `src/utils/validation.ts` from Phase 2:
- Email validation
- Birthdate format validation
- Required field validation

Display errors inline near form fields per UX-003.

### Error Handling

Per Section 8.1, handle API errors:
- Map `ErrorsModel` to form field errors
- Display general error message for server errors
- Allow retry on failure

## Deliverables

1. **Checkout Page & Components**
   - `src/pages/Checkout/index.tsx` (main orchestrator)
   - `src/pages/Checkout/components/CustomerInfoForm.tsx`
   - `src/pages/Checkout/components/ShippingAddressForm.tsx`
   - `src/pages/Checkout/components/OrderReview.tsx`
   - `src/pages/Checkout/components/OrderConfirmation.tsx`

2. **Form Components** (if needed)
   - `src/components/common/FormInput.tsx`
   - `src/components/common/FormError.tsx`

3. **Route Updates**
   - Update `src/routes/AppRoutes.tsx` with Checkout component
   - Add `/checkout/confirmation/:orderId` route

## Acceptance Criteria

Per Functional Requirements FR-014 through FR-018 and Section 6.3:

- [ ] When I access `/checkout` while logged in, I see the checkout form
- [ ] If I have an existing customer record, my info is prefilled
- [ ] I can enter/update customer information and shipping address
- [ ] Order review shows all items, quantities, prices, and shipping address
- [ ] When I submit the order, an order is created in ShoppingCart API
- [ ] After successful order, I see a confirmation with order ID
- [ ] After successful order, my cart is empty
- [ ] If I'm a new customer, my customerResourceId is stored for future orders
- [ ] Form validation prevents submission of invalid data
- [ ] API errors are displayed clearly
- [ ] ESLint passes with no errors

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Customer already exists (duplicate email) | Medium | Handle 409 conflict from API, show clear message |
| Order submission fails mid-process | High | Add retry mechanism, don't clear cart on failure |
| Form state lost on refresh | Medium | Consider sessionStorage for form persistence |
| Invalid address data | Medium | Add thorough client-side validation |
| Cart empty at checkout | Low | Check cart before allowing checkout, redirect if empty |

## References

- Functional Requirements FR-014 through FR-018
- Acceptance Criteria Section 6.3
- Technical Specification Section 5.2 (ShoppingCart API)
- Technical Specification Section 6.3 (Customer Mapping)
- Technical Specification Section 8 (Error Handling & Validation)
- UX-003 (form validation display)

## Todo List

### Form Components (Tasks 1-3)

- [ ] **Task 1:** Create CustomerInfoForm
  - Status: Not Started
  - Files: `src/pages/Checkout/components/CustomerInfoForm.tsx`
  - Content: Form with firstName, lastName, email, birthDate; prefill logic
  
- [ ] **Task 2:** Create ShippingAddressForm
  - Status: Not Started
  - Files: `src/pages/Checkout/components/ShippingAddressForm.tsx`
  - Content: Form with address fields, validation
  
- [ ] **Task 3:** Create OrderReview
  - Status: Not Started
  - Files: `src/pages/Checkout/components/OrderReview.tsx`
  - Content: Display all order details, edit links, submit button

### Checkout Page (Task 4)

- [ ] **Task 4:** Implement Checkout page orchestrator
  - Status: Not Started
  - Files: `src/pages/Checkout/index.tsx`
  - Content: Multi-step flow, state management, submission logic
  - Dependencies: Tasks 1-3

### Confirmation (Task 5)

- [ ] **Task 5:** Create OrderConfirmation component
  - Status: Not Started
  - Files: `src/pages/Checkout/components/OrderConfirmation.tsx`
  - Content: Success message, order ID, navigation links

### Integration (Task 6)

- [ ] **Task 6:** Update routes with Checkout pages
  - Status: Not Started
  - Files: `src/routes/AppRoutes.tsx`
  - Action: Replace placeholder Checkout, add confirmation route
  - Dependencies: Tasks 4-5

### Testing (Task 7)

- [ ] **Task 7:** End-to-end checkout testing
  - Status: Not Started
  - Action: Test new customer flow, existing customer flow, error cases
  - Dependencies: All previous tasks
  - Notes: Requires ShoppingCart API running

## Notes

- Use React Hook Form for form management to reduce boilerplate
- Consider adding a progress indicator (Steps 1/3, 2/3, 3/3)
- Confirmation page should prevent accidental navigation away
- customerResourceId should persist across sessions (stored in AuthContext, potentially in sessionStorage)
- Consider adding "Save for later" or "Continue as guest" in future (out of scope now)
