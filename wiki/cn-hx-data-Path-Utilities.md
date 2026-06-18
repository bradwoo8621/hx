# 路径工具

`@hx/data` 提供独立的路径函数（`get`、`set`、`parsePath`）和强大的 TypeScript 类型级别工具，用于类型安全的深层对象访问。

## `parsePath(path)`

将点号分隔的路径字符串拆分为片段数组。

```ts
import { parsePath } from '@hx/data';

parsePath('user.name');              // ['user', 'name']
parsePath('user.addresses.[0].city'); // ['user', 'addresses', '[0]', 'city']
```

## `get(obj, path)`

深层读取值。如果路径上任意段不存在则返回 `undefined`。

```ts
import { get } from '@hx/data';

const obj = { user: { name: '张三', tags: ['a', 'b'] } };

get(obj, 'user.name');  // '张三'
get(obj, 'user.tags.[0]'); // 'a'
get(obj, 'user.age');   // undefined
```

类型安全——返回类型由路径推导：

```ts
const obj = { user: { name: '张三', age: 30 } };
const name = get(obj, 'user.name'); // 类型: string | undefined
const age = get(obj, 'user.age');   // 类型: number | undefined
```

## `set(obj, path, value)`

深层写入值。自动创建中间对象/数组。原地修改。

```ts
import { set } from '@hx/data';

const obj = { user: {} };

// 创建中间对象
set(obj, 'user.address.city', '北京');
// obj === { user: { address: { city: '北京' } } }

// 创建中间数组
set(obj, 'items.[0].name', '第一项');
// obj === { user: { ... }, items: [{ name: '第一项' }] }
```

数组行为：
- 索引越界 → 用 `null` 填充扩展数组
- 下一段是 `[N]` → 创建数组中间对象
- 下一段是属性名 → 创建对象中间对象

## 类型级别工具

### `ModelPath<T>`

类型 `T` 的所有合法路径字符串的联合类型。处理嵌套对象和数组。

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

数组类型生成 `[number]` 路径：
```ts
type TagPaths = ModelPath<string[]>;
// "[0]"
```

### `PathValue<T, P>`

获取特定路径的值类型。对非法路径返回 `never`。

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

类似 `PathValue`，但 `P` 受 `ModelPath<T>` 约束——只有合法路径在类型层面才被允许。

```ts
type Valid = StrictPathValue<State, 'user.name'>;  // string
type Invalid = StrictPathValue<State, 'bad'>;       // never（编译错误）
```

### `ModelPathDelimiter`

始终为 `'.'`。由条件类型内部使用。

## 与函数结合使用

类型级别工具与运行时函数配合：

```ts
function deepGet<T, P extends ModelPath<T>>(obj: T, path: P): PathValue<T, P> | undefined {
  return get(obj, path);
}

// 完全类型安全：
const obj = { user: { name: '张三', age: 30 } };
const name = deepGet(obj, 'user.name'); // typeof name = string | undefined
const age = deepGet(obj, 'user.age');   // typeof age = number | undefined
// deepGet(obj, 'bad.path');            // 类型错误！'bad.path' 不可赋值
```

## 边界情况

### null 中间值处理

```ts
set({}, 'a.b', null);
// 创建 { a: { b: null } }
```

### 非数组上使用索引访问

```ts
set({ user: '字符串' }, 'user.[0]', 1);
// 抛出: Cannot access index [0] on non-array
```

### 通过 set 删除

```ts
const obj = { a: { b: 1, c: 2 } };
set(obj, 'a.b', null);  // 创建 obj.a.b = null（不会删除）
```
