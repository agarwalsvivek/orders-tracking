# Architecture & Design Patterns

## System Architecture Overview

Orders Tracking is built using a **layered microservices architecture** with clean separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│              User Interface & Real-time Updates        │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/WebSocket
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend API                          │
│            Express.js REST Endpoints                    │
│            Business Logic & Validation                  │
└──────────┬──────────────────────┬──────────────────────┘
           │                      │
        HTTP               Events via Kafka
           │                      │
           ▼                      ▼
    ┌─────────────┐     ┌─────────────────┐
    │  Database   │     │  Kafka Broker   │
    │  (Orders)   │     │  (Event Stream) │
    └─────────────┘     └────────┬────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  Kafka Service       │
                      │  Event Consumers     │
                      └──────────────────────┘
```

## Layered Architecture

### Presentation Layer (Frontend)

**Responsibility**: User interaction and display

- React components for UI
- State management (Context API)
- Event handlers and form validation
- WebSocket connections for real-time updates

### API Layer (Backend)

**Responsibility**: Request handling and routing

- Express.js route handlers
- Request validation and authentication
- Response formatting and error handling
- HTTP status code management

### Business Logic Layer

**Responsibility**: Core application logic

- Order processing
- Validation rules
- Business calculations
- Event publishing

### Persistence Layer

**Responsibility**: Data storage and retrieval

- Database queries
- Data modeling
- Transaction management

### Event Streaming Layer

**Responsibility**: Asynchronous communication

- Kafka producers
- Event consumers
- Event transformation

## Design Patterns

### Repository Pattern

Abstracts data access, allowing different storage implementations:

```typescript
// Interface
export interface IOrderRepository {
  findById(id: string): Promise<IOrder | null>;
  findAll(page: number, limit: number): Promise<IOrder[]>;
  create(order: IOrder): Promise<IOrder>;
  update(order: IOrder): Promise<void>;
  delete(id: string): Promise<void>;
}

// Implementation
export class OrderRepository implements IOrderRepository {
  async findById(id: string): Promise<IOrder | null> {
    // Query database
    return db.query('SELECT * FROM orders WHERE id = ?', [id]);
  }
  // ... other methods
}
```

### Service Locator Pattern

Centralize service instantiation and dependency injection:

```typescript
// services/locator.ts
export class ServiceLocator {
  private static services = new Map<string, any>();

  static register(name: string, service: any) {
    this.services.set(name, service);
  }

  static get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }
}

// Usage
ServiceLocator.register('orderService', new OrderService());
const orderService = ServiceLocator.get<OrderService>('orderService');
```

### Observer Pattern

Used for real-time event handling:

```typescript
// Event emitter for real-time updates
class OrderEventEmitter extends EventEmitter {
  onOrderCreated(callback: (order: IOrder) => void) {
    this.on('order:created', callback);
  }

  onOrderUpdated(callback: (order: IOrder) => void) {
    this.on('order:updated', callback);
  }

  emitOrderCreated(order: IOrder) {
    this.emit('order:created', order);
  }
}
```

### Factory Pattern

Create objects without specifying exact classes:

```typescript
export class ServiceFactory {
  static createOrderService(): OrderService {
    const repository = new OrderRepository();
    const kafkaService = new KafkaService();
    return new OrderService(repository, kafkaService);
  }

  static createNotificationService(): NotificationService {
    return new NotificationService();
  }
}
```

### Decorator Pattern

Add functionality to objects dynamically:

```typescript
// Logging decorator
function LogCall(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    console.log(`Calling ${propertyKey} with:`, args);
    const result = await originalMethod.apply(this, args);
    console.log(`${propertyKey} returned:`, result);
    return result;
  };

  return descriptor;
}

class OrderService {
  @LogCall
  async createOrder(request: CreateOrderRequest) {
    // Implementation
  }
}
```

## Data Flow Patterns

### Request-Response Pattern

Synchronous communication for immediate responses:

```
1. Frontend sends HTTP request
2. Backend receives and validates request
3. Backend processes business logic
4. Backend queries database
5. Backend returns response
6. Frontend updates UI
```

### Event-Driven Pattern

Asynchronous communication for eventual consistency:

```
1. Backend creates order
2. Backend publishes OrderCreated event to Kafka
3. Event is processed by consumers
4. Consumers update related systems
5. Frontend subscribes to order updates
6. Frontend receives real-time update via WebSocket
```

### Hybrid Pattern

Combines request-response and event-driven:

```typescript
// REST endpoint creates order
POST /api/orders
→ OrderService.createOrder()
  ├─ Save to database (sync)
  ├─ Publish event (async)
  └─ Return response immediately

