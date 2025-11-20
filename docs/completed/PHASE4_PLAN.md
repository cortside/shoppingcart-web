# PHASE4_PLAN: Cart Page

**Last Updated:** 2025-11-20  
**Status:** Completed  
**Owner:** Development Team

## Overview

Implement the shopping cart page where users can view cart contents, update quantities, remove items, see the subtotal, and proceed to checkout.

## Goals

- Implement Cart page with cart item display
- Allow quantity updates for each item
- Allow item removal
- Display cart subtotal
- Provide "Proceed to Checkout" button
- Handle empty cart state
- Ensure cart persistence works correctly

## Scope

### In Scope

- Cart page (`/cart`) per FR-007 through FR-011
- Display all cart items with image, name, price, quantity
- Quantity update controls
- Remove item buttons
- Subtotal calculation display
- "Proceed to Checkout" button (navigation to `/checkout`)
- Empty cart state with link back to catalog
- Integration with CartContext

### Out of Scope

- Checkout implementation (Phase 6)
- Authentication (Phase 5)
- Payment processing

## Dependencies

- **Prerequisites:**
  - Phase 1 complete (project structure)
  - Phase 2 complete (CartContext with persistence)
  - Phase 3 complete (ability to add items to cart)
- **External:** None (client-side only)

## Technical Details

### Cart Page

**Location:** `src/pages/Cart/index.tsx`

**Features:**
- Display all items from CartContext
- Show item details: image, name, SKU, unit price
- Quantity controls per item (input or +/- buttons)
- Remove button per item
- Subtotal display (sum of all item totals)
- "Continue Shopping" link to catalog
- "Proceed to Checkout" button to `/checkout`
- Empty cart state when no items

**Cart Item Display:**

Each cart item shows:
- Product image (thumbnail)
- Product name
- SKU
- Unit price
- Quantity selector
- Item total (unit price × quantity)
- Remove button

**Subtotal Display:**

Format: "Subtotal: $XXX.XX"

**Empty Cart State:**

Message: "Your cart is empty"
Link: "Continue Shopping" → `/catalog`

**Components:**

`src/pages/Cart/components/CartItem.tsx`:
- Single cart item row/card
- Props: `CartItem`, `onUpdateQuantity`, `onRemove`
- Displays all item details
- Quantity controls integrated

`src/pages/Cart/components/CartSummary.tsx`:
- Displays subtotal
- "Proceed to Checkout" button

`src/pages/Cart/components/EmptyCart.tsx`:
- Empty state message
- Link to catalog

### Integration with CartContext

```typescript
const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
```

**Update Quantity:**
```typescript
const handleUpdateQuantity = (sku: string, newQuantity: number) => {
  if (newQuantity < 1) return; // Prevent 0 or negative
  updateQuantity(sku, newQuantity);
};
```

**Remove Item:**
```typescript
const handleRemove = (sku: string) => {
  // Optional: confirm dialog before removing
  removeItem(sku);
};
```

### Responsive Design

- Desktop: Table-like layout with columns for image, name, price, quantity, total, remove
- Tablet/Mobile: Card layout, stacked vertically

## Deliverables

1. **Cart Page**
   - `src/pages/Cart/index.tsx`
   - `src/pages/Cart/components/CartItem.tsx`
   - `src/pages/Cart/components/CartSummary.tsx`
   - `src/pages/Cart/components/EmptyCart.tsx`

2. **Route Integration**
   - Update `src/routes/AppRoutes.tsx` to use actual Cart component

3. **Header Update**
   - Update `src/components/layout/Header.tsx` to show cart count and link to `/cart`

## Acceptance Criteria

Per Functional Requirements Section 6.2:

- [x] When I view the Cart page, I see all items I've added with correct quantities
- [x] When I change an item's quantity, the subtotal updates immediately
- [x] When I remove an item, it disappears from the cart and subtotal updates
- [x] The subtotal correctly sums all (unit price × quantity)
- [x] "Proceed to Checkout" button navigates to `/checkout`
- [x] Empty cart shows "Your cart is empty" with link to catalog
- [x] Cart persists when I close and reopen the browser (within 7 days)
- [x] Header shows current cart item count
- [x] Layout is responsive on mobile, tablet, desktop
- [x] ESLint passes with no errors (only pre-existing warnings from Catalog page)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Quantity input allows invalid values | Medium | Validate input, prevent negative/zero values |
| Accidental item removal | Low | Optional: add confirmation dialog |
| Subtotal calculation precision errors | Low | Use proper number formatting, round to 2 decimals |
| Cart persistence conflicts | Low | CartContext handles this; test edge cases |

## References

- Functional Requirements FR-007 through FR-011
- Acceptance Criteria Section 6.2
- UX Requirements UX-002 (empty cart state)
- Technical Specification Section 7.2 (CartContext)
- Functional Requirement FR-023 (cart persistence)

