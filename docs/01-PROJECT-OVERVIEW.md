# Project Overview

## What is Orders Tracking?

Orders Tracking is a full-stack monorepo application built with modern web technologies. It's a real-time order tracking system that demonstrates a scalable microservices architecture using Kafka for event streaming.

## Technology Stack

### Frontend

- **React 18** with TypeScript
- **Webpack** for bundling
- **Jest** + React Testing Library for unit testing
- **Cypress** for end-to-end testing
- **CSS Modules** for styling (SCSS support)

### Backend

- **Node.js** with TypeScript
- **Express** framework
- **Kafka** for asynchronous event streaming
- **Jest** for unit testing

### DevOps & Infrastructure

- **Docker** for containerization (Kafka, Zookeeper)
- **Nx** monorepo framework for build orchestration

## Project Structure

```
packages/
├── frontend/              # React web application
│   ├── src/
│   │   ├── app/          # Application components
│   │   ├── assets/       # Static assets
│   │   ├── main.tsx      # Entry point
│   │   └── styles.css    # Global styles
│   └── project.json
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── main.ts       # Server entry point
│   │   └── assets/
│   └── project.json
├── frontend-e2e/         # Cypress end-to-end tests
├── backend-e2e/          # Backend integration tests
└── kafka-service/        # Kafka producer/consumer service
```

## Key Responsibilities

### Frontend Package

- User interface for viewing and tracking orders
- Real-time updates via WebSocket/Kafka integration
- Responsive dashboard with statistics
- Client-side validation and state management

### Backend Package

- RESTful API endpoints for order management
- Kafka event producer for order events
- Database integration for order persistence
- Request validation and error handling

### Kafka Service Package

- Kafka topic management
- Event consumers for order stream processing
- Produces events to Kafka topics

## Development Workflow

1. **Setup**: Install dependencies with `npm install`
2. **Development**: Run dev servers with `nx serve`
3. **Testing**: Run tests with `nx test` or `nx e2e`
4. **Building**: Build for production with `nx build`
5. **Linting**: Check code with `nx lint`

## Monorepo Convention

This project uses **Nx** for monorepo management. All commands should be executed through Nx, not through underlying tooling directly (e.g., use `nx build backend` not `cd packages/backend && npm run build`).

## Success Criteria

- Code should be maintainable and follow TypeScript best practices
- All components and functions must have unit test coverage
- E2E tests should verify critical user workflows
- Performance should be optimized for large datasets
- Security best practices should be adhered to (input validation, authentication)
