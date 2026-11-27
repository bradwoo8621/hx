# data-hx-* 属性

所有组件使用 `data-hx-*` 属性作为 CSS 选择器与内部状态的载体。每个属性都由 `src/utils/props.ts` 中共享的 data attribute computer 产生——要么来自一个专用 prop，要么来自直接透传的 `data-*` prop。

## HxOmittedDataAttributes

由组件**内部**管理。它们被排除在公共 props 之外——从外部设置不会生效，组件始终写入自己的值。其中一部分是类型标识（始终存在），另一部分承载状态（仅在激活时存在）。

### 组件类型标识

每个组件在根 DOM 元素上写入自己的类型标识 `<div data-hx-xxx="">`。

| 属性                      | 组件                                       | 形态                                    |
|------------------------|----------------------------------------|-----------------------------------|
| `data-hx-label`        | `HxLabel`                              | `<span data-hx-label="">`         |
| `data-hx-badge`        | `HxBadge`                              | `<span data-hx-badge="">`         |
| `data-hx-svg-icon`     | `computeSvgIconDefaults`（icons/utils）  | `<svg data-hx-svg-icon="">`       |
| `data-hx-input`        | `HxInput`                              | `<input data-hx-input="">`        |
| `data-hx-format-input` | `HxFormatInput`                        | `<input data-hx-format-input="">` |
| `data-hx-textarea`     | `HxTextarea`                           | `<textarea data-hx-textarea="">`  |
| `data-hx-checkbox`     | `HxCheckbox`                           | `<div data-hx-checkbox="">`       |
| `data-hx-m-checkbox`   | `HxMCheckbox`                          | `<div data-hx-m-checkbox="">`     |
| `data-hx-radio`        | `HxRadio`                              | `<div data-hx-radio="">`          |
| `data-hx-m-radio`      | `HxMRadio`                             | `<div data-hx-m-radio="">`        |
| `data-hx-select`       | `HxSelect`                             | `<div data-hx-select="">`         |
| `data-hx-m-select`     | `HxMSelect`                            | `<div data-hx-m-select="">`       |
| `data-hx-dtp`          | `HxDateTimePicker`                     | `<div data-hx-dtp="">`            |
| `data-hx-button`       | `HxButton`                             | `<button data-hx-button="">`      |
| `data-hx-actions`      | `HxActions`                            | `<div data-hx-actions="">`        |
| `data-hx-upload`       | `HxUpload`                             | `<div data-hx-upload="">`         |
| `data-hx-separator`    | `HxSeparator`                          | `<div data-hx-separator="">`      |
| `data-hx-options-label` | `HxOptionsLabel`                      | `<span data-hx-options-label="">` |
| `data-hx-callout`      | `HxCallout`                            | `<div data-hx-callout="">`        |
| `data-hx-box`          | `HxBox`                                | `<div data-hx-box="">`            |
| `data-hx-flex`         | `HxFlex`                               | `<div data-hx-flex="">`           |
| `data-hx-grid`         | `HxGrid`                               | `<div data-hx-grid="">`           |
| `data-hx-panel`        | `HxPanel`                              | `<div data-hx-panel="">`          |
| `data-hx-button-bar`   | `HxButtonBar`                          | `<div data-hx-button-bar="">`     |
| `data-hx-tabs`         | `HxTabs`                               | `<div data-hx-tabs="">`           |
| `data-hx-pagination`   | `HxPagination`                         | `<div data-hx-pagination="">`     |
| `data-hx-overlay`      | `HxOverlay`                            | `<div data-hx-overlay="">`        |
| `data-hx-alert`        | `HxAlert`                              | `<div data-hx-alert="">`          |
| `data-hx-toast`        | `HxToast`                              | `<div data-hx-toast="">`          |
| `data-hx-popup`        | `HxPopup`                              | `<div data-hx-popup="">`          |
| `data-hx-with-check`   | `HxWithCheck`（HOC）、`HxTextarea`        | `<div data-hx-with-check="">`     |

