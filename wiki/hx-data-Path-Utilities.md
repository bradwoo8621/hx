# Path Utilities

`@hx/data` provides standalone path functions (`get`, `set`, `parsePath`) and powerful TypeScript type-level utilities for type-safe deep object access.

## `parsePath(path)`

Split a dot-delimited path string into segments.

```ts
import { parsePath } from '@hx/data';

parsePath('user.name');              // ['user', 'name']
parsePath('user.addresses.[0].city'); // ['user', 'addresses', '[0]', 'city']
```

## `get(obj, path)`

Deeply read a value. Returns `undefined` if any segment doesn't exist.

```ts
import { get } from '@hx/data';

const obj = { user: { name: 'John', tags: ['a', 'b'] } };

get(obj, 'user.name');  // 'John'
get(obj, 'user.tags.[0]'); // 'a'
get(obj, 'user.age');   // undefined
```

Type-safe — the return type is inferred from the path:

```ts
const obj = { user: { name: 'John', age: 30 } };
const name = get(obj, 'user.name'); // type: string | undefined
const age = get(obj, 'user.age');   // type: number | undefined
```

## `set(obj, path, value)`

Deeply write a value. Creates intermediate objects/arrays automatically. Mutates in-place.

```ts
import { set } from '@hx/data';

const obj = { user: {} };

// Create intermediate objects
set(obj, 'user.address.city', 'NYC');
// obj === { user: { address: { city: 'NYC' } } }

// Create intermediate arrays
set(obj, 'items.[0].name', 'first');
// obj === { user: { ... }, items: [{ name: 'first' }] }
```

Array behavior:
- Index out of bounds → array is extended with `null` fillers
- Next segment is `[N]` → create array intermediate
- Next segment is property → create object intermediate

## Type-Level Types

### `ModelPath<T>`

Union of all valid path strings for type `T`. Handles nested objects and arrays.

```ts
import type { ModelPath } from '@hx/data';

interface User {
  name: string;
  address: {
    city: string;
    zip: string;
  };
  tags: string[];
}

type UserPaths = ModelPath<User>;
// "name" | "address" | "address.city" | "address.zip" | "tags" | "tags.[0]"
```

Array types generate `[number]` paths:
```ts
type TagPaths = ModelPath<string[]>;
// "[0]"
```

### `PathValue<T, P>`

Get the value type at a specific path. Returns `never` for invalid paths.

```ts
import type { PathValue } from '@hx/data';

interface State {
  count: number;
  user: {
    name: string;
    tags: string[];
  };
}

type T1 = PathValue<State, 'count'>;          // number
type T2 = PathValue<State, 'user.name'>;      // string
type T3 = PathValue<State, 'user.tags.[0]'>;  // string
type T4 = PathValue<State, 'invalid'>;        // never
```

### `StrictPathValue<T, P>`

Like `PathValue` but `P` is constrained to `ModelPath<T>` — only valid paths allowed at the type level.

```ts
type Valid = StrictPathValue<State, 'user.name'>;  // string
type Invalid = StrictPathValue<State, 'bad'>;       // never (compile error)
```

### `ModelPathDelimiter`

Always `'.'`. Used internally by conditional types.

## Using Types with Functions

The type-level types integrate with the runtime functions:

```ts
function deepGet<T, P extends ModelPath<T>>(obj: T, path: P): PathValue<T, P> | undefined {
  return get(obj, path);
}

// Fully type-safe:
const obj = { user: { name: 'John', age: 30 } };
const name = deepGet(obj, 'user.name'); // typeof name = string | undefined
const age = deepGet(obj, 'user.age');   // typeof age = number | undefined
// deepGet(obj, 'bad.path');            // TYPE ERROR! 'bad.path' is not assignable
```

## Edge Cases

### Null intermediate handling

```ts
set({}, 'a.b', null);
// creates { a: { b: null } }
```

### Non-array index access

```ts
set({ user: 'string' }, 'user.[0]', 1);
// THROWS: Cannot access index [0] on non-array
```

### Deleting via set

```ts
const obj = { a: { b: 1, c: 2 } };
set(obj, 'a.b', null);  // creates obj.a.b = null (does NOT delete)
```
