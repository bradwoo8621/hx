# Reactive API Reference

## `reactive(target, options?)`

Creates a reactive root object. Returns a proxy that fires change events on any nested modification.

```ts
function reactive<T extends object>(
  target: T,
  options?: ReactiveOptions
): ReactiveRoot & T
```

```ts
const state = reactive({ count: 0, items: ['a', 'b'] });
// state is both ReactiveRoot AND { count, items }
```

### Options

```ts
interface ReactiveOptions {
  onChanged?: (event: ValueChangedEvent) => void;
}
```

```ts
const state = reactive(
  { count: 0 },
  {
    onChanged(event) {
      console.log('built-in listener:', event.pathToRoot);
    }
  }
);
```

The `onChanged` callback is called for EVERY change. It's a shorthand equivalent to `ERO.on(state, '*', listener)`, but fires before other registered listeners.

---

## `ERO` — ExposedReactiveObject

`ERO` is the singleton static class providing the public API. All methods are static.

```
import { ERO } from '@hx/data';
```

---

### `ERO.on(obj, path, listener)`

Subscribe to changes at a path.

```ts
ERO.on(
  obj: any,        // any reactive object (root or nested)
  path: string,    // "*" | "path.*" | "path"
  listener: (event: ValueChangedEvent) => void
): void
```

```ts
const state = reactive({ user: { name: 'John', age: 30 } });

// Global: catch everything
ERO.on(state, '*', (e) => {
  console.log(`[global] ${e.pathToRoot}: ${e.oldValue} → ${e.newValue}`);
});

// Branch: catch user subtree
ERO.on(state, 'user.*', (e) => {
  console.log(`[user] ${e.pathToRoot}: ${e.oldValue} → ${e.newValue}`);
});

// Exact: only user.name changes
ERO.on(state, 'user.name', (e) => {
  console.log(`[name] ${e.oldValue} → ${e.newValue}`);
});
```

The callback receives the full `ValueChangedEvent`.

---

### `ERO.off(obj, path, listener)`

Unsubscribe.

```ts
const listener = (e: ValueChangedEvent) => console.log(e.pathToRoot);

ERO.on(state, 'count', listener);
state.count = 1;   // fires

ERO.off(state, 'count', listener);
state.count = 2;   // does NOT fire
```

Path must match exactly what was passed to `ERO.on()`.

---

### `ERO.emit(obj, key, oldValue, newValue)`

Manually fire a change event without modifying the object.

```ts
ERO.emit(state, 'count', 0, 99);
// Any listener on 'count' or 'count.*' will fire
```

Useful for custom mutation patterns or external state sync.

---

### `ERO.isReactiveRoot(obj)`

Type guard for `ReactiveRoot`.

```ts
const root = reactive({ x: 1 });
const nested = root.x; // not an object

ERO.isReactiveRoot(root);    // true
ERO.isReactiveRoot(nested);  // false
```

---

### `ERO.isReactiveObject(obj)`

Type guard for any reactive object (root or nested).

```ts
const root = reactive({ user: {} });
const user = root.user;

ERO.isReactiveObject(root);  // true
ERO.isReactiveObject(user);  // true (nested objects are also proxied)
ERO.isReactiveObject(123);   // false
```

---

### `ERO.rootOf(obj)`

Get the root reactive object from any nested descendant.

```ts
const root = reactive({ user: { address: { city: 'NY' } } });
const address = root.user.address;

ERO.rootOf(address) === root;  // true
```

---

### `ERO.parentOf(obj)`

Get the parent. Returns `undefined` if obj is the root.

```ts
const root = reactive({ user: { name: 'John' } });
const user = root.user;

ERO.parentOf(user) === root;     // true
ERO.parentOf(root) === undefined; // true
```

---

### `ERO.pathToRoot(obj)`

Absolute path from root to this object.

```ts
const root = reactive({ user: { address: { city: 'NY' } } });
const city = root.user.address;

ERO.pathToRoot(city);  // 'user.address'
```

---

### `ERO.pathToParent(obj)`

Path segment from parent to this object.

```ts
const root = reactive({ user: { name: 'John' }, items: ['a', 'b'] });

ERO.pathToParent(root.user);  // 'user'
ERO.pathToParent(root.items); // 'items'
```

---

### `ERO.pathOf(obj, andPath?)`

Resolve an absolute path. Supports relative traversal.

```ts
const root = reactive({
  user: { name: 'John', address: { city: 'NY' } },
  age: 30
});
const address = root.user.address;

// Absolute path of this object
ERO.pathOf(address);           // 'user.address'

// Relative: ./ goes deeper
ERO.pathOf(address, './city'); // 'user.address.city'

// Relative: ../ goes up
ERO.pathOf(address, '../name');// 'user.name'

// Multiple levels up
ERO.pathOf(address, '../../age'); // 'age'

// Absolute: / resets to root
ERO.pathOf(address, '/age');  // 'age'
```

---

### `ERO.getValue(obj, path)`

Get a value. Works on both plain and reactive objects. For reactive objects, supports relative/absolute paths.

```ts
// Plain object
ERO.getValue({ a: { b: 1 } }, 'a.b');  // 1

// Reactive with relative path
const state = reactive({ user: { name: 'John', age: 30 } });
const user = state.user;
ERO.getValue(user, './name');  // 'John'
ERO.getValue(user, '/user/age'); // 30
```

---

### `ERO.setValue(obj, path, value)`

Set a value. Triggers events on reactive objects. Creates intermediate paths automatically.

```ts
const state = reactive({ user: { name: 'John' } });

ERO.setValue(state, 'user.name', 'Jane');  // fires event
ERO.setValue(state, 'user.address.city', 'NY'); // creates intermediate objects
```

With relative paths:

```ts
const address = state.user.address; // created above
ERO.setValue(address, './zip', '10001');
ERO.setValue(address, '../name', 'Bob');
```

---

### `ERO.setValueSilent(obj, path, value, mode?)`

Set without triggering events. Works directly on the underlying plain object.

```ts
const state = reactive({ user: { name: 'John' } });

// No events at all
ERO.setValueSilent(state, 'user.name', 'Jane', 'mute-all');

// Only the leaf is silent; intermediate creation fires
ERO.setValueSilent(state, 'user.newField', 'value', 'mute-leaf');
```

---

### `ERO.revoke(obj)`

Unwrap. Returns the plain JavaScript object with no proxies.

```ts
const reactiveObj = reactive({ x: 1 });
const plain = ERO.revoke(reactiveObj);

plain.x = 2;         // no events fired
reactiveObj.x = 3;   // events fire (proxy still active)
```

---

### `ERO.fake()`

Create a stub reactive object that logs errors on any access. Useful for testing or placeholder states.

```ts
const fake = ERO.fake<{ name: string }>();
fake.name;     // console.error: "Always returns undefined, when getter[name] called..."
fake.name = 1; // console.error: "Always returns true, when setter[name] called..."
```

---

### `ERO.loosePathOf(obj?, andPath?)`

Like `pathOf` but returns `undefined` for null/undefined input (no throw).

```ts
ERO.loosePathOf(null);        // undefined
ERO.loosePathOf(someObj);     // same as ERO.pathOf(someObj)
```
