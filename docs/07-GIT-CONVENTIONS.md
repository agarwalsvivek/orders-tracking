# Git & Commit Conventions

## Commit Message Format

All commits should follow the **Conventional Commits** specification for consistency and to enable automated changelog generation.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Components

#### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, or development tools
- **ci**: Changes to CI/CD configuration

#### Scope

The scope specifies what part of the codebase is affected. Common scopes:

- `frontend`: React frontend changes
- `backend`: Node.js backend changes
- `kafka`: Kafka service changes
- `e2e`: End-to-end tests
- `build`: Build configuration
- `deps`: Dependency updates

#### Subject

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize the first letter
- No period (.) at the end
- Limit to 50 characters
- Be specific and descriptive

#### Body (Optional)

- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line
- Reference issues and breaking changes

#### Footer (Optional)

- Document breaking changes with `BREAKING CHANGE:` prefix
- Reference closed issues: `Closes #123`
- Reference related issues: `Refs #456`

### Examples

#### Simple Feature

```
feat(frontend): add order status filter to dashboard

Users can now filter orders by status on the dashboard for better visibility
of their order pipeline.
```

#### Bug Fix

```
fix(backend): handle missing order items in validation

The order validation was crashing when items array was empty. Now it properly
validates and returns a meaningful error message.

Closes #456
```

#### Breaking Change

```
feat(backend): restructure order API response format

BREAKING CHANGE: The order response now returns items as a nested array
instead of a flat structure. Update frontend consumers to use response.items[].

Refs #789
```

#### Performance Improvement

```
perf(frontend): optimize order list rendering with virtualization

Implemented react-window virtualization to improve performance when rendering
large order lists. Reduces initial render time by 60%.
```

#### Documentation

```
docs: add testing guidelines for components

Added comprehensive testing guidelines for React components including examples
for unit testing and integration testing with React Testing Library.
```

## Branch Naming

### Format

```
<type>/<feature-name>
```

### Types

- `feature/`: New feature development
- `fix/`: Bug fixes
- `docs/`: Documentation updates
- `refactor/`: Code refactoring
- `perf/`: Performance improvements
- `test/`: Test additions/improvements

### Examples

```
feature/add-order-filters
fix/handle-kafka-connection-timeout
docs/api-documentation
refactor/extract-order-service
perf/optimize-dashboard-rendering
test/add-e2e-tests-for-checkout
```

### Rules

- Use lowercase letters and numbers
- Use hyphens to separate words
- Keep branch names concise (under 50 characters)
- Delete branch after merge

## Pull Request Guidelines

### PR Title

- Follow commit message format
- Start with type: `feat:`, `fix:`, `docs:`, etc.
- Be descriptive and specific

### PR Description Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #123

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

- [ ] Added/updated tests
- [ ] Tests pass locally
- [ ] Manual testing performed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
```

### Merge Requirements

Before merging a PR, ensure:

1. ✅ All tests pass
2. ✅ Code review approved
3. ✅ No merge conflicts
4. ✅ CI pipeline passes
5. ✅ Code coverage not decreased
6. ✅ Branch is up to date with main

## Workflow

### Feature Development

```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/add-order-filters

# Make changes and commit
git add .
git commit -m "feat(frontend): add order status filter

Users can now filter orders by status on the dashboard."

# Push branch
git push -u origin feature/add-order-filters

# Create PR and request review
# After approval, merge and delete branch
```

### Bug Fix

```bash
# Create fix branch from main
git checkout main
git pull origin main
git checkout -b fix/handle-validation-error

# Make changes
git add .
git commit -m "fix(backend): handle missing order items in validation

Closes #456"

# Push and create PR
git push -u origin fix/handle-validation-error
```

### Working on Feature Branch

```bash
# Fetch latest changes
git fetch origin

# Rebase with main to keep history clean
git rebase origin/main

# If conflicts occur, resolve and continue
git add .
git rebase --continue

