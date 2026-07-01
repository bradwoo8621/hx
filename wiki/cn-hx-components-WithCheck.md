# HxWithCheck / HxCheckMessage

验证 HOC 和独立消息组件。为任何响应式组件添加模型验证。

## HxWithCheck（HOC）

将任意表单组件包装为带验证规则和错误消息显示。

```tsx
import { HxWithCheck } from '@hx/components';

// 即时包装
const ValidatedInput = HxWithCheck(HxInput);

<ValidatedInput
  $model={form}
  $field="email"
  $check={{
    required: true,
    pattern: /^[^\s@]+@[^\s@]+$/,
    message: '请输入有效的邮箱地址',
  }}
/>

// 始终保留消息 DOM 以维持布局稳定
<ValidatedInput
  $model={form}
  $field="username"
  $check={{ required: true, minLength: 3 }}
  alwaysKeepMessageDOM
/>
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$check` | `CheckProps` | — | 验证规则对象 |
| `alwaysKeepMessageDOM` | `boolean` | `false` | 始终渲染消息 DOM 元素；防止布局抖动 |
| `$domCheckBox` | HTML 属性 | — | 包装 `<div>` 上的额外属性 |
| `$domCheckMsg` | HTML 属性 | — | 消息元素上的额外属性 |

### 验证规则

| 规则 | 类型 | 说明 |
|------|------|------|
| `required` | `boolean` | 值不能为空 |
| `pattern` | `RegExp` | 值必须匹配正则表达式 |
| `minLength` | `number` | 最小字符串长度 |
| `maxLength` | `number` | 最大字符串长度 |
| `custom` | `(value, model?) => true \| string` | 自定义验证器。返回 `true` 表示通过，或返回错误消息字符串 |
| `message` | `string` | 自定义错误消息（覆盖默认消息） |

### 自定义验证器

```tsx
// 简单自定义检查
$check={{ custom: (v) => v >= 18 || '必须年满 18 岁' }}

// 跨字段校验
$check={{
  custom: (value, model) => {
    if (model.password !== model.confirmPassword) return '两次密码不一致';
    return true;
  },
}}
```

---

## HxCheckMessage

独立的验证消息展示——适用于跨字段验证或消息需与输入框分开显示的场景。

```tsx
<HxCheckMessage
  $model={form}
  $check={{
    custom: (_, m) => m.password === m.confirmPassword ? true : '两次密码不一致',
  }}
  $checkProps={{}}
  $supplyOn={() => ['password', 'confirmPassword']}
/>
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$check` | `CheckProps` | — | 验证规则 |
| `$checkProps` | `P` | — | 传递给 `$supplyOn` 的 props |
| `$supplyOn` | `(props: P) => CheckPropSuppliedOn` | — | 返回需监听的字段路径数组，用于重新验证 |
| `alwaysKeepMessageDOM` | `boolean` | `false` | 始终渲染消息 DOM |

---

## 预置验证组件

每个通过 `HxWithCheck(BaseComponent)` 创建，接受所有基础组件 props 外加 `$check`、`alwaysKeepMessageDOM`、`$domCheckBox`、`$domCheckMsg`：

| 组件 | 基础组件 |
|------|----------|
| `HxWithCheckInput` | `HxInput` |
| `HxWithCheckFormatInput` | `HxFormatInput` |
| `HxWithCheckTextarea` | `HxTextarea` |
| `HxWithCheckSelect` | `HxSelect` |
| `HxWithCheckCheckbox` | `HxCheckbox` |
| `HxWithCheckRadio` | `HxRadio` |
| `HxWithCheckUpload` | `HxUpload` |

```tsx
<HxWithCheckInput $model={form} $field="email" $check={{ required: true }} />
<HxWithCheckSelect $model={form} $field="country" $check={{ required: true }} options={list} />
```

## 全局配置

```ts
import { configHxWithCheck } from '@hx/components';
configHxWithCheck({ alwaysKeepMessageDOM: false });
```
