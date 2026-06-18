# @hx/data

Proxy-based reactive data management for TypeScript. Zero dependencies, tree-shakeable, full type safety.

## Core Features

- **Nested reactivity** — objects and arrays are automatically wrapped in proxies
- **Path-based change tracking** — subscribe to changes at any depth with dot-notation paths
- **Wildcard listening** — monitor all changes globally (`*`) or branch-level (`user.*`)
- **Hierarchy navigation** — walk up/down the reactive tree: parent, root, path resolution
- **Revocation** — unwrap reactive objects back to plain JavaScript
- **Typed path utilities** — safe deep `get`/`set` with full type inference

## Installation

```bash
pnpm add @hx/data
```

## Quick Example

```ts
import { reactive, ERO } from '@hx/data';

// Create a reactive root
const state = reactive({
  user: {
    name: 'John',
    address: { city: 'New York' }
  },
  count: 0
});

// Watch changes
ERO.on(state, 'user.name', (event) => {
  console.log(`Name: ${event.oldValue} → ${event.newValue}`);
});

ERO.on(state, '*', (event) => {
  console.log(`[${event.pathToRoot}] changed`);
});

// Modifications trigger listeners automatically
state.user.name = 'Jane';
state.count = 1;
state.user.address.city = 'Boston';
```

## API Map

| Category | API | Description |
|----------|-----|-------------|
| Creation | `reactive()` | Create a reactive root object |
| Listening | `ERO.on()` | Subscribe to changes |
| | `ERO.off()` | Unsubscribe |
| | `ERO.emit()` | Manually trigger change event |
| Inspection | `ERO.isReactiveRoot()` | Check if object is a reactive root |
| | `ERO.isReactiveObject()` | Check if object is reactive |
| Navigation | `ERO.rootOf()` | Get root from any nested object |
| | `ERO.parentOf()` | Get parent |
| | `ERO.pathOf()` | Resolve path to/from any node |
| | `ERO.pathToRoot()` | Get absolute path from root |
| | `ERO.pathToParent()` | Get path segment from parent |
| Value access | `ERO.getValue()` | Get value at path (plain or reactive) |
| | `ERO.setValue()` | Set value at path (triggers events) |
| | `ERO.setValueSilent()` | Set value without events |
| Revocation | `ERO.revoke()` | Unwrap reactive → plain object |
| Utilities | `ERO.fake()` | Create a stub reactive object |
| | `get()` / `set()` | Low-level path traversal |
| | `parsePath()` | Parse `"a.b.[0].c"` into segments |
| | `EventEmitter` | Standalone pub/sub |
