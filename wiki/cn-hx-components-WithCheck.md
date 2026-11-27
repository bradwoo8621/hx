# HxWithCheck / HxCheckMessage

验证 HOC 和独立消息组件。通过自定义 `handle` 函数对模型数据做校验，由响应式字段监听触发。

---

## HxWithCheck（HOC）

将任意响应式组件包装为带验证的版本。内部通过 `ERO.on()` 订阅字段变更，当被监听的字段变化时调用 `handle` 函数，将结果作为错误/警告消息显示在被包装组件的下方。

```tsx
import { HxWithCheck } from '@hx/components';

// 包装组件；$supplyOn 为省略 on 的规则提供监听路径
const ValidatedInput = HxWithCheck(HxInput, {
  $supplyOn: props => props.$field
});

<ValidatedInput
  $model={form}
  $field="email"
  $check={{
    handle: (event, model) => {
      const v = model.email;
      if (!v) return '请输入邮箱';
      if (!/^[^\s@]+@[^\s@]+$/.test(v)) return '邮箱格式不正确';
      return undefined;  // 校验通过
    },
  }}
/>
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$check` | `DynamicCheck` | — | 验证规则，只有一条，见下方 DynamicCheck |
| `alwaysKeepMessageDOM` | `boolean` | `false` | 始终渲染消息 DOM 元素，防止布局抖动 |
| `$domCheckBox` | HTML 属性 | — | 包装 `<div>` 上的额外属性 |
| `$domCheckMsg` | HTML 属性 | — | 消息 `<span>` 上的额外属性 |

被包装组件的全部 prop 同样可用，并原样透传给被包装组件。`$visible`、`$disabled`、`$readonly` 由 HOC 自己解析（支持与其他组件一致的布尔、函数、监听对象三种写法；函数形式在挂载/父组件重渲染时求值，不跟随模型变化，需要跟随模型变化请用监听对象），再把解析后的布尔值向下传递，因此被包装组件与包装 `<div>` 的状态始终一致。布局类 prop（`fGrow`、`fAlignSelf`、`gRow`、`gRows`、`gCol`、`gCols`、`gJustifySelf`、`gAlignSelf`）由包装 `<div>` 消费而不是被包装组件，解析后的 `data-hx-visible`、`data-hx-disabled`、`data-hx-readonly` 会与之一并写到包装 `<div data-hx-with-check="">` 上，方便从外部为其写样式。

### DynamicCheck

```ts
interface DynamicCheck<T extends object> {
  on?: string | string[];          // 要监听的字段路径；省略时使用 $supplyOn
  handle: MonitorCheckFunc<T>;     // 校验函数
  scopes?: string | string[];      // 运行这条规则的手动派发 scope
}

type MonitorCheckFunc<T> = (
  event: ValueChangedEvent,        // 触发校验的变更事件，手动派发时是手动事件
  model: HxObject<T>,              // 响应式模型
  context: HxContext               // 组件上下文
) => CheckResult;

type CheckResult =
  | undefined                      // 通过——无错误
  | string                         // 错误消息（红色）
  | { level: 'warn' | 'error'; message: ReactNode };  // 带级别的消息
```

`$check` 只接受一条规则。同一字段的多个检查写在同一个 `handle` 里，返回第一条失败；校验依赖其他字段时，把它们全部列进 `on`。

