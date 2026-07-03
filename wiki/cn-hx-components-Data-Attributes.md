# Data Attributes 参考

所有 Hx 组件使用 `data-hx-*` 属性进行样式和状态管理（非 CSS-in-JS）。这些属性是**保留的**——你**不能**将它们作为自定义 `data-hx-*` props
传递给组件，它们会被静默丢弃。

但你可以将它们用作 **CSS 选择器**，来实现自定义样式。

---

## 公共属性（多个组件共享）

| 属性                        | 使用组件                                  | 用途               | 取值                                                                                          |
|---------------------------|---------------------------------------|------------------|---------------------------------------------------------------------------------------------|
| `data-hx-root`            | 应用根元素                                 | 根元素标记            | `""`                                                                                        |
| `data-hx-portal-root`     | Overlay 系统                            | Portal 挂载点       | `""`                                                                                        |
| `data-hx-theme`           | 应用根元素                                 | 主题标识             | 主题名称                                                                                        |
| `data-hx-language`        | 应用根元素                                 | 当前语言             | 语言代码                                                                                        |
| `data-hx-model-path`      | 所有响应式组件                               | 绑定到此元素的模型字段路径    | 路径字符串（如 `"user.name"`）                                                                      |
| `data-hx-visible`         | 所有组件                                  | 可见性切换            | `""`（可见）或 `"no"`（隐藏）                                                                        |
| `data-hx-disabled`        | 表单组件                                  | 禁用状态             | `""`（禁用）或不存在/`undefined`                                                                    |
| `data-hx-readonly`        | Input、Textarea                        | 只读状态             | `""`（只读）或不存在                                                                                |
| `data-hx-focus`           | Input、Textarea                        | 焦点状态             | `""`（聚焦）或不存在                                                                                |
| `data-hx-hover`           | Select 选项、Actions                     | 悬停元素标记           | `""`（悬停中）或不存在                                                                               |
| `data-hx-color`           | Button、Badge、Upload、Callout、Separator | 颜色主题             | `"primary"`、`"success"`、`"warn"`、`"danger"`、`"info"`、`"waive"`                              |
| `data-hx-min-width`       | 宽度约束组件                                | 最小宽度             | 尺寸令牌或 CSS 值                                                                                 |
| `data-hx-width`           | 宽度约束组件                                | 固定宽度             | 尺寸令牌或 CSS 值                                                                                 |
| `data-hx-max-width`       | 宽度约束组件                                | 最大宽度             | 尺寸令牌或 CSS 值                                                                                 |
| `data-hx-min-height`      | 高度约束组件                                | 最小高度             | 尺寸令牌或 CSS 值                                                                                 |
| `data-hx-height`          | 高度约束组件                                | 固定高度             | 尺寸令牌或 CSS 值                                                                                 |
| `data-hx-max-height`      | 高度约束组件                                | 最大高度             | 尺寸令牌或 CSS 值                                                                                 |
| `data-hx-margin-x`        | 布局组件                                  | 水平外边距            | `"none"`、`"xs"`、`"sm"`、`"md"`、`"lg"`、`"xl"`                                                 |
| `data-hx-margin-y`        | 布局组件                                  | 垂直外边距            | 同上                                                                                          |
| `data-hx-margin-t`        | 布局组件、图标                               | 顶部外边距            | 同上                                                                                          |
| `data-hx-margin-r`        | 布局组件、图标                               | 右侧外边距            | 同上                                                                                          |
| `data-hx-margin-b`        | 布局组件、图标                               | 底部外边距            | 同上                                                                                          |
| `data-hx-margin-l`        | 布局组件、图标                               | 左侧外边距            | 同上                                                                                          |
| `data-hx-padding-x`       | 布局组件                                  | 水平内边距            | `"none"`、`"xs"`、`"sm"`、`"md"`、`"lg"`、`"xl"`                                                 |
| `data-hx-padding-y`       | 布局组件                                  | 垂直内边距            | 同上                                                                                          |
| `data-hx-padding-t`       | 布局组件                                  | 顶部内边距            | 同上                                                                                          |
| `data-hx-padding-b`       | 布局组件                                  | 底部内边距            | 同上                                                                                          |
| `data-hx-border`          | 布局组件                                  | 边框开关             | `""`（有边框）或不存在                                                                               |
| `data-hx-border-radius`   | 布局组件                                  | 圆角               | `"none"`、`"xs"`、`"sm"`、`"md"`、`"lg"`、`"xl"`                                                 |
| `data-hx-cell-gap-x`      | Flex、Grid                             | 水平间距             | `"none"`、`"xs"`、`"sm"`、`"md"`、`"lg"`、`"xl"`                                                 |
| `data-hx-cell-gap-y`      | Flex、Grid                             | 垂直间距             | 同上                                                                                          |
| `data-hx-justify-items`   | Grid                                  | 网格项行轴对齐          | CSS 值                                                                                       |
| `data-hx-justify-content` | Flex、Grid                             | 容器行轴对齐           | `"start"`、`"end"`、`"center"`、`"space-between"`、`"space-around"`、`"space-evenly"`、`"normal"` |
| `data-hx-align-items`     | Flex、Grid                             | 容器列轴对齐           | `"start"`、`"end"`、`"center"`、`"baseline"`、`"stretch"`、`"normal"`                            |
| `data-hx-align-content`   | Flex、Grid                             | 多行对齐             | 同上                                                                                          |
| `data-hx-first-element`   | Flex、Grid                             | 标记第一个子元素（用于间距逻辑） | `""` 或不存在                                                                                   |

