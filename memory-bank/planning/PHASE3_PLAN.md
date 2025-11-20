# PHASE3_PLAN: Public Pages (Catalog & Product Detail)

**Last Updated:** 2025-11-19  
**Status:** Planning  
**Owner:** Development Team

## Overview

Implement the public-facing catalog browsing experience: the Catalog list page with pagination, search, and sorting, and the Product Detail page with add-to-cart functionality.

## Goals

- Implement Catalog page with item grid/list display
- Add pagination controls for catalog
- Implement search by name/SKU
- Implement sort by name and price (asc/desc)
- Implement Product Detail page with item display
- Add "Add to Cart" functionality on Product Detail page
- Ensure responsive design for desktop, tablet, mobile
- Handle loading and error states

## Scope

### In Scope

- Catalog page (`/catalog`) per FR-001 through FR-004
- Product Detail page (`/product/:sku`) per FR-005, FR-006
- Integration with Catalog API via `catalogApi.ts`
- Integration with CartContext for add-to-cart
- UI components: ItemCard, ItemGrid, Pagination, SearchBar, SortDropdown
- Loading indicators and error messages
- Empty state for no search results
- Responsive layout with TailwindCSS

### Out of Scope

- Cart page (Phase 4)
- Authentication (Phase 5)
- Checkout (Phase 6)
- Protected pages (Phases 7-8)

## Dependencies

- **Prerequisites:** 
  - Phase 1 complete (project structure, layout)
  - Phase 2 complete (types, catalogApi, CartContext)
- **External:** Catalog API running on port 5001

## Technical Details

### Catalog Page

**Location:** `src/pages/Catalog/index.tsx`

**Features:**
- Display items in grid layout (responsive: 1 col mobile, 2-3 col tablet, 4 col desktop)
- Pagination controls (Previous, Next, page numbers)
- Search input (debounced for performance)
- Sort dropdown (Name A-Z, Name Z-A, Price Low-High, Price High-Low)
- Loading spinner while fetching
- Error message if API fails
- Empty state "No items found" when search returns 0 results

**Query State:**
- Use URL query params for pageNumber, search, sort
- Preserve query params on navigation

**API Integration:**
```typescript
const { data, loading, error } = useCatalogItems({
  pageNumber,
  pageSize: 12,
  search,
  sort
});
```

**Components:**

`src/pages/Catalog/components/ItemCard.tsx`:
- Display: image, name, SKU, price
- Click → navigate to `/product/${sku}`

`src/pages/Catalog/components/ItemGrid.tsx`:
- Grid container for ItemCard components

`src/pages/Catalog/components/SearchBar.tsx`:
- Input with search icon
- Debounced onChange (300ms)

`src/pages/Catalog/components/SortDropdown.tsx`:
- Dropdown with sort options
- Options: "name", "name desc", "unitPrice", "unitPrice desc"

`src/pages/Catalog/components/Pagination.tsx`:
- Previous/Next buttons
- Page number display
- Disable Previous on page 1, Next on last page

### Product Detail Page

**Location:** `src/pages/ProductDetail/index.tsx`

**Features:**
- Fetch item by SKU from route param
- Display: large image, name, SKU, price, description (if available)
- Quantity selector (number input, min 1)
- "Add to Cart" button
- Loading state while fetching item
- Error state if item not found (404)
- Success toast/message when added to cart
- Breadcrumb navigation (Catalog > Product Name)

**API Integration:**
```typescript
const { sku } = useParams();
const { item, loading, error } = useItemBySku(sku);
```

**Add to Cart:**
```typescript
const { addItem } = useCart();
const handleAddToCart = () => {
  addItem(item, quantity);
  // Show success message
};
```

**Components:**

`src/pages/ProductDetail/components/QuantitySelector.tsx`:
- Number input with +/- buttons
- Min: 1, default: 1

`src/components/common/Toast.tsx`:
- Simple toast notification component
- Used for "Added to cart" message

### Common Components

Create reusable components:

`src/components/common/LoadingSpinner.tsx`:
- Centered spinner for loading states

`src/components/common/ErrorMessage.tsx`:
- Styled error display with retry option

`src/components/common/Button.tsx`:
- Primary/secondary button styles
- Loading state support

### Routing Integration

Update `src/routes/AppRoutes.tsx`:
- Remove placeholder Catalog component
- Remove placeholder ProductDetail component
- Import actual implementations

## Deliverables

1. **Catalog Page**
   - `src/pages/Catalog/index.tsx`
   - `src/pages/Catalog/components/ItemCard.tsx`
   - `src/pages/Catalog/components/ItemGrid.tsx`
   - `src/pages/Catalog/components/SearchBar.tsx`
   - `src/pages/Catalog/components/SortDropdown.tsx`
   - `src/pages/Catalog/components/Pagination.tsx`

2. **Product Detail Page**
   - `src/pages/ProductDetail/index.tsx`
   - `src/pages/ProductDetail/components/QuantitySelector.tsx`

3. **Common Components**
   - `src/components/common/LoadingSpinner.tsx`
   - `src/components/common/ErrorMessage.tsx`
   - `src/components/common/Button.tsx`
   - `src/components/common/Toast.tsx`

