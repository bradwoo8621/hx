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

### 响应式状态——`$visible` / `$disabled` / `$readonly`

这三个 prop 支持三种写法：

- `boolean`——状态固定不变。
- `(model) => boolean`——函数形式，在组件挂载时以及函数引用变化时（实际就是父组件重渲染并传入新的内联函数时）求值；**模型数据变化时不会重新求值**，因此只适合在父组件这次渲染的生命周期内保持静态的值。
- `{ on, handle, default }`——监听对象。`on` 是一条模型路径或路径数组；这些路径任一变化时执行 `handle(event, model, context)`。`default`（布尔值或 `(model) => boolean`）提供初始值；省略时 `$visible` 初始为 `true`，`$disabled` / `$readonly` 初始为 `false`。

需要跟随模型变化的状态请用监听对象形式：

```tsx
<HxButton
  text="保存"
  $disabled={{on: 'dirty', handle: (_ev, m) => !m.dirty, default: (m) => !m.dirty}}
/>
<HxInput
  $model={form}
  $field="name"
  $readonly={{on: 'locked', handle: (_ev, m) => m.locked, default: (m) => m.locked}}
/>
```

初始值来自 `default`，不会执行 `handle` 去推导；如果挂载时模型可能已经满足条件，请传 `default`（通常写成读取模型的函数）。

监听对象的 `handle` 必须对模型只读——在 handler 里修改 `$model` 不受支持。

Tabs 的每个 tab 对 `$visible` / `$disabled` 同样支持这三种写法：

```tsx
{ mark: 'admin', header: '管理员', body: <AdminTab />,
  $visible: {on: 'isAdmin', handle: (_ev, m) => m.isAdmin, default: (m) => m.isAdmin} }
```

---

## 全局配置

每个组件组暴露一个 `configHx*()` 函数。默认值在渲染时读取（非闭包捕获），配置即时全局生效。

```ts
import {
  configHxCommon,
  configHxCallout,
  configHxButton,
  configHxInput,
  configHxFormatInput,
  configHxSelect,
  configHxTextarea,
  configHxCheckbox,
  configHxMCheckbox,
  configHxMRadio,
  configHxRadio,
  configHxBadge,
  configHxBox,
  configHxFlex,
  configHxGrid,
  configHxLabel,
  configHxSeparator,
  configHxPanel,
  configHxPagination,
  configHxTabs,
  configHxTable,
  configHxDateTimePicker,
  configHxUpload,
  configHxOverlay,
  configHxWithCheck,
  configHxActions,
  configHxButtonBar,
  configHxTooltip,
  configHxWithPopup,
} from '@hx/components';
```

### 通用模型格式

`configHxCommon()` 设置模型值显示的全局格式模式：

```ts
configHxCommon({
  datetimeValueFormat: 'y/m/dTh:n:s',  // 默认：年-月-日T时:分:秒
  dateValueFormat: 'y/m/d',            // 默认：年-月-日
  timeValueFormat: 'h:n:s',            // 默认：时:分:秒
});
```

---

## 工具提示（附属物）

Tooltip 是附属物，而非独立组件。任何接受公共 props 的组件都能通过共享的 `tooltip` prop 附加提示，悬停/聚焦接线由 `usePropsToDomExpose` 自动完成；需要完全掌控时，组件使用工具提示上下文（`useHxTooltip`）。

```tsx
<HxButton text="Hover" tooltip="A short hint" />
<HxButton text="Hover" tooltip={{ content: 'Below', position: 'bottom' }} />
```

12 种位置、Context API 及 `configHxTooltip` 默认值详见 [Tooltip](./cn-hx-tooltip)。

---

## 样式约定

组件使用 `data-*` 属性控制样式——不涉及 CSS-in-JS。所有设计令牌定义在 `src/styles/variables/` 目录中，按类别拆分并由 `variables/index.css` 汇总。组件样式被组织为 `src/styles/common/` 中的共享规则与 `src/styles/components/<name>/` 中的按组件模块；每个模块设置共享规则消费的样式槽变量（`--hx-*-this` / `--hx-*-this-default`），因此父组件或使用者只需设置一个槽变量即可覆盖组件的单个外观，而无需重写其内部样式。

```html
<button data-hx-button data-hx-color="primary" data-hx-variant="solid">...</button>
```

`HxColor`、`HxSize`、`HxDirection` 等值均为字符串字面量联合类型，直接映射到 CSS 自定义属性。

### 级联层（Cascade Layer）

所有样式表都导入到 `hx` 级联层中：`src/styles/index.css` 以 `layer(hx)` 导入每个文件，构建产物 `hx-components.css` 则以单个 `@layer hx { ... }` 代码块输出。因此未分层的应用样式始终优先于 hx 样式，与选择器特异性无关——覆盖组件样式既不需要 `!important`，也不需要更强的选择器。

```css
/* 未分层规则，可覆盖任意 hx 规则的同名属性 */
.my-button {
  text-transform: none;
}
```

设计令牌同理：在未分层的 CSS 中声明令牌即可覆盖 hx 默认值。组件字体令牌（`--hx-button-font-family`、`--hx-input-font-family` 等）默认取值为 `--hx-font-family`，且各处 `font-family` 声明直接以该令牌作为完整字体栈，因此覆盖时若字体栈需要通用字族（如 `system-ui`），请写入令牌取值中。

### 全局重置

组件库只重置自己的部分：`box-sizing: border-box` 与 `div { position: relative }` 均限定在 `[data-hx-root]`、`[data-hx-portal-root]` 子树内，宿主页面保留自己的盒模型。

`html` 与 `body` 的重置由 `data-hx-reset-styles` 属性控制：

| 元素 | 属性 | 开关 |
|------|------|------|
| `<html>` | `data-hx-reset-styles` | `HxContextProvider` 的 `resetHtmlStyles` 属性 |
| `<body>` | `data-hx-reset-styles` | `HxContextProvider` 的 `resetBodyStyles` 属性 |

两者默认均为 `true`。可在 provider 上单独关闭，或全局配置：

```tsx
<HxContextProvider resetHtmlStyles={false} resetBodyStyles={false}>
  <App />
</HxContextProvider>
```

```ts
configHxContext({ resetHtmlStyles: false, resetBodyStyles: false });
```

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

## 临时瘫痪

一个名字故意起得很怪的数据属性，用于在一次短暂操作期间锁住控件：

```tsx
el.setAttribute('data-hx-temporary-paralysis', '');
```

目前只有 `HxSelect` 支持。属性存在期间，select 输入区会忽略指针激活、键盘激活和清空按钮，因此下拉框无法打开。它不是视觉上的 `disabled` 状态——控件外观与焦点保持不变——而且只守住了入口：已经展开的菜单不在其范围内。

`HxPagination` 在页码或页大小请求进行中会给两个 select 都设置该属性，避免 select 发起第二个请求。只在"需要在不改变 `$disabled` 的前提下锁住控件"时使用；常规禁用仍应使用 `$disabled`。

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