---

## 组件专属属性

### Button

| 属性                              | 用途             | 取值                                       |
|---------------------------------|----------------|------------------------------------------|
| `data-hx-button`                | 组件类型标识         | `""`                                     |
| `data-hx-button-variant`        | 视觉变体           | `"solid"`、`"outline"`、`"ghost"`、`"link"` |
| `data-hx-button-text-uppercase` | 文本大写变换         | `""` 或不存在                                |
| `data-hx-button-input-embed`    | 按钮嵌入在输入框内      | `""` 或不存在                                |
| `data-hx-button-svg-icon`       | 按钮包含 SVG 图标子元素 | `""` 或不存在                                |
| `data-hx-button-icon`           | 按钮有图标元素        | `""` 或不存在                                |

### Badge

| 属性                      | 用途     | 取值                               |
|-------------------------|--------|----------------------------------|
| `data-hx-badge`         | 组件类型标识 | `""`                             |
| `data-hx-badge-variant` | 视觉样式   | `"solid"`、`"outline"`、`"dashed"` |
| `data-hx-badge-size`    | 尺寸变体   | `"sm"`、`"std"`                   |

### Label

| 属性                                | 用途              | 取值        |
|-----------------------------------|-----------------|-----------|
| `data-hx-label`                   | 组件类型标识          | `""`      |
| `data-hx-label-text`              | 文本内容标记          | `""`      |
| `data-hx-label-opaque`            | 不透明背景           | `""` 或不存在 |
| `data-hx-label-clickable`         | 可点击光标样式         | `""` 或不存在 |
| `data-hx-label-hoverable`         | 启用悬停样式          | `""` 或不存在 |
| `data-hx-label-active`            | 激活/按下状态         | `""` 或不存在 |
| `data-hx-label-input-placeholder` | Label 用作输入框占位符  | `""` 或不存在 |
| `data-hx-label-input-embed`       | Label 嵌入在输入框内   | `""` 或不存在 |
| `data-hx-label-svg-icon`          | Label 包含 SVG 图标 | `""` 或不存在 |

### Input

| 属性                     | 用途              | 取值   |
|------------------------|-----------------|------|
| `data-hx-input`        | 组件类型标识          | `""` |
| `data-hx-format-input` | FormatInput 标识  | `""` |
| `data-hx-input-box`    | HxInputBox 外层包装 | `""` |
| `data-hx-input-inbox`  | 内层输入区域          | `""` |

### Textarea

| 属性                             | 用途        | 取值                                            |
|--------------------------------|-----------|-----------------------------------------------|
| `data-hx-textarea`             | 组件类型标识    | `""`                                          |
| `data-hx-textarea-box`         | 外层包装      | `""`                                          |
| `data-hx-textarea-rows`        | 可见行数      | 数字                                            |
| `data-hx-textarea-max-rows`    | 自动增高的最大行数 | 数字（仅当 `autoRows` 为数字时）                        |
| `data-hx-textarea-resize`      | 调整大小行为    | `"none"`、`"vertical"`、`"horizontal"`、`"both"` |
| `data-hx-textarea-placeholder` | 已设置占位文本   | `""` 或不存在                                     |