4. **Hooks (optional)**
   - `src/hooks/useCatalogItems.ts` (wrapper for catalogApi.listItems)
   - `src/hooks/useItemBySku.ts` (wrapper for catalogApi.getItemBySku)

## Acceptance Criteria

Per Functional Requirements Section 6.1:

- [ ] When I navigate to `/catalog`, I see a list of items
- [ ] Pagination works: clicking Next shows a different subset of items
- [ ] Search filters items by name or SKU
- [ ] Sort options reorder items correctly (name asc/desc, price asc/desc)
- [ ] Clicking an item navigates to `/product/:sku` with item details
- [ ] On Product Detail, I can select quantity and add item to cart
- [ ] After adding to cart, I see a success message
- [ ] Loading states display while fetching data
- [ ] Error states display if API fails
- [ ] Empty state displays when search returns no results
- [ ] Layout is responsive on mobile, tablet, desktop
- [ ] ESLint passes with no errors
- [ ] Follows TypeScript and UI coding standards

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Catalog API slow response times | Medium | Implement loading states, consider caching |
| Large images slow page load | Medium | Use lazy loading, optimize image sizes |
| Search debouncing too aggressive | Low | Test with users, adjust timeout |
| Pagination UX unclear | Low | Add clear visual indicators for current page |

## References

- Functional Requirements FR-001 through FR-006
- Acceptance Criteria Section 6.1
- UX Requirements UX-002, UX-003, UX-004
- Technical Specification Section 5.1 (Catalog API)
- NFR-001 (Performance), NFR-002 (Responsiveness)

## Todo List

### Catalog Page Implementation (Tasks 1-7)

- [ ] **Task 1:** Create ItemCard component
  - Status: Not Started
  - Files: `src/pages/Catalog/components/ItemCard.tsx`
  - Content: Display item image, name, SKU, price; click handler
  
- [ ] **Task 2:** Create ItemGrid component
  - Status: Not Started
  - Files: `src/pages/Catalog/components/ItemGrid.tsx`
  - Content: Responsive grid container
  
- [ ] **Task 3:** Create SearchBar component
  - Status: Not Started
  - Files: `src/pages/Catalog/components/SearchBar.tsx`
  - Content: Input with debounced onChange
  
- [ ] **Task 4:** Create SortDropdown component
  - Status: Not Started
  - Files: `src/pages/Catalog/components/SortDropdown.tsx`
  - Content: Dropdown with sort options
  
- [ ] **Task 5:** Create Pagination component
  - Status: Not Started
  - Files: `src/pages/Catalog/components/Pagination.tsx`
  - Content: Previous/Next, page numbers
  
- [ ] **Task 6:** Implement Catalog page
  - Status: Not Started
  - Files: `src/pages/Catalog/index.tsx`
  - Content: API integration, state management, component composition
  - Dependencies: Tasks 1-5
  
- [ ] **Task 7:** Add catalog to routes
  - Status: Not Started
  - Files: `src/routes/AppRoutes.tsx`
  - Action: Replace placeholder with actual Catalog component
  - Dependencies: Task 6

### Product Detail Page Implementation (Tasks 8-11)

- [ ] **Task 8:** Create QuantitySelector component
  - Status: Not Started
  - Files: `src/pages/ProductDetail/components/QuantitySelector.tsx`
  - Content: Number input with +/- buttons
  
- [ ] **Task 9:** Implement ProductDetail page
  - Status: Not Started
  - Files: `src/pages/ProductDetail/index.tsx`
  - Content: Fetch item by SKU, display details, add to cart integration
  - Dependencies: Task 8
  
- [ ] **Task 10:** Add product detail to routes
  - Status: Not Started
  - Files: `src/routes/AppRoutes.tsx`
  - Action: Replace placeholder with actual ProductDetail component
  - Dependencies: Task 9
  
- [ ] **Task 11:** Test navigation from Catalog to Product Detail
  - Status: Not Started
  - Action: Click item card, verify correct item loads
  - Dependencies: Task 7, Task 10

### Common Components (Tasks 12-15)

- [ ] **Task 12:** Create LoadingSpinner component
  - Status: Not Started
  - Files: `src/components/common/LoadingSpinner.tsx`
  
- [ ] **Task 13:** Create ErrorMessage component
  - Status: Not Started
  - Files: `src/components/common/ErrorMessage.tsx`
  
- [ ] **Task 14:** Create Button component
  - Status: Not Started
  - Files: `src/components/common/Button.tsx`
  - Content: Primary/secondary styles, loading state
  
- [ ] **Task 15:** Create Toast component
  - Status: Not Started
  - Files: `src/components/common/Toast.tsx`
  - Content: Success/error notifications

### Testing & Refinement (Task 16)

- [ ] **Task 16:** End-to-end testing and acceptance criteria validation
  - Status: Not Started
  - Action: Test all acceptance criteria, verify responsive design
  - Dependencies: All previous tasks

## Notes

- Use TailwindCSS utility classes for responsive layouts
- Consider adding a custom hook for API calls to reduce boilerplate
- Empty state message: "No items found. Try adjusting your search."
- Default pageSize: 12 items per page
- Debounce search: 300ms
