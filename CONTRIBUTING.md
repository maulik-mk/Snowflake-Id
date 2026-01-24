# Contributing to Snowflake-ID

❤️ Thanks for wanting to contribute!

## Getting Started

### Prerequisites
- **Node.js** 18, 20, or 22 (LTS versions)
- **npm**

### Setup
1. **Fork** the repo on GitHub.
2. **Clone** your fork:
    ```bash
    git clone https://github.com/maulik-mk/Snowflake-Id.git
    cd Snowflake-Id
    ```
3. **Install dependencies**:
    ```bash
    npm ci
    ```

---

## 🌊 Git Flow Branching Strategy

We use **Git Flow** for this project. Please follow these guidelines strictly.

### Branch Structure

| Branch | Purpose | Merges Into |
|--------|---------|-------------|
| `main` | Production-ready code, tagged releases only | — |
| `develop` | Integration branch for features | `main` (via release) |
| `feature/*` | New features and enhancements | `develop` |
| `release/*` | Preparing a new production release | `main` and `develop` |
| `hotfix/*` | Urgent production fixes | `main` and `develop` |

```
main ─────●─────────────────●─────────────●──────► (releases only)
          │                 ↑             ↑
          │            release/1.1    hotfix/1.0.1
          │                 ↑             ↑
develop ──●────●────●───────●─────────────●──────► (integration)
               ↑    ↑
          feature/  feature/
          auth      api
```

---

## Development Workflow

### 1️⃣ Feature Development

**Always branch from `develop`, never from `main`!**

```bash
# Switch to develop and pull latest
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/add-new-feature
```

**Branch naming conventions:**
- `feature/short-description` — New features
- `fix/bug-description` — Bug fixes (non-urgent)
- `docs/what-changed` — Documentation updates
- `chore/task-description` — Maintenance tasks

### 2️⃣ Working on Your Feature

1. **Make your changes** — write clean TypeScript.

2. **Run tests** before committing (we use Vitest):
    ```bash
    npm test
    npx vitest  # watch mode
    ```
    Don't break existing tests. Add tests for new features.

3. **Build** to check for errors:
    ```bash
    npm run build
    ```

4. **Lint your code**:
    ```bash
    npm run lint
    npm run typecheck
    ```

### 3️⃣ Submitting Your Work

```bash
# Push your feature branch
git push origin feature/add-new-feature
```

**Open a Pull Request against `develop`** (NOT `main`!)

> ⚠️ **Important:** PRs to `main` will be rejected. All features must go through `develop` first.

---

## Release Process (Maintainers Only)

### Creating a Release

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Bump version, update changelog, final testing
npm version minor  # or patch/major

# Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# Delete release branch
git branch -d release/v1.2.0
```

### Hotfix Process

For urgent production bugs:

```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/v1.2.1

# Fix the bug, bump patch version
npm version patch

# Merge to main
git checkout main
git merge --no-ff hotfix/v1.2.1
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin main --tags

# Merge to develop
git checkout develop
git merge --no-ff hotfix/v1.2.1
git push origin develop
```

---

## Commit Guidelines

Use **Conventional Commits**:

Format: `<type>(<scope>): <subject>`

Examples:
- `feat: add support for custom epoch`
- `fix: resolve overflow issue in sequence generation`
- `docs: update installation instructions`
- `test: add unit tests for date parsing`
- `chore: update dependencies`

---

## Pull Request Checklist

- [ ] Branch created from `develop` (not `main`)
- [ ] PR targets `develop` branch
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Commit messages follow conventional commits
- [ ] Description explains what and why

---

## Quick Reference

| I want to... | Do this |
|--------------|---------|
| Add a feature | Branch from `develop` → PR to `develop` |
| Fix a bug | Branch from `develop` → PR to `develop` |
| Release to production | Maintainer creates `release/*` branch |
| Fix urgent prod bug | Maintainer creates `hotfix/*` from `main` |

---

## Reporting Bugs

Open an issue with:
- Description of the bug
- Steps to reproduce (code snippets help)
- Expected vs actual behavior

## Feature Requests

Got an idea? Open an issue first so we can discuss it before you start coding.

---
Happy Coding! ❄️