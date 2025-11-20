---
description: 'React-specific coding standards and best practices, including hooks, performance optimization, and component patterns.'
applyTo: '**/*.tsx,**/*.jsx'
---

# React Best Practices and Standards

**Status:** Authoritative  
**Scope:** React-specific patterns for TypeScript/JavaScript projects  
**Last Updated:** November 20, 2025

This document defines **HOW** to write React code with a focus on performance, maintainability, and best practices. These standards complement the TypeScript and Performance instruction files.

## Core Principles

1. **Functional Components Only:** Use functional components with hooks, not class components
2. **Performance by Default:** Memoize appropriately to prevent unnecessary re-renders
3. **Composition Over Inheritance:** Build complex UIs from simple, reusable components
4. **Explicit Dependencies:** Always declare all hook dependencies accurately
5. **Accessibility First:** Build accessible components from the start

---

## Component Structure

### Functional Components

**Always use functional components:**

```tsx
// ✅ Good: Functional component with TypeScript
interface UserCardProps {
  readonly user: User;
  readonly onEdit: (id: string) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
}

// ❌ Bad: Class component
class UserCard extends React.Component<UserCardProps> {
  render() {
    return <div>...</div>;
  }
}
```

### Props Interface Naming

```tsx
// ✅ Good: ComponentNameProps pattern
interface UserCardProps {
  readonly user: User;
}

// ✅ Good: Mark props as readonly
interface ButtonProps {
  readonly onClick: () => void;
  readonly children: ReactNode;
}

// ❌ Bad: Generic or unclear naming
interface Props {
  user: User;
}
```

---

## Performance Optimization

### CRITICAL: Memoization Requirements

**Always memoize callbacks passed to child components or used in dependency arrays:**

#### Context Providers - MUST Memoize Callbacks

```tsx
// ❌ Bad: Callbacks recreated on every render
export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CatalogItem, quantity: number) => {
    setItems((current) => [...current, { ...item, quantity }]);
  };

  const value = {
    items,
    addItem, // ❌ New function instance every render
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ✅ Good: Callbacks properly memoized
export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  // ✅ useCallback with correct dependencies
  const addItem = useCallback((item: CatalogItem, quantity: number) => {
    setItems((current) => [...current, { ...item, quantity }]);
  }, []); // Empty deps because using functional setState

  const value = useMemo(
    () => ({
      items,
      addItem,
    }),
    [items, addItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

#### When to Use `useCallback`

**MUST use `useCallback` when:**

1. **Passing callbacks to memoized child components**
2. **Callbacks are dependencies of other hooks**
3. **Callbacks are in Context Provider values**
4. **Callbacks are passed to third-party libraries expecting stable references**

```tsx
// ✅ Good: Memoize callback passed to child
function ParentComponent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []); // No external dependencies, uses functional setState

  return <MemoizedChild onClick={handleClick} />;
}

