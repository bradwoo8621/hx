# 高级模式

## 深层对象监听

监控整个状态树：

```ts
const state = reactive({ user: { name: '张三', profile: { avatar: 'a.jpg' } } });

ERO.on(state, '*', (event) => {
  console.log(`[${event.pathToRoot}] ${event.oldValue} → ${event.newValue}`);
});

// 任意位置的变更都会触发监听器
state.user.name = '李四';
state.user.profile.avatar = 'b.jpg';
```

## 计算属性 / 衍生值

结合 `ERO.on` 与外部的衍生状态同步器：

```ts
const state = reactive({ firstName: '张', lastName: '三' });
let fullName = '';

function updateFullName() {
  fullName = `${state.firstName}${state.lastName}`;
}

ERO.on(state, 'firstName', updateFullName);
ERO.on(state, 'lastName', updateFullName);
updateFullName(); // 初始计算

state.firstName = '李';
console.log(fullName); // '李三'
```

## 表单绑定模式

`@hx/data` 专为表单状态管理设计。`$model` 传播模式：

```ts
const form = reactive({
  username: '',
  email: '',
  preferences: {
    newsletter: true,
    theme: 'dark'
  }
});

// 绑定监听器以同步 UI
ERO.on(form, '*', (event) => {
  console.log(`表单字段 ${event.pathToRoot} 已变更`);
  // 触发校验、自动保存等
});

// 任意表单输入 setValue 触发监听器
ERO.setValue(form, 'username', 'alice');
ERO.setValue(form, 'preferences.theme', 'light');
```

## 批量更新（静默模式）

使用 `mute-all` 进行多次更改而不触发事件，然后手动触发一次：

```ts
const state = reactive({ a: 1, b: 2, c: 3 });

// 批量静默更新
ERO.setValueSilent(state, 'a', 10, 'mute-all');
ERO.setValueSilent(state, 'b', 20, 'mute-all');
ERO.setValueSilent(state, 'c', 30, 'mute-all');

// 手动通知一次
ERO.emit(state, '*', { a: 1, b: 2, c: 3 }, { a: 10, b: 20, c: 30 });
```

## 撤销 / 重做栈

```ts
const state = reactive({ value: '' });
const history: string[] = [];
let historyIndex = -1;

ERO.on(state, 'value', (event) => {
  // 记录到撤销栈
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

state.value = '你好';
state.value = '世界';
undo(); // value → '你好'
undo(); // value → ''
```

## 树形遍历

遍历响应式层级结构：

```ts
const state = reactive({
  user: { name: '张三', address: { city: '北京' } },
  items: [{ id: 1 }, { id: 2 }]
});

// 从任意嵌套节点导航
const address = state.user.address;

ERO.rootOf(address)    // === state
ERO.parentOf(address)  // === state.user
ERO.pathOf(address)    // 'user.address'
ERO.pathOf(address, '../name')  // 'user.name'

// 通用向上遍历函数
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

## 条件监听

动态注册/取消监听器：

```ts
const state = reactive({ mode: 'edit', data: '你好' });

let dataListener: OnChangeEventHandle | null = null;

ERO.on(state, 'mode', (event) => {
  if (event.newValue === 'edit') {
    dataListener = (e) => console.log('编辑模式数据变更:', e.newValue);
    ERO.on(state, 'data', dataListener);
  } else {
    if (dataListener) {
      ERO.off(state, 'data', dataListener);
      dataListener = null;
    }
  }
});

state.mode = 'edit';   // 监听器注册
state.data = '世界';    // 触发
state.mode = 'view';   // 监听器移除
state.data = '最终';    // 不触发
```

## React 集成（剥离代理）

将值传给 React 状态时，使用 `ERO.revoke()` 剥离代理：

```ts
const reactiveState = reactive({ items: ['a', 'b', 'c'] });

// React state 必须是普通对象
setReactState(ERO.revoke(reactiveState));

// 或克隆特定部分
const plainItems = ERO.revoke(reactiveState.items);
```

## 数组模式：响应式队列

```ts
function createQueue<T>() {
  const state = reactive({ items: [] as T[] });

  return {
    enqueue(item: T) {
      state.items.push(item); // 触发 'items.*' 事件
    },
    dequeue(): T | undefined {
      const item = state.items.shift(); // 触发 'items.*' 事件
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
queue.onChange(() => console.log('队列变更:', queue.items));
queue.enqueue('第一');
queue.enqueue('第二');
queue.dequeue();
```

## 类型安全路径工具实战

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

// 类型安全路径构建器
function pathOf<T>(p: ModelPath<T>): string {
  return p as string;
}

// 编译期路径检查
const namePath = pathOf<AppState>('user.name');      // OK
const themePath = pathOf<AppState>('settings.theme'); // OK
// const badPath = pathOf<AppState>('settings.bad');  // 类型错误

// 类型安全取值器
function typedGet<T, P extends ModelPath<T>>(obj: T, path: P): PathValue<T, P> | undefined {
  return get(obj, path as string);
}

const state: AppState = {
  user: { name: '张三', email: 'z@ex.com', role: 'admin' },
  settings: { theme: 'dark', notifications: true },
  items: [{ id: 1, label: 'A' }]
};

const role = typedGet(state, 'user.role');     // typeof role = 'admin' | 'user' | undefined
const theme = typedGet(state, 'settings.theme'); // typeof theme = 'light' | 'dark' | undefined
```

## 测试用桩对象

使用 `ERO.fake()` 创建模拟响应式对象用于测试：

```ts
const fakeState = ERO.fake<{ count: number; name: string }>();

// 所有操作都记录错误日志但不会崩溃
fakeState.count = 5;   // console.error: "Always returns true, when setter[count] called..."
console.log(fakeState.count); // undefined，同时记录错误日志
```

这在需要响应式形状的对象但不在意实际响应式行为的组件测试中非常有用。
