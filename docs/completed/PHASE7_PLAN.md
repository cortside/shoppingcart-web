# PHASE7_PLAN: Order History

**Last Updated:** 2025-01-11  
**Status:** Completed  
**Owner:** Development Team

## Overview

Implement the Order History page where authenticated users can view their past orders in a paginated list. This provides transparency and order tracking capabilities.

## Goals

- Display paginated list of user's orders
- Show key order information (order ID, date, status, total)
- Enable navigation to individual order details
- Implement responsive design for mobile and desktop
- Handle empty state (no orders yet)

## Scope

### In Scope

- Order history page (`/account/orders`) per FR-019
- Paginated order list
- Order summary cards
- Navigation to individual order detail
- Empty state when no orders exist
- Loading states
- Error handling for API failures

### Out of Scope

- Order filtering by status
- Order search
- Order cancellation
- Order editing
- Export orders to CSV

## Dependencies

- **Prerequisites:**
  - Phase 1-2 complete (infrastructure)
  - Phase 5 complete (authentication)
  - Phase 6 complete (checkout creates orders)
- **External:** ShoppingCart API running on port 5000

## Technical Details

### Order History API

**Endpoint:** `GET /v1/orders`

**Query Parameters:**
- `pageNumber`: 1-based page number
- `pageSize`: items per page (default 20)

**Response:**

```typescript
{
  "pageNumber": 1,
  "pageSize": 20,
  "totalItems": 45,
  "totalPages": 3,
  "items": [
    {
      "orderResourceId": "550e8400-e29b-41d4-a716-446655440000",
      "orderDate": "2025-11-15T10:30:00Z",
      "status": "Confirmed",
      "items": [
        {
          "sku": "WIDGET-001",
          "name": "Premium Widget",
          "unitPrice": 29.99,
          "quantity": 2
        }
      ],
      "address": {
        "street": "123 Main St",
        "city": "Springfield",
        "state": "IL",
        "country": "USA",
        "zipCode": "62701"
      },
      "total": 59.98
    }
  ]
}
```

### Page Structure

**Location:** `src/pages/OrderHistory/index.tsx`

**Layout:**

```
┌────────────────────────────────────────┐
│ Order History                           │
├────────────────────────────────────────┤
│ [Order Card 1]                          │
│ Order #550e8400... | Nov 15, 2025      │
│ Status: Confirmed | Total: $59.98      │
│ 2 items                                 │
│ [View Details →]                        │
├────────────────────────────────────────┤
│ [Order Card 2]                          │
│ ...                                     │
├────────────────────────────────────────┤
│ [Pagination]                            │
│ ← Previous | Page 1 of 3 | Next →      │
└────────────────────────────────────────┘
```

### Order Card Component

**Location:** `src/pages/OrderHistory/components/OrderCard.tsx`

**Display:**
- Order ID (first 8 characters + "...")
- Order date (formatted)
- Order status
- Total amount (formatted currency)
- Item count
- "View Details" link

**Example:**

```tsx
interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">
          Order #{order.orderResourceId.substring(0, 8)}...
        </h3>
        <span className="text-sm text-gray-600">
          {formatDate(order.orderDate)}
        </span>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
        <span className="font-semibold">
          {formatCurrency(order.total)}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
      </p>
      
      <Link 
        to={`/account/orders/${order.orderResourceId}`}
        className="text-blue-600 hover:underline text-sm"
      >
        View Details →
      </Link>
    </div>
  );
};
```

### Pagination Component

**Location:** `src/components/common/Pagination.tsx` (reusable)

**Props:**
- `currentPage: number`
- `totalPages: number`
- `onPageChange: (page: number) => void`

**Features:**
- Previous/Next buttons
- Current page indicator
- Disabled state for first/last page

### Data Fetching

**Hook pattern:**

```typescript
const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchOrders = async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await listOrders({ pageNumber: page, pageSize: 20 });
      setOrders(response.items);
      setPagination({
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalItems: response.totalItems,
        totalPages: response.totalPages
      });
    } catch (err) {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrders(pagination.pageNumber);
  }, [pagination.pageNumber]);
  
  // Render logic...
};
```

### Empty State

**When:** `orders.length === 0 && !loading`

**Display:**

```tsx
<div className="text-center py-12">
  <p className="text-gray-600 text-lg mb-4">
    You haven't placed any orders yet.
  </p>
  <Link 
    to="/catalog" 
    className="text-blue-600 hover:underline"
  >
    Start shopping →
  </Link>
</div>
```

### Loading State

**When:** `loading === true`

**Display:** Skeleton loaders or spinner

### Error State

**When:** `error !== null`

**Display:**

```tsx
<div className="text-center py-12">
  <p className="text-red-600 mb-4">{error}</p>
  <button 
    onClick={() => fetchOrders(pagination.pageNumber)}
    className="btn-primary"
  >
    Retry
  </button>
</div>
```

### Responsive Design

**Mobile (<640px):**
- Stack order card content vertically
- Full width cards
- Simplified pagination (just arrows)

**Tablet/Desktop (≥640px):**
- Order cards with horizontal layout
- Page numbers in pagination