const MemoizedChild = memo(({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click me</button>;
});
```

```tsx
// ✅ Good: Callback used in useEffect
function DataFetcher({ userId }: { userId: string }) {
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    const result = await api.getUserData(userId);
    setData(result);
  }, [userId]); // Include userId as dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is stable when userId doesn't change

  return <div>{/* render data */}</div>;
}
```

#### When to Use `useMemo`

**MUST use `useMemo` for:**

1. **Expensive computations** (filtering, sorting, mapping large arrays)
2. **Context Provider values** (prevents consumer re-renders)
3. **Creating objects/arrays used as dependencies**

```tsx
// ✅ Good: Memoize expensive computation
function ProductList({ products }: { products: Product[] }) {
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.price - b.price);
  }, [products]); // Only re-sort when products change

  return (
    <div>
      {sortedProducts.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

```tsx
// ✅ Good: Memoize derived state
function ShoppingCart({ items }: { items: CartItem[] }) {
  const { subtotal, itemCount, taxAmount } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const taxAmount = subtotal * 0.08;
    return { subtotal, itemCount, taxAmount };
  }, [items]);

  return (
    <div>
      <p>Items: {itemCount}</p>
      <p>Subtotal: ${subtotal.toFixed(2)}</p>
      <p>Tax: ${taxAmount.toFixed(2)}</p>
    </div>
  );
}
```

#### When to Use `memo`

**MUST use `React.memo` for:**

1. **Pure presentational components** that receive the same props frequently
2. **Components that render expensive child trees**
3. **List items in large lists**

```tsx
// ✅ Good: Memoize component to prevent re-renders
export const UserCard = memo(({ user, onEdit }: UserCardProps) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
});

UserCard.displayName = 'UserCard';
```

```tsx
// ✅ Good: Custom comparison function for complex props
export const ProductCard = memo(
  ({ product }: { product: Product }) => {
    return <div>{product.name}</div>;
  },
  (prevProps, nextProps) => {
    // Only re-render if product ID changes
    return prevProps.product.id === nextProps.product.id;
  }
);
```

#### Memoization Anti-Patterns

```tsx
// ❌ Bad: Memoizing primitive values (unnecessary)
const count = useMemo(() => 5, []); // Waste of memory
const value = 5; // ✅ Just use the value directly

// ❌ Bad: Memoizing without dependencies
const onClick = useCallback(() => {
  console.log(userId); // ❌ userId not in dependencies!
}, []);

// ✅ Good: Include all dependencies
const onClick = useCallback(() => {
  console.log(userId);
}, [userId]);

// ❌ Bad: Over-memoization for simple components
const SimpleText = memo(({ text }: { text: string }) => <p>{text}</p>);
// For such simple components, memo overhead may not be worth it

// ✅ Good: Only memoize when there's actual benefit
const SimpleText = ({ text }: { text: string }) => <p>{text}</p>;
```

---

## Hooks Best Practices

### Hook Rules

1. **Only call hooks at the top level** (not in loops, conditions, or nested functions)
2. **Only call hooks from React functions** (components or custom hooks)
3. **Declare all dependencies** in dependency arrays (no omissions)

### `useState` Patterns

```tsx
// ✅ Good: Functional setState for updates based on previous state
const [count, setCount] = useState(0);

const increment = useCallback(() => {
  setCount((prevCount) => prevCount + 1); // ✅ Safe from stale closures
}, []);

// ❌ Bad: Direct state reference (stale closure risk)
const increment = useCallback(() => {
  setCount(count + 1); // ❌ Requires count in dependencies
}, []); // ❌ Missing dependency
```

```tsx
// ✅ Good: Lazy initialization for expensive initial state
const [data, setData] = useState(() => {
  return expensiveComputation(); // Only runs once
});

// ❌ Bad: Runs on every render
const [data, setData] = useState(expensiveComputation());
```

### `useEffect` Patterns

```tsx
// ✅ Good: Clean up side effects
useEffect(() => {
  const subscription = api.subscribe(userId);

  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, [userId]);
```

```tsx
// ✅ Good: Separate concerns into multiple useEffect hooks
function UserProfile({ userId }: { userId: string }) {
  // Fetch user data
  useEffect(() => {
    fetchUserData(userId);
  }, [userId]);

  // Track analytics
  useEffect(() => {
    analytics.trackPageView('profile', userId);
  }, [userId]);

  // Better than combining unrelated effects
}
```

```tsx
// ❌ Bad: Missing dependencies
useEffect(() => {
  fetchData(userId); // ❌ userId not in deps
}, []);

// ✅ Good: All dependencies declared
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### Custom Hooks

```tsx
// ✅ Good: Extract reusable logic into custom hooks
function useApiData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetch(url).then((r) => r.json());
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useApiData<User>(`/api/users/${userId}`);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  return <div>{data?.name}</div>;
}
```

---

## Context Best Practices

### Context Provider Memoization - CRITICAL

**Always memoize context values to prevent unnecessary re-renders:**

```tsx
// ❌ Bad: Context value recreated every render
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (credentials: Credentials) => {
    // login logic
  };

  const value = {
    user,
    login, // ❌ New object and function every render
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ Good: Properly memoized context value
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((credentials: Credentials) => {
    // login logic
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### Context + useReducer Pattern

```tsx
// ✅ Good: Complex state management with useReducer
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { sku: string; quantity: number } };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM':
      return [...state, action.payload];
    case 'REMOVE_ITEM':
      return state.filter((item) => item.sku !== action.payload);
    case 'UPDATE_QUANTITY':
      return state.map((item) =>
        item.sku === action.payload.sku ? { ...item, quantity: action.payload.quantity } : item
      );
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // dispatch is stable, no need to memoize
  const value = useMemo(() => ({ items, dispatch }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

---

## Component Patterns

### Compound Components

```tsx
// ✅ Good: Compound component pattern for flexible APIs
const Tabs = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState(0);

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

const TabList = ({ children }: { children: ReactNode }) => {
  return <div role="tablist">{children}</div>;
};

const Tab = ({ index, children }: { index: number; children: ReactNode }) => {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      role="tab"
      aria-selected={activeTab === index}
      onClick={() => setActiveTab(index)}
    >
      {children}
    </button>
  );
};

// Usage
<Tabs>
  <TabList>
    <Tab index={0}>Tab 1</Tab>
    <Tab index={1}>Tab 2</Tab>
  </TabList>
  <TabPanel index={0}>Content 1</TabPanel>
  <TabPanel index={1}>Content 2</TabPanel>
</Tabs>
```

### Render Props Pattern

```tsx
// ✅ Good: Render props for flexible rendering
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, loading, error } = useApiData<T>(url);
  return <>{children(data, loading, error)}</>;
}

// Usage
<DataFetcher<User> url="/api/user/123">
  {(user, loading, error) => {
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    return <UserProfile user={user} />;
  }}
</DataFetcher>
```

---

## Event Handlers

### Naming Conventions

```tsx
// ✅ Good: Event handler naming
interface ButtonProps {
  onClick: () => void; // Prop: on[Event]
}

function MyComponent() {
  const handleClick = () => {
    // Handler function: handle[Event]
    console.log('clicked');
  };

  return <button onClick={handleClick}>Click</button>;
}
```

### Preventing Inline Functions

```tsx
// ❌ Bad: Inline function creates new reference every render
<button onClick={() => handleDelete(item.id)}>Delete</button>

// ✅ Good: Memoized callback
const handleDelete = useCallback(() => {
  deleteItem(item.id);
}, [item.id]);

<button onClick={handleDelete}>Delete</button>

// ✅ Alternative: Use data attributes
<button onClick={handleDelete} data-id={item.id}>Delete</button>

const handleDelete = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
  const id = e.currentTarget.dataset.id;
  deleteItem(id);
}, []);
```

---

## Accessibility (a11y)

### Semantic HTML

```tsx
// ✅ Good: Use semantic HTML elements
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

