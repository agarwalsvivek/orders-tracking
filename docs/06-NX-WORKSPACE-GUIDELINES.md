# Nx Workspace & Monorepo Guidelines

## Nx Fundamentals

This project uses **Nx** as a monorepo management tool. All development activities should respect Nx conventions and use Nx commands for building, testing, and running the application.

### Why Nx?

- **Monorepo Organization**: Organize multiple applications and libraries in a single repository
- **Build Orchestration**: Efficient caching and parallel task execution
- **Dependency Management**: Clear visualization of project dependencies
- **Code Generation**: Scaffolding templates for consistent project structure
- **Incremental Builds**: Only rebuild what changed
- **Workspace Clarity**: Unified experience for developers

## Project Structure

### Packages vs Libraries

- **Packages**: Runnable applications (frontend, backend, services)

  - Located in `packages/` directory
  - Have a `src/main.ts` or `src/index.ts` entry point
  - Can be deployed independently

- **Libraries**: Reusable code shared across packages
  - Located in `libs/` directory (when needed)
  - Have specific responsibility/domain
  - Imported by packages and other libraries

### Current Project Structure

```
packages/
├── frontend/        # React web application
├── backend/         # Node.js/Express API
├── kafka-service/   # Kafka producer/consumer
├── frontend-e2e/    # Cypress E2E tests
└── backend-e2e/     # Backend integration tests
```

## Nx Commands

### Essential Commands

#### Running Tasks

```bash
# Build a single project
nx build frontend
nx build backend

# Build multiple projects
nx run-many --target=build --projects=frontend,backend

# Build all projects that were affected by changes
nx affected --target=build

# Run tasks in parallel with specific concurrency
nx run-many --target=build --max-parallel=4
```

#### Development

```bash
# Serve frontend for development
nx serve frontend

# Serve backend for development
nx serve backend

# Serve with watch mode (automatic rebuild on changes)
nx serve frontend -- --watch
```

#### Testing

```bash
# Test single project
nx test frontend
nx test backend

# Test multiple projects
nx run-many --target=test --projects=frontend,backend

# Test only projects affected by changes
nx affected --target=test

# Run tests in watch mode
nx test frontend -- --watch

# Generate coverage report
nx test frontend -- --coverage
```

#### Linting

```bash
# Lint single project
nx lint frontend

# Lint all projects
nx run-many --target=lint

# Fix linting issues
nx lint frontend -- --fix
```

#### End-to-End Testing

```bash
# Run E2E tests for frontend
nx e2e frontend-e2e

# Run E2E tests in headless mode (CI)
nx e2e frontend-e2e -- --headless

# Run specific E2E test file
nx e2e frontend-e2e -- --spec="cypress/e2e/orders.cy.ts"
```

### Project Information

#### View Project Details

```bash
# Show project information
nx show project frontend

# Show project configuration
nx show project frontend --json

# Show available targets for a project
nx show project frontend --web
```

#### Visualize Dependency Graph

```bash
# Open interactive dependency graph visualization
nx dep-graph

# Focus on specific project
nx dep-graph --focus=frontend

# Export graph as JSON
nx dep-graph --file=graph.json
```

#### List Projects

```bash
# List all projects
nx list

# List only applications
nx list --type=app

# List only libraries
nx list --type=lib
```

## Project Configuration

### project.json

Each project has a `project.json` file that defines:

- **sourceRoot**: Main source directory
- **projectType**: 'application' or 'library'
- **targets**: Available tasks (build, test, serve, lint, etc.)
- **tags**: Project tags for organization

### Example project.json (Frontend)

```json
{
  "name": "frontend",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/frontend/src",
  "projectType": "application",
  "tags": [],
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/packages/frontend",
        "index": "packages/frontend/src/index.html",
        "main": "packages/frontend/src/main.tsx"
      }
    },
    "serve": {
      "executor": "@nx/webpack:dev-server",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "frontend:build",
        "port": 4200
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "packages/frontend/jest.config.ts"
      }
    }
  }
}
```

## Adding New Projects

### Creating a New Application

```bash
# Generate a new React app
nx generate @nx/react:application --name=my-app --routing

# Generate a new Node.js app
nx generate @nx/node:application --name=my-service --routing=false

# Generate a new library
nx generate @nx/react:library --name=my-lib
```