### 根 / Portal / 主题 / 语言

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-root`        | `HxContextProvider` | `<div data-hx-root="">` —— 最外层应用容器 |
| `data-hx-portal-root` | `HxPopupProvider`、`HxOverlayPortalRoot`、`HxTooltipProvider`、`UploadItemGalleryPreview` | `<div data-hx-portal-root="">` —— 挂载到 `document.body` 的 portal 目标 |
| `data-hx-theme`       | `HxContextProvider`、`HxPopupProvider`、`HxOverlayPortalRoot`、`HxTooltipProvider`、`UploadItemGalleryPreview` | 在 `[data-hx-root]` 与 `[data-hx-portal-root]` 上 `setAttribute('data-hx-theme', value)` —— 当前主题代码，可供使用方 CSS 选择器使用 |
| `data-hx-language`    | 同上 | 在 `[data-hx-root]` 与 `[data-hx-portal-root]` 上写入当前语言 |
| `data-hx-reset-styles` | `HxContextProvider` | 在 `<html>` 与 `<body>` 上 `setAttribute('data-hx-reset-styles', '')` —— 应用全局重置 |
| `data-hx-origin-pointer-events` | `BodyScrollLock` | popup 层打开期间设置在 `<body>` 上；在把 `pointer-events` 置为 `none` 前保存原值 |
| `data-hx-hierarchy-context` | `HxHierarchyProvider`（绑定的根：tabs 根、tab header、tab body、panel 根、overlay portal 根） | 由 `bind()` 写入；值为注册的上下文名，元素同时携带 Symbol 键的上下文句柄——见 [Hooks](./cn-hx-components-Hooks#usehxhierarchy) |

### 公共属性

这些属性由共享的 prop 接口（`CommonBorderProps`、`CommonPaddingProps`、`VisibleProps`、`DisabledProps` 等）产生，通过 `DOMUtils.exposePropsToDOM` 写入每个组件的根 DOM 元素，或通过 `setAttribute` / `removeAttribute` 命令式控制。

`DOMUtils.exposePropsToDOM` 在写入 DOM 前会归一化取值，boolean prop 与属性形式可以互换：

- `data-hx-visible`：`true` / `''` / 任何非 `false` 值输出 `''`；只有 `false` 输出 `'no'`
- `data-hx-disabled` / `data-hx-readonly`：`true` / `''` 输出 `''`；其他任何值（包括 `false`）都会移除该属性
- 因此内部元素上可以直接写 `data-hx-disabled={disabled}` 传 boolean——由 computer 转换，而不是 React 渲染出 `="true"`

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-model-path`      | `HxLabel`、`HxBadge`、`HxInput`、`HxFormatInput`、`HxTextarea`、`HxCheckbox`、`HxMCheckbox`、`HxRadio`、`HxMRadio`、`HxSelect`、`HxMSelect`、`HxDateTimePicker`、`HxButton`、`HxActions`、`HxSeparator`、`HxBox`、`HxFlex`、`HxGrid`、`HxPanel`、`HxButtonBar`、`HxTabs`、`HxPagination`、`HxTable`、`HxInputBox` | `ERO.pathOf($model, $field)` —— 响应式数据路径 |
| `data-hx-visible`         | `HxLabel`、`HxBadge`、`HxInput`、`HxFormatInput`、`HxTextarea`、`HxCheckbox`、`HxMCheckbox`、`HxRadio`、`HxMRadio`、`HxSelect`、`HxMSelect`、`HxDateTimePicker`、`HxButton`、`HxActions`、`HxUpload`、`HxSeparator`、`HxBox`、`HxFlex`、`HxGrid`、`HxPanel`、`HxButtonBar`、`HxTabs`、`HxTable`、`HxInputBox` | 可见时 `''`，隐藏时 `'no'` |
| `data-hx-disabled`        | `HxLabel`、`HxInput`、`HxFormatInput`、`HxTextarea`、`HxCheckbox`、`HxMCheckbox`、`HxRadio`、`HxMRadio`、`HxSelect`、`HxMSelect`、`HxDateTimePicker`、`HxButton`、`HxActions`、`HxUpload`、`UploadButton`、`UploadGallery`、`UploadDnd`、`HxInputBox` | 启用时 `(void 0)`，禁用时 `''` |
| `data-hx-readonly`        | `HxInput`、`HxFormatInput`、`HxTextarea`、`HxInputBox` | 非只读时 `(void 0)`，只读时 `''` |
| `data-hx-focus`           | `HxSelect`、`HxDateTimePicker` | popup 打开时 `el.setAttribute('data-hx-focus', '')` |
| `data-hx-hover`           | `HxActions`、`HxCheckbox`、`HxRadio`、`HxSelect`、`HxDateTimePicker` | 鼠标移入时 `el.setAttribute('data-hx-hover', '')` |
| `data-hx-color`           | `HxLabel`、`HxButton`、`HxCallout`、`HxSeparator`、`HxToast` | `color` prop 的值 |
| `data-hx-border`          | `HxBox`、`HxFlex`、`HxGrid`、`HxPanel`、`HxTabs` | `border` prop 为 true 时 `''`，否则不存在 |
| `data-hx-border-color`    | `HxActions` | 边框颜色（来自 `color`） |
| `data-hx-border-radius`   | `HxLabel`、`HxBox`、`HxFlex`、`HxGrid`、`HxPanel`、`HxActions`、`HxTabs`、`HxBadge` | `"atomic"`、`"round"`（仅 Badge，高度的一半）或 `borderRadius` prop 的值 |
| `data-hx-padding-x`       | `HxLabel`、`HxBox`、`HxFlex`、`HxGrid`、`HxTabs` | `paddingX` prop 的值 |
| `data-hx-padding-y`       | `HxLabel` | `paddingY` prop 的值 |
| `data-hx-padding-t`       | `HxBox`、`HxFlex`、`HxGrid`、`HxTabs` | `paddingT` prop 的值 |
| `data-hx-padding-b`       | `HxBox`、`HxFlex`、`HxGrid`、`HxTabs` | `paddingB` prop 的值 |
| `data-hx-margin-x`        | `HxSeparator` | `marginX` prop 的值 |
| `data-hx-margin-y`        | `HxSeparator` | `marginY` prop 的值 |
| `data-hx-cell-gap-x`      | `HxFlex`、`HxGrid`、`HxMRadio`、`HxMCheckbox` | `gapX` prop 的值 |
| `data-hx-cell-gap-y`      | `HxFlex`、`HxGrid`、`HxMRadio`、`HxMCheckbox` | `gapY` prop 的值 |
| `data-hx-justify-items`   | `HxGrid` | `justifyItems` prop 的值 |
| `data-hx-justify-content` | `HxFlex`、`HxGrid` | `justifyContent` prop 的值 |
| `data-hx-align-items`     | `HxFlex`、`HxGrid` | `alignItems` prop 的值 |
| `data-hx-align-content`   | `HxFlex`、`HxGrid` | `alignContent` prop 的值 |
| `data-hx-min-width`       | `HxWidthConstrainedProps` | `minWidth` prop 的值 |
| `data-hx-width`           | `HxWidthConstrainedProps`、`HxOverlay` | `width` prop 的值 |
| `data-hx-max-width`       | `HxWidthConstrainedProps` | `maxWidth` prop 的值 |
| `data-hx-min-height`      | `HxHeightConstrainedProps` | `minHeight` prop 的值 |
| `data-hx-height`          | `HxHeightConstrainedProps`、`HxOverlay` | `height` prop 的值 |
| `data-hx-max-height`      | `HxHeightConstrainedProps`、`HxOverlay` | `maxHeight` prop 的值 |
| `data-hx-checked`         | `HxCheckMessage` | 显示消息期间为 `warn` 或 `error`，校验通过后移除 |