### Checkbox

| 属性                         | 用途        | 取值        |
|----------------------------|-----------|-----------|
| `data-hx-checkbox`         | 组件类型标识    | `""`      |
| `data-hx-checkbox-checked` | 选中状态      | `""` 或不存在 |
| `data-hx-checkbox-curtain` | 选中指示器视觉遮罩 | `""` 或不存在 |

### Radio

| 属性                      | 用途        | 取值        |
|-------------------------|-----------|-----------|
| `data-hx-radio`         | 组件类型标识    | `""`      |
| `data-hx-radio-checked` | 选中状态      | `""` 或不存在 |
| `data-hx-radio-curtain` | 选中指示器视觉遮罩 | `""` 或不存在 |

### MCheckbox

| 属性                             | 用途     | 取值                  |
|--------------------------------|--------|---------------------|
| `data-hx-m-checkbox`           | 组件类型标识 | `""`                |
| `data-hx-m-checkbox-direction` | 布局方向   | `"dir-x"`、`"dir-y"` |
| `data-hx-m-checkbox-lanes`     | 网格列数   | 数字                  |

### MRadio

| 属性                          | 用途     | 取值                  |
|-----------------------------|--------|---------------------|
| `data-hx-m-radio`           | 组件类型标识 | `""`                |
| `data-hx-m-radio-direction` | 布局方向   | `"dir-x"`、`"dir-y"` |
| `data-hx-m-radio-lanes`     | 网格列数   | 数字                  |

### Select

| 属性                       | 用途     | 取值   |
|--------------------------|--------|------|
| `data-hx-select`         | 组件类型标识 | `""` |
| `data-hx-select-icon`    | 下拉三角图标 | `""` |
| `data-hx-select-options` | 选项列表容器 | `""` |
| `data-hx-select-option`  | 单个选项   | `""` |

### Actions

| 属性                        | 用途     | 取值   |
|---------------------------|--------|------|
| `data-hx-actions`         | 组件类型标识 | `""` |
| `data-hx-actions-options` | 下拉选项容器 | `""` |
| `data-hx-actions-option`  | 单个操作项  | `""` |

### Upload

| 属性                                 | 用途          | 取值                                                  |
|------------------------------------|-------------|-----------------------------------------------------|
| `data-hx-upload`                   | 组件类型标识      | `""`                                                |
| `data-hx-upload-color`             | 主题色         | `HxColor` 值                                         |
| `data-hx-upload-variant`           | 展示变体        | `"solid"`、`"outline"`、`"ghost"`、`"dnd"`、`"gallery"` |
| `data-hx-upload-trigger`           | 上传触发按钮/区域   | `""`                                                |
| `data-hx-upload-error-msg`         | 上传级别错误消息    | `""`                                                |
| `data-hx-upload-dnd-desc`          | 拖拽区域描述文本    | `""`                                                |
| `data-hx-upload-dnd-bottom-border` | 拖拽区域底部边框    | `""`                                                |
| `data-hx-upload-files`             | 文件列表容器      | `""`                                                |
| `data-hx-upload-file`              | 单个文件行       | `""`                                                |
| `data-hx-upload-file-error`        | 文件有错误       | `""`                                                |
| `data-hx-upload-file-icon`         | 文件类型图标      | `""`                                                |
| `data-hx-upload-file-details`      | 文件详情区域      | `""`                                                |
| `data-hx-upload-file-name`         | 文件名展示       | `""`                                                |
| `data-hx-upload-file-ext-name`     | 文件扩展名展示     | `""`                                                |
| `data-hx-upload-file-size`         | 文件大小展示      | `""`                                                |
| `data-hx-upload-file-action`       | 文件操作按钮（删除等） | `""`                                                |
| `data-hx-upload-file-uploading`    | 文件上传中状态     | `""`                                                |
| `data-hx-upload-file-percentage`   | 上传进度百分比     | `""`                                                |
| `data-hx-upload-file-error-msg`    | 单文件错误消息     | `""`                                                |
| `data-hx-upload-file-thumbnail`    | 图片缩略图       | `""`                                                |
| `data-hx-upload-preview-backdrop`  | 画廊预览遮罩      | `""`                                                |
| `data-hx-upload-preview-state`     | 预览动画状态      | 状态字符串                                               |
| `data-hx-upload-preview-content`   | 预览图片容器      | `""`                                                |
| `data-hx-upload-preview-ratio`     | 图片宽高比       | 比例值                                                 |
| `data-hx-upload-preview-rect`      | 图片显示矩形      | `""`                                                |
| `data-hx-upload-preview-action`    | 预览操作按钮      | `""`                                                |