## Todo List

### Cart Page Components (Tasks 1-4)

- [x] **Task 1:** Create CartItem component
  - Status: Completed
  - Files: `src/pages/Cart/components/CartItem.tsx`
  - Content: Display item details, quantity controls, remove button
  
- [x] **Task 2:** Create CartSummary component
  - Status: Completed
  - Files: `src/pages/Cart/components/CartSummary.tsx`
  - Content: Subtotal display, "Proceed to Checkout" button
  
- [x] **Task 3:** Create EmptyCart component
  - Status: Completed
  - Files: `src/pages/Cart/components/EmptyCart.tsx`
  - Content: Empty state message, link to catalog
  
- [x] **Task 4:** Implement Cart page
  - Status: Completed
  - Files: `src/pages/Cart/index.tsx`
  - Content: Conditional render (empty vs items), integrate CartContext
  - Dependencies: Tasks 1-3

### Integration (Tasks 5-6)

- [x] **Task 5:** Update routes with Cart page
  - Status: Completed (already using actual Cart component)
  - Files: `src/routes/AppRoutes.tsx`
  - Action: Replace placeholder Cart component
  - Dependencies: Task 4
  
- [x] **Task 6:** Update Header with cart count and link
  - Status: Completed
  - Files: `src/components/layout/Header.tsx`
  - Content: Display `useCart().itemCount`, link to `/cart`
  - Dependencies: Task 5

### Testing (Task 7)

- [x] **Task 7:** End-to-end testing and acceptance criteria validation
  - Status: Completed
  - Action: All tests passing, cart functionality verified
  - Test file: `tests/pages/Cart/CartPage.test.tsx` (6 tests, all passing)
  - Dependencies: All previous tasks

## Notes

- Quantity controls should be similar to ProductDetail QuantitySelector (can reuse)
- Consider adding a "Clear Cart" button for user convenience (optional)
- Empty cart state should be visually friendly, not just text
- Cart count in header should update immediately when cart changes

## Completion Summary

**Phase 4 completed successfully on 2025-11-19**

### What Was Delivered

1. **Cart Page Components:**
   - `CartItem.tsx` - Displays individual cart items with quantity controls and remove button
   - `CartSummary.tsx` - Shows order summary with subtotal and checkout button
   - `EmptyCart.tsx` - Empty state with friendly messaging and link to catalog
   - `Cart/index.tsx` - Main cart page with conditional rendering

2. **Header Integration:**
   - Updated Header to show live cart count from CartContext
   - Added cart icon for better UX
   - Cart count updates immediately when items are added/removed

3. **Testing:**
   - Created comprehensive test suite (`tests/pages/Cart/CartPage.test.tsx`)
   - 6 tests covering all major functionality
   - All tests passing (100% pass rate)

### Key Technical Decisions

- **Responsive Design:** Used Tailwind's responsive classes with different layouts for mobile vs desktop
- **Reused Components:** Leveraged existing QuantitySelector from ProductDetail for consistency
- **CartContext Integration:** All cart operations go through the context for proper state management
- **Accessibility:** Added proper ARIA labels and semantic HTML
- **Visual Hierarchy:** Desktop uses table-like layout, mobile uses card-based stacked layout

### Functionality Verified

✅ Empty cart state displays correctly  
✅ Cart items render with all details (image, name, SKU, price, quantity)  
✅ Quantity controls work correctly (update, min/max limits)  
✅ Remove item functionality works  
✅ Subtotal calculates correctly  
✅ "Proceed to Checkout" button links to `/checkout`  
✅ "Continue Shopping" links to `/catalog`  
✅ Header cart count updates in real-time  
✅ Cart persists in localStorage (7-day TTL from Phase 2)  
✅ Responsive layout works on mobile, tablet, desktop  
✅ No linting errors (only pre-existing warnings from Catalog page)

### Known Issues / Future Enhancements

- Could add "Clear All Items" button for convenience
- Could add item removal confirmation dialog to prevent accidental deletions
- Could show loading state when cart is being updated (currently instant)
- Pre-existing linting warnings in Catalog page (useCallback dependencies) - not introduced by this phase

### Files Created/Modified

**Created:**
- `src/pages/Cart/components/CartItem.tsx`
- `src/pages/Cart/components/CartSummary.tsx`
- `src/pages/Cart/components/EmptyCart.tsx`
- `tests/pages/Cart/CartPage.test.tsx`

**Modified:**
- `src/pages/Cart/index.tsx` (replaced placeholder)
- `src/components/layout/Header.tsx` (added cart count)
- `memory-bank/current/PHASE4_PLAN.md` (tracked progress)

### Next Steps

Phase 4 is complete. Ready to proceed to Phase 5 (Authentication) or continue with other planned phases.
