# HxWithCheck / HxCheckMessage

验证 HOC 和独立消息组件。通过自定义 `handle` 函数对模型数据做校验，由响应式字段监听触发。

---

## HxWithCheck（HOC）

将任意响应式组件包装为带验证的版本。内部通过 `ERO.on()` 订阅字段变更，当被监听的字段变化时调用 `handle` 函数，将结果作为错误/警告消息显示在被包装组件的下方。

```tsx
import { HxWithCheck } from '@hx/components';

// 包装组件
const ValidatedInput = HxWithCheck(HxInput);

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
| `$check` | `DynamicCheck \| DynamicCheck[]` | — | 一条或多条验证规则，见下方 DynamicCheck |
| `alwaysKeepMessageDOM` | `boolean` | `false` | 始终渲染消息 DOM 元素，防止布局抖动 |
| `$domCheckBox` | HTML 属性 | — | 包装 `<div>` 上的额外属性 |
| `$domCheckMsg` | HTML 属性 | — | 消息 `<span>` 上的额外属性 |

### DynamicCheck

```ts
interface DynamicCheck<T extends object> {
  on?: string | string[];          // 要监听的字段路径
  handle: MonitorCheckFunc<T>;     // 校验函数
}

type MonitorCheckFunc<T> = (
  event: ValueChangedEvent,        // 触发校验的变更事件
  model: HxObject<T>,              // 响应式模型
  context: HxContext               // 组件上下文
) => CheckResult;

type CheckResult =
  | undefined                      // 通过——无错误
  | string                         // 错误消息（红色）
  | { level: 'warn' | 'error'; message: ReactNode };  // 带级别的消息
```

- **`on`**：要监听的模型字段路径。不指定时，HOC 使用创建时传入的 `$supplyOn`（通常是被包装组件的 `$field`）。两者都不提供则校验永远不会触发。
- **`handle`**：监听的字段变化时被调用。返回 `undefined` 表示通过，`string` 表示错误消息，`{ level, message }` 支持警告（黄色）或错误（红色）两种级别。

### 常见模式

```tsx
// 单字段校验（省略 `on`——使用组件的 $field）
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

// 同一字段多条校验
<ValidatedInput
  $model={form}
  $field="username"
  $check={[
    {
      handle: (event, model) => model.username ? undefined : '用户名必填',
    },
    {
      handle: (event, model) => {
        if (model.username && model.username.length < 3) return '至少 3 个字符';
        return undefined;
      },
    },
  ]}
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
| `$check` | `DynamicCheck \| DynamicCheck[]` | — | 验证规则 |
| `$checkProps` | `P` | — | 传递给 `$supplyOn` 的 props |
| `$supplyOn` | `(props: P) => string \| string[]` | — | 返回监听的字段路径；作为未指定 `on` 的校验的默认监听路径 |
| `alwaysKeepMessageDOM` | `boolean` | `false` | 始终渲染消息 DOM |

---

## 预置验证组件

每个通过 `HxWithCheck(BaseComponent)` 创建，接受基础组件所有 props 外加 `$check`、`alwaysKeepMessageDOM`、`$domCheckBox`、`$domCheckMsg`：

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
