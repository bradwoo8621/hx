# @hx/data - Reactive Data Library

Lightweight, proxy-based reactive data management library for TypeScript applications, designed for seamless integration with the @hx/components UI component library.

## Key Features

- **Proxy-based Reactivity**: Automatic fine-grained change detection for nested objects and arrays using ES6 Proxies
- **Path-based Event System**: Subscribe to changes at any level of nested objects using dot-notation paths with wildcard support
- **ERO Utility API**: Comprehensive set of reactive data manipulation methods with type safety
- **Flexible Update Modes**: Control event emission with `setValueSilent` modes (loud, mute-all, mute-leaf) for optimal performance
- **Zero Runtime Dependencies**: Pure TypeScript implementation with no external dependencies
- **Framework Agnostic**: Works with any UI framework, built specifically for React and @hx/components
- **Type-safe**: Full TypeScript support with generic type inference for all reactive operations
- **Hierarchical Navigation**: Traverse reactive object hierarchies with `rootOf()` and `pathOf()` utilities

## Installation

```bash
pnpm add @hx/data
# or
npm install @hx/data
```

## Quick Start

```typescript
import { reactive, ERO } from '@hx/data';

// Create a reactive object
const user = reactive({
  name: 'John Doe',
  email: 'john@example.com',
  address: {
    city: 'Shanghai',
    country: 'China'
  }
});

// Listen to changes on specific fields
ERO.on(user, 'name', (event) => {
  console.log(`Name changed from ${event.oldValue} to ${event.newValue}`);
});

// Listen to all changes under address
ERO.on(user, 'address.*', (event) => {
  console.log(`Address field ${event.pathToRoot} changed`);
});

// Update values - automatically triggers events
user.name = 'Jane Doe';
user.address.city = 'Beijing';

// Get values using path notation
const city = ERO.getValue(user, 'address.city'); // 'Beijing'

// Set values using path notation
ERO.setValue(user, 'address.country', 'CN');
```

## Core Concepts

### Reactive Objects
Reactive objects are standard JavaScript objects wrapped in ES6 Proxies that automatically track changes and emit events when properties are modified. Nested objects are automatically converted to reactive objects when accessed.

### ERO (Entity Reactive Object)
ERO is the utility API that provides all reactive data manipulation methods. It works with both reactive and plain JavaScript objects.

### Path Notation
Access nested properties using dot-notation:
- Simple properties: `'name'`, `'email'`
- Nested properties: `'address.city'`, `'user.profile.age'`
- Array elements: `'items.[0].name'`, `'users.[2].email'`
- Wildcards: `'user.*'` (all children, direct or descents)

### Event System
Change events include:
- `oldValue`: The previous value before the change
- `newValue`: The new value after the change
- `pathToRoot`: Full path from the root object to the changed property
- `pathToParent`: Path from the parent object to the changed property

## Core API Reference

### `reactive<T extends object>(target: T): T`
Creates a new reactive root object from a plain object. Nested objects will be automatically wrapped in reactive proxies when accessed.

```typescript
const model = reactive({ count: 0 });
```

### `getValue<T>(model: object, path: string): T | undefined`
Gets a value from an object using dot-notation path. Works with both reactive and plain objects.

```typescript
const name = ERO.getValue(user, 'name');
```

### `setValue<T>(model: object, path: string, value: T): void`
Sets a value on an object using dot-notation path, automatically creating intermediate objects if they don't exist. Triggers change events for all affected paths.

```typescript
ERO.setValue(user, 'address.zipCode', '200000');
```

### `setValueSilent<T>(model: object, path: string, value: T, mode: 'loud' | 'mute-all' | 'mute-leaf' = 'loud'): void`
Sets a value with configurable event emission:
- `'loud'`: Default, emits all change events
- `'mute-all'`: Suppresses all change events
- `'mute-leaf'`: Suppresses only leaf node change events, emits events for intermediate path creation

```typescript
// Update without triggering leaf events (used by input components for debouncing)
ERO.setValueSilent(user, 'name', 'New Name', 'mute-leaf');
```

### `emit(model: object, path: string, oldValue: any, newValue: any): void`
Manually triggers a change event for a specific path.

```typescript
ERO.emit(user, 'name', oldName, newName);
```

### `on<T>(model: object, path: string, handler: (event: ChangeEvent<T>) => void): void`
Subscribes to change events for a specific path or wildcard pattern.

```typescript
// Listen to all changes on the user object
ERO.on(user, '**', (event) => {
  console.log('Something changed:', event);
});
```

### `off<T>(model: object, path: string, handler: (event: ChangeEvent<T>) => void): void`
Unsubscribes from change events.

### `pathOf(model: object, field: string): string`
Resolves the absolute path from the root reactive object to a nested field.

```typescript
const address = user.address;
const fullPath = ERO.pathOf(address, 'city'); // 'address.city'
```

### `rootOf(model: object): object`
Gets the root reactive object from any nested reactive object.

```typescript
const address = user.address;
const root = ERO.rootOf(address); // same as original user object
```

### `isReactiveObject(value: any): boolean`
Checks if a value is a reactive object.

### `revoke<T extends object>(model: T): T`
Removes reactivity from a reactive object, returning a plain object reference. Changes to the revoked object will not trigger events.

## Integration with @hx/components

@hx/data is designed to work seamlessly with @hx/components reactive UI components:

```tsx
import { reactive } from '@hx/data';
import { HxInput, HxButton, HxFlex } from '@hx/components';

function MyForm() {
  const formModel = reactive({
    email: '',
    password: ''
  });

  const handleSubmit = () => {
    console.log('Form values:', formModel);
  };

  return (
    <HxFlex direction="dir-y" gapY="md">
      <HxInput $model={formModel} $field="email" label="Email" />
      <HxInput $model={formModel} $field="password" type="password" label="Password" />
      <HxButton text="Submit" onClick={handleSubmit} />
    </HxFlex>
  );
}
```

All components with `$model` and `$field` props automatically establish two-way data binding with reactive objects, handling change events and UI updates automatically.

## TypeScript Support

@hx/data is written in TypeScript with full type safety for all operations:

```typescript
interface User {
  name: string;
  email: string;
  address: {
    city: string;
  };
}

const user = reactive<User>({
  name: 'John',
  email: 'john@example.com',
  address: {
    city: 'Shanghai'
  }
});

// Type-safe value access
const name = ERO.getValue<User, string>(user, 'name'); // type: string

// Type-safe value assignment
ERO.setValue<User, string>(user, 'address.city', 'Beijing'); // Type checked
```

## License

MIT