### SVG 图标

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-svg-icon-name` | `src/components/icons/` 下全部 61 个图标组件 | `<svg data-hx-svg-icon-name="calendar">` —— 图标标识 |

### Label

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-label-text`              | `HxLabel` | `<span data-hx-label-text="...">` —— 标签文本内容 |
| `data-hx-label-opaque`            | `HxLabel` | `opaque` prop 为 true 时输出不透明背景 |
| `data-hx-label-text-indent`       | `HxLabel` | `indent` prop 为 true 时缩进文本 |
| `data-hx-label-clickable`         | `HxLabel` | 设置 `clickable` prop 时显示 pointer 光标 |
| `data-hx-label-hoverable`         | `HxLabel` | 设置 `hoverable` prop 时启用悬停效果 |
| `data-hx-label-active`            | `HxLabel`、`HxSelect` | 激活/选中状态 |
| `data-hx-label-input-placeholder` | `HxInputBox`、`HxSelect` | 输入框内的占位文本 |
| `data-hx-label-single-line-ellipsis` | `HxInputBox`、`HxSelect`、`HxMSelect` | 标签/占位文本单行显示并省略号截断 |

### Badge

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-badge-variant` | `HxBadge` | `variant` prop 的值 |
| `data-hx-badge-size`    | `HxBadge` | `size` prop 的值 |
| `data-hx-border-radius` | `HxBadge` | `borderRadius` prop 的值；`"round"` = 高度的一半 |

### Input

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-input-box`   | `HxInputBox` | `<div data-hx-input-box="">` —— 输入框外层包装 |
| `data-hx-input-inbox` | `HxInputBox` | `<input data-hx-input-inbox="">` —— 内层输入元素 |

### Textarea

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-textarea-box`              | `HxTextarea` | 外层包装 |
| `data-hx-textarea-rows`             | `HxTextarea` | `rows` prop 的行数 |
| `data-hx-textarea-max-rows`         | `HxTextarea` | `autoRows` prop 给出的最大行数 |
| `data-hx-textarea-resize`           | `HxTextarea` | `resize` prop 的值 |
| `data-hx-textarea-placeholder`      | `HxTextarea` | 占位文本覆盖层 |
| `data-hx-label-textarea-char-limit` | `HxTextarea` | 字符数计数器 |

### Checkbox / MCheckbox

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-checkbox-checked`     | `HxCheckbox`  | 选中状态 |
| `data-hx-checkbox-curtain`     | `HxCheckbox`  | 动画遮罩元素 |
| `data-hx-checkbox-icon`        | `HxCheckbox`  | 勾选图标，尺寸由 checkbox 规则控制 |
| `data-hx-m-checkbox-direction` | `HxMCheckbox` | `direction` prop 的布局方向 |
| `data-hx-m-checkbox-lanes`     | `HxMCheckbox` | `lanes` prop 的列数，1–10 |

### Radio / MRadio

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-radio-checked`     | `HxRadio`  | 选中状态 |
| `data-hx-radio-curtain`     | `HxRadio`  | 动画遮罩元素 |
| `data-hx-m-radio-direction` | `HxMRadio` | 布局方向 |
| `data-hx-m-radio-lanes`     | `HxMRadio` | 列数，1–10 |

### Select

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-select-icon`    | `HxSelect` | `<button data-hx-select-icon="caret-down">` / `<button data-hx-select-icon="clear">` —— 下拉与清除按钮 |
| `data-hx-select-input-label` | `HxSelect` | 触发器内已选标签的 span |
| `data-hx-select-options` | `HxSelect` | popup 内选项列表容器 |
| `data-hx-select-option`  | `HxSelect` | popup 内单个选项 |
| `data-hx-select-option-value` | `HxSelect` | 选项的 `value` |
| `data-hx-select-input`   | `HxSelect` | popup 内的筛选输入框 |

