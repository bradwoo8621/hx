# Data Attributes Reference

All Hx components use `data-hx-*` attributes for styling and state management instead of CSS-in-JS. These attributes are **reserved** — you **cannot** pass them as custom `data-hx-*` props to components, they will be silently omitted.

You can, however, use them as **CSS selectors** to customize component appearance.

---

## Common Attributes (shared across multiple components)

| Attribute | Used By | Purpose | Values |
|-----------|---------|---------|--------|
| `data-hx-root` | app root | Root element marker | `""` |
| `data-hx-portal-root` | Overlay system | Portal mount point | `""` |
| `data-hx-theme` | app root | Theme identifier | theme name |
| `data-hx-language` | app root | Current locale | locale code |
| `data-hx-model-path` | all reactive components | Model field path bound to this element | path string (e.g. `"user.name"`) |
| `data-hx-visible` | all components | Visibility toggle | `""` (visible) or `"no"` (hidden) |
| `data-hx-disabled` | form components | Disabled state | `""` (disabled) or absent/`undefined` |
| `data-hx-readonly` | Input, Textarea | Read-only state | `""` (readonly) or absent |
| `data-hx-focus` | Input, Textarea | Focus state | `""` (focused) or absent |
| `data-hx-hover` | select options, actions | Hovered element marker | `""` (hovered) or absent |
| `data-hx-color` | Button, Badge, Upload, Callout, Separator | Color theme | `"primary"`, `"success"`, `"warn"`, `"danger"`, `"info"`, `"waive"` |
| `data-hx-min-width` | width-constrained components | Minimum width | size token or CSS value |
| `data-hx-width` | width-constrained components | Fixed width | size token or CSS value |
| `data-hx-max-width` | width-constrained components | Maximum width | size token or CSS value |
| `data-hx-min-height` | height-constrained components | Minimum height | size token or CSS value |
| `data-hx-height` | height-constrained components | Fixed height | size token or CSS value |
| `data-hx-max-height` | height-constrained components | Maximum height | size token or CSS value |
| `data-hx-margin-x` | layout components | Horizontal margin | `"none"`, `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` |
| `data-hx-margin-y` | layout components | Vertical margin | same |
| `data-hx-margin-t` | layout components, icons | Top margin | same |
| `data-hx-margin-r` | layout components, icons | Right margin | same |
| `data-hx-margin-b` | layout components, icons | Bottom margin | same |
| `data-hx-margin-l` | layout components, icons | Left margin | same |
| `data-hx-padding-x` | layout components | Horizontal padding | `"none"`, `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` |
| `data-hx-padding-y` | layout components | Vertical padding | same |
| `data-hx-padding-t` | layout components | Top padding | same |
| `data-hx-padding-b` | layout components | Bottom padding | same |
| `data-hx-border` | layout components | Border toggle | `""` (has border) or absent |
| `data-hx-border-radius` | layout components | Border radius | `"none"`, `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` |
| `data-hx-cell-gap-x` | Flex, Grid | Horizontal gap | `"none"`, `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"` |
| `data-hx-cell-gap-y` | Flex, Grid | Vertical gap | same |
| `data-hx-justify-items` | Grid | Grid item row-axis alignment | CSS value |
| `data-hx-justify-content` | Flex, Grid | Container row-axis alignment | `"start"`, `"end"`, `"center"`, `"space-between"`, `"space-around"`, `"space-evenly"`, `"normal"` |
| `data-hx-align-items` | Flex, Grid | Container column-axis alignment | `"start"`, `"end"`, `"center"`, `"baseline"`, `"stretch"`, `"normal"` |
| `data-hx-align-content` | Flex, Grid | Multi-line alignment | same as above |
| `data-hx-first-element` | Flex, Grid | Marks first child for gap logic | `""` or absent |

---

## Component-Specific Attributes

### Button

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-button` | Component type identifier | `""` |
| `data-hx-button-variant` | Visual variant | `"solid"`, `"outline"`, `"ghost"`, `"link"` |
| `data-hx-text-uppercase` | Uppercase text transform | `""` or absent |
| `data-hx-button-input-embed` | Button embedded inside an input | `""` or absent |
| `data-hx-button-svg-icon` | Button contains an SVG icon child | `""` or absent |
| `data-hx-button-icon` | Button has an icon element | `""` or absent |

### Badge

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-badge` | Component type identifier | `""` |
| `data-hx-badge-variant` | Visual style | `"solid"`, `"outline"`, `"dashed"` |
| `data-hx-badge-size` | Size variant | `"sm"`, `"std"` |

