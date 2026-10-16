# HxMSelect / HxWithCheckMSelect

多选下拉组件，基于单选 [Select](./cn-hx-components-Select)——弹出层、筛选与键盘行为一致，但为多选语义：模型值为选中项值的数组，在弹出层中点击选项进行切换（toggle），选中的选项在输入框中以可移除的 badge 形式展示。

`HxWithCheckMSelect` 添加验证功能（参见 [WithCheck](./cn-hx-components-WithCheck)）。

模型值可通过 `toModel`/`fromModel` 转换器支持任意结构；不配置时字段直接保存选中数组。清空选择时向模型写入 `(void 0)`。

compact 模式下选中项单行展示，超出的选项折叠为 `+N` badge；默认（非 compact）模式下每个选中项渲染为带移除按钮的 badge，在输入框或 badge 上按 `Delete`/`Backspace`（Mac）可移除选择。弹出层中选中项以勾选图标标记，compact 模式下还排序置顶（启用选项排序时，各组内部仍按排序规则排列）。

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
| `compact` | `boolean` | `false` | 单行展示，超出折叠为 `+N` badge；弹出层中选中项置顶 |

## 弹出层 Props（HxMSelectPopup）

与 [Select 弹出层 props](./cn-hx-components-Select#popup-props-hxselectpopup) 相同，i18n 键定义在 `HxMSelectDefaults`。

## 键盘导航

与 [Select 键盘导航](./cn-hx-components-Select#键盘导航) 相同。

## 内部事件系统

与 select 的 `EventEmitter` 对应，事件名前缀为 `EvtHxMSelect_*`：
- `EvtHxMSelect_OptionSelectedChange` — 选项点击/切换（输入框更新模型值）
- `EvtHxMSelect_OptionDeselect` — 通过 badge 移除按钮移除选项（弹出层清除其选中标记）
- `EvtHxMSelect_OptionDeselectAll` — 清空全部选择（弹出层清除所有选中标记）
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
