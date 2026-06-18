# Advanced Patterns

## Deep Object Watching

Monitor the entire state tree:

```ts
const state = reactive({ user: { name: 'John', profile: { avatar: 'a.jpg' } } });

ERO.on(state, '*', (event) => {
  console.log(`[${event.pathToRoot}] ${event.oldValue} → ${event.newValue}`);
});

// Every single change anywhere triggers the listener
state.user.name = 'Jane';
state.user.profile.avatar = 'b.jpg';
```

## Computed / Derived Values

Combine `ERO.on` with external derived state synchronizers:

```ts
const state = reactive({ firstName: 'John', lastName: 'Doe' });
let fullName = '';

function updateFullName() {
  fullName = `${state.firstName} ${state.lastName}`;
}

ERO.on(state, 'firstName', updateFullName);
ERO.on(state, 'lastName', updateFullName);
updateFullName(); // initial computation

state.firstName = 'Jane';
console.log(fullName); // 'Jane Doe'
```

## Form Binding Pattern

`@hx/data` is designed for form state management. The `$model` propagation pattern:

```ts
const form = reactive({
  username: '',
  email: '',
  preferences: {
    newsletter: true,
    theme: 'dark'
  }
});

// Bind a listener to sync UI
ERO.on(form, '*', (event) => {
  console.log(`Form field ${event.pathToRoot} changed`);
  // Trigger validation, auto-save, etc.
});

// Any form input setValue triggers the listener
ERO.setValue(form, 'username', 'alice');
ERO.setValue(form, 'preferences.theme', 'light');
```

## Batch Updates with Silence

Use `mute-all` to make multiple changes without triggering events, then manually emit once:

```ts
const state = reactive({ a: 1, b: 2, c: 3 });

// Batch silent updates
ERO.setValueSilent(state, 'a', 10, 'mute-all');
ERO.setValueSilent(state, 'b', 20, 'mute-all');
ERO.setValueSilent(state, 'c', 30, 'mute-all');

// Manually notify once
ERO.emit(state, '*', { a: 1, b: 2, c: 3 }, { a: 10, b: 20, c: 30 });
```

## Undo / Redo Stack

```ts
const state = reactive({ value: '' });
const history: string[] = [];
let historyIndex = -1;

ERO.on(state, 'value', (event) => {
  // Record in undo stack
  historyIndex++;
  history.splice(historyIndex);
  history.push(event.oldValue);
});

function undo() {
  if (historyIndex >= 0) {
    const previous = history[historyIndex--];
    ERO.setValueSilent(state, 'value', previous, 'mute-all');
    ERO.emit(state, 'value', state.value, previous);
  }
}

state.value = 'hello';
state.value = 'world';
undo(); // value → 'hello'
undo(); // value → ''
```

## Tree Traversal

Walk the reactive hierarchy:

```ts
const state = reactive({
  user: { name: 'John', address: { city: 'NY' } },
  items: [{ id: 1 }, { id: 2 }]
});

// Navigate from any nested node
const address = state.user.address;

ERO.rootOf(address)    // === state
ERO.parentOf(address)  // === state.user
ERO.pathOf(address)    // 'user.address'
ERO.pathOf(address, '../name')  // 'user.name'

// Generic tree walker
function walkParents(node: any) {
  let current = node;
  const chain: string[] = [];
  while (ERO.isReactiveObject(current)) {
    chain.push(ERO.pathToParent(current));
    const parent = ERO.parentOf(current);
    if (!parent) break;
    current = parent;
  }
  return chain.reverse();
}

walkParents(address); // ['user', 'address']
```

## Conditional Listening

Register/unregister listeners dynamically:

```ts
const state = reactive({ mode: 'edit', data: 'hello' });

let dataListener: OnChangeEventHandle | null = null;

ERO.on(state, 'mode', (event) => {
  if (event.newValue === 'edit') {
    dataListener = (e) => console.log('Data changed in edit mode:', e.newValue);
    ERO.on(state, 'data', dataListener);
  } else {
    if (dataListener) {
      ERO.off(state, 'data', dataListener);
      dataListener = null;
    }
  }
});

state.mode = 'edit';   // listener registered
state.data = 'world';  // fires
state.mode = 'view';   // listener removed
state.data = 'final';  // does NOT fire
```

## React Integration (Escaping Proxy)

When passing values to React state, use `ERO.revoke()` to strip proxies:

```ts
const reactiveState = reactive({ items: ['a', 'b', 'c'] });

// React state must be plain objects
setReactState(ERO.revoke(reactiveState));

// Or clone specific portions
const plainItems = ERO.revoke(reactiveState.items);
```

## Array Pattern: Reactive Queue

```ts
function createQueue<T>() {
  const state = reactive({ items: [] as T[] });

  return {
    enqueue(item: T) {
      state.items.push(item); // triggers 'items.*' event
    },
    dequeue(): T | undefined {
      const item = state.items.shift(); // triggers 'items.*' event
      return item;
    },
    get items(): readonly T[] {
      return state.items;
    },
    onChange(listener: () => void) {
      ERO.on(state, 'items.*', listener);
    }
  };
}

const queue = createQueue<string>();
queue.onChange(() => console.log('Queue changed:', queue.items));
queue.enqueue('first');
queue.enqueue('second');
queue.dequeue();
```

## Type-Safe Path Utilities in Practice

```ts
import type { ModelPath, PathValue } from '@hx/data';

interface AppState {
  user: {
    name: string;
    email: string;
    role: 'admin' | 'user';
  };
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  items: { id: number; label: string }[];
}

// Type-safe path builder
function pathOf<T>(p: ModelPath<T>): string {
  return p as string;
}

// Compile-time path checking
const namePath = pathOf<AppState>('user.name');      // OK
const themePath = pathOf<AppState>('settings.theme'); // OK
// const badPath = pathOf<AppState>('settings.bad');  // TYPE ERROR

// Type-safe getter
function typedGet<T, P extends ModelPath<T>>(obj: T, path: P): PathValue<T, P> | undefined {
  return get(obj, path as string);
}

const state: AppState = {
  user: { name: 'John', email: 'j@ex.com', role: 'admin' },
  settings: { theme: 'dark', notifications: true },
  items: [{ id: 1, label: 'A' }]
};

const role = typedGet(state, 'user.role');     // typeof role = 'admin' | 'user' | undefined
const theme = typedGet(state, 'settings.theme'); // typeof theme = 'light' | 'dark' | undefined
```

## Stub Objects for Testing

Use `ERO.fake()` to create mock reactive objects for testing:

```ts
const fakeState = ERO.fake<{ count: number; name: string }>();

// All operations log errors but don't crash
fakeState.count = 5;   // console.error: "Always returns true, when setter[count] called..."
console.log(fakeState.count); // undefined, console.error logged
```

This is useful for component tests where you need a reactive-shaped object but don't care about actual reactivity.
