# Testing Guidelines

## Testing Philosophy

Testing is a critical part of maintaining code quality. All code changes should include appropriate test coverage following these principles:

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it's implemented
2. **DRY Testing**: Avoid duplicating test logic using shared fixtures and helpers
3. **Clear Test Names**: Test names should clearly describe what is being tested
4. **Comprehensive Coverage**: Aim for high coverage but prioritize critical paths
5. **Fail Fast**: Write tests that catch bugs early in development

## Test Coverage Expectations

### Minimum Coverage

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Critical Paths

- Must have 100% coverage:
  - Error handling code
  - Security-critical functions
  - API endpoints
  - State mutations in React components

## Jest Configuration

### Running Tests

```bash
# Run all tests
nx test

# Run tests for specific project
nx test frontend
nx test backend

# Run tests in watch mode
nx test frontend -- --watch

# Run tests with coverage
nx test frontend -- --coverage

# Run specific test file
nx test frontend -- --testPathPattern=OrderCard
```

### Test Structure

- Place test files next to source files with `.spec.ts` or `.spec.tsx` suffix
- One primary describe block per file
- Group related tests with nested describe blocks

## Frontend Testing (React Testing Library)

### Unit Tests

#### Component Testing

- Test component behavior from the user's perspective
- Use semantic queries instead of implementation details
- Test props, events, and rendering

```typescript
// components/OrderCard/OrderCard.spec.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderCard } from './OrderCard';

describe('OrderCard', () => {
  const defaultProps = {
    order: {
      id: '1',
      status: 'pending',
      total: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId: 'cust-1',
      items: [],
    },
    onStatusChange: jest.fn(),
  };

  describe('rendering', () => {
    it('should render order information', () => {
      render(<OrderCard {...defaultProps} />);
      expect(screen.getByText(/order #1/i)).toBeInTheDocument();
      expect(screen.getByText(/\$100/)).toBeInTheDocument();
    });

    it('should display correct status', () => {
      render(<OrderCard {...defaultProps} />);
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onStatusChange when status button clicked', async () => {
      const handleStatusChange = jest.fn();
      render(
        <OrderCard {...defaultProps} onStatusChange={handleStatusChange} />
      );

      const statusButton = screen.getByRole('button', {
        name: /update status/i,
      });
      await userEvent.click(statusButton);

      expect(handleStatusChange).toHaveBeenCalledWith('1', expect.any(String));
    });
  });

  describe('edge cases', () => {
    it('should render with undefined optional props', () => {
      const props = { ...defaultProps, onStatusChange: undefined };
      render(<OrderCard {...props} />);
      expect(screen.getByText(/order #1/i)).toBeInTheDocument();
    });
  });
});
```

#### Hook Testing

- Test hooks in isolation using `renderHook`
- Test state updates and side effects
- Test error scenarios

```typescript
// hooks/useFetchOrders.spec.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useFetchOrders } from './useFetchOrders';
import * as api from '../api/orders';

jest.mock('../api/orders');

describe('useFetchOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch orders on mount', async () => {
    const mockOrders = [{ id: '1', status: 'pending' }];
    jest.spyOn(api, 'fetchOrders').mockResolvedValue(mockOrders);

    const { result } = renderHook(() => useFetchOrders('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockOrders);
  });

  it('should set error when fetch fails', async () => {
    const error = new Error('Network error');
    jest.spyOn(api, 'fetchOrders').mockRejectedValue(error);

    const { result } = renderHook(() => useFetchOrders('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBeNull();
  });
});
```

### Integration Tests

#### Component Integration

- Test multiple components working together
- Test with provider wrappers (Context, Redux, etc.)
- Test data flow between components

```typescript
// app/Dashboard.spec.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { AppProvider } from '../context/app-context';
import * as api from '../api/orders';

jest.mock('../api/orders');

const renderWithProviders = (component: React.ReactElement) => {
  return render(<AppProvider>{component}</AppProvider>);
};

describe('Dashboard Integration', () => {
  it('should display orders and allow interaction', async () => {
    const mockOrders = [
      { id: '1', status: 'pending', total: 100 },
      { id: '2', status: 'shipped', total: 200 },
    ];
    jest.spyOn(api, 'fetchOrders').mockResolvedValue(mockOrders);

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Order #1/)).toBeInTheDocument();
      expect(screen.getByText(/Order #2/)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Cypress)

#### Critical User Flows

- Test complete user workflows
- Use page objects for maintainability
- Test real API interactions

```typescript
// cypress/e2e/orders.cy.ts
describe('Orders Tracking', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display orders on dashboard', () => {
    cy.get('[data-testid="order-list"]').should('exist');
    cy.get('[data-testid="order-card"]').should('have.length.greaterThan', 0);
  });

  it('should update order status', () => {
    cy.get('[data-testid="order-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="status-button"]').click();
        cy.get('[data-testid="status-shipped"]').click();
      });

    cy.get('[data-testid="toast-success"]').should('contain', 'Status updated');
  });

  it('should filter orders by status', () => {
    cy.get('[data-testid="status-filter"]').select('pending');
    cy.get('[data-testid="order-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'Pending');
    });
  });
});
```

#### Page Object Pattern

- Create reusable page objects for common operations
- Encapsulate selectors and interactions
- Reduce test maintenance

```typescript
// cypress/support/app.po.ts
export class OrdersPage {
  visitDashboard() {
    cy.visit('/');
  }