### MSelect

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-m-select-input-label`     | `HxMSelect` | 触发器内已选标签的 span |
| `data-hx-m-select-input-label-more`| `HxMSelect` | `+N` 溢出徽章 |
| `data-hx-m-select-input-options`   | `HxMSelect` | 触发器内徽章列表 |
| `data-hx-m-select-input-options-compact` | `HxMSelect` | 触发器以紧凑模式渲染时存在 |
| `data-hx-m-select-input`           | `HxMSelect` | popup 内的筛选输入框 |
| `data-hx-m-select-icon`            | `HxMSelect` | 下拉按钮 |
| `data-hx-m-select-options`         | `HxMSelect` | popup 内选项列表容器 |
| `data-hx-m-select-option`          | `HxMSelect` | popup 内单个选项 |
| `data-hx-m-select-option-value`    | `HxMSelect` | 选项的 `value` |

### Options-Label

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-options-label-state`    | `HxOptionsLabel` | `loading` / `no-options` / `no-value` / `option-not-found` / `some-option-not-found` / `option-found` |
| `data-hx-options-label-value`    | `HxOptionsLabel` | 绑定的模型值（数组以 `,` 连接） |
| `data-hx-options-label-separator`| `HxOptionsLabel` | 已解析标签之间的 `,` 分隔符 |

### DateTimePicker

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-dtp-icon`  | `HxDateTimePicker` | `<button data-hx-dtp-icon="calendar">` / `<button data-hx-dtp-icon="clear">` —— 日历与清除按钮 |
| `data-hx-dtp-panel` | `HxDateTimePicker` | popup 面板容器 |
| `data-hx-dtp-panel-header` / `-footer` / `-time` | `HxDateTimePicker` | 面板头部栏、底部栏（今天 / 清除 / 确定）、时间输入行 |
| `data-hx-dtp-panel-days` / `-months` / `-years` | `HxDateTimePicker` | 日 / 月 / 年面板容器 |
| `data-hx-dtp-panel-days-header-separator` | `HxDateTimePicker` | 日面板中星期表头与日期网格之间的分隔线 |
| `data-hx-dtp-panel-weekday-label` | `HxDateTimePicker` | 星期列表头；值为星期 key（如 `mon`） |
| `data-hx-dtp-panel-weekend` | `HxDateTimePicker` | 标记周末列与周末日期格 |
| `data-hx-dtp-panel-btn` | `HxDateTimePicker` | 头部与底部按钮：`prev-year`、`prev-month`、`month`、`year`、`next-month`、`next-year`、`today`、`clear`、`confirm` |
| `data-hx-dtp-panel-day-era` / `-month-era` / `-year-era` | `HxDateTimePicker` | 单元格标签内该日期的年号名 |
| `data-hx-dtp-panel-month-eras` / `-year-eras` | `HxDateTimePicker` | 单元格标签内以 ` / ` 连接的备选年号名（年号交替） |
| `data-hx-dtp-panel-day-gregory` / `-month-gregory` / `-year-gregory` | `HxDateTimePicker` | 每个网格单元上都有；值为该格的公历 key（日/月/年数字） |
| `data-hx-dtp-panel-day-bc` / `-month-bc` | `HxDateTimePicker` | 日 / 月面板中标记 BCE 单元格 |
| `data-hx-dtp-panel-day-y10k` / `-month-y10k` | `HxDateTimePicker` | 标记超出 9999 年的单元格 |
| `data-hx-dtp-panel-days-visible` / `-months-visible` / `-years-visible` | `HxDateTimePicker` | 面板切换期间的显示状态：`hide` / `prepare` / `show` |
| `data-hx-dtp-panel-state-day` / `-state-month` / `-state-year` | `HxDateTimePicker` | 网格高亮所在的日 / 月 / 年 |
| `data-hx-dtp-panel-model-day` / `-model-month` / `-model-year` | `HxDateTimePicker` | 标记与模型值的日 / 月 / 年匹配的单元格 |
| `data-hx-dtp-panel-this-month` | `HxDateTimePicker` | 标记属于当前展示月份的日期格 |
| `data-hx-dtp-panel-time-input` | `HxDateTimePicker` | 时间部分输入框：值为 `hour` / `minute` / `second` |
| `data-hx-dtp-panel-time-separator` | `HxDateTimePicker` | 时间行起始处的 1px 装饰线 |
| `data-hx-dtp-panel-time-colon` | `HxDateTimePicker` | 时间输入框之间的 `:` 标签 |
| `data-hx-dtp-panel-time-has-minute` / `-time-has-second` | `HxDateTimePicker` | 格式包含分 / 秒时存在 |
| `data-hx-dtp-panel-footer-separator` | `HxDateTimePicker` | 底部栏内的分隔元素 |

### Button

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-button-variant`        | `HxButton`                  | `variant` prop 的值 |
| `data-hx-button-text-uppercase` | `HxButton`                  | 文本大写变换 |
| `data-hx-button-input-embed`    | `HxSelect`、`HxDateTimePicker` | 嵌入输入框内的图标按钮 |
| `data-hx-button-svg-icon`       | `HxActions`、`HxPagination`、`HxSelect`、`HxDateTimePicker` | 纯 SVG 图标按钮 |

