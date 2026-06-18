# EventEmitter

A lightweight, TypeScript-typed pub/sub event emitter. Used internally by the reactive system, but also exported as a standalone utility.

```ts
import { EventEmitter } from '@hx/data';
```

## API

### `on(eventName, listener)`

Subscribe to an event. Returns `this` for chaining.

```ts
const emitter = new EventEmitter();

emitter.on('click', (x, y) => {
  console.log(`click at ${x}, ${y}`);
});
```

### `emit(eventName, ...args)`

Fire an event. Returns `true` if there were listeners, `false` otherwise.

```ts
emitter.emit('click', 100, 200); // "click at 100, 200" → returns true
emitter.emit('unknown');         // no listeners → returns false
```

### `off(eventName, listener)`

Remove a specific listener.

```ts
const handler = (msg: string) => console.log(msg);

emitter.on('log', handler);
emitter.emit('log', 'hello');     // fires

emitter.off('log', handler);
emitter.emit('log', 'world');     // does NOT fire
```

### `once(eventName, listener)`

Register a one-shot listener. Fires once then auto-removes.

```ts
emitter.once('init', () => {
  console.log('runs only once');
});

emitter.emit('init'); // fires
emitter.emit('init'); // no listener → returns false
```

### `offAll(eventName?)`

Remove all listeners. If no event name, clear everything.

```ts
emitter.on('a', () => {});
emitter.on('a', () => {});
emitter.on('b', () => {});

emitter.offAll('a');  // removes 'a' listeners only
emitter.offAll();     // removes everything
```

## Type

```ts
type Listener = (...args: any[]) => void;
```

## Pattern: Chaining

All mutation methods return `this`:

```ts
emitter
  .on('start', () => console.log('started'))
  .on('stop', () => console.log('stopped'))
  .emit('start');
```

## Pattern: Use with Reactive

The reactive system uses `EventEmitter` internally for path-based event routing. You can use it independently for any pub/sub needs:

```ts
class Store {
  private events = new EventEmitter();

  subscribe(listener: () => void) {
    return this.events.on('change', listener);
  }

  unsubscribe(listener: () => void) {
    this.events.off('change', listener);
  }

  protected notify() {
    this.events.emit('change');
  }
}
```