- **`on`**：要监听的模型字段路径。不指定时，HOC 使用创建时传入的 `$supplyOn`（通常是被包装组件的 `$field`）。两者都没有时，规则不会随值变化运行：会打印一条警告，规则只在[手动派发](#手动派发)时运行。只有预置组件（使用 `HxWithCheckWithSingleFieldOptions` 创建）会自动提供 `$field`。
- **`handle`**：监听的字段变化时被调用，手动派发规则时也会被调用。返回 `undefined` 表示通过，`string` 表示错误消息，`{ level, message }` 支持警告（黄色）或错误（红色）两种级别。
- **`scopes`**：把规则限定在指定了其中某个 scope 的手动派发里，值变化不受它影响。见[手动派发](#手动派发)。

### 常见模式

```tsx
// 单字段校验（省略 `on`——仅在 HOC 创建时提供了 $supplyOn 时有效）
<ValidatedInput
  $model={form}
  $field="email"
  $check={{
    handle: (event, model) => {
      if (!model.email) return '必填';
      return undefined;
    },
  }}
/>

// 多字段关联校验（显式指定 `on`）
<ValidatedInput
  $model={form}
  $field="confirmPassword"
  $check={{
    on: ['password', 'confirmPassword'],
    handle: (event, model) => {
      if (model.password !== model.confirmPassword) return '两次密码不一致';
      return undefined;
    },
  }}
/>

// 同一字段多条校验：写在同一个 handle 里，返回第一条失败
<ValidatedInput
  $model={form}
  $field="username"
  $check={{
    handle: (event, model) => {
      if (!model.username) return '用户名必填';
      if (model.username.length < 3) return '至少 3 个字符';
      return undefined;
    },
  }}
/>

// 警告级别消息（黄色，非阻断）
$check={{
  handle: (event, model) => {
    if (model.stock < 10) return { level: 'warn', message: '库存不足' };
    return undefined;
  },
}}
```

### alwaysKeepMessageDOM

为 `true` 时，消息 DOM 始终存在（无错误时显示空文本），防止校验消息出现/消失导致的布局抖动：

```tsx
<ValidatedInput
  $model={form} $field="email"
  $check={{ handle: validateEmail }}
  alwaysKeepMessageDOM
/>
```

### 手动派发

每个验证组件都会把自己的规则注册到 provider，调用一次即可全部运行，例如在提交时。`useHxContext().checks.check(callback, scopes?)` 运行已注册的规则并更新各自的消息。有规则返回消息时，它在下一帧调用 `callback(true, errors)`，这时消息已经渲染出来；否则立即调用 `callback(false)`。

- `hasError`：至少有一条规则返回了消息时为 `true`，`warn` 级别也算。
- `errors`：按规则的运行顺序列出结果，每项是 `{ error, el }`，即 `CheckResultWithLevel` 和对应消息的元素。
- `el` 只是用来辅助滚动或聚焦到消息的。消息元素渲染出来之后它就是该元素，规则没有渲染消息时它没有值。
- `scopes` 用来选择要运行的规则。带 `scopes` 的规则只在派发指定了其中之一时运行；`scopes` 里含 `AnyCheckScope` 或没有 `scopes` 的规则，每次派发都运行。不指定 `scopes` 的派发，或数组里含 `AnyCheckScope` 的派发，会运行全部规则。

```tsx
const context = useHxContext();

// 运行全部规则，都没有返回消息才保存
const onSave = () => {
  context.checks.check(hasError => {
    if (!hasError) save();
  });
};

// 运行 "save" scope 的规则，以及所有每次派发都运行的规则
context.checks.check(onChecked, 'save');
```

```tsx
// 只有 "save" 派发才会运行的规则
$check={{ scopes: ['save'], handle: (event, model) => model.agreed ? undefined : '请同意条款' }}
```

规则收到的是一个 `pathToParent` 为 `ManualCheckField` 的变更事件，因为并没有值变化。

---

## HxCheckMessage

独立的验证消息展示——适用于消息需要与输入框分离显示，或要进行不绑定单一输入框的跨字段校验。

```tsx
<HxCheckMessage
  $model={form}
  $check={{
    on: ['password', 'confirmPassword'],
    handle: (event, model) => {
      if (model.password !== model.confirmPassword) return '两次密码不一致';
      return undefined;
    },
  }}
  $checkProps={{}}
  $supplyOn={() => ['password', 'confirmPassword']}
/>
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$check` | `DynamicCheck` | — | 验证规则，只有一条 |
| `$checkProps` | `P` | — | 传递给 `$supplyOn` 的 props |
| `$supplyOn` | `(props: P) => string \| string[]` | — | 返回监听的字段路径；作为未指定 `on` 的校验的默认监听路径 |
| `alwaysKeepMessageDOM` | `boolean` | `false` | 始终渲染消息 DOM |

显示消息期间，元素上带有 `data-hx-checked="warn"` 或 `data-hx-checked="error"`。

---

## 预置验证组件

每个通过 `HxWithCheck(BaseComponent, HxWithCheckWithSingleFieldOptions)` 创建（textarea 与 upload 变体是手写包装），接受基础组件所有 props 外加 `$check`、`alwaysKeepMessageDOM`、`$domCheckBox`、`$domCheckMsg`：

| 组件 | 基础组件 |
|------|----------|
| `HxWithCheckInput` | `HxInput` |
| `HxWithCheckFormatInput` | `HxFormatInput` |
| `HxWithCheckTextarea` | `HxTextarea` |
| `HxWithCheckSelect` | `HxSelect` |
| `HxWithCheckCheckbox` | `HxCheckbox` |
| `HxWithCheckRadio` | `HxRadio` |
| `HxWithCheckMCheckbox` | `HxMCheckbox` |
| `HxWithCheckMRadio` | `HxMRadio` |
| `HxWithCheckMSelect` | `HxMSelect` |
| `HxWithCheckDateTimePicker` | `HxDateTimePicker` |
| `HxWithCheckTable` | `HxTable` |
| `HxWithCheckUpload` | `HxUpload` |

---

## 创建自定义验证组件

```tsx
import { HxWithCheck } from '@hx/components';

// 可选：提供 $supplyOn 告诉 HOC 默认监听哪些字段
const ValidatedCustom = HxWithCheck(MyComponent, {
  $supplyOn: (props) => props.$field,  // 默认监听组件自身的 $field
});
```

提供 `$supplyOn` 后，任何省略 `on` 的 `DynamicCheck` 将使用此路径作为监听路径。这就是 `HxWithCheckInput` 的工作方式——`on` 由 `$field` 自动推断。

## 全局配置

```ts
import { configHxWithCheck } from '@hx/components';
configHxWithCheck({ alwaysKeepMessageDOM: false });
```
