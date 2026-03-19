# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commonly Used Commands
```bash
# Build the library to dist/ directory (ESM + TypeScript definitions)
pnpm run build

# Run eslint code quality checks
pnpm run lint

# Run all unit tests
pnpm run test

# Run tests in watch mode during development
pnpm run test:watch

# Run a single test file
pnpm vitest run test/<test-filename>.test.ts
```

## High-Level Architecture
`@hx/data` is a lightweight, proxy-based reactive data management library for TypeScript applications, enabling fine-grained change tracking and observable data objects.

### Core Modules
1. **`src/reactive.ts`** - Core reactive system
   - Creates proxy-wrapped reactive objects that automatically track changes to nested properties and arrays
   - Supports path-based change event listening (e.g. `user.address.city`, `items.[0].name`)
   - Provides hierarchy navigation methods (get root/parent, resolve paths) and reactivity revocation

2. **`src/path.ts`** - Path handling utilities
   - Parses and resolves object paths supporting both dot notation for objects and `[index]` notation for arrays
   - Provides type-safe `get()` and `set()` methods to access/modify deeply nested properties using path strings

3. **`src/events.ts`** - Type-safe event emitter
   - Used internally by the reactive system to broadcast change events
   - Supports path-based event routing and wildcard pattern matching

### Key Architectural Features
- **Hierarchical reactivity**: Nested objects/arrays are automatically wrapped in reactive proxies
- **Path-based event system**: Changes are emitted with full path context, enabling precise subscription to specific nested property changes
- **Zero dependency**: Pure TypeScript implementation with no external runtime dependencies
- **Immutable API surface**: All reactive operations are performed through standard JavaScript property access/mutation syntax

## Coding Conventions
- **Mandatory**: Use `(void 0)` instead of `undefined` for all undefined value references (applies to all JS/TS code in this repository)
- Tests follow naming pattern: `test/<feature-name>.test.ts`
- All code must pass eslint checks before being committed
