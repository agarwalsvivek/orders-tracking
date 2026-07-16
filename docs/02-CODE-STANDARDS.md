# Code Standards & Best Practices

## General Principles

### 1. TypeScript Configuration

- **Strict Mode**: Always use strict TypeScript configuration (`strict: true`)
- **No `any`**: Avoid using `any` type. Use generics, unions, or interfaces instead
- **Explicit Types**: Always explicitly type function parameters and return types
- **Module Resolution**: Use ES modules with proper import/export statements

### 2. Code Style

#### Naming Conventions

- **Components**: PascalCase (e.g., `OrderCard`, `UserProfile`)
- **Functions**: camelCase (e.g., `fetchOrders`, `calculateTotal`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Files**: kebab-case for utility files (e.g., `order-utils.ts`), PascalCase for components (e.g., `OrderCard.tsx`)
- **Interfaces/Types**: PascalCase with I prefix for interfaces (e.g., `IOrder`, `IUser`)

#### Code Formatting

- **Indentation**: 2 spaces (enforced by Prettier)
- **Line Length**: Maximum 100 characters (with exceptions for URLs/strings)
- **Semicolons**: Always use semicolons
- **Quotes**: Double quotes for strings (enforced by ESLint)
- **Trailing Commas**: Use trailing commas in objects and arrays for easier diffs

### 3. Import/Export Practices

#### Named Exports

- Prefer named exports for better tree-shaking and refactoring
- Default exports only for page/route components or single-responsibility modules

```typescript
// Good
export const fetchOrders = async () => { };
export const calculateTotal = (items: IOrder[]) => { };

// Avoid
export default const fetchOrders = async () => { };
```

#### Import Organization

Order imports in the following way:

1. Built-in Node.js modules
2. Third-party dependencies
3. Relative imports from parent directories (`../`)
4. Relative imports from sibling directories (`./`)

```typescript
import { useState } from 'react';
import axios from 'axios';

import { useAppContext } from '../context/app-context';
import { formatDate } from './utils';
```

### 4. Error Handling

#### Try-Catch Pattern

- Always use try-catch for async operations
- Provide meaningful error messages
- Log errors with context

```typescript
try {
  const orders = await fetchOrders();
  return orders;
} catch (error) {
  console.error('Failed to fetch orders:', error);
  throw new Error(
    `Order fetch failed: ${
      error instanceof Error ? error.message : 'Unknown error'
    }`
  );
}
```

#### Type-Safe Error Handling

- Create custom error types for domain-specific errors
- Use discriminated unions for error states

```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };

const fetchOrders = async (): Promise<Result<IOrder[]>> => {
  try {
    // ... fetch logic
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: 'Failed to fetch orders' };
  }
};
```

### 5. Comments and Documentation

#### When to Comment

- Comment the "why", not the "what"
- Explain non-obvious logic or workarounds
- Document complex algorithms
- Do NOT comment what the code clearly shows

```typescript
// Bad - Obvious from code
// Increment the counter
count++;

// Good - Explains why
// Retry logic with exponential backoff to handle transient network failures
await retryWithBackoff(() => fetchOrders(), 3);
```

#### JSDoc for Public APIs

- Document all exported functions with JSDoc
- Include parameter types and return types
- Add examples for complex functions

```typescript
/**
 * Fetches orders for a specific user with pagination support
 * @param userId - The ID of the user
 * @param page - Page number (starting from 1)
 * @param limit - Number of items per page
 * @returns Promise resolving to an array of orders
 * @throws Error if user not found or API fails
 *
 * @example
 * const orders = await fetchUserOrders('user-123', 1, 20);
 */
export const fetchUserOrders = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<IOrder[]> => {
  // implementation
};
```

## Frontend-Specific Standards

See [03-FRONTEND-GUIDELINES.md](03-FRONTEND-GUIDELINES.md)

## Backend-Specific Standards

See [04-BACKEND-GUIDELINES.md](04-BACKEND-GUIDELINES.md)

## ESLint & Prettier

### ESLint Configuration

- Project uses `@nx/eslint` and `@eslint/js`
- Enforces React best practices via `eslint-plugin-react`
- Runs linting via `nx lint`

### Prettier Configuration

- Enforced code formatting
- Two-space indentation
- 100-character line limit
- Double quotes

### Running Linters

```bash
# Lint all projects
nx run-many --target=lint

# Lint specific project
nx lint frontend

# Fix linting issues automatically
nx lint frontend -- --fix
```

## Dependency Management

### Adding Dependencies

- Use npm/pnpm workspaces for monorepo packages
- Avoid circular dependencies between packages
- Keep dependencies up to date but stable
- Document why external dependencies are needed

### Tree-Shaking

- Export only what's necessary from modules
- Avoid default exports in utility modules
- Use ES modules for better tree-shaking
