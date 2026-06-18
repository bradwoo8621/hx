# 响应式 API 参考

## `reactive(target, options?)`

创建响应式根对象。返回一个代理，在任意嵌套修改时触发变更事件。

```ts
function reactive<T extends object>(
  target: T,
  options?: ReactiveOptions
): ReactiveRoot & T
```

```ts
const state = reactive({ count: 0, items: ['a', 'b'] });
// state 同时是 ReactiveRoot 和 { count, items }
```

### 选项

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
      console.log('内置监听器:', event.pathToRoot);
    }
  }
);
```

`onChanged` 回调在**每次**变更时调用。它等效于 `ERO.on(state, '*', listener)`，但在其他已注册监听器之前触发。

---

## `ERO` — ExposedReactiveObject

`ERO` 是提供公共 API 的单例静态类。所有方法都是静态的。

```ts
import { ERO } from '@hx/data';
```

---

### `ERO.on(obj, path, listener)`

在某个路径上订阅变更。

```ts
ERO.on(
  obj: any,        // 任意响应式对象（根或嵌套）
  path: string,    // "*" | "path.*" | "path"
  listener: (event: ValueChangedEvent) => void
): void
```

```ts
const state = reactive({ user: { name: '张三', age: 30 } });

// 全局：捕获所有
ERO.on(state, '*', (e) => {
  console.log(`[全局] ${e.pathToRoot}: ${e.oldValue} → ${e.newValue}`);
});

// 分支：捕获 user 子树
ERO.on(state, 'user.*', (e) => {
  console.log(`[user] ${e.pathToRoot}: ${e.oldValue} → ${e.newValue}`);
});

// 精确：仅 user.name 变更
ERO.on(state, 'user.name', (e) => {
  console.log(`[name] ${e.oldValue} → ${e.newValue}`);
});
```

---

### `ERO.off(obj, path, listener)`

取消订阅。

```ts
const listener = (e: ValueChangedEvent) => console.log(e.pathToRoot);

ERO.on(state, 'count', listener);
state.count = 1;   // 触发

ERO.off(state, 'count', listener);
state.count = 2;   // 不触发
```

路径必须与注册时完全一致。

---

### `ERO.emit(obj, key, oldValue, newValue)`

手动触发变更事件，不修改对象本身。

```ts
ERO.emit(state, 'count', 0, 99);
// 'count' 或 'count.*' 上的监听器会触发
```

---

### `ERO.isReactiveRoot(obj)`

`ReactiveRoot` 类型守卫。

```ts
const root = reactive({ x: 1 });

ERO.isReactiveRoot(root);    // true
ERO.isReactiveRoot(123);     // false
```

---

### `ERO.isReactiveObject(obj)`

任意响应式对象（根或嵌套）的类型守卫。

```ts
const root = reactive({ user: {} });
const user = root.user;

ERO.isReactiveObject(root);  // true
ERO.isReactiveObject(user);  // true（嵌套对象也被代理）
ERO.isReactiveObject(123);   // false
```

---

### `ERO.rootOf(obj)`

从任意嵌套后代获取根对象。

```ts
const root = reactive({ user: { address: { city: '北京' } } });
const address = root.user.address;

ERO.rootOf(address) === root;  // true
```

---

### `ERO.parentOf(obj)`

获取父对象。如果是根对象则返回 `undefined`。

```ts
const root = reactive({ user: { name: '张三' } });
const user = root.user;

ERO.parentOf(user) === root;     // true
ERO.parentOf(root) === undefined; // true
```

---

### `ERO.pathToRoot(obj)`

从根到该对象的绝对路径。

```ts
const root = reactive({ user: { address: { city: '北京' } } });
const city = root.user.address;

ERO.pathToRoot(city);  // 'user.address'
```

---

### `ERO.pathToParent(obj)`

从父级到该对象的路径片段。

```ts
const root = reactive({ user: { name: '张三' }, items: ['a', 'b'] });

ERO.pathToParent(root.user);  // 'user'
ERO.pathToParent(root.items); // 'items'
```

---

### `ERO.pathOf(obj, andPath?)`

解析绝对路径。支持相对路径遍历。

```ts
const root = reactive({
  user: { name: '张三', address: { city: '北京' } },
  age: 30
});
const address = root.user.address;

// 当前对象的绝对路径
ERO.pathOf(address);           // 'user.address'

// 相对路径：./ 深入
ERO.pathOf(address, './city'); // 'user.address.city'

// 相对路径：../ 向上
ERO.pathOf(address, '../name');// 'user.name'

// 多级向上
ERO.pathOf(address, '../../age'); // 'age'

// 绝对路径：/ 重置到根
ERO.pathOf(address, '/age');  // 'age'
```

---

### `ERO.getValue(obj, path)`

获取值。适用于普通对象和响应式对象。对响应式对象支持相对/绝对路径。

```ts
// 普通对象
ERO.getValue({ a: { b: 1 } }, 'a.b');  // 1

// 响应式对象 + 相对路径
const state = reactive({ user: { name: '张三', age: 30 } });
const user = state.user;
ERO.getValue(user, './name');   // '张三'
ERO.getValue(user, '/user/age'); // 30
```

---

### `ERO.setValue(obj, path, value)`

设置值。在响应式对象上触发事件。自动创建中间路径。

```ts
const state = reactive({ user: { name: '张三' } });

ERO.setValue(state, 'user.name', '李四');  // 触发事件
ERO.setValue(state, 'user.address.city', '北京'); // 自动创建中间对象
```

相对路径：

```ts
const address = state.user.address; // 上面创建的
ERO.setValue(address, './zip', '100001');
ERO.setValue(address, '../name', '王五');
```

---

### `ERO.setValueSilent(obj, path, value, mode?)`

静默设置，不触发事件。直接操作底层普通对象。

```ts
const state = reactive({ user: { name: '张三' } });

// 完全静默
ERO.setValueSilent(state, 'user.name', '李四', 'mute-all');

// 仅叶子节点静默；中间路径创建仍触发事件
ERO.setValueSilent(state, 'user.newField', 'value', 'mute-leaf');
```

---

### `ERO.revoke(obj)`

撤销代理。返回不带代理的普通 JavaScript 对象。

```ts
const reactiveObj = reactive({ x: 1 });
const plain = ERO.revoke(reactiveObj);

plain.x = 2;         // 不触发事件
reactiveObj.x = 3;   // 触发事件（代理仍在生效）
```

---

### `ERO.fake()`

创建桩响应式对象，任何访问都会打印错误日志。用于测试或占位场景。

```ts
const fake = ERO.fake<{ name: string }>();
fake.name;     // console.error: "Always returns undefined, when getter[name] called..."
fake.name = 1; // console.error: "Always returns true, when setter[name] called..."
```

---

### `ERO.loosePathOf(obj?, andPath?)`

类似 `pathOf`，但对 null/undefined 输入返回 `undefined`（不抛异常）。

```ts
ERO.loosePathOf(null);        // undefined
ERO.loosePathOf(someObj);     // 等同于 ERO.pathOf(someObj)
```