  getOrderList() {
    return cy.get('[data-testid="order-list"]');
  }

  getOrderCard(orderId: string) {
    return cy.get(`[data-testid="order-${orderId}"]`);
  }

  updateOrderStatus(orderId: string, newStatus: string) {
    this.getOrderCard(orderId).within(() => {
      cy.get('[data-testid="status-button"]').click();
      cy.get(`[data-testid="status-${newStatus}"]`).click();
    });
  }

  verifyOrderStatus(orderId: string, expectedStatus: string) {
    this.getOrderCard(orderId).should('contain', expectedStatus);
  }
}
```

## Backend Testing (Jest)

### Unit Tests

#### Service Testing

- Test business logic in isolation
- Mock external dependencies (Kafka, databases)
- Test error scenarios

```typescript
// services/__tests__/order-service.spec.ts
import { OrderService } from '../order-service';
import { KafkaService } from '../kafka-service';

jest.mock('../kafka-service');

describe('OrderService', () => {
  let service: OrderService;
  let kafkaService: jest.Mocked<KafkaService>;

  beforeEach(() => {
    kafkaService = new KafkaService() as jest.Mocked<KafkaService>;
    service = new OrderService();
  });

  describe('createOrder', () => {
    it('should create order with valid request', async () => {
      const request = {
        customerId: 'user-123',
        items: [{ productId: 'prod-1', quantity: 2, price: 50 }],
      };

      const result = await service.createOrder(request);

      expect(result.customerId).toBe('user-123');
      expect(result.total).toBe(100);
      expect(result.status).toBe('pending');
    });

    it('should publish order created event', async () => {
      const request = {
        customerId: 'user-123',
        items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
      };

      const order = await service.createOrder(request);
      expect(kafkaService.publishOrderCreated).toHaveBeenCalledWith(order);
    });

    it('should throw error for invalid request', async () => {
      const invalidRequest = {
        customerId: '',
        items: [],
      };

      await expect(
        service.createOrder(invalidRequest as any)
      ).rejects.toThrow();
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const mockOrder = { id: '1', customerId: 'user-1' };
      jest.spyOn(service, 'getOrderById').mockResolvedValue(mockOrder as any);

      const result = await service.getOrderById('1');

      expect(result).toEqual(mockOrder);
    });

    it('should return null when not found', async () => {
      jest.spyOn(service, 'getOrderById').mockResolvedValue(null);

      const result = await service.getOrderById('non-existent');

      expect(result).toBeNull();
    });
  });
});
```

#### Error Handling Testing

- Test custom error classes
- Test error responses
- Test error propagation

```typescript
// utils/__tests__/errors.spec.ts
import { AppError, ValidationError, NotFoundError } from '../errors';

describe('Error Classes', () => {
  describe('ValidationError', () => {
    it('should have correct status code', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('NotFoundError', () => {
    it('should have correct status code', () => {
      const error = new NotFoundError('Order');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toContain('Order not found');
    });
  });
});
```

### Integration Tests

#### API Endpoint Testing

- Test full request-response cycle
- Use supertest for HTTP testing
- Test authentication and validation

```typescript
// routes/__tests__/orders.spec.ts
import request from 'supertest';
import express from 'express';
import { ordersRouter } from '../orders';
import { OrderService } from '../../services/order-service';

jest.mock('../../services/order-service');

describe('Orders API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/orders', ordersRouter);
  });

  describe('GET /api/orders', () => {
    it('should return list of orders', async () => {
      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/orders', () => {
    it('should create order with valid request', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          customerId: 'user-123',
          items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 400 with invalid request', async () => {
      const response = await request(app).post('/api/orders').send({
        customerId: 'user-123',
        // Missing items
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order by id', async () => {
      const response = await request(app).get('/api/orders/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app).get('/api/orders/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
```

## Test Best Practices

### Mocking

- Mock external dependencies, not internal logic
- Clear mocks between tests
- Use realistic mock data

```typescript
// Good: Mock external service
jest.mock('../kafka-service');

// Bad: Mocking internal helper
jest.mock('./internal-utils');
```

### Test Data

- Use factory functions for test data
- Keep test data realistic
- Use meaningful variable names

```typescript
// factories/order-factory.ts
export function createMockOrder(overrides?: Partial<IOrder>): IOrder {
  return {
    id: 'test-123',
    customerId: 'user-123',
    status: 'pending',
    total: 100,
    items: [{ productId: 'prod-1', quantity: 1, price: 100 }],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// In tests
const order = createMockOrder({ status: 'shipped' });
```

### Async Testing

- Always wait for async operations
- Use `waitFor` for element changes
- Test loading and error states

```typescript
// Good: Proper async handling
await waitFor(() => {
  expect(screen.getByText('Order loaded')).toBeInTheDocument();
});

// Bad: Missing await
waitFor(() => {
  expect(screen.getByText('Order loaded')).toBeInTheDocument();
});
```

## Coverage Reporting

### Generate Coverage Report

```bash
nx test frontend -- --coverage
nx test backend -- --coverage
```

### Analyzing Coverage

- Review coverage reports in `coverage/` directory
- Focus on missing branches, not just statements
- Prioritize testing critical paths over chasing 100% coverage

## Continuous Integration

### Pre-commit Testing

- Run tests before committing
- Enforce test passing in CI/CD
- Block merge if coverage drops