### Actions

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-actions-options` | `HxActions` | popup 内选项容器 |

### Upload

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-upload-trigger`           | `UploadButton`、`UploadGallery`、`UploadDnd` | 触发器包装 |
| `data-hx-upload-error-msg`         | `HxUploadError` | 错误消息 |
| `data-hx-upload-dnd-icon`          | `UploadDnd` | 拖拽图标 |
| `data-hx-upload-dnd-label`         | `UploadDnd` | 拖拽上传文本 |
| `data-hx-upload-dnd-desc`          | `UploadDnd` | 拖拽描述文本 |
| `data-hx-upload-dnd-bottom-border` | `UploadDnd` | 底部边框装饰 |
| `data-hx-upload-files`             | `UploadButton`、`UploadDnd` | 文件列表容器 |
| `data-hx-upload-file`              | `UploadItemGallery`、`UploadItemList` | 单个文件项 |
| `data-hx-upload-file-error`        | `UploadItemGallery`、`UploadItemList` | 出错的文件项 |
| `data-hx-upload-file-details`      | `UploadItemList` | 文件详情区域 |
| `data-hx-upload-file-name`         | `UploadItemList` | 文件名 |
| `data-hx-upload-file-ext-name`     | `UploadItemList` | 扩展名 |
| `data-hx-upload-file-size`         | `UploadItemList` | 文件大小 |
| `data-hx-upload-file-upload`       | `UploadItemList`、`UploadItemGallery` | 重试上传按钮 |
| `data-hx-upload-file-download`     | `UploadItemList`、`UploadItemGallery` | 下载按钮 |
| `data-hx-upload-file-preview`      | `UploadItemGallery` | 预览按钮 |
| `data-hx-upload-file-delete`       | `UploadItemList`、`UploadItemGallery` | 删除按钮 |
| `data-hx-upload-file-uploading`    | `UploadItemList` | 上传中状态图标 |
| `data-hx-upload-file-action`       | `UploadItemList` | 包裹操作按钮的行 |
| `data-hx-upload-file-percentage`   | `UploadItemGallery`、`UploadItemList` | 上传进度百分比 |
| `data-hx-upload-file-error-msg`    | `UploadItemGallery`、`UploadItemList` | 单文件错误消息 |
| `data-hx-upload-file-thumbnail`    | `UploadItemGallery` | 缩略图容器 |
| `data-hx-upload-file-icon`         | `UploadItemGallery` | 非图片文件占位图标 |
| `data-hx-upload-file-image`        | `UploadItemGallery` | 缩略图图片 |
| `data-hx-upload-gallery-icon`      | `UploadGallery` | 画廊触发器图标 |
| `data-hx-upload-gallery-label`     | `UploadGallery` | 画廊触发器文本 |
| `data-hx-upload-preview-backdrop`  | `UploadItemGalleryPreview` | 预览遮罩 |
| `data-hx-upload-preview-state`     | `UploadItemGalleryPreview` | 预览状态 |
| `data-hx-upload-preview-content`   | `UploadItemGalleryPreview` | 预览内容容器 |
| `data-hx-upload-preview-ratio`     | `UploadItemGalleryPreview` | 预览缩放比例 |
| `data-hx-upload-preview-rect`      | `UploadItemGalleryPreview` | 预览矩形边界 |
| `data-hx-upload-preview-rect-image`| `UploadItemGalleryPreview` | 被缩放的图片元素 |
| `data-hx-upload-preview-action`    | `UploadItemGalleryPreview` | 预览底部的操作行 |

`data-hx-upload-color` 已移除：upload 现在通过 computer 写共享的 `data-hx-color`（来自 `color` prop）。`data-hx-upload-variant` 仍由 `variant` prop 写入。

### Separator

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-separator-direction` | `HxSeparator` | 水平 / 垂直方向 |
| `data-hx-separator-size`      | `HxSeparator` | 线条长度或高度 |

### Callout

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-callout-background` | `HxCallout` | 背景层 |
| `data-hx-callout-content`    | `HxCallout` | 内容区 |
| `data-hx-callout-icon`       | `HxCallout` | 图标区 |

颜色不单独设属性：`kind` 解析成调色板颜色后，组件把它写成 `data-hx-callout-background` 上的 `data-hx-color`。

