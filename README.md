# Orders Tracking - Nx Monorepo

A full-stack monorepo using Nx, React, Node.js/Express, and Kafka for event streaming.

## 📋 Project Structure

- **`packages/frontend`**: React 18 + TypeScript web application
- **`packages/backend`**: Node.js/Express API server with Kafka integration
- **`packages/frontend-e2e`**: Cypress end-to-end tests for frontend
- **`packages/backend-e2e`**: E2E tests for backend

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker (for Kafka and Zookeeper)
- npm

### Installation

```bash
npm install
```

## 🎯 Running the Applications

### 1. Start Kafka & Zookeeper (Docker)

First, ensure Docker is running, then start the message broker:

```bash
# Start Zookeeper
sudo docker run -d --name zookeeper -p 2181:2181 zookeeper:3.8

# Start Kafka
sudo docker run -d --name kafka -p 9092:9092 \
  --link zookeeper \
  --env KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
  --env KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  --env KAFKA_BROKER_ID=1 \
  --env KAFKA_LISTENERS=PLAINTEXT://:9092 \
  wurstmeister/kafka
```

Verify Kafka is running:

```bash
sudo docker ps
```

### 2. Start Backend Server

```bash
npx nx serve backend
```

Backend runs on `http://localhost:3333`

### 3. Start Kafka Service (new terminal)

```bash
npx nx serve kafka-service
```

Kafka Service runs on `http://localhost:3334`

### 4. Start Frontend Application (new terminal)

```bash
npx nx serve frontend
```

Frontend runs on `http://localhost:4200`

## 📡 Testing the Integration

### Send a message to Kafka via Backend

```bash
curl -X POST http://localhost:3333/send \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Kafka!"}'
```

The backend will publish the message to Kafka, and the frontend will consume and display it.

## 🛠️ Available Commands

```bash
# Build all projects
npx nx run-many --target=build --all

# Run linter
npx nx run-many --target=lint --all

# Run tests
npx nx run-many --target=test --all

# View Nx project graph
npx nx graph
```

## 🧹 Cleanup Docker Containers

```bash
# Stop and remove containers
sudo docker stop kafka zookeeper
sudo docker rm kafka zookeeper
```

## 📚 Technologies Used

- **Frontend**: React 18, TypeScript, Webpack, Cypress
- **Backend**: Express.js, Node.js, CORS, KafkaJS
- **Message Queue**: Apache Kafka + Zookeeper
- **Monorepo**: Nx
- **Testing**: Jest, Cypress
- **Linting**: ESLint, Prettier

## 🔗 Useful Resources

- [Nx Documentation](https://nx.dev)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [KafkaJS Documentation](https://kafka.js.org)

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
