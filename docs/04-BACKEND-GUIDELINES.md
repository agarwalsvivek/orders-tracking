# Backend Guidelines

## Overview

The backend is a Node.js/Express application written in TypeScript that provides RESTful APIs for order management and integrates with Kafka for event-driven architecture.

## Project Structure

```
packages/backend/src/
├── main.ts              # Application entry point
├── middleware/          # Express middleware
├── routes/              # API route handlers
├── controllers/         # Business logic
├── services/            # Core service logic
├── models/              # Data models and interfaces
├── utils/               # Utility functions
├── config/              # Configuration files
└── assets/              # Static files
```

## Express Application Setup

### Server Initialization

- Initialize Express app with appropriate middleware
- Configure CORS for frontend communication
- Set up error handling middleware
- Enable request logging

```typescript
// main.ts
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { ordersRouter } from './routes/orders';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/orders', ordersRouter);

// Error handling (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Middleware Organization

- Create separate files for each middleware
- Export middleware functions from a central location
- Apply middleware in logical order

```typescript
// middleware/index.ts
export { errorHandler } from './error-handler';
export { requestLogger } from './request-logger';
export { authenticate } from './auth';
export { validateRequest } from './validation';
```

## API Design

### RESTful Conventions

- Use standard HTTP methods (GET, POST, PUT, DELETE)
- Use proper HTTP status codes
- Use consistent URL naming patterns

```typescript
// Endpoints following REST conventions
GET    /api/orders              # List all orders
POST   /api/orders              # Create new order
GET    /api/orders/:id          # Get specific order
PUT    /api/orders/:id          # Update order
DELETE /api/orders/:id          # Delete order
```

### Route Handlers

- Keep route handlers thin and focused
- Delegate business logic to controllers/services
- Always return consistent response format

```typescript
// routes/orders.ts
import { Router } from 'express';
import { OrderController } from '../controllers/order-controller';

export const ordersRouter = Router();
const controller = new OrderController();

ordersRouter.get('/', (req, res, next) => controller.list(req, res, next));
ordersRouter.post('/', (req, res, next) => controller.create(req, res, next));
ordersRouter.get('/:id', (req, res, next) =>
  controller.getById(req, res, next)
);
ordersRouter.put('/:id', (req, res, next) => controller.update(req, res, next));
ordersRouter.delete('/:id', (req, res, next) =>
  controller.delete(req, res, next)
);
```

### Request/Response Types

- Define interfaces for all request/response bodies
- Use validation libraries for runtime type checking
- Return consistent response envelope

```typescript
// models/order.ts
export interface IOrder {
  id: string;
  customerId: string;
  items: IOrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// DTOs for API boundaries
export interface CreateOrderRequest {
  customerId: string;
  items: IOrderItem[];
}

export interface CreateOrderResponse {
  success: boolean;
  data?: IOrder;
  error?: string;
}
```

### Response Format

- Always return consistent response structure
- Include metadata when appropriate
- Use HTTP status codes correctly

```typescript
// Standard response format
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Order created successfully"
}

// Error response format
{
  "success": false,
  "error": "Invalid order data",
  "details": { /* validation errors */ }
}
```

## Controllers & Services Layer

### Controller Pattern

- Controllers handle HTTP request/response
- Delegate business logic to services
- Validate request data
- Handle error responses

```typescript
// controllers/order-controller.ts
import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order-service';
import { CreateOrderRequest } from '../models/order';

export class OrderController {
  private orderService = new OrderService();

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const orders = await this.orderService.getOrders(page, limit);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const createRequest = req.body as CreateOrderRequest;
      // Validate request
      if (!createRequest.customerId || !createRequest.items?.length) {
        return res.status(400).json({
          success: false,
          error: 'Invalid order data',
        });
      }
      const order = await this.orderService.createOrder(createRequest);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, error: 'Order not found' });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}
```

### Service Layer

- Services contain business logic
- Services interact with external systems (Kafka, DB)
- Services are testable and reusable

```typescript
// services/order-service.ts
import { IOrder, CreateOrderRequest } from '../models/order';
import { KafkaService } from './kafka-service';

export class OrderService {
  private kafkaService = new KafkaService();

  async getOrders(page: number, limit: number): Promise<IOrder[]> {
    // Fetch from database
    // const orders = await db.query('SELECT * FROM orders LIMIT ? OFFSET ?', [limit, (page - 1) * limit]);
    // return orders;
    return [];
  }