### Flex / Grid

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-flex-direction` | `HxFlex`  | 行 / 列方向 |
| `data-hx-flex-wrap`      | `HxFlex`  | 换行开关 |
| `data-hx-grid-columns`   | `HxGrid`  | 列数 |

### Panel

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-panel-collapsible`     | `HxPanel`        | 启用折叠 |
| `data-hx-panel-collapsed`       | `HxPanel`        | 折叠状态（经 setAttribute） |
| `data-hx-panel-header`          | `HxPanelHeader`  | 头部容器 |
| `data-hx-panel-title`           | `HxPanelHeader`  | 标题文本 |
| `data-hx-panel-collapse-button` | `HxPanelHeader`  | 折叠切换按钮 |
| `data-hx-panel-body`            | `HxPanelBody`、`HxPanel` | 内容容器 |

### Tabs

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-tabs-active-mark`             | `HxTabs` | 标记激活标签页指示条位置 |
| `data-hx-tabs-active-index`            | `HxTabs` | 激活标签页索引 |
| `data-hx-tab-active`                   | `HxTabHeader`、`HxTabBody` | 激活标签页标记 |
| `data-hx-tabs-header`                  | `HxTabsHeader` | 标签页头部容器 |
| `data-hx-tab-header`                   | `HxTabHeader`  | 单个标签页头部 |
| `data-hx-tabs-body`                    | `HxTabsBody`   | 标签页内容容器 |
| `data-hx-tab-body`                     | `HxTabBody`    | 单个标签页内容 |
| `data-hx-tab-mark`                     | `HxTabHeader`、`HxTabBody` | 标签页 mark |
| `data-hx-tab-index`                    | `HxTabHeader`、`HxTabBody` | 标签页索引 |
| `data-hx-tabs-header-active-indicator` | `HxTabsHeader` | 激活标签页下划线指示条 |
| `data-hx-tabs-header-more-tab`         | `HxTabsHeader` | 溢出"更多"标签页 |
| `data-hx-tabs-state-indicator`         | `HxTabs`（内部） | 内容区内部的状态元素；承载 `data-hx-tabs-active-mark` / `data-hx-tabs-active-index` |

### Pagination

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-pagination-total-pages`       | `HxPagination` | 总页数 |
| `data-hx-pagination-total-items`       | `HxPagination` | 总条数展示 |
| `data-hx-pagination-total-items-key1`  | `HxPagination` | "Total" i18n 键 |
| `data-hx-pagination-total-items-key2`  | `HxPagination` | "Items" i18n 键 |
| `data-hx-pagination-page-size`         | `HxPagination` | 每页条数选择器 |
| `data-hx-pagination-page-number`       | `HxPagination` | 当前页码 |
| `data-hx-pagination-page-number-slash` | `HxPagination` | "/" i18n 键 |
| `data-hx-pagination-total-comma-key`   | `HxPagination` | "," i18n 键 |
| `data-hx-pagination-page-size-value`   | `HxPagination` | 每页条数值 |
| `data-hx-pagination-per-page-key`      | `HxPagination` | "/ Page" i18n 键 |
| `data-hx-pagination-total-items-value` | `HxPagination` | 总条数值 |
| `data-hx-pagination-previous-page`     | `HxPagination` | 上一页按钮 |
| `data-hx-pagination-next-page`         | `HxPagination` | 下一页按钮 |
| `data-hx-pagination-loading`           | `HxPagination` | 加载遮罩 |
| `data-hx-pagination-loading-position`  | `HxPagination` | 旋转指示位置：`"start"` / `"end"` |
| `data-hx-pagination-loading-state`     | `HxPagination` | 变更回调执行中为 `"on"` |

### Overlay

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-overlay-backdrop`  | `HxOverlayBackdrop` | 遮罩背景元素 |
| `data-hx-overlay-state`     | `HxOverlayBackdrop` | 遮罩动画状态（经 setAttribute） |
| `data-hx-toast-container`   | `HxToast` | Toast 内容包装 |
| `data-hx-toast-content`     | `HxToast` | 图标 + 消息行 |
| `data-hx-toast-content-icon` | `HxToast` | 类型图标 |
| `data-hx-toast-content-message` | `HxToast` | 消息文本 |
| `data-hx-toast-buttons`     | `HxToast` | 底部按钮行 |
| `data-hx-toast-dismiss-bar` | `HxToast` | 自动关闭进度条 |
| `data-hx-toast-dismiss`     | `HxToast` | 关闭动画状态 |
| `data-hx-alert-container`   | `HxAlert` | Alert 内容包装 |
| `data-hx-alert-content`     | `HxAlert` | 图标 + 消息行 |
| `data-hx-alert-content-icon` | `HxAlert` | 类型图标 |
| `data-hx-alert-content-message` | `HxAlert` | 消息文本 |
| `data-hx-alert-buttons`     | `HxAlert` | 底部按钮行 |
| `data-hx-dialog`            | `HxDialog` | Dialog 标识 |
| `data-hx-drawer`            | `HxDrawer` | Drawer 标识 |

### Popup

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-popup-state`            | `HxPopup` | popup 生命周期状态（经 setAttribute） |
| `data-hx-popup-avoid-transition` | `HxPopup` | 跳过打开/关闭动画 |
| `data-hx-popup-for-select`       | `HxSelect` | 属于 select popup |
| `data-hx-popup-for-m-select`     | `HxMSelect` | 属于 m-select popup |
| `data-hx-popup-for-actions`      | `HxActions` | 属于 actions popup |
| `data-hx-popup-for-dtp`          | `HxDateTimePicker` | 属于 datetime-picker popup |
| `data-hx-popup-for-table-sort`   | `HxTable` | 属于表格排序 popup |
| `data-hx-popup-for-table-filter` | `HxTable` | 属于表格筛选 popup |