### Label

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-label` | Component type identifier | `""` |
| `data-hx-label-text` | Text content marker | `""` |
| `data-hx-label-opaque` | Opaque background | `""` or absent |
| `data-hx-label-clickable` | Clickable cursor style | `""` or absent |
| `data-hx-label-hoverable` | Hover style enabled | `""` or absent |
| `data-hx-label-active` | Active/pressed state | `""` or absent |
| `data-hx-label-input-placeholder` | Label used as input placeholder | `""` or absent |
| `data-hx-label-input-embed` | Label embedded in input | `""` or absent |
| `data-hx-label-svg-icon` | Label contains an SVG icon | `""` or absent |

### Input

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-input` | Component type identifier | `""` |
| `data-hx-format-input` | FormatInput identifier | `""` |
| `data-hx-input-box` | Outer HxInputBox wrapper | `""` |
| `data-hx-input-inbox` | Inner input area | `""` |

### Textarea

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-textarea` | Component type identifier | `""` |
| `data-hx-textarea-box` | Outer wrapper | `""` |
| `data-hx-textarea-rows` | Visible row count | number |
| `data-hx-textarea-max-rows` | Max rows for auto-grow | number (only when `autoRows` is a number) |
| `data-hx-textarea-resize` | Resize behaviour | `"none"`, `"vertical"`, `"horizontal"`, `"both"` |
| `data-hx-textarea-placeholder` | Placeholder text set | `""` or absent |

### Checkbox

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-checkbox` | Component type identifier | `""` |
| `data-hx-checkbox-checked` | Checked state | `""` or absent |
| `data-hx-checkbox-curtain` | Visual check indicator overlay | `""` or absent |

### Radio

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-radio` | Component type identifier | `""` |
| `data-hx-radio-checked` | Checked state | `""` or absent |
| `data-hx-radio-curtain` | Visual radio indicator overlay | `""` or absent |

### MCheckbox

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-m-checkbox` | Component type identifier | `""` |
| `data-hx-m-checkbox-direction` | Layout direction | `"dir-x"`, `"dir-y"` |
| `data-hx-m-checkbox-lanes` | Grid column count | number |

### MRadio

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-m-radio` | Component type identifier | `""` |
| `data-hx-m-radio-direction` | Layout direction | `"dir-x"`, `"dir-y"` |
| `data-hx-m-radio-lanes` | Grid column count | number |

### Select

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-select` | Component type identifier | `""` |
| `data-hx-select-icon` | Dropdown caret icon | `""` |
| `data-hx-select-options` | Options list container | `""` |
| `data-hx-select-option` | Individual option | `""` |

### Actions

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-actions` | Component type identifier | `""` |
| `data-hx-actions-options` | Dropdown options container | `""` |
| `data-hx-actions-option` | Individual action item | `""` |

### Upload

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-upload` | Component type identifier | `""` |
| `data-hx-upload-color` | Theme colour | `HxColor` value |
| `data-hx-upload-variant` | Display variant | `"solid"`, `"outline"`, `"ghost"`, `"dnd"`, `"gallery"` |
| `data-hx-upload-trigger` | Upload trigger button/zone | `""` |
| `data-hx-upload-error-msg` | Upload-level error message | `""` |
| `data-hx-upload-dnd-desc` | DnD description text | `""` |
| `data-hx-upload-dnd-bottom-border` | DnD zone bottom border | `""` |
| `data-hx-upload-files` | File list container | `""` |
| `data-hx-upload-file` | Individual file row | `""` |
| `data-hx-upload-file-error` | File has error | `""` |
| `data-hx-upload-file-icon` | File type icon | `""` |
| `data-hx-upload-file-details` | File details section | `""` |
| `data-hx-upload-file-name` | File name display | `""` |
| `data-hx-upload-file-ext-name` | File extension display | `""` |
| `data-hx-upload-file-size` | File size display | `""` |
| `data-hx-upload-file-action` | File action buttons (remove, etc.) | `""` |
| `data-hx-upload-file-uploading` | File uploading state | `""` |
| `data-hx-upload-file-percentage` | Upload progress percentage | `""` |
| `data-hx-upload-file-error-msg` | Per-file error message | `""` |
| `data-hx-upload-file-thumbnail` | Image thumbnail | `""` |
| `data-hx-upload-preview-backdrop` | Gallery preview backdrop | `""` |
| `data-hx-upload-preview-state` | Preview animation state | state string |
| `data-hx-upload-preview-content` | Preview image container | `""` |
| `data-hx-upload-preview-ratio` | Image aspect ratio | ratio value |
| `data-hx-upload-preview-rect` | Image display rect | `""` |
| `data-hx-upload-preview-action` | Preview action buttons | `""` |

### Separator

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-separator` | Component type identifier | `""` |
| `data-hx-separator-direction` | Orientation | `"dir-x"`, `"dir-y"` |
| `data-hx-separator-size` | Line thickness | size value |

### Callout

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-callout` | Component type identifier | `""` |
| `data-hx-callout-color` | Colour from kind mapping | colour value |

