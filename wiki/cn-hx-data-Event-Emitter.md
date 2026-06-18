# EventEmitter

轻量级 TypeScript 发布/订阅事件发射器。响应式系统内部使用，也作为独立工具导出。

```ts
import { EventEmitter } from '@hx/data';
```

## API

### `on(eventName, listener)`

订阅事件。返回 `this` 支持链式调用。

```ts
const emitter = new EventEmitter();

emitter.on('click', (x, y) => {
  console.log(`点击位置 ${x}, ${y}`);
});
```

### `emit(eventName, ...args)`

触发事件。有监听器返回 `true`，否则返回 `false`。

```ts
emitter.emit('click', 100, 200); // "点击位置 100, 200" → 返回 true
emitter.emit('unknown');         // 无监听器 → 返回 false
```

### `off(eventName, listener)`

移除特定监听器。

```ts
const handler = (msg: string) => console.log(msg);

emitter.on('log', handler);
emitter.emit('log', '你好');     // 触发

emitter.off('log', handler);
emitter.emit('log', '世界');     // 不触发
```

### `once(eventName, listener)`

注册一次性监听器。触发一次后自动移除。

```ts
emitter.once('init', () => {
  console.log('只执行一次');
});

emitter.emit('init'); // 触发
emitter.emit('init'); // 无监听器 → 返回 false
```

### `offAll(eventName?)`

移除所有监听器。不传事件名则清空全部。

```ts
emitter.on('a', () => {});
emitter.on('a', () => {});
emitter.on('b', () => {});

emitter.offAll('a');  // 仅移除 'a' 的监听器
emitter.offAll();     // 清空所有
```

## 类型定义

```ts
type Listener = (...args: any[]) => void;
```

## 模式：链式调用

所有变更方法都返回 `this`：

```ts
emitter
  .on('start', () => console.log('已启动'))
  .on('stop', () => console.log('已停止'))
  .emit('start');
```

## 模式：与响应式系统配合

响应式系统内部使用 `EventEmitter` 实现基于路径的事件路由。你也可以独立使用它实现任意发布/订阅需求：

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