### Creating a New Library

```bash
# Generate a reusable library
nx generate @nx/node:library --name=my-lib --unitTestRunner=jest

# Import library in another project
import { myFunction } from '@org/my-lib';
```

## TypeScript Path Mapping

### tsconfig.base.json

The workspace uses TypeScript path aliases for clean imports:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@org/*": ["packages/*/src"]
    }
  }
}
```

### Usage

```typescript
// Instead of relative imports
import { fetchOrders } from '../../../backend/src/services/order-service';

// Use path aliases
import { OrderService } from '@org/backend/services/order-service';
```

## Building and Deployment

### Production Builds

```bash
# Build frontend for production
nx build frontend --configuration=production

# Build backend for production
nx build backend --configuration=production

# Build all projects for production
nx run-many --target=build --all --configuration=production
```

### Output Locations

- Frontend: `dist/packages/frontend/`
- Backend: `dist/packages/backend/`
- Other packages: `dist/packages/<package-name>/`

## Caching

### Nx Caching

- Nx automatically caches task outputs
- Cached tasks run instantly on re-execution
- Cache is cleared when source files change

### Cache Configuration

Cache behavior is configured in `nx.json`. Critical sections:

```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nx/nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test", "lint", "e2e"]
      }
    }
  }
}
```

### Disabling Cache

```bash
# Skip cache for a single run
nx build frontend --skip-nx-cache

# Reset cache
nx reset
```

## Watch Mode

### Development Workflow

```bash
# Serve with auto-reload
nx serve frontend --watch

# Test with auto-rerun
nx test frontend --watch

# Rebuild on changes
nx build frontend --watch
```

## Tagging Projects

### Project Tags

Use tags to organize projects and define boundaries:

```json
{
  "tags": ["scope:frontend", "type:app", "feature:orders"]
}
```

### Access Control with Tags

Enforce module boundaries in `.eslintrc.base.json`:

```json
{
  "rules": {
    "@nx/enforce-module-boundaries": [
      "error",
      {
        "enforcedBoundaries": [
          {
            "sourceTag": "scope:frontend",
            "onlyDependOnLibsWithTags": ["scope:shared"]
          }
        ]
      }
    ]
  }
}
```

## Affected Commands

### Use Affected for CI/CD

Run tasks only on projects that changed:

```bash
# Test only affected projects
nx affected --target=test

# Build only affected projects
nx affected --target=build

# Affected from a base branch
nx affected --target=build --base=main

# Affected between two commits
nx affected --target=test --base=HEAD~2
```

## Workspace Scripts

### Running Multiple Tasks

Create aliases in `package.json`:

```json
{
  "scripts": {
    "dev": "nx serve frontend",
    "dev:backend": "nx serve backend",
    "test:all": "nx run-many --target=test --all",
    "build:all": "nx run-many --target=build --all",
    "lint:all": "nx run-many --target=lint --all",
    "e2e": "nx e2e frontend-e2e"
  }
}
```

## Monorepo Best Practices

### 1. Keep Packages Focused

- One responsibility per package
- Clear separation of concerns
- Avoid circular dependencies

### 2. Use Libraries for Shared Code

- Extract reusable logic into libraries
- Libraries should have clear API boundaries
- Document library purposes

### 3. Version Management

- Keep dependencies aligned
- Use workspace package resolution
- Manage versions centrally

### 4. Testing Strategy

- Unit tests in component packages
- Integration tests in E2E packages
- Use test coverage goals

### 5. Documentation

- Document package purposes
- Maintain README in each package
- Provide usage examples

## Troubleshooting

### Cache Issues

```bash
# Clear all caches
nx reset

# Verify cache by showing task graph
nx show project frontend --web
```

### Dependency Resolution

```bash
# Check if dependencies are properly linked
nx show project frontend

# Visualize dependency graph
nx dep-graph
```

### Module Not Found

- Verify path aliases in `tsconfig.base.json`
- Check `project.json` sourceRoot
- Ensure correct export from library

## Performance Optimization

### Parallel Execution

```bash
# Run with specific number of parallel tasks
nx run-many --target=build --max-parallel=4

# Run with all available cores
nx run-many --target=test --max-parallel
```

### Selective Builds

```bash
# Only build what changed
nx affected --target=build

# Build specific dependency chain
nx build frontend --with-deps
```
