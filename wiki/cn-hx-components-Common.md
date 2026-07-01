# 公共概念

适用于所有 Hx 组件的共享模式：响应式绑定、全局配置、样式约定和事件转发。

---

## $model / $field 模式

所有表单类组件都接受 `$model`（响应式 `HxObject<T>`）和 `$field`（`ModelPath<T> | HxDataPath`）用于双向数据绑定。

```tsx
const model = reactive({ user: { name: '张三', role: 'admin' } });

// 读取模型值，变更时自动写回
<HxInput $model={model} $field="user.name" />
```

值通过 `ERO.getValue(model, field)` 读取，通过 `ERO.setValue(model, field, value)` 写入。变更会触发组件注册的响应式监听器。

### 模型的自动传递

`$model` 通过 `DOMUtils.interposeToChildren()` 自动传递给子组件。只需在顶层容器指定 `$model`：

```tsx
<HxPanel $model={form} title="个人资料">
  <HxInput $field="user.name" />   {/* $model 自动继承 */}
  <HxSelect $field="user.role" options={roles} />  {/* $model 自动继承 */}
</HxPanel>
```

### 响应式禁用/只读

支持 `$disabled` 或 `$readonly` 的组件接受一个接收模型并返回布尔值的函数：

```tsx
<HxButton text="保存" $disabled={(m) => !m.dirty} />
<HxInput $model={form} $field="name" $readonly={(m) => m.locked} />
```

### 响应式可见性（Tabs）

标签页支持 `$visible` 实现响应式显隐：

```tsx
{ mark: 'admin', header: '管理员', body: <AdminTab />, $visible: (m) => m.isAdmin }
```

---

## 全局配置

每个组件组暴露一个 `configHx*()` 函数。默认值在渲染时读取（非闭包捕获），配置即时全局生效。

```ts
import {
  configHxCommon,
  configHxButton,
  configHxInput,
  configHxSelect,
  configHxTextarea,
  configHxCheckbox,
  configHxBadge,
  configHxBox,
  configHxFlex,
  configHxGrid,
  configHxLabel,
  configHxSeparator,
  configHxPanel,
  configHxPagination,
  configHxTabs,
  configHxUpload,
  configHxOverlay,
  configHxPopup,
  configHxWithCheck,
  configHxSelectOptions,
  configHxActions,
  configHxButtonBar,
} from '@hx/components';
```

### 通用模型格式

`configHxCommon()` 设置模型值显示的全局格式模式：

```ts
configHxCommon({
  modelDateTimeFormat: '@d/ymd :hns',  // 默认：年-月-日 时:分:秒
  modelDateFormat: '@d/ymd',           // 默认：年-月-日
  modelTimeFormat: '@d:hns',           // 默认：时:分:秒
});
```

---

## 样式约定

组件使用 `data-*` 属性控制样式——不涉及 CSS-in-JS。所有设计令牌定义在 `src/styles/variables.css` 中。

```html
<button data-hx-button data-hx-color="primary" data-hx-variant="solid">...</button>
```

`HxColor`、`HxSize`、`HxDirection` 等值均为字符串字面量联合类型，直接映射到 CSS 自定义属性。

---

## 原生 DOM 事件转发

所有组件将原生 DOM 事件转发到底层 HTML 元素。未被组件内部消费的事件将透传。各元素类型支持的事件类别：

| 元素 | 事件 |
|------|------|
| `<button>` | `onClick`、`onMouseDown/Up/Enter/Leave/Move/Over/Out`、`onKeyDown/Up/Press`、`onFocus`、`onBlur`、`onTouchStart/End/Move`、`onPointerDown/Up/Enter/Leave` |
| `<input>` | 以上所有 + `onChange`、`onInput`、`onBeforeInput`、`onCompositionStart/End/Update` |
| `<textarea>` | 同 `<input>` |
| `<div>`、`<span>` | `onClick`、`onMouseDown/Up/Enter/Leave/Move/Over/Out`、`onKeyDown/Up`、`onFocus`、`onBlur`、`onScroll`、`onTouchStart/End/Move`、`onPointerDown/Up/Enter/Leave` |
| `<svg>` | 所有标准 SVG 指针/焦点事件 |

---

## Select 选项

选项系统（`HxSelectOptions`）被 `HxSelect`、`HxMCheckbox` 和 `HxMRadio` 共享。

### HxSelectOption

```ts
interface HxSelectOption {
  value: unknown;
  label: ReactNode;
  disabled?: boolean;
  [key: string]: unknown;  // 可扩展
}
```

### HxSelectOptions（联合类型）

```ts
type HxSelectOptions<T> =
  | HxSelectOption[]                                          // 静态数组
  | Iterable<HxSelectOption>                                  // 可迭代对象
  | ((search?: string) => Promise<HxSelectOption[]>)          // 异步获取
  | ((search?: string) => Iterable<HxSelectOption>);          // 同步生成器
```

三种消费组件的使用方式：

```tsx
const opts = [
  { value: 'cn', label: '中国' },
  { value: 'us', label: '美国' },
];

<HxSelect options={opts} />
<HxMCheckbox options={async (s) => fetchOptions(s)} />
<HxMRadio options={opts} />
```