// ❌ Bad: Div soup
<div className="nav">
  <div className="list">
    <div className="item">
      <div className="link">Home</div>
    </div>
  </div>
</div>
```

### ARIA Attributes

```tsx
// ✅ Good: Proper ARIA attributes
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  onClick={handleClose}
>
  <XIcon />
</button>

<input
  type="text"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? 'error-message' : undefined}
/>
{error && <p id="error-message" role="alert">{error}</p>}
```

### Keyboard Navigation

```tsx
// ✅ Good: Keyboard navigation support
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'ArrowDown':
        e.preventDefault();
        // Focus first item
        break;
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu">
          <li role="menuitem"><button>Item 1</button></li>
        </ul>
      )}
    </div>
  );
}
```

---

## Error Boundaries

```tsx
// ✅ Good: Error boundary for graceful error handling
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

---

## Testing Considerations

### Testable Components

```tsx
// ✅ Good: Component easy to test
export function UserGreeting({ user }: { user: User }) {
  return <h1>Hello, {user.name}!</h1>;
}

// Test
it('displays user name', () => {
  render(<UserGreeting user={{ id: '1', name: 'John' }} />);
  expect(screen.getByText('Hello, John!')).toBeInTheDocument();
});
```

### Avoid Testing Implementation Details

```tsx
// ❌ Bad: Testing implementation details
it('calls useState', () => {
  const spy = jest.spyOn(React, 'useState');
  render(<Counter />);
  expect(spy).toHaveBeenCalled();
});

// ✅ Good: Test behavior
it('increments counter when button clicked', () => {
  render(<Counter />);
  fireEvent.click(screen.getByText('Increment'));
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

---

## Common Pitfalls to Avoid

### 1. Stale Closures

```tsx
// ❌ Bad: Stale closure
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1); // ❌ Always sees initial count
    }, 1000);
    return () => clearInterval(timer);
  }, []); // ❌ Missing count dependency

  return <div>{count}</div>;
}

