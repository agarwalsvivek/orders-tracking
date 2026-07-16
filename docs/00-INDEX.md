# LLM Agent Instructions Index

Welcome! This directory contains comprehensive guidelines for LLM agents (like GitHub Copilot) working on the Orders Tracking project. These instructions establish coding standards, best practices, and project conventions to ensure consistent, high-quality development.

## Quick Navigation

### 📖 Essential Reading

1. **[01-PROJECT-OVERVIEW.md](01-PROJECT-OVERVIEW.md)** - Start here!

   - Project purpose and architecture
   - Technology stack overview
   - Project structure and key responsibilities
   - Development workflow fundamentals

2. **[02-CODE-STANDARDS.md](02-CODE-STANDARDS.md)** - General coding rules
   - TypeScript configuration and type safety
   - Naming conventions and code style
   - Import/export best practices
   - Error handling patterns
   - Comments and documentation standards
   - ESLint and Prettier configuration

### 🎨 Framework-Specific Guidelines

3. **[03-FRONTEND-GUIDELINES.md](03-FRONTEND-GUIDELINES.md)** - React development

   - Component structure and organization
   - React Hooks best practices
   - State management patterns
   - CSS Modules and SCSS
   - API integration with Axios
   - Real-time updates with WebSocket
   - Performance optimization
   - Accessibility standards

4. **[04-BACKEND-GUIDELINES.md](04-BACKEND-GUIDELINES.md)** - Express.js development
   - Express app setup and middleware
   - RESTful API design
   - Controllers and services layer
   - Error handling and custom errors
   - Kafka integration patterns
   - Input validation
   - Logging and monitoring

### ✅ Quality Assurance

5. **[05-TESTING-GUIDELINES.md](05-TESTING-GUIDELINES.md)** - Testing standards
   - Testing philosophy and coverage expectations
   - React component testing with React Testing Library
   - Hook testing patterns
   - Integration testing
   - Cypress E2E testing
   - Backend service testing with Jest
   - API endpoint testing with Supertest
   - Mocking and test data best practices

### 🏗️ Infrastructure & Process

6. **[06-NX-WORKSPACE-GUIDELINES.md](06-NX-WORKSPACE-GUIDELINES.md)** - Monorepo management

   - Nx fundamentals and commands
   - Project structure and organization
   - Creating new applications and libraries
   - TypeScript path mapping
   - Building and deployment
   - Caching and performance
   - Dependency management

7. **[07-GIT-CONVENTIONS.md](07-GIT-CONVENTIONS.md)** - Version control

   - Conventional Commits format
   - Branch naming conventions
   - Pull request guidelines
   - Code review checklist
   - Merge requirements
   - Git best practices

8. **[08-ARCHITECTURE.md](08-ARCHITECTURE.md)** - System design
   - System architecture overview
   - Layered architecture patterns
   - Design patterns (Repository, Service Locator, Observer, Factory, Decorator)
   - Data flow patterns
   - Error handling architecture
   - State management
   - Security architecture
   - Scalability considerations

## Core Principles

### 1. TypeScript First

- Always use strict TypeScript (`strict: true`)
- Avoid `any` type - use proper type annotations
- Explicit types for functions and parameters
- Leverage interfaces and type utilities

### 2. Component-Driven Development

- Small, focused components with single responsibility
- Reusable custom hooks
- Clear prop interfaces
- Well-organized folder structure

### 3. Clean Code

- Self-documenting code with clear naming
- Comments explain "why", not "what"
- DRY principle - don't repeat yourself
- Consistent code style (ESLint + Prettier)

### 4. Comprehensive Testing

- Unit tests for business logic
- Integration tests for component interactions
- E2E tests for critical user flows
- Minimum 80% code coverage

### 5. Semantic Versioning

- Follow Conventional Commits for version management
- Clear commit messages enable automated changelog
- Version numbers reflect API changes

### 6. Monorepo Best Practices

- Use Nx commands for all operations
- Maintain clean dependency graph
- Organize code into focused packages
- Document package purposes

### 7. Security & Performance

- Validate all inputs
- Handle errors gracefully
- Optimize bundle size and runtime performance
- Implement proper authentication/authorization

