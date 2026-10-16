# HxMSelect / HxWithCheckMSelect

多选下拉组件。当前为单选 [Select](./cn-hx-components-Select) 的完整克隆——props、弹出层、键盘行为与样式完全一致；多选语义（值数组、`toModel`/`fromModel` 转换、`maxChecked`、`compact`）将在后续分化。

`HxWithCheckMSelect` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

选中项文本过长时单行截断显示省略号。

```tsx
// 静态选项
<HxMSelect $model={form} $field="country" options={[
  { value: 'cn', label: '中国' },
  { value: 'us', label: '美国' },
]} />

// 异步选项，带筛选和清除
<HxMSelect
  $model={form} $field="user"
  options={async (search) => fetchUsers(search)}
  filter
  clearable
/>

// 选项超过 5 个时自动显示筛选框
<HxMSelect
  $model={form} $field="city"
  options={cityList}
  filterWhenOptionExceed={5}
/>
```

## Props

与 [Select props](./cn-hx-components-Select#props) 相同，另加：

`HxMSelect` 的 `clearable` 默认为 `true`（单选 Select 无默认值）；可通过 `configHxMSelect({ clearable: false })` 全局配置。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `toModel` | `(value: Array<any>) => any` | — | 将选中的显示值数组转换为模型值 |
| `fromModel` | `(value: any) => Array<any>` | — | 将模型值转换为选中的显示值数组 |
| `maxChecked` | `number` | — | 最大同时选中数量（预留） |
| `compact` | `boolean` | `false` | 紧凑渲染（预留） |

## 弹出层 Props（HxMSelectPopup）

与 [Select 弹出层 props](./cn-hx-components-Select#popup-props-hxselectpopup) 相同，i18n 键定义在 `HxMSelectDefaults`。

## 键盘导航

与 [Select 键盘导航](./cn-hx-components-Select#键盘导航) 相同。

## 内部事件系统

与 select 的 `EventEmitter` 对应，事件名前缀为 `EvtHxMSelect_*`：
- `EvtHxMSelect_OptionSelectedChange` — 选项点击/选中
- `EvtHxMSelect_HoverPreviousOption` — Arrow Up
- `EvtHxMSelect_HoverNextOption` — Arrow Down
- `EvtHxMSelect_SelectHoverOption` — Enter 选中高亮项
- `EvtHxMSelect_ClosePopup` — Escape 或点击外部

## 全局配置

```ts
import { configHxMSelect } from '@hx/components';
configHxMSelect({
  clearable: false, // 默认：true
  filterWhenOptionExceed: 8,
  maxPopupHeight: 258,
  showSelectedOnPopupOpen: true,
});
```

也可通过链式设置 API：`HxSettings.mSelect({...})`。