### Box / Flex / Grid

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-box` | Box component identifier | `""` |
| `data-hx-flex` | Flex component identifier | `""` |
| `data-hx-flex-direction` | Flex direction | `"dir-x"`, `"dir-y"` |
| `data-hx-flex-wrap` | Flex wrap toggle | `""` (wraps) or `"no"` |
| `data-hx-grid` | Grid component identifier | `""` |
| `data-hx-grid-columns` | Grid column count | `12`, `15`, `16` |
| `data-hx-flex-cell-grow` | Flex child grow factor | number |
| `data-hx-flex-cell-align-self` | Flex child self-alignment | `"auto"`, `"start"`, `"end"`, `"center"`, `"baseline"`, `"stretch"` |
| `data-hx-grid-cell-row` | Grid child row start | number |
| `data-hx-grid-cell-rows` | Grid child row span | number |
| `data-hx-grid-cell-col` | Grid child column start | number |
| `data-hx-grid-cell-cols` | Grid child column span | number |
| `data-hx-grid-cell-justify-self` | Grid child row self-alignment | `"stretch"`, `"start"`, `"end"`, `"center"` |
| `data-hx-grid-cell-align-self` | Grid child column self-alignment | `"stretch"`, `"start"`, `"end"`, `"center"` |

### Panel

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-panel` | Component type identifier | `""` |
| `data-hx-panel-collapsible` | Collapse toggle enabled | `""` or absent |
| `data-hx-panel-collapsed` | Currently collapsed | `""` or absent |
| `data-hx-panel-header` | Header bar element | `""` |
| `data-hx-panel-title` | Title text element | `""` |
| `data-hx-panel-collapse-button` | Collapse toggle button | `""` |
| `data-hx-panel-body` | Body content container | `""` |

### Tabs

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-tabs` | Component type identifier | `""` |
| `data-hx-tabs-active-mark` | Active tab mark name | mark string |
| `data-hx-tabs-active-index` | Active tab index | number |
| `data-hx-tab-active` | Tab is the active one | `""` or absent |
| `data-hx-tabs-header` | Tabs header row | `""` |
| `data-hx-tab-header` | Individual tab header | `""` |
| `data-hx-tabs-body` | Tabs body container | `""` |
| `data-hx-tab-body` | Individual tab body | `""` |
| `data-hx-tab-mark` | Tab mark identifier | mark string |
| `data-hx-tab-index` | Tab index position | number |
| `data-hx-tabs-header-active-indicator` | Active tab underline/indicator | `""` |
| `data-hx-tabs-header-more-tab` | Overflow "more" tab | `""` |

### Pagination

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-pagination` | Component type identifier | `""` |
| `data-hx-pagination-total-pages` | Total page count display | number |
| `data-hx-pagination-total-items` | Total items count display | number |
| `data-hx-pagination-total-items-key1` | i18n key for "items" (part 1) | i18n key |
| `data-hx-pagination-total-items-key2` | i18n key for "items" (part 2) | i18n key |
| `data-hx-pagination-page-size` | Page size selector | `""` |

### Overlay / Alert / Toast

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-overlay` | Overlay component identifier | `""` |
| `data-hx-dialog` | Dialog overlay identifier | `""` |
| `data-hx-alert` | Alert identifier | `""` |
| `data-hx-toast` | Toast identifier | `""` |
| `data-hx-overlay-backdrop` | Backdrop element | `""` |
| `data-hx-overlay-state` | Lifecycle state | `"entering"`, `"entered"`, `"exiting"`, `"exited"` |
| `data-hx-toast-dismiss-bar` | Auto-dismiss progress bar | `""` |
| `data-hx-toast-dismiss` | Manual dismiss button | `""` |

### Popup

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-popup` | Component type identifier | `""` |
| `data-hx-popup-state` | Lifecycle state | `"prepare"`, `"active"`, `"hide"` |
| `data-hx-popup-avoid-transition` | Suppress CSS transition | `""` |
| `data-hx-popup-for-select` | Popup belongs to Select | `""` |
| `data-hx-popup-for-actions` | Popup belongs to Actions | `""` |

### WithCheck

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-with-check` | Component type identifier | `""` |

### ButtonBar

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-button-bar` | Component type identifier | `""` |

### SVG Icons

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-svg-icon` | Icon component identifier | `""` |
| `data-hx-svg-icon-name` | Icon name for styling | icon name string (e.g. `"check"`, `"calendar"`) |

### Temporary

| Attribute | Purpose | Values |
|-----------|---------|--------|
| `data-hx-temporary-display` | Internal: temporary display state | `""` |

---

## Using Data Attributes for Custom Styling

Since all design tokens are exposed via `data-*` attributes, you can target specific states in your CSS:

```css
/* Target a solid danger button */
[data-hx-button][data-hx-color="danger"][data-hx-button-variant="solid"] {
  /* custom styles */
}

/* Target a checked checkbox */
[data-hx-checkbox][data-hx-checkbox-checked] {
  /* custom styles */
}

/* Target an active tab header */
[data-hx-tab-header][data-hx-tab-active] {
  /* custom styles */
}

/* Target a collapsed panel body */
[data-hx-panel-body][data-hx-panel-collapsed] {
  display: none;
}
```

The component type identifiers (`data-hx-button`, `data-hx-input`, etc.) are set on the root element of each component and are always present, making them reliable CSS selectors.
