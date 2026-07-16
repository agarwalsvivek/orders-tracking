# Frontend Guidelines

## Overview

The frontend is a React 18 + TypeScript application using Webpack for bundling and Jest + React Testing Library for testing. It provides a real-time order tracking dashboard with live statistics.

## React Component Standards

### Component Structure

#### Functional Components Only

- Use functional components exclusively (no class components)
- Use React Hooks for state and side effects

```typescript
// Good
const OrderCard: React.FC<{ order: IOrder }> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  return <div className={styles.card}>{/* Component JSX */}</div>;
};

export default OrderCard;
```

#### Props Interface

- Always define props as an interface
- Extract props interface outside the component
- Use `React.FC<PropsInterface>` type annotation

```typescript
interface OrderCardProps {
  order: IOrder;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  isLoading?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusChange,
  isLoading = false,
}) => {
  // Implementation
};
```

### Component Organization

#### File Structure

```
components/
├── OrderCard/
│   ├── OrderCard.tsx          # Component
│   ├── OrderCard.spec.tsx     # Tests
│   ├── order-card.scss        # Styles (if CSS Modules used)
│   ├── OrderCard.utils.ts     # Helper functions
│   └── index.ts               # Export
└── Dashboard/
    ├── Dashboard.tsx
    ├── Dashboard.spec.tsx
    ├── dashboard.scss
    └── index.ts
```

#### Component Size Guidelines

- Keep components under 300 lines
- Extract logic into custom hooks or utility functions
- One component per file

### Hooks Usage

#### Custom Hooks

- Create custom hooks for reusable logic
- Prefix with `use` (e.g., `useFetchOrders`, `useLocalStorage`)
- Keep hooks focused on a single responsibility

```typescript
// Good: Single responsibility
export const useFetchOrders = (userId: string) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchUserOrders(userId);
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  return { orders, loading, error };
};
```

#### Hook Dependencies

- Always specify dependency arrays
- Never omit the dependency array (except for single-run effects)
- Use ESLint plugin `eslint-plugin-react-hooks` warnings as guidance

```typescript
// Good - Dependencies specified
useEffect(() => {
  // Effect code
}, [userId, orderId]);

// Bad - Missing dependencies
useEffect(() => {
  fetchOrders(userId);
}, []);
```

### State Management

#### Local State

- Use `useState` for component-local state
- Keep state close to where it's used

#### Global State

- Use Context API for app-wide state (theme, auth, user info)
- Create separate contexts for different domains

```typescript
// app-context.tsx
interface IAppContext {
  user: IUser | null;
  isAuthenticated: boolean;
  setUser: (user: IUser) => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<IUser | null>(null);

  return (
    <AppContext.Provider value={{ user, isAuthenticated: !!user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

## Styling

### CSS Modules

- Use CSS Modules for component-scoped styles
- Avoid global styles except for resets and base styles
- Name SCSS files with lowercase kebab-case matching component name

```typescript
// OrderCard.tsx
import styles from './order-card.scss';

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return <div className={styles.card}>{/* Content */}</div>;
};
```

### SCSS Best Practices

- Use BEM (Block Element Modifier) naming convention
- Nest selectors appropriately
- Avoid deep nesting (max 3 levels)

```scss
// order-card.scss
.card {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;

  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__title {
    font-weight: 600;
    font-size: 16px;
  }

  &__status {
    &--pending {
      color: #ff9800;
    }

    &--completed {
      color: #4caf50;
    }
  }
}
```

### Responsive Design

- Mobile-first approach
- Use media queries for responsive breakpoints
- Define breakpoints as constants

```scss
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;

.card {
  padding: 16px;

  @media (min-width: $breakpoint-md) {
    padding: 24px;
  }

  @media (min-width: $breakpoint-lg) {
    padding: 32px;
  }
}
```

## API Integration

### Axios Usage

- Create a centralized API client
- Use interceptors for error handling and auth
- Always provide type safety with interfaces

```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Data Fetching Pattern

- Use custom hooks for API calls
- Handle loading, error, and success states
- Implement proper error boundaries

```typescript
// hooks/useFetchOrders.ts
export const useFetchOrders = (userId: string) => {
  const [state, setState] = useState<{
    data: IOrder[] | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: true, error: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const response = await apiClient.get(`/users/${userId}/orders`);
        setState({ data: response.data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch',
        });
      }
    };

    fetchData();
  }, [userId]);

  return state;
};
```

## Real-Time Updates

### WebSocket/Kafka Integration

- Use event emitters or custom hooks for real-time updates
- Implement proper cleanup in useEffect
- Handle connection failures gracefully

```typescript
export const useRealTimeOrders = (userId: string) => {
  const [orders, setOrders] = useState<IOrder[]>([]);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:3000/orders/${userId}`);

    socket.onmessage = (event) => {
      const updatedOrder = JSON.parse(event.data);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    };

    socket.onerror = () => {
      console.error('WebSocket connection failed');
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  return orders;
};
```

## Testing (React Testing Library)

### Component Testing

- Test user behavior, not implementation details
- Use semantic queries (`getByRole`, `getByLabelText`)
- Avoid testing internal state

```typescript
// OrderCard.spec.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OrderCard from './OrderCard';

describe('OrderCard', () => {
  const mockOrder: IOrder = {
    id: '1',
    status: 'pending',
    total: 100,
    // ... other properties
  };

  it('should display order information', () => {
    render(<OrderCard order={mockOrder} onStatusChange={jest.fn()} />);
    expect(screen.getByText('Order #1')).toBeInTheDocument();
  });

  it('should call onStatusChange when status is updated', async () => {
    const handleStatusChange = jest.fn();
    render(<OrderCard order={mockOrder} onStatusChange={handleStatusChange} />);

    const statusButton = screen.getByRole('button', { name: /update status/i });
    await userEvent.click(statusButton);

    expect(handleStatusChange).toHaveBeenCalledWith('1', expect.any(String));
  });
});
```

### Test File Organization

- Place `.spec.tsx` files next to components
- One describe block per component
- Group related tests with describe blocks

## Accessibility

### ARIA Labels

- Use semantic HTML elements
- Provide ARIA labels for non-semantic components
- Test with keyboard navigation

```typescript
const OrderForm: React.FC = () => {
  return (
    <form>
      <label htmlFor="order-id">Order ID</label>
      <input id="order-id" type="text" aria-required="true" />

      <button type="submit" aria-label="Submit order form">
        Submit
      </button>
    </form>
  );
};
```

## Performance Optimization

### Code Splitting

- Use lazy loading for routes and heavy components
- Implement suspense boundaries

```typescript
const Dashboard = lazy(() => import('./Dashboard'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
};
```

### Memoization

- Use `React.memo` for components with expensive renders
- Use `useMemo` for expensive computations
- Use `useCallback` for callbacks passed to memoized children

```typescript
interface OrderListProps {
  orders: IOrder[];
  onOrderClick: (orderId: string) => void;
}

const OrderList = React.memo<OrderListProps>(({ orders, onOrderClick }) => {
  return (
    <div>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onClick={() => onOrderClick(order.id)}
        />
      ))}
    </div>
  );
});
```

## Environment Variables

### Configuration

- Use `.env.example` to document required variables
- Prefix with `REACT_APP_` for Webpack exposure
- Never commit `.env` files

```env
# .env.example
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
```

### Usage

```typescript
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
```
