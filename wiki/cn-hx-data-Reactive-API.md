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

根对象必须是对象。传入数组会抛出 `Error('Root cannot be an array.')`；数组可以作为嵌套属性使用（`reactive({ items: [] })`）。

### 选项

`ReactiveOptions` 目前是空接口，仅为未来扩展预留。监听变更请使用 `ERO.on(state, '*', listener)`，不存在 `onChanged` 回调选项。

---

## `ERO` — ExposedReactiveObject

`ERO` 是提供公共 API 的单例静态类。所有方法都是静态的。

```ts
import { ERO } from '@hx/data';
```

---

## 路径写法

取值路径与事件模式共用同一套点号/方括号格式：

| 写法 | 示例 | 适用 API | 含义 |
|------|------|----------|------|
| 点号路径 | `user.address.city` | 全部 | 嵌套属性访问 |
| 数组下标 | `items.[0].name` | 全部 | 单个数组元素；嵌套数组继续串联 |
| 普通相对路径 | `address.city` | `pathOf`、`getValue`、`setValue`、`setValueSilent` | 相对给定对象 |
| 点号相对路径 | `./city`、`../name`、`../../age` | 同上 | `./` 从对象向下，`../` 移动到父级 |
| 绝对路径 | `/user.name` | 同上 | 从根开始；只有前导 `/` 特殊，分段仍用 `.` |
| 全局通配 | `*` | `on`、`off`、`emit` | 所有变更 |
| 子树通配 | `user.*` | 同上 | `user` 的任意后代，不含 `user` 本身 |
| 中间通配 | `items.*.name` | 同上 | `items` 任意单个段上的 `name` |
| 首段通配 | `*.name` | 同上 | 任意根属性上的 `name` |

```ts
const root = reactive({ user: { name: '张三', address: { city: '北京' } } });
const address = root.user.address;

ERO.pathOf(address, 'city');         // 'user.address.city'
ERO.pathOf(address, './city');       // 'user.address.city'
ERO.pathOf(address, '../name');      // 'user.name'
ERO.getValue(address, '/user.name'); // '张三'
```

通配符只用于 `ERO.on` / `off` / `emit`；`get`、`set`、`getValue`、`setValue` 与 `pathOf` 会把 `*` 当作普通段名。`.` 和 `*` 是保留字符，属性名中含 `.` 或等于 `*` 时无法通过路径按字面量访问。

---

### `ERO.on(obj, path, listener)`

在某个路径上订阅变更。

```ts
ERO.on(
  obj: any,        // 任意响应式对象（根或嵌套）
  path: string,    // "*" | "path.*" | "a.*.b" | "*.name" | "path"
  listener: (event: ValueChangedEvent) => void
): void
```

```ts
const state = reactive({
  user: { name: '张三', age: 30 },
  items: [{ name: 'first' }, { name: 'second' }]
});

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

// 中间通配：任意元素的 name
ERO.on(state, 'items.*.name', (e) => {
  console.log(`[item] ${e.pathToRoot}`);
});
```

`*` 段后面还有其他段时恰好匹配一个段（含数组下标），如 `items.*.name`；位于末尾时匹配整棵子树，如 `user.*`。`.` 和 `*` 是保留字符，属性名中含 `.` 或等于 `*` 时无法通过路径按字面量访问。

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
// 只有注册在 'count' 上的监听器触发；'count.*' 不会触发（末尾 * 需要子段）
```

对数组元素，传入裸索引字符串（`'2'`，不是 `'[2]'`）；内部会包装为 `[2]`。

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
ERO.getValue(user, '/user.age'); // 30 — 仅去掉前导 /，分段仍用 .
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

静默设置，不触发事件。直接操作底层普通对象。`mode` 默认为 `mute-all`：

- `mute-all`（默认）：完全不触发事件
- `mute-leaf`：仅叶子节点静默；中间路径创建仍触发事件
- `loud`：触发所有变更事件，等价于 `ERO.setValue`

```ts
const state = reactive({ user: { name: '张三' } });

// 完全静默（默认模式）
ERO.setValueSilent(state, 'user.name', '李四');
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

`ERO.reactive()` 与 `ERO.loosePathOf()` 也在 facade 上；`loosePathOf` 对缺失输入返回 `undefined` 而不抛错。

---

## 错误与监听器异常

- `ERO.on` / `off` / `emit` / `rootOf` / `pathOf` / `pathToRoot` / `pathToParent` 对非响应式目标抛错：`Cannot expose a null or undefined value.`、`Cannot expose a non-object value.` 或 `Cannot expose a non-reactive object value.`
- 事件分发时，抛错的监听器会被捕获并通过 `console.error` 报告；后续监听器仍会执行。
- `set` / `setValue` 在末段路径收到 `null` 或 `undefined` 时删除对象属性；数组下标则写入 `null`。
- 写入相同值、删除不存在的键、把 `length` 设为当前值都不会触发事件。
- 把响应式对象赋给另一个响应式对象时，实际存入的是解包后的原始对象；`reactive(existingReactive)` 也会先解包。响应式数组上的 `indexOf` / `lastIndexOf` 会自动解包被查找的值。
