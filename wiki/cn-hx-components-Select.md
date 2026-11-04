# HxSelect / HxWithCheckSelect

下拉选择组件，支持可选的筛选、排序和清除功能。内部使用 `HxPopup` 进行定位。

`HxWithCheckSelect` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

选中项文本过长时单行截断显示省略号。

```tsx
// 静态选项
<HxSelect $model={form} $field="country" options={[
  { value: 'cn', label: '中国' },
  { value: 'us', label: '美国' },
]} />

// 异步选项，带筛选和清除——options 接收 (model, context)，不是搜索字符串
<HxSelect
  $model={form} $field="user"
  options={async (model, context) => fetchUsers(model, context)}
  filter
  clearable
/>

// 选项超过 5 个时自动显示筛选框
<HxSelect
  $model={form} $field="city"
  options={cityList}
  filterWhenOptionExceed={5}
/>

// 完整配置
<HxSelect
  $model={form} $field="product"
  options={productOpts}
  filter
  sort
  clearable
  placeholderKey="请选择产品..."
  minPopupWidth={300}
  maxPopupHeight={400}
  popupPosition="bottom"
  popupAlignTo="right"
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `options` | `HxSelectOptions<T>` | — | 选项源（[参见 Common](./cn-hx-components-Common#select-options)） |
| `optionsDependsOn` | `HxDataPath \| HxDataPath[]` | — | 给定路径变化时重新加载选项 |
| `onOptionsChange` | `'none' \| 'clear' \| (options) => HxSelectOption \| undefined` | `'clear'` | 选项变化时如何处理当前值 |
| `clearable` | `boolean` | — | 显示清除按钮以重置值；同时启用 Delete（Mac 上 Backspace）清除 |
| `filter` | `boolean \| undefined` | — | 显示筛选输入框。省略时，选项数达到 `filterWhenOptionExceed` 后自动显示；`false` 关闭 |
| `sort` | `boolean` | — | 按标签字母排序 |
| `selectedLabel` | `(option: HxSelectOption) => ReactNode` | — | 由选中选项渲染闭合态控件的标签（选项自身的 `selectedLabel` 字段优先） |
| `placeholder` | `boolean` | `true` | 未选中时是否显示占位文本 |
| `placeholderKey` | `ReactNode` | `'~HxCommon.SelectPlaceholder'` | 占位文本或 i18n 键名 |
| `downIcon` | `ReactNode` | — | 自定义下拉图标 |
| `showSelectedOnPopupOpen` | `boolean` | `true` | 打开弹出层时滚动到并高亮当前选中项 |
| `filterWhenOptionExceed` | `number` | `8` | 选项数 **>=** 此值时自动启用筛选（配置最小钳制为 8） |
| `minPopupWidth` | `number` | — | 弹出层最小宽度（像素） |
| `maxPopupHeight` | `number` | `258` | 弹出层最大高度（像素）；配置最小钳制为 200 |
| `sameWidthAtMinimum` | `boolean` | `true` | 弹出层最小宽度等于触发器 |
| `enterToOpenPopup` | `boolean` | `false` | 关闭状态下 Enter 打开弹出层 |
| `spaceToOpenPopup` | `boolean` | `true` | 关闭状态下 Space 打开弹出层 |
| `popupPosition` | `'top' \| 'bottom'` | — | 强制弹出在触发器下方 / 上方，不使用自动检测 |
| `popupAlignTo` | `'left' \| 'right'` | — | 强制与触发器的水平对齐方式；按逻辑方向解释，RTL 下镜像 |
| `zIndex` | `number` | — | 弹出层 z-index |
| `gapToEdge` | `number` | — | 弹出层与**视口**边缘的最小间距（像素） |

## 弹出层 Props（HxSelectPopup）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `optionsOnLoadKey` | `ReactNode` | `'~HxCommon.SelectOptionsOnLoad'` | 异步加载中的标签 |
| `noOptionsKey` | `ReactNode` | `'~HxCommon.SelectNoOptions'` | 无匹配选项时的标签 |
| `filterPlaceholderKey` | `ReactNode` | `'~HxCommon.SelectFilterPlaceholder'` | 筛选输入框的占位文本 |

筛选是对已加载选项标签做不区分大小写的子串匹配，纯客户端；在筛选框中输入不会重新请求选项源。

## 键盘导航

- **上/下箭头** — 关闭时打开弹出层；打开时移动高亮（使用 DOM 属性操作，避免大量选项时重新渲染）。禁用的选项会被跳过
- **Enter** — 选中高亮选项；关闭时只有设置 `enterToOpenPopup` 才打开
- **Space** — 关闭时在 `spaceToOpenPopup` 开启时打开；打开时选中
- **Escape** — 关闭弹出层
- **Delete** / **Backspace（Mac）** — `clearable` 时清除值
- **Tab** — 没有焦点陷阱：在触发器上 Tab 进入筛选输入框；在筛选框中 Shift+Tab 回到触发器，Tab 进入下一个可聚焦节点

## 内部事件系统

Select 使用 `EventEmitter` 进行触发器与弹出层通信：
- `EvtHxSelect_OptionSelect` — 选项被点击/选中
- `EvtHxSelect_HoverPreviousOption` — 上箭头
- `EvtHxSelect_HoverNextOption` — 下箭头
- `EvtHxSelect_SelectHoverOption` — Enter 确认高亮项
- `EvtHxSelect_ClosePopup` — Escape 或点击外部
- `EvtHxSelect_GetSelect` — 触发器请求 select DOM 节点
- `EvtHxSelect_GetFilterInput` — 触发器请求筛选输入框 DOM 节点

## 原生 DOM 事件

触发器输入框和弹出层转发所有标准 DOM 事件，但实际很少需要——选中值通过 `$model`/`$field` 管理，键盘导航由组件内部处理。仅在需要跟踪焦点状态时使用 `onFocus`/`onBlur`。

## 全局配置

```ts
import { configHxSelect } from '@hx/components';
configHxSelect({
  filterWhenOptionExceed: 8,
  maxPopupHeight: 258,
  showSelectedOnPopupOpen: true,
});
```