// Frontend polls or uses WebSocket for updates
WS /orders/:id/updates
→ Consumer processes event
  ├─ Update related data
  └─ Emit update event
```

## Error Handling Architecture

### Error Classification

```typescript
// 1. Validation Errors (400)
- Input validation failed
- Invalid business rules
- Constraint violations

// 2. Authentication/Authorization Errors (401/403)
- User not authenticated
- User lacks permissions
- Token expired

// 3. Not Found Errors (404)
- Resource doesn't exist
- Requested item not found

// 4. Conflict Errors (409)
- Resource already exists
- State conflict
- Duplicate entry

// 5. Server Errors (500)
- Unexpected exceptions
- Database errors
- External service failures
```

### Error Recovery Strategy

```typescript
export class ErrorHandler {
  static async handleWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;

        const delay = backoffMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }
}
```

## State Management Architecture

### Frontend State Hierarchy

```
App Context (Global)
├─ User/Auth state
├─ Theme state
└─ Notification state

Component Context (Local)
├─ Order List Component
│  └─ Filter/Sort state
└─ Order Details Component
   └─ Form state
```

### Backend State Management

```
Database (Persistent)
├─ Orders
├─ Customers
└─ Transactions

Cache (Temporary)
├─ Recent orders
├─ User sessions
└─ Frequently accessed data

Kafka State (Event Log)
├─ Order events
├─ Status changes
└─ Audit trail
```

## Testing Architecture

### Test Pyramid

```
         /\
        /  \  E2E Tests
       /────\  (Critical flows)
      /      \
     /────────\ Integration Tests
    /          \  (Components + Services)
   /────────────\ Unit Tests
  /              \ (Functions, Components)
 /                \
```

### Test Organization

```
Frontend Tests:
- Unit: Component rendering, hooks, utils
- Integration: Multiple components together
- E2E: User workflows from UI

Backend Tests:
- Unit: Services, utils, validation
- Integration: Routes, middleware, Kafka
- E2E: Full API workflows
```

## Security Architecture

### Authentication Flow

```
1. User provides credentials
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token (secure storage)
5. Frontend includes token in requests
6. Backend validates token signature
7. Backend authorizes request
8. Backend executes operation
```

### Data Protection

```
In Transit:
- HTTPS/TLS encryption
- Signed JWTs
- CORS validation

At Rest:
- Database encryption
- Sensitive fields hashed
- Secrets in environment variables

Access Control:
- Role-based access control (RBAC)
- Resource-level authorization
- Audit logging
```

## Scalability Considerations

### Horizontal Scaling

**Frontend**:

- Deploy across multiple CDN edge locations
- Static asset caching
- Load balancer for API distribution

**Backend**:

- Multiple server instances
- Load balancer for request distribution
- Session/state in external cache
- Database read replicas

**Kafka**:

- Multiple partitions for parallelism
- Consumer groups for scaling

### Vertical Scaling

**Frontend**:

- Code splitting and lazy loading
- Image optimization
- Resource compression

**Backend**:

- Database query optimization
- Caching strategies
- Connection pooling

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
logger.info('Order created', {
  orderId: order.id,
  customerId: order.customerId,
  total: order.total,
  timestamp: new Date().toISOString(),
});

// Error logging with context
logger.error('Failed to process order', {
  orderId: order.id,
  error: error.message,
  stack: error.stack,
  context: { userId, sessionId },
});
```

### Metrics to Track

**Frontend**:

- Page load time
- Component render time
- API response time
- User interactions

**Backend**:

- Request latency
- Error rate
- Database query time
- Kafka message throughput

## Future Architecture Improvements

### Potential Enhancements

1. **Database Optimization**

   - Add database sharding for large datasets
   - Implement read replicas
   - Add database caching layer

2. **Service Decomposition**

   - Extract order service into separate microservice
   - Extract notification service
   - Implement service mesh

3. **Event Streaming**

   - Add event schema registry
   - Implement event sourcing
   - Add command pattern

4. **Caching Layer**

   - Add Redis for session management
   - Implement distributed caching
   - Add API response caching

5. **Real-time Communication**
   - Consider gRPC for service-to-service communication
   - Implement GraphQL subscription for real-time frontend updates

## Dependency Graph

### Frontend Dependencies

```
App
├─ React
├─ Axios (API calls)
├─ React Router (Navigation)
└─ SCSS (Styling)
```

### Backend Dependencies

```
Express.js
├─ TypeScript
├─ KafkaJS (Event streaming)
├─ Express middleware
└─ Database driver
```

### Shared Dependencies

```
jest (Testing)
eslint (Code quality)
prettier (Formatting)
nx (Build orchestration)
```