### Table

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-table` | `HxTable` | 组件标识 |
| `data-hx-table-layout` | `HxTableLayout` | grid-template 容器 |
| `data-hx-table-header` / `data-hx-table-body` | `HxTableHeader` / `HxTableBody` | 表头 / 表体容器 |
| `data-hx-table-header-cell` / `data-hx-table-body-cell` | 单元格组件 | 单个表头 / 表体单元格 |
| `data-hx-table-header-start-row` / `-start-column` / `-end-row` / `-end-column` | 表头单元格 | 单元格的网格位置 |
| `data-hx-table-body-start-row` / `-start-column` / `-end-row` / `-end-column` | 表体单元格 | 单元格的网格位置 |
| `data-hx-table-cell-start-row` / `-start-column` / `-end-row` / `-end-column` | 所有单元格 | 网格位置数值（行 / 列序号）；吸附偏移计算读取它们 |
| `data-hx-table-cell-sticky` / `-sticky-left` / `-sticky-right` / `-sticky-top` | 单元格 | 吸附边标记 |
| `data-hx-table-cell-first-sticky-right` / `-last-sticky-left` | 单元格 | 吸附范围的第一 / 最后一列；吸附边阴影绘制处 |
| `data-hx-table-cell-block-end` / `-inline-end` | 表体单元格 | 表体块的最后一行 / 最后一列；边缘样式的对称占位 |
| `data-hx-table-cell-last-row` | 表体单元格 | 最后一行的单元格上存在 |
| `data-hx-table-cell-z-index` | 表体单元格 | 吸附单元格的层叠顺序 |
| `data-hx-table-cell-row-grid-line` / `-column-grid-line` | 单元格 | 网格线显示 |
| `data-hx-table-cell-odd-row` / `-even-row` / `-stripe-row` | 单元格 | 行条纹 |
| `data-hx-table-body-nested-cell` / `-nested-row-expanded` | 表体单元格 | 嵌套行状态 |
| `data-hx-table-nested-row-collapsed` / `-nested-row-expanded` | 表体行 | 行包装上的折叠 / 展开标记 |
| `data-hx-table-body-group-cell` / `-group-full-line-cell` | 表体单元格 | 分组行 |
| `data-hx-table-nested-row-operator` / `-operator-expand` / `-operator-collapse` | 嵌套行操作符 | 展开/收起按钮 |
| `data-hx-table-row-index` / `-row-index-label` / `-row-number` | 行号列 | 行号 |
| `data-hx-table-header-assist-empty-cell` / `data-hx-table-body-assist-empty-cell` | 自动补齐单元格 | 空隙占位 |
| `data-hx-table-body-no-data-cell` | 空表体 | "无数据"单元格 |
| `data-hx-table-toolbar` | `HxTableToolbar` | 工具栏容器；仅在声明了排序/筛选/fuzzy 时渲染 |
| `data-hx-table-toolbar-criteria` / `-criteria-spacer` | `HxTableToolbarCriteria` | 条件行（fuzzy 输入 + 排序/筛选按钮）及其弹性占位 |
| `data-hx-table-toolbar-criteria-applied` | `HxTableToolbarCriteriaApplied` | 已应用条件行（排序/筛选条件生效时渲染） |
| `data-hx-table-toolbar-fuzzy` | `HxTableToolbarFuzzyInput` | fuzzy 筛选输入框 |
| `data-hx-table-toolbar-button` | 工具栏按钮 | 值为 `sort` / `filter` / `clear-criteria` |
| `data-hx-table-toolbar-applied-sort` | 已应用行 | 已排序条件徽章（升/降图标） |
| `data-hx-table-toolbar-applied-filter` / `-applied-filter-method` | 已应用行 | 已筛选条件徽章及其方法标签 |
| `data-hx-table-sort-columns` / `-sort-column` | 排序弹层 | 有序列表容器 / 每个排序列一行 |
| `data-hx-table-sort-column-index` / `-sort-column-key` / `-sort-column-button` | 排序弹层 | 行序号、列 key、升/降切换 |
| `data-hx-table-sort-more-column` / `-no-sort-column` | 排序弹层 | 添加列下拉 / 空状态标签 |
| `data-hx-table-sort-button` / `-sort-operators` | 排序弹层 | 确认/取消/清除按钮行 |
| `data-hx-active` | 排序弹层 | 标记排序行的激活升/降方向 |
| `data-hx-table-filter-columns` / `-filter-column` | 筛选弹层 | 有序列表容器 / 每个筛选列一行 |
| `data-hx-table-filter-column-index` / `-filter-column-key` / `-filter-column-method` / `-filter-column-value` | 筛选弹层 | 行序号、列 key、方法选择器、取值编辑器 |
| `data-hx-table-filter-column-button` | 筛选弹层 | 单行清除按钮 |
| `data-hx-table-filter-more-column` / `-no-filter-column` | 筛选弹层 | 添加列下拉 / 空状态标签 |
| `data-hx-table-filter-button` / `-filter-operators` | 筛选弹层 | 确认/取消/清除按钮行 |
| `data-hx-table-footer` / `-footer-spreader` | `HxTableFooter` | 表脚与占位 |
| `data-hx-table-content` / `-content-layout` / `-content-sticky` / `-content-v-scroll` | 内容区 | 滚动/吸附状态 |

### Tooltip

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-tooltip` | `HxTooltip` | 根标识 |
| `data-hx-tooltip-content` | `HxTooltip` | 内容元素 |
| `data-hx-tooltip-arrow` | `HxTooltip` | 箭头元素 |
| `data-hx-tooltip-handle` | `HxTooltip` | 实例 handle id |
| `data-hx-tooltip-position` | `HxTooltip` | 解析后的位置 |
| `data-hx-tooltip-status` | `HxTooltip` | `prepare` / `ready` / `located` / `hidden` |
| `data-hx-tooltip-trigger-rtl` | `HxTooltip` | 触发元素为 RTL 方向 |
| `data-hx-tooltip-podium` | 任何带 `tooltip` prop 的组件 | 由 `usePropsToDomExpose` 写在承载 tooltip 的元素上；内层 tooltip 的悬停会在最近的 podium 处停止冒泡 |

