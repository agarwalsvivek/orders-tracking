# Agent Instructions for Orders Tracking

This file provides high-level guidance for LLM agents working on this project. **For detailed instructions, refer to the comprehensive documentation in the `/docs` directory.**

## Quick Links to Documentation

👉 **Start here**: [docs/00-INDEX.md](docs/00-INDEX.md) - Complete index and navigation guide

### Essential Documentation

- [01-PROJECT-OVERVIEW.md](docs/01-PROJECT-OVERVIEW.md) - Project purpose, tech stack, structure
- [02-CODE-STANDARDS.md](docs/02-CODE-STANDARDS.md) - General coding standards for all code
- [03-FRONTEND-GUIDELINES.md](docs/03-FRONTEND-GUIDELINES.md) - React component best practices
- [04-BACKEND-GUIDELINES.md](docs/04-BACKEND-GUIDELINES.md) - Express.js and API patterns
- [05-TESTING-GUIDELINES.md](docs/05-TESTING-GUIDELINES.md) - Testing standards and examples
- [06-NX-WORKSPACE-GUIDELINES.md](docs/06-NX-WORKSPACE-GUIDELINES.md) - Monorepo and Nx usage
- [07-GIT-CONVENTIONS.md](docs/07-GIT-CONVENTIONS.md) - Git commit and branching conventions
- [08-ARCHITECTURE.md](docs/08-ARCHITECTURE.md) - System design and architecture patterns

## Project Overview

**Orders Tracking** is a full-stack monorepo application:

- **Frontend**: React 18 + TypeScript web application
- **Backend**: Node.js/Express API with Kafka integration
- **Architecture**: Event-driven with real-time updates
- **Monorepo Tool**: Nx for build orchestration

## Core Principles for LLM Agents

### 1. Always Use TypeScript Strict Mode

- Never use `any` type
- Explicit type annotations for all functions
- Use interfaces for data structures

### 2. Follow Naming Conventions

- Components: PascalCase (e.g., `OrderCard`)
- Functions/variables: camelCase (e.g., `fetchOrders`)
- Files: kebab-case for utils, PascalCase for components
- Constants: UPPER_SNAKE_CASE

### 3. Write Tests First or Alongside Code

- Minimum 80% code coverage
- Unit tests for functions and components
- Integration tests for component interactions
- E2E tests for critical user flows

### 4. Use Conventional Commits

```
feat(scope): description
fix(scope): description
docs(scope): description
```

Examples: `feat(frontend): add order filter`, `fix(backend): handle validation error`

### 5. Use Nx Commands

```bash
# Always use Nx, not direct tooling
nx build frontend          # ✅ Correct
npm run build              # ❌ Wrong

nx test backend            # ✅ Correct
cd packages/backend && npm test  # ❌ Wrong
```

### 6. Organize Code Thoughtfully

- One component per file
- Keep components under 300 lines
- Extract reusable logic into services/utils
- Use path aliases: `@org/frontend` not `../../../`

## What NOT to Do

❌ **Never**:

- Use `any` type without strong justification
- Skip tests for complex features
- Leave console.log statements in code
- Commit with vague messages
- Ignore accessibility standards
- Hardcode configuration values
- Modify TypeScript config without documentation
- Create circular dependencies
- Skip error handling in API endpoints

## Before You Start

1. **Read the relevant documentation** from the `/docs` directory
2. **Check existing patterns** for similar features
3. **Run tests locally** to ensure everything works
4. **Follow the code review checklist** from git conventions guide

## Common Tasks

### Adding a Frontend Feature

1. Read: [03-FRONTEND-GUIDELINES.md](docs/03-FRONTEND-GUIDELINES.md)
2. Create component following the structure guide
3. Add tests alongside component
4. Use TypeScript strict mode
5. Commit with: `feat(frontend): describe feature`

### Fixing a Backend Bug

1. Read: [04-BACKEND-GUIDELINES.md](docs/04-BACKEND-GUIDELINES.md)
2. Write test that reproduces the bug
3. Fix the bug
4. Ensure error handling is proper
5. Commit with: `fix(backend): describe fix`

### Running Tests

```bash
# All tests
nx run-many --target=test

# Specific project
nx test frontend
nx test backend

# With coverage
nx test frontend -- --coverage

# Watch mode
nx test frontend -- --watch
```

### Building for Production

```bash
# Build all projects
nx run-many --target=build --configuration=production

# Build specific project
nx build backend --configuration=production
```

## Key Files to Know

- `tsconfig.base.json` - TypeScript path aliases
- `nx.json` - Nx configuration and cache settings
- `package.json` - Dependencies and workspace scripts
- `.eslintrc.base.json` - ESLint configuration
- `.prettierrc` - Prettier formatting rules

## General Nx Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Make changes following guidelines in `/docs`
3. Run tests: `nx run-many --target=test`
4. Commit with Conventional Commits
5. Push and create PR
6. After approval, merge to main

## System Architecture

```
React Frontend ──HTTP/WebSocket──> Express Backend ──> Database
                                         │
                                      Kafka Events
                                         │
                                    Kafka Service
```

**Refer to [08-ARCHITECTURE.md](docs/08-ARCHITECTURE.md) for detailed architecture patterns.**

## Testing Philosophy

- **Unit Tests**: Test functions, components, services in isolation
- **Integration Tests**: Test components working together
- **E2E Tests**: Test complete user workflows
- **Coverage**: Aim for 80%+ with focus on critical paths

See [05-TESTING-GUIDELINES.md](docs/05-TESTING-GUIDELINES.md) for detailed examples.

## Nx General Guidelines

- For navigating/exploring the workspace, use Nx commands
- When running tasks (build, test, lint, serve), always use Nx
- Prefix nx commands with package manager: `pnpm nx build` or `npm exec nx test`
- Never guess CLI flags - check `--help` or documentation
- For scaffolding tasks, use Nx generators: `nx generate @nx/react:app`

See [06-NX-WORKSPACE-GUIDELINES.md](docs/06-NX-WORKSPACE-GUIDELINES.md) for comprehensive Nx guidance.

## Code Style

All code must pass:

- **ESLint**: `nx lint` (code quality)
- **Prettier**: (automatic formatting)

```bash
# Run both linters
nx run-many --target=lint --all

# Fix automatically
nx lint frontend -- --fix
```

## Performance Considerations

- Use React.memo for expensive renders
- Implement code splitting for routes
- Optimize bundle size
- Cache Kafka connections and DB connections

## Security Best Practices

- Validate all inputs on frontend and backend
- Never expose secrets in code
- Use environment variables for configuration
- Implement proper error handling without leaking sensitive info
- Use HTTPS in production

## Questions or Clarifications?

Refer to the comprehensive documentation in the `/docs` directory. Each guide includes:

- Detailed explanations with examples
- Anti-patterns to avoid
- Best practices
- Code snippets

---

**Last Updated**: 2024
**Documentation Version**: 1.0.0

Start by reading [docs/00-INDEX.md](docs/00-INDEX.md) for complete navigation.