### Separator

| 属性                            | 用途     | 取值                  |
|-------------------------------|--------|---------------------|
| `data-hx-separator`           | 组件类型标识 | `""`                |
| `data-hx-separator-direction` | 方向     | `"dir-x"`、`"dir-y"` |
| `data-hx-separator-size`      | 线条粗细   | 尺寸值                 |

### Callout

| 属性                      | 用途            | 取值   |
|-------------------------|---------------|------|
| `data-hx-callout`       | 组件类型标识        | `""` |
| `data-hx-callout-color` | 根据 kind 映射的颜色 | 颜色值  |

### Box / Flex / Grid

| 属性                               | 用途            | 取值                                                             |
|----------------------------------|---------------|----------------------------------------------------------------|
| `data-hx-box`                    | Box 组件标识      | `""`                                                           |
| `data-hx-flex`                   | Flex 组件标识     | `""`                                                           |
| `data-hx-flex-direction`         | Flex 方向       | `"dir-x"`、`"dir-y"`                                            |
| `data-hx-flex-wrap`              | Flex 换行开关     | `""`（换行）或 `"no"`                                               |
| `data-hx-grid`                   | Grid 组件标识     | `""`                                                           |
| `data-hx-grid-columns`           | Grid 列数       | `12`、`15`、`16`                                                 |
| `data-hx-flex-cell-grow`         | Flex 子元素增长因子  | 数字                                                             |
| `data-hx-flex-cell-align-self`   | Flex 子元素自身对齐  | `"auto"`、`"start"`、`"end"`、`"center"`、`"baseline"`、`"stretch"` |
| `data-hx-grid-cell-row`          | Grid 子元素行起始   | 数字                                                             |
| `data-hx-grid-cell-rows`         | Grid 子元素行跨度   | 数字                                                             |
| `data-hx-grid-cell-col`          | Grid 子元素列起始   | 数字                                                             |
| `data-hx-grid-cell-cols`         | Grid 子元素列跨度   | 数字                                                             |
| `data-hx-grid-cell-justify-self` | Grid 子元素行自身对齐 | `"stretch"`、`"start"`、`"end"`、`"center"`                       |
| `data-hx-grid-cell-align-self`   | Grid 子元素列自身对齐 | `"stretch"`、`"start"`、`"end"`、`"center"`                       |

### Panel

| 属性                              | 用途     | 取值        |
|---------------------------------|--------|-----------|
| `data-hx-panel`                 | 组件类型标识 | `""`      |
| `data-hx-panel-collapsible`     | 启用折叠切换 | `""` 或不存在 |
| `data-hx-panel-collapsed`       | 当前已折叠  | `""` 或不存在 |
| `data-hx-panel-header`          | 标题栏元素  | `""`      |
| `data-hx-panel-title`           | 标题文本元素 | `""`      |
| `data-hx-panel-collapse-button` | 折叠切换按钮 | `""`      |
| `data-hx-panel-body`            | 内容容器   | `""`      |

### Tabs

| 属性                                     | 用途          | 取值        |
|----------------------------------------|-------------|-----------|
| `data-hx-tabs`                         | 组件类型标识      | `""`      |
| `data-hx-tabs-active-mark`             | 当前激活标签页标记名  | mark 字符串  |
| `data-hx-tabs-active-index`            | 当前激活标签页索引   | 数字        |
| `data-hx-tab-active`                   | 标签页为激活状态    | `""` 或不存在 |
| `data-hx-tabs-header`                  | 标签页标题行      | `""`      |
| `data-hx-tab-header`                   | 单个标签页标题     | `""`      |
| `data-hx-tabs-body`                    | 标签页内容容器     | `""`      |
| `data-hx-tab-body`                     | 单个标签页内容     | `""`      |
| `data-hx-tab-mark`                     | 标签页标识       | mark 字符串  |
| `data-hx-tab-index`                    | 标签页位置索引     | 数字        |
| `data-hx-tabs-header-active-indicator` | 激活标签页下划线指示器 | `""`      |
| `data-hx-tabs-header-more-tab`         | 溢出"更多"标签页   | `""`      |