// ✅ Good: Functional update
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => c + 1); // ✅ Always gets latest count
    }, 1000);
    return () => clearInterval(timer);
  }, []); // ✅ No dependencies needed

  return <div>{count}</div>;
}
```

### 2. Unnecessary State

```tsx
// ❌ Bad: Derived state in useState
function UserProfile({ user }: { user: User }) {
  const [fullName, setFullName] = useState(`${user.firstName} ${user.lastName}`);
  // Problem: fullName doesn't update when user prop changes
}

// ✅ Good: Calculate during render
function UserProfile({ user }: { user: User }) {
  const fullName = `${user.firstName} ${user.lastName}`;
  return <div>{fullName}</div>;
}

// ✅ Good: Memoize if expensive
function UserProfile({ user }: { user: User }) {
  const fullName = useMemo(
    () => expensiveFormatting(user.firstName, user.lastName),
    [user.firstName, user.lastName]
  );
  return <div>{fullName}</div>;
}
```

### 3. Prop Drilling

```tsx
// ❌ Bad: Prop drilling through multiple levels
<Grandparent>
  <Parent theme={theme}>
    <Child theme={theme}>
      <GrandChild theme={theme} />
    </Child>
  </Parent>
</Grandparent>

// ✅ Good: Use Context
const ThemeContext = createContext<Theme>(defaultTheme);

<ThemeProvider value={theme}>
  <Grandparent>
    <Parent>
      <Child>
        <GrandChild />
      </Child>
    </Parent>
  </Grandparent>
</ThemeProvider>
```

---

## Performance Checklist

Before committing React code:

- [ ] All callbacks in Context Providers are memoized with `useCallback`
- [ ] Context Provider values are memoized with `useMemo`
- [ ] Expensive computations are memoized with `useMemo`
- [ ] Pure components are wrapped with `memo` where beneficial
- [ ] All hook dependencies are correctly declared
- [ ] No inline function props to memoized components
- [ ] Event handlers are properly memoized
- [ ] No unnecessary state (prefer derived values)
- [ ] Components are accessible (ARIA, keyboard nav)
- [ ] Error boundaries wrap main application sections

---

## Quick Reference: When to Memoize

| Scenario | Use | Reason |
|----------|-----|--------|
| Callback in Context Provider | `useCallback` | Prevent consumer re-renders |
| Expensive computation | `useMemo` | Avoid recalculating on every render |
| Object/array in Context value | `useMemo` | Prevent reference changes |
| Callback passed to memoized child | `useCallback` | Maintain referential equality |
| Pure presentational component | `memo` | Skip re-renders with same props |
| Derived state from props | `useMemo` | Cache calculated values |
| Callback in useEffect deps | `useCallback` | Prevent effect from running unnecessarily |

---

**This is the authoritative standard for React development in this project.**

Follow these patterns consistently for performant, maintainable React applications.

_Last Updated: November 20, 2025_  
_This file defines React-specific standards for the project._