# Force push to remote (only after rebase)
git push -f origin feature/add-order-filters
```

## Commit Best Practices

### Atomic Commits

- One logical change per commit
- Commits should be reversible
- Commits should be independently testable

```bash
# Good: Separate logical changes
git commit -m "feat(frontend): add order status filter"
git commit -m "test(frontend): add tests for filter component"

# Bad: Multiple unrelated changes
git commit -m "feat: add filter and fix backend issue and update docs"
```

### Interactive Rebase

Clean up commits before creating a PR:

```bash
# Last 3 commits
git rebase -i HEAD~3

# Squash commits
pick abc1234 feat: add filter
squash def5678 fix: minor cleanup
squash ghi9012 test: add tests

# Result: Single clean commit
```

### Amending Commits

Fix mistakes in the last commit:

```bash
# Make changes
git add .

# Amend without creating new commit
git commit --amend --no-edit

# Force push if already pushed
git push -f origin feature/branch-name
```

## Code Review Checklist

### For PR Authors

- [ ] Code follows project style guide
- [ ] Tests added/updated and passing
- [ ] No console.log or debug statements left
- [ ] No commented-out code
- [ ] Comments explain "why", not "what"
- [ ] Commit messages are clear and descriptive
- [ ] PR description is comprehensive
- [ ] Related issues referenced

### For Reviewers

- [ ] Code changes are necessary and make sense
- [ ] Changes follow project conventions
- [ ] Logic is correct and handles edge cases
- [ ] No obvious performance issues
- [ ] Tests are adequate and meaningful
- [ ] Error handling is appropriate
- [ ] Security best practices followed
- [ ] Documentation updated if needed

## Handling Conflicts

### Merge Conflicts

```bash
# After git pull with conflicts
# 1. Open conflicted files
# 2. Resolve conflicts manually
# 3. Add resolved files
git add .
git commit -m "chore: resolve merge conflicts"
git push origin feature/branch-name
```

### Rebase Conflicts

```bash
# During rebase
git rebase main

# If conflicts occur
# 1. Resolve conflicts in files
# 2. Stage changes
git add .

# 3. Continue rebase
git rebase --continue

# 4. Push (force push after rebase)
git push -f origin feature/branch-name
```

## Git Hygiene

### Keeping Repository Clean

```bash
# Delete local merged branches
git branch -d feature/completed-feature

# Delete remote merged branches
git push -d origin feature/completed-feature

# Clean up local branches
git branch -d $(git branch --merged main | grep -v main)

# Prune remote tracking branches
git fetch -p origin
```

### .gitignore Best Practices

- Never commit node_modules, dist, build directories
- Never commit .env files with secrets
- Ignore editor files (.idea, .vscode, .DS_Store)
- Ignore OS specific files (Thumbs.db, etc.)

```
# .gitignore
node_modules/
dist/
build/
coverage/
.env
.env.local
.DS_Store
.idea/
*.log
*.tmp
```

## Tagging for Releases

### Version Tags

Use semantic versioning for tags:

```bash
# Create version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# List tags
git tag

# Delete tag
git tag -d v1.0.0
git push -d origin v1.0.0
```

## Advanced Git Tips

### Stashing Changes

```bash
# Stash uncommitted changes
git stash

# List stashes
git stash list

# Apply stash
git stash apply stash@{0}

# Drop stash
git stash drop stash@{0}
```

### Cherry-picking Commits

```bash
# Apply specific commit to current branch
git cherry-pick <commit-hash>

# In case of conflicts during cherry-pick
git cherry-pick --continue
git cherry-pick --abort
```

### Viewing History

```bash
# View commit graph
git log --oneline --graph --all

# View changes in commit
git show <commit-hash>

# View diff between branches
git diff main feature/branch-name

# Find commit that introduced a bug
git bisect start
git bisect bad
git bisect good <known-good-commit>
```