## Deliverables

1. **Order History Page**
   - `src/pages/OrderHistory/index.tsx` (main page)
   - `src/pages/OrderHistory/components/OrderCard.tsx`

2. **Reusable Components**
   - `src/components/common/Pagination.tsx`

3. **Utilities** (if not already created)
   - `src/utils/formatters.ts` (formatDate, formatCurrency, getStatusColor)

4. **Route Updates**
   - Update `src/routes/AppRoutes.tsx` with OrderHistory component

## Acceptance Criteria

Per Functional Requirements FR-019 and Section 6.4:

- [ ] When I navigate to `/account/orders`, I see a list of my orders
- [ ] Each order shows: order ID, date, status, total, item count
- [ ] I can click "View Details" to see individual order
- [ ] If I have more than 20 orders, pagination controls appear
- [ ] I can navigate between pages using Previous/Next buttons
- [ ] If I have no orders, I see a message and link to catalog
- [ ] Orders are sorted by date (newest first)
- [ ] Page is responsive on mobile and desktop
- [ ] API errors are handled gracefully with retry option
- [ ] ESLint passes with no errors

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large number of orders (performance) | Medium | Pagination already implemented; consider caching |
| API timeout on slow connections | Medium | Add loading timeout, show error after 10s |
| Order status inconsistency | Low | Display status as-is from API, add refresh button |
| User has no customerResourceId | High | Verify authentication and customer mapping in Phase 5/6 |

## References

- Functional Requirements FR-019
- Acceptance Criteria Section 6.4
- Technical Specification Section 5.2.2 (List Orders API)
- Technical Specification Section 4.1 (Order model)
- UX-001 (responsive design)

## Todo List

### Components (Tasks 1-2)

- [x] **Task 1:** Create OrderCard component
  - Status: Completed
  - Files: `src/pages/Orders/components/OrderCard.tsx`
  - Content: Display order summary with link to detail
  
- [x] **Task 2:** Create Pagination component
  - Status: Completed
  - Files: `src/components/common/Pagination.tsx`
  - Content: Reusable pagination with prev/next/page numbers

### Order History Page (Task 3)

- [x] **Task 3:** Implement OrderHistory page
  - Status: Completed
  - Files: `src/pages/Orders/index.tsx`
  - Content: Fetch orders, display list, handle pagination
  - Dependencies: Tasks 1-2

### States (Tasks 4-6)

- [x] **Task 4:** Implement loading state
  - Status: Completed
  - Location: `src/pages/Orders/index.tsx`
  - Content: LoadingSpinner component
  
- [x] **Task 5:** Implement empty state
  - Status: Completed
  - Location: `src/pages/Orders/index.tsx`
  - Content: Message + link to catalog
  
- [x] **Task 6:** Implement error state
  - Status: Completed
  - Location: `src/pages/Orders/index.tsx`
  - Content: Error message + retry button

### Utilities (Task 7)

- [x] **Task 7:** Add date/currency formatters
  - Status: Completed
  - Files: `src/utils/formatters.ts`
  - Content: formatDate, formatCurrency, getStatusColor, truncate helpers

### Integration (Task 8)

- [x] **Task 8:** Update routes with OrderHistory
  - Status: Completed
  - Files: `src/routes/AppRoutes.tsx`
  - Action: Replaced placeholder OrderHistory component (already integrated)

### Testing (Task 9)

- [x] **Task 9:** End-to-end order history testing
  - Status: Completed
  - Action: Test with 0 orders, 1 page, multiple pages, errors
  - Dependencies: All previous tasks
  - Notes: All 41 tests passing (formatters, pagination, OrderCard, Orders page)

## Code Review Fixes

All critical performance issues identified in code review have been addressed:

- ✅ **Fixed:** Added `useCallback` to `fetchOrders` in OrdersPage
- ✅ **Fixed:** Added `useCallback` to `handlePageChange` in OrdersPage  
- ✅ **Fixed:** Fixed `useEffect` dependency array (removed eslint-disable)
- ✅ **Fixed:** Added `useCallback` to `handlePrevious` and `handleNext` in Pagination
- ✅ **Fixed:** Wrapped Pagination component with `React.memo`
- ✅ **Fixed:** Wrapped OrderCard component with `React.memo`
- ✅ **Fixed:** Added `readonly` modifiers to all props interfaces
- ✅ **Fixed:** Added `useMemo` for computed values in OrderCard
- ✅ **Fixed:** Extracted magic number (page size 20) to `DEFAULT_PAGE_SIZE` constant
- ✅ **Fixed:** Added `displayName` to all memoized components (Pagination, OrderCard, OrdersPage)

**Test Results After Fixes:**
- ✅ All 41 tests passing
- ✅ Build successful  
- ✅ No lint errors in Phase 7 code
- ✅ All React performance best practices followed

## Notes

- Order status values should be displayed as-is from API
- Consider adding a "Refresh" button for users to manually reload
- Date formatting should be locale-aware (use browser locale)
- Pagination component will be reused in Phase 8 (Profile) if customer has many orders
- Consider adding order status filtering in future (out of scope for now)
