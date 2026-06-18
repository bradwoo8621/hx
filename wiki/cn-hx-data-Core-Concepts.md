# 核心概念

## 响应式对象

**响应式对象**是包装在 `Proxy` 中的 JavaScript 对象，任何属性的读写都会被拦截和追踪，从而启用自动变更检测。

```ts
import { reactive } from '@hx/data';

const root = reactive({
  profile: {
    name: '张三',
    age: 30
  },
  tags: ['管理员', '编辑']
});
```

### 根对象 vs 嵌套对象

- **ReactiveRoot** — 由 `reactive()` 创建的顶层对象。拥有完整 API：事件触发、变更监听。
- **ReactiveObject** — 任意嵌套对象或数组。将操作委托给其根对象。

```ts
const root = reactive({ user: { name: '张三' } });
const user = root.user;        // ReactiveObject（嵌套）
const name = user.name;        // 纯字符串（原始类型不代理）

ERO.isReactiveRoot(root);      // true
ERO.isReactiveRoot(user);      // false
ERO.isReactiveObject(user);    // true
ERO.isReactiveObject(name);    // false — 原始类型不被代理
```

### 撤销代理

将响应式对象还原为普通 JavaScript 对象：

```ts
const reactiveObj = reactive({ x: 1, y: 2 });
const plain = ERO.revoke(reactiveObj);
// plain === { x: 1, y: 2 }（无代理，无事件）
```

## 变更事件

每次修改都会触发 `ValueChangedEvent`，包含完整上下文：

```ts
interface ValueChangedEvent {
  root: ReactiveRoot;         // 响应式根对象
  parent: ReactiveObject;     // 被变更属性的直接父级
  oldValue: any;              // 变更前的值
  newValue: any;              // 变更后的值
  pathToRoot: PathToRoot;     // 从根开始的绝对路径（如 "user.address.city"）
  pathToParent: PathToParent; // 从父级开始的路径（如 "city" 或 "[0]"）
}
```

### 路径匹配规则

三种监听模式：

| 模式 | 匹配范围 |
|---------|---------|
| `*` | 响应式树中的所有变更 |
| `path.*` | `path` 路径本身及其所有后代的变更 |
| `path` | 仅精确匹配该路径 |

```ts
const obj = reactive({ user: { name: '张三', age: 30 } });

ERO.on(obj, '*', (e) => console.log('全局:', e.pathToRoot));
ERO.on(obj, 'user.*', (e) => console.log('user 子树:', e.pathToRoot));
ERO.on(obj, 'user.name', (e) => console.log('精确 name:', e.pathToRoot));

obj.user.name = '李四';  // 三个监听器都触发
obj.user.age = 31;       // '*' 和 'user.*' 触发，'user.name' 不触发
```

### 数组变更

数组变更方法（`push`、`pop`、`shift`、`unshift`、`splice`、`sort`、`reverse`、`fill`、`copyWithin`）自动被检测并触发相应事件：

```ts
const obj = reactive({ items: [1, 2, 3] });

ERO.on(obj, 'items.*', (e) => {
  console.log(e.oldValue, '→', e.newValue);
});

obj.items.push(4);  // 触发: [1,2,3] → [1,2,3,4]
obj.items[0] = 10;  // 触发: 1 → 10
```

数组变更方法（`push`、`pop`、`shift`、`unshift`、`splice`）只触发**一次**变更事件（旧数组副本 → 新数组副本）。length 属性变更导致的重复事件会在内部被抑制。

## ValueChangedEvent 详解

```ts
const root = reactive({ user: { address: { city: '北京' } } });

ERO.on(root, 'user.address.city', (event) => {
  event.root           // === root
  event.parent         // === root.user.address
  event.oldValue       // '北京'
  event.newValue       // '上海'
  event.pathToRoot     // 'user.address.city'
  event.pathToParent   // 'city'
});

root.user.address.city = '上海';
```

## 静默模式

控制变更事件是否触发：

```ts
type ValueSetSilenceMode = 'loud' | 'mute-all' | 'mute-leaf';
```

| 模式 | 行为 |
|------|----------|
| `loud` | 默认 — 所有事件正常触发 |
| `mute-all` | 不触发任何事件 |
| `mute-leaf` | 仅最终写入不触发事件；中间路径的创建仍会触发 |

```ts
const obj = reactive({ user: { name: '张三' } });

// 正常：触发事件
ERO.setValue(obj, 'user.name', '李四');

// 静默：不触发事件
ERO.setValueSilent(obj, 'user.name', '李四', 'mute-all');
```