### 临时属性

| 属性 | 组件 | 说明 |
|------|------|------|
| `data-hx-select-option-temporary-display` | `HxSelect` | `el.setAttribute('data-hx-select-option-temporary-display', 'block')` —— 筛选隐藏选项前保存原 display 值 |
| `data-hx-m-select-option-temporary-display` | `HxMSelect` | 与 `HxSelect` 相同机制，用于多选 popup |
| `data-hx-temporary-paralysis` | `HxPagination`（设置）、`HxSelect`（响应） | 不带视觉禁用态地锁定 select 的激活入口 —— 见[公共概念](./cn-hx-components-Common#临时瘫痪) |
| `data-hx-aemt-<event>` | `DOMUtils` 重复事件守卫 | 受守卫的处理器运行期间保持的临时属性（`data-hx-aemt-suppress-error-report=""` 可退出超时错误报告）—— 见[工具函数](./cn-hx-components-Utilities#重复事件守卫) |

---

## 使用方可设置的属性

**没有任何组件**会自行设置这些属性。把它们作为 prop 传给你想影响的元素；共享的 data attribute computer 会原样转发到 DOM。

| 属性 | 用途 |
|------|------|
| `data-hx-svg-icon-animation`     | 图标动画控制 |
| `data-hx-button-min-width`       | 自定义按钮最小宽度 |
| `data-hx-label-check-msg`        | 校验消息文本 |
| `data-hx-label-svg-icon`         | 标签图标指示 |
| `data-hx-label-input-embed`      | 嵌入输入框内的标签（前缀/后缀） |
| `data-hx-margin-t`               | 自定义顶部外边距 |
| `data-hx-margin-r`               | 自定义右侧外边距 |
| `data-hx-margin-b`               | 自定义底部外边距 |
| `data-hx-margin-l`               | 自定义左侧外边距 |
| `data-hx-flex-cell-grow`         | Flex 子元素增长因子 |
| `data-hx-align-self`             | Flex / Grid 子元素自身对齐 |
| `data-hx-grid-cell-row`          | Grid 子元素行起始 |
| `data-hx-grid-cell-rows`         | Grid 子元素行跨度 |
| `data-hx-grid-cell-col`          | Grid 子元素列起始 |
| `data-hx-grid-cell-cols`         | Grid 子元素列跨度 |
| `data-hx-justify-self`           | Grid 子元素自身对齐 |
| `data-hx-first-element`          | 用户设置的遮罩层首个焦点元素 |

---

## 用 Data Attributes 写样式

每个组件都通过 `data-hx-*` 属性暴露状态，因此可以在 CSS 中直接选择精确状态：

```css
/* 红色实心按钮 */
[data-hx-button][data-hx-color="danger"][data-hx-button-variant="solid"] {
    /* 自定义样式 */
}

/* 已选中的复选框 */
[data-hx-checkbox][data-hx-checkbox-checked] {
    /* 自定义样式 */
}

/* 激活的标签页头部 */
[data-hx-tab-header][data-hx-tab-active] {
    /* 自定义样式 */
}

/* 折叠面板的内容区 */
[data-hx-panel-body][data-hx-panel-collapsed] {
    display: none;
}
```

组件类型标识（`data-hx-button`、`data-hx-input` 等）始终写在组件的根元素上，是可靠的选择器锚点。
