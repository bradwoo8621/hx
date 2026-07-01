# HxSelect / HxWithCheckSelect

下拉选择组件，支持可选的筛选、排序和清除功能。内部使用 `HxPopup` 进行定位。

`HxWithCheckSelect` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

```tsx
// 静态选项
<HxSelect $model={form} $field="country" options={[
  { value: 'cn', label: '中国' },
  { value: 'us', label: '美国' },
]} />

// 异步选项，带筛选和清除
<HxSelect
  $model={form} $field="user"
  options={async (search) => fetchUsers(search)}
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
  placeholder="请选择产品..."
  minPopupWidth={300}
  maxPopupHeight={400}
/>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `$model` | `HxObject<T>` | — | 响应式模型 |
| `$field` | `ModelPath<T> \| HxDataPath` | — | 模型字段路径 |
| `options` | `HxSelectOptions<T>` | — | 选项源（[参见 Common](./cn-hx-components-Common#select-options)） |
| `clearable` | `boolean` | — | 显示清除按钮以重置值 |
| `filter` | `boolean` | — | 在弹出层中显示筛选输入框 |
| `sort` | `boolean` | — | 按标签字母排序 |
| `placeholder` | `ReactNode \| boolean` | `true` | 未选中时的占位文本。`true` = 默认 i18n 键名 |
| `showSelectedOnPopupOpen` | `boolean` | `true` | 打开弹出层时滚动到并高亮当前选中项 |
| `filterWhenOptionExceed` | `number` | `8` | 当选项总数超过此值时自动启用筛选 |
| `minPopupWidth` | `number` | — | 弹出层最小宽度（像素） |
| `maxPopupHeight` | `number` | `258` | 弹出层最大高度（像素） |
| `zIndex` | `number` | — | 弹出层 z-index |
| `gapToEdge` | `number` | — | 触发器与弹出层间距（像素） |

## 弹出层 Props（HxSelectPopup）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `optionsOnLoadKey` | i18n 键名 | `'~HxCommon.OnLoading'` | 异步加载中的标签 |
| `noOptionsKey` | i18n 键名 | `'~HxCommon.NoOptions'` | 无匹配选项时的标签 |
| `filterPlaceholderKey` | i18n 键名 | `'~HxCommon.Filter'` | 筛选输入框的占位文本 |

## 键盘导航

- **上/下箭头** — 在选项间导航（使用 DOM 属性操作，避免大量选项时重新渲染）
- **Enter** — 选中高亮选项
- **Escape** — 关闭弹出层
- **Tab** — 弹出层内焦点循环（在筛选输入框和选项间跳转）

## 内部事件系统

Select 使用 `EventEmitter` 进行触发器与弹出层通信：
- `EvtHxSelect_OptionSelect` — 选项被点击/选中
- `EvtHxSelect_HoverPreviousOption` — 上箭头
- `EvtHxSelect_HoverNextOption` — 下箭头
- `EvtHxSelect_SelectHoverOption` — Enter 确认高亮项
- `EvtHxSelect_ClosePopup` — Escape 或点击外部

## 原生 DOM 事件

触发器输入框和弹出层转发所有标准 DOM 事件。

## 全局配置

```ts
import { configHxSelect } from '@hx/components';
configHxSelect({
  filterWhenOptionExceed: 8,
  maxPopupHeight: 258,
  showSelectedOnPopupOpen: true,
});
```