### Pagination

| 属性                                    | 用途              | 取值      |
|---------------------------------------|-----------------|---------|
| `data-hx-pagination`                  | 组件类型标识          | `""`    |
| `data-hx-pagination-total-pages`      | 总页数展示           | 数字      |
| `data-hx-pagination-total-items`      | 总条数展示           | 数字      |
| `data-hx-pagination-total-items-key1` | "条" i18n 键名（前半） | i18n 键名 |
| `data-hx-pagination-total-items-key2` | "条" i18n 键名（后半） | i18n 键名 |
| `data-hx-pagination-page-size`        | 每页条数选择器         | `""`    |

### Overlay / Alert / Toast

| 属性                          | 用途           | 取值                                              |
|-----------------------------|--------------|-------------------------------------------------|
| `data-hx-overlay`           | Overlay 组件标识 | `""`                                            |
| `data-hx-dialog`            | Dialog 遮罩标识  | `""`                                            |
| `data-hx-alert`             | Alert 标识     | `""`                                            |
| `data-hx-toast`             | Toast 标识     | `""`                                            |
| `data-hx-overlay-backdrop`  | 遮罩背景元素       | `""`                                            |
| `data-hx-overlay-state`     | 生命周期状态       | `"entering"`、`"entered"`、`"exiting"`、`"exited"` |
| `data-hx-toast-dismiss-bar` | 自动关闭进度条      | `""`                                            |
| `data-hx-toast-dismiss`     | 手动关闭按钮       | `""`                                            |

### Popup

| 属性                               | 用途               | 取值                              |
|----------------------------------|------------------|---------------------------------|
| `data-hx-popup`                  | 组件类型标识           | `""`                            |
| `data-hx-popup-state`            | 生命周期状态           | `"prepare"`、`"active"`、`"hide"` |
| `data-hx-popup-avoid-transition` | 抑制 CSS 过渡        | `""`                            |
| `data-hx-popup-for-select`       | Popup 属于 Select  | `""`                            |
| `data-hx-popup-for-actions`      | Popup 属于 Actions | `""`                            |

### WithCheck

| 属性                   | 用途     | 取值   |
|----------------------|--------|------|
| `data-hx-with-check` | 组件类型标识 | `""` |

### ButtonBar

| 属性                   | 用途     | 取值   |
|----------------------|--------|------|
| `data-hx-button-bar` | 组件类型标识 | `""` |

### SVG 图标

| 属性                      | 用途         | 取值                                |
|-------------------------|------------|-----------------------------------|
| `data-hx-svg-icon`      | 图标组件标识     | `""`                              |
| `data-hx-svg-icon-name` | 图标名称（用于样式） | 图标名称字符串（如 `"check"`、`"calendar"`） |

### 临时属性

| 属性                                        | 用途        | 取值   |
|-------------------------------------------|-----------|------|
| `data-hx-select-option-temporary-display` | 内部：临时展示状态 | `""` |

---

## 使用 Data Attributes 自定义样式

因为所有设计令牌都通过 `data-*` 属性暴露，可以直接在 CSS 中精确选择特定状态：

```css
/* 选择红色实心按钮 */
[data-hx-button][data-hx-color="danger"][data-hx-button-variant="solid"] {
    /* 自定义样式 */
}

/* 选择已选中的复选框 */
[data-hx-checkbox][data-hx-checkbox-checked] {
    /* 自定义样式 */
}

/* 选择当前激活的标签页标题 */
[data-hx-tab-header][data-hx-tab-active] {
    /* 自定义样式 */
}

/* 选择折叠面板的内容区 */
[data-hx-panel-body][data-hx-panel-collapsed] {
    display: none;
}
```

组件类型标识（`data-hx-button`、`data-hx-input` 等）始终设置在每个组件的根元素上，是可靠的 CSS 选择器。