  async createOrder(request: CreateOrderRequest): Promise<IOrder> {
    // Create order in database
    const order: IOrder = {
      id: this.generateId(),
      customerId: request.customerId,
      items: request.items,
      status: 'pending',
      total: request.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Publish order created event to Kafka
    await this.kafkaService.publishOrderCreated(order);

    return order;
  }

  async getOrderById(id: string): Promise<IOrder | null> {
    // Fetch from database
    return null;
  }

  private generateId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## Error Handling

### Custom Error Classes

- Create domain-specific error classes
- Include error codes and HTTP status codes

```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}
```

### Global Error Handler

- Catch all errors at middleware level
- Log errors appropriately
- Return consistent error responses

```typescript
// middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }

  // Unknown error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};
```

## Kafka Integration

### Kafka Service Pattern

- Create centralized Kafka service
- Handle producer/consumer lifecycle
- Implement error handling and retries

```typescript
// services/kafka-service.ts
import { Kafka, Producer, Consumer } from 'kafkajs';
import { IOrder } from '../models/order';

export class KafkaService {
  private kafka = new Kafka({
    clientId: 'orders-backend',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });

  private producer: Producer | null = null;
  private consumer: Consumer | null = null;

  async initProducer(): Promise<void> {
    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  async initConsumer(groupId: string): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId });
    await this.consumer.connect();
  }

  async publishOrderCreated(order: IOrder): Promise<void> {
    if (!this.producer) {
      await this.initProducer();
    }

    await this.producer!.send({
      topic: 'orders.created',
      messages: [
        {
          key: order.id,
          value: JSON.stringify(order),
        },
      ],
    });
  }

  async subscribeToOrderEvents(
    callback: (order: IOrder) => Promise<void>
  ): Promise<void> {
    if (!this.consumer) {
      await this.initConsumer('orders-service');
    }

    await this.consumer!.subscribe({ topic: 'orders.created' });
    await this.consumer!.run({
      eachMessage: async ({ topic, partition, message }) => {
        const order = JSON.parse(message.value?.toString() || '{}');
        await callback(order);
      },
    });
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
    }
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}
```

### Event Publishing

- Use domain events for cross-service communication
- Include correlation IDs for tracing
- Implement idempotency

```typescript
// models/events.ts
export interface IDomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  timestamp: Date;
  data: Record<string, any>;
}

export interface IOrderCreatedEvent extends IDomainEvent {
  type: 'order.created';
  data: IOrder;
}
```

## Input Validation

### Request Validation Middleware

- Validate all incoming requests
- Use schema validation libraries
- Return clear error messages

```typescript
// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';

export const validateCreateOrder = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { customerId, items } = req.body;

  if (!customerId || typeof customerId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'customerId is required and must be a string',
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'items must be a non-empty array',
    });
  }

  for (const item of items) {
    if (!item.productId || !item.quantity || !item.price) {
      return res.status(400).json({
        success: false,
        error: 'Each item must have productId, quantity, and price',
      });
    }
  }

  next();
};
```

## Logging & Monitoring

### Request Logging

- Log all incoming requests
- Include request ID for tracing
- Log response times

```typescript
// middleware/request-logger.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = uuidv4();
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      JSON.stringify({
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })
    );
  });

  next();
};
```

## Testing (Jest)

### Service Testing

- Test business logic in isolation
- Mock external dependencies
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
    it('should create order and publish event', async () => {
      const request = {
        customerId: 'user-123',
        items: [{ productId: 'prod-1', quantity: 2, price: 50 }],
      };

      const order = await service.createOrder(request);

      expect(order.customerId).toBe('user-123');
      expect(order.total).toBe(100);
      expect(order.status).toBe('pending');
      expect(kafkaService.publishOrderCreated).toHaveBeenCalledWith(order);
    });
  });
});
```

### API Testing

- Test endpoints with actual HTTP requests
- Test success and error paths
- Verify response format

```typescript
// routes/__tests__/orders.spec.ts
import request from 'supertest';
import express from 'express';
import { ordersRouter } from '../orders';

describe('Orders API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/orders', ordersRouter);
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
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 400 with invalid request', async () => {
      const response = await request(app).post('/api/orders').send({
        items: [],
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
```

## Environment Configuration

### Environment Variables

- Document all required variables
- Provide defaults for development
- Use `.env.example` for documentation

```env
# .env
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
KAFKA_BROKER=localhost:9092
DATABASE_URL=mongodb://localhost/orders
JWT_SECRET=your-secret-key
```

## Performance Considerations

### Connection Pooling

- Reuse Kafka connections
- Implement connection pooling for databases
- Close connections on graceful shutdown

### Caching

- Implement caching for frequently accessed data
- Use appropriate cache invalidation strategies
- Document cache behavior

## Security Best Practices

### Input Sanitization

- Validate all inputs
- Sanitize data before storing
- Use parameterized queries for databases

### Authentication & Authorization

- Implement JWT or similar authentication
- Validate tokens on protected routes
- Use role-based access control

### HTTPS & Environment

- Use HTTPS in production
- Keep sensitive data in environment variables
- Never log sensitive information
