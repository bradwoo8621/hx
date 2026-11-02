# Core Concepts

## Reactive Objects

A **reactive object** is a JavaScript object wrapped in a `Proxy`. Any property read/write is intercepted and tracked, enabling automatic change detection.

```ts
import { reactive } from '@hx/data';

const root = reactive({
  profile: {
    name: 'Alice',
    age: 30
  },
  tags: ['admin', 'editor']
});
```

### Root vs Nested

- **ReactiveRoot** — the top-level object created by `reactive()`. Has the full API: event triggers, change listeners.
- **ReactiveObject** — any nested object or array. Delegates operations to its root.

```ts
const root = reactive({ user: { name: 'John' } });
const user = root.user;        // ReactiveObject (nested)
const name = user.name;        // plain string (primitive)

ERO.isReactiveRoot(root);      // true
ERO.isReactiveRoot(user);      // false
ERO.isReactiveObject(user);    // true
ERO.isReactiveObject(name);    // false — primitives aren't proxied
```

### Revocation

Unwrap a reactive object back to plain JavaScript:

```ts
const reactiveObj = reactive({ x: 1, y: 2 });
const plain = ERO.revoke(reactiveObj);
// plain === { x: 1, y: 2 } (no proxy, no events)
```

## Change Events

Every modification fires a `ValueChangedEvent` with full context:

```ts
interface ValueChangedEvent {
  root: ReactiveRoot;         // the root reactive object
  parent: ReactiveObject;     // direct parent of the changed property
  oldValue: any;              // value before change
  newValue: any;              // value after change
  pathToRoot: PathToRoot;     // absolute path from root (e.g. "user.address.city")
  pathToParent: PathToParent; // path from parent (e.g. "city" or "[0]")
}
```

### Path Matching Rules

Four listening modes:

| Pattern | Matches |
|---------|---------|
| `*` | Everything in the entire reactive tree |
| `path.*` | Any descendant of `path` (but not the replacement of `path` itself) |
| `a.*.b` | `b` on any single segment of `a` |
| `path` | Exact match only |

A `*` segment matches exactly one segment (including array indices) when it is followed by another segment, and matches the whole subtree when it is the last segment. There is no recursive `**` pattern.

```ts
const obj = reactive({ user: { name: 'John', age: 30 } });

ERO.on(obj, '*', (e) => console.log('global:', e.pathToRoot));
ERO.on(obj, 'user.*', (e) => console.log('user subtree:', e.pathToRoot));
ERO.on(obj, 'user.name', (e) => console.log('exact name:', e.pathToRoot));

obj.user.name = 'Jane';  // all three fire
obj.user.age = 31;       // '*' and 'user.*' fire, 'user.name' does NOT
```

The `*` in the middle of `items.*.name` matches any array element, so it fires for `items.[0].name`, `items.[1].name`, and so on. Note that `items.*` (trailing) means the whole subtree, while `items.*.name` means one segment plus `name`.

`.` and `*` are reserved characters: a property name containing `.` is split into multiple path segments, and a property named `*` is treated as a wildcard, so neither can be addressed as a literal property through path notation.

### Array Changes

Array mutations (`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`) are automatically detected and fire appropriate events:

```ts
const obj = reactive({ items: [1, 2, 3] });

ERO.on(obj, 'items.*', (e) => {
  console.log(e.oldValue, '→', e.newValue);
});

obj.items.push(4);  // fires: [1,2,3] → [1,2,3,4]
obj.items[0] = 10;  // fires: 1 → 10
```

Array mutation methods (`push`, `pop`, `shift`, `unshift`, `splice`) trigger ONE change event (old array copy → new array copy). The duplicate length-change event is suppressed internally.

## ValueChangedEvent in Detail

```ts
const root = reactive({ user: { address: { city: 'NYC' } } });

ERO.on(root, 'user.address.city', (event) => {
  event.root           // === root
  event.parent         // === root.user.address
  event.oldValue       // 'NYC'
  event.newValue       // 'Boston'
  event.pathToRoot     // 'user.address.city'
  event.pathToParent   // 'city'
});

root.user.address.city = 'Boston';
```

## Silence Modes

Control whether change events fire:

```ts
type ValueSetSilenceMode = 'loud' | 'mute-all' | 'mute-leaf';
```

| Mode | Behavior |
|------|----------|
| `loud` | All events fire normally; pass it explicitly, since `setValueSilent` defaults to `mute-all` |
| `mute-all` | No events fire for the entire operation |
| `mute-leaf` | Only the final write is silent; intermediate path creation still fires |

```ts
const obj = reactive({ user: { name: 'John' } });

// Normal: fires event
ERO.setValue(obj, 'user.name', 'Jane');

// Silent: no event
ERO.setValueSilent(obj, 'user.name', 'Jane', 'mute-all');
```