## Technology Stack Reference

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Webpack** - Bundler
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Cypress** - E2E testing
- **SCSS** - Styling with modules
- **Axios** - HTTP client

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Jest** - Unit testing
- **Supertest** - API testing
- **KafkaJS** - Event streaming
- **ESLint** - Code linting

### DevOps & Tools

- **Nx** - Monorepo orchestration
- **Docker** - Containerization
- **Prettier** - Code formatting
- **ESLint** - Code quality
- **npm/pnpm** - Package management

## Common Tasks

### Starting a Feature

1. Read relevant guidelines (02-CODE-STANDARDS.md + framework guide)
2. Create branch: `git checkout -b feature/description`
3. Follow component/service patterns
4. Write tests alongside code
5. Follow naming conventions
6. Commit with Conventional Commits format

### Code Review Checklist

- [ ] Code follows style guidelines (02-CODE-STANDARDS.md)
- [ ] Type safety verified (TypeScript strict mode)
- [ ] Tests added and passing
- [ ] No console logs or debug code
- [ ] Comments explain "why"
- [ ] Naming is clear and descriptive
- [ ] Error handling is proper
- [ ] Performance impact assessed

### Testing Requirements

- Unit tests: Functions, components, services
- Integration tests: Multiple components/modules
- E2E tests: Critical user workflows
- Coverage: Minimum 80%
- Always test error scenarios

### Deploying Changes

1. Ensure all tests pass: `nx run-many --target=test`
2. Build for production: `nx run-many --target=build --configuration=production`
3. Create PR with descriptive title
4. Wait for code review and CI to pass
5. Merge to main
6. Tag release: `git tag -a v1.0.0`

## Project Structure Quick Reference

```
orders-tracking/
├── packages/
│   ├── frontend/         # React web app
│   ├── backend/          # Express API
│   ├── kafka-service/    # Event consumers
│   ├── frontend-e2e/     # Cypress tests
│   └── backend-e2e/      # Integration tests
├── docs/                 # This documentation
├── nx.json              # Nx configuration
├── tsconfig.base.json   # TypeScript aliases
└── package.json         # Dependencies
```

## Common Commands

```bash
# Development
nx serve frontend              # Start React dev server
nx serve backend               # Start Express dev server

# Testing
nx test frontend               # Test frontend
nx test backend                # Test backend
nx e2e frontend-e2e            # Run E2E tests

# Building
nx build frontend              # Build frontend
nx build backend               # Build backend
nx run-many --target=build     # Build all

# Code Quality
nx lint frontend               # Lint frontend
nx lint backend                # Lint backend
nx lint --fix                  # Fix linting issues

# Utilities
nx dep-graph                   # Visualize dependencies
nx show project frontend       # Project info
nx affected --target=test      # Test affected projects
```

## Best Practices Summary

### Do's ✅

- Use TypeScript strict mode
- Write tests before or alongside code
- Use semantic HTML and accessibility standards
- Follow naming conventions consistently
- Keep components focused and reusable
- Document complex logic with comments
- Use Nx commands for all operations
- Validate inputs and handle errors
- Use path aliases for imports
- Review architecture docs before major changes

### Don'ts ❌

- Don't use `any` type in TypeScript
- Don't skip tests for complex features
- Don't commit without following Conventional Commits
- Don't merge without code review
- Don't ignore accessibility standards
- Don't hardcode configuration values
- Don't use barrel exports for large modules
- Don't skip validation in API endpoints
- Don't leave console logs in production code
- Don't modify tsconfig paths without documentation

## Getting Help

1. **Specific Guidelines**: Check the relevant .md file (e.g., 03-FRONTEND-GUIDELINES.md)
2. **Architecture Questions**: Review 08-ARCHITECTURE.md
3. **Nx Issues**: See 06-NX-WORKSPACE-GUIDELINES.md
4. **Git/Commit Issues**: See 07-GIT-CONVENTIONS.md
5. **Testing Help**: See 05-TESTING-GUIDELINES.md

## Contributing to Documentation

When updating these guidelines:

1. Keep sections focused and concise
2. Add examples for complex concepts
3. Update the index if adding new sections
4. Follow markdown best practices
5. Test any code examples

---

**Last Updated**: 2024
**Version**: 1.0.0

Remember: These guidelines ensure consistency, quality, and maintainability across the entire project. When in doubt, refer to the relevant documentation section or ask for clarification before proceeding.
