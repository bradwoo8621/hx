# data-hx-* Attributes

All components use `data-hx-*` attributes for CSS selectors and internal state. These attributes are managed in two type unions in
`src/types/component.ts`:

## HxOmittedDataAttributes

Managed **internally** by components. Excluded from public props — setting them externally is ineffective because the component always
writes its own value. Some are type markers (always present), others carry state (present only when active).

### Component Type Markers

Each component writes its own type marker on the root DOM element as `<div data-hx-xxx="">`.

| Attribute              | Component                              | Usage                             |
|------------------------|----------------------------------------|-----------------------------------|
| `data-hx-label`        | `HxLabel`                              | `<span data-hx-label="">`         |
| `data-hx-badge`        | `HxBadge`                              | `<span data-hx-badge="">`         |
| `data-hx-svg-icon`     | `computeSvgIconDefaults` (icons/utils) | `<svg data-hx-svg-icon="">`       |
| `data-hx-input`        | `HxInput`                              | `<input data-hx-input="">`        |
| `data-hx-format-input` | `HxFormatInput`                        | `<input data-hx-format-input="">` |
| `data-hx-textarea`     | `HxTextarea`                           | `<textarea data-hx-textarea="">`  |
| `data-hx-checkbox`     | `HxCheckbox`                           | `<div data-hx-checkbox="">`       |
| `data-hx-m-checkbox`   | `HxMCheckbox`                          | `<div data-hx-m-checkbox="">`     |
| `data-hx-radio`        | `HxRadio`                              | `<div data-hx-radio="">`          |
| `data-hx-m-radio`      | `HxMRadio`                             | `<div data-hx-m-radio="">`        |
| `data-hx-select`       | `HxSelect`                             | `<div data-hx-select="">`         |
| `data-hx-dtp`          | `HxDateTimePicker`                     | `<div data-hx-dtp="">`            |
| `data-hx-button`       | `HxButton`                             | `<button data-hx-button="">`      |
| `data-hx-actions`      | `HxActions`                            | `<div data-hx-actions="">`        |
| `data-hx-upload`       | `HxUpload`                             | `<div data-hx-upload="">`         |
| `data-hx-separator`    | `HxSeparator`                          | `<div data-hx-separator="">`      |
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
| `data-hx-with-check`   | `HxWithCheck` (HOC), `HxTextarea`      | `<div data-hx-with-check="">`     |

### Root / Portal / Theme / Language

| Attribute             | Component                                           | Usage                                                                                                                     |
|-----------------------|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| `data-hx-root`        | `HxContext`                                         | `<div data-hx-root="">` — outermost app container                                                                         |
| `data-hx-portal-root` | `HxPopupProvider`, `OverlayPortalRoot`              | `<div data-hx-portal-root="">` — portal destination in `document.body`                                                    |
| `data-hx-theme`       | `HxContext`, `HxPopupProvider`, `OverlayPortalRoot` | `el.setAttribute('data-hx-theme', value)` on `[data-hx-root]` and `[data-hx-portal-root]` — current theme for CSS cascade |
| `data-hx-language`    | `HxContext`, `HxPopupProvider`, `OverlayPortalRoot` | `el.setAttribute('data-hx-language', value)` on `[data-hx-root]` and `[data-hx-portal-root]` — current language           |

### Common

These attributes are produced by shared prop interfaces (`CommonBorderProps`, `CommonPaddingProps`, `VisibleProps`, `DisabledProps`, etc.)
and written to every component's root DOM element via `DOMUtils.exposePropsToDOM`, or controlled imperatively via `setAttribute`/
`removeAttribute`.

| Attribute                 | Component                                                                                                                                                                                                                                                                                                                           | Usage                                                 |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| `data-hx-model-path`      | `HxLabel`<br>`HxBadge`<br>`HxInput`<br>`HxFormatInput`<br>`HxTextarea`<br>`HxCheckbox`<br>`HxMCheckbox`<br>`HxRadio`<br>`HxMRadio`<br>`HxSelect`<br>`HxDateTimePicker`<br>`HxButton`<br>`HxActions`<br>`HxSeparator`<br>`HxBox`<br>`HxFlex`<br>`HxGrid`<br>`HxPanel`<br>`HxButtonBar`<br>`HxTabs`<br>`HxPagination`<br>`HxInputBox` | `ERO.pathOf($model, $field)` — reactive data path     |
| `data-hx-visible`         | `HxLabel`<br>`HxBadge`<br>`HxInput`<br>`HxFormatInput`<br>`HxTextarea`<br>`HxCheckbox`<br>`HxMCheckbox`<br>`HxRadio`<br>`HxMRadio`<br>`HxSelect`<br>`HxDateTimePicker`<br>`HxButton`<br>`HxActions`<br>`HxUpload`<br>`HxSeparator`<br>`HxBox`<br>`HxFlex`<br>`HxGrid`<br>`HxPanel`<br>`HxButtonBar`<br>`HxTabs`<br>`HxInputBox`     | `(void 0)` when visible, `'no'` when hidden           |
| `data-hx-disabled`        | `HxLabel`<br>`HxInput`<br>`HxFormatInput`<br>`HxTextarea`<br>`HxCheckbox`<br>`HxMCheckbox`<br>`HxRadio`<br>`HxMRadio`<br>`HxSelect`<br>`HxDateTimePicker`<br>`HxButton`<br>`HxActions`<br>`HxUpload`<br>`HxUploadButton`<br>`HxUploadGallery`<br>`HxUploadDnD`<br>`HxInputBox`                                                      | `(void 0)` when enabled, `''` when disabled           |
| `data-hx-readonly`        | `HxInput`, `HxFormatInput`, `HxTextarea`, `HxInputBox`                                                                                                                                                                                                                                                                              | `(void 0)` when not readonly, `''` when readonly      |
| `data-hx-focus`           | `HxSelect`, `HxDateTimePicker`                                                                                                                                                                                                                                                                                                      | `el.setAttribute('data-hx-focus', '')` on popup open  |
| `data-hx-hover`           | `HxActions`, `HxLabel`, `HxRadio`, `HxSelect`                                                                                                                                                                                                                                                                                       | `el.setAttribute('data-hx-hover', '')` on mouse enter |
| `data-hx-color`           | `HxLabel`, `HxButton`, `HxCallout`, `HxSeparator`, `HxToast`                                                                                                                                                                                                                                                                        | `{color}` prop value                                  |
| `data-hx-border`          | `HxBox`, `HxFlex`, `HxGrid`, `HxPanel`, `HxTabs`                                                                                                                                                                                                                                                                                    | `''` when `border` prop is true, absent otherwise     |
| `data-hx-border-color`    | `HxActions`                                                                                                                                                                                                                                                                                                                         | `{color}` — border color                              |
| `data-hx-border-radius`   | `HxLabel`, `HxBox`, `HxFlex`, `HxGrid`, `HxPanel`, `HxActions`, `HxTabs`                                                                                                                                                                                                                                                            | `"atomic"` or value from `borderRadius` prop          |
| `data-hx-padding-x`       | `HxLabel`, `HxBox`, `HxFlex`, `HxGrid`, `HxTabs`                                                                                                                                                                                                                                                                                    | `{paddingX}` prop value                               |
| `data-hx-padding-y`       | `HxLabel`                                                                                                                                                                                                                                                                                                                           | `{paddingY}` prop value                               |
| `data-hx-padding-t`       | `HxBox`, `HxFlex`, `HxGrid`, `HxTabs`                                                                                                                                                                                                                                                                                               | `{paddingT}` prop value                               |
| `data-hx-padding-b`       | `HxBox`, `HxFlex`, `HxGrid`, `HxTabs`                                                                                                                                                                                                                                                                                               | `{paddingB}` prop value                               |
| `data-hx-margin-x`        | `HxSeparator`                                                                                                                                                                                                                                                                                                                       | `{marginX}` prop value                                |
| `data-hx-margin-y`        | `HxSeparator`                                                                                                                                                                                                                                                                                                                       | `{marginY}` prop value                                |
| `data-hx-cell-gap-x`      | `HxFlex`, `HxGrid`, `HxMRadio`, `HxMCheckbox`                                                                                                                                                                                                                                                                                       | `{gapX}` prop value                                   |
| `data-hx-cell-gap-y`      | `HxFlex`, `HxGrid`, `HxMRadio`, `HxMCheckbox`                                                                                                                                                                                                                                                                                       | `{gapY}` prop value                                   |
| `data-hx-justify-items`   | `HxGrid`                                                                                                                                                                                                                                                                                                                            | `{justifyItems}` prop value                           |
| `data-hx-justify-content` | `HxFlex`, `HxGrid`                                                                                                                                                                                                                                                                                                                  | `{justifyContent}` prop value                         |
| `data-hx-align-items`     | `HxFlex`, `HxGrid`                                                                                                                                                                                                                                                                                                                  | `{alignItems}` prop value                             |
| `data-hx-align-content`   | `HxFlex`, `HxGrid`                                                                                                                                                                                                                                                                                                                  | `{alignContent}` prop value                           |
| `data-hx-min-width`       | `CommonPixelsProps`                                                                                                                                                                                                                                                                                                                 | `{minWidth}` prop value                               |
| `data-hx-width`           | `CommonPixelsProps`, `HxOverlay`                                                                                                                                                                                                                                                                                                    | `{width}` prop value                                  |
| `data-hx-max-width`       | `CommonPixelsProps`                                                                                                                                                                                                                                                                                                                 | `{maxWidth}` prop value                               |
| `data-hx-min-height`      | `CommonPixelsProps`                                                                                                                                                                                                                                                                                                                 | `{minHeight}` prop value                              |
| `data-hx-height`          | `CommonPixelsProps`                                                                                                                                                                                                                                                                                                                 | `{height}` prop value                                 |
| `data-hx-max-height`      | `CommonPixelsProps`, `HxOverlay`                                                                                                                                                                                                                                                                                                    | `{maxHeight}` prop value                              |
| `data-hx-first-element`   | `HxOverlay`                                                                                                                                                                                                                                                                                                                         | marks the first focusable element for focus trapping  |

### SVG Icon

| Attribute               | Component                                            | Usage                                                      |
|-------------------------|------------------------------------------------------|------------------------------------------------------------|
| `data-hx-svg-icon-name` | All 44 icon components under `src/components/icons/` | `<svg data-hx-svg-icon-name="calendar">` — icon identifier |

### Label

| Attribute                         | Component                | Usage                                                                             |
|-----------------------------------|--------------------------|-----------------------------------------------------------------------------------|
| `data-hx-label-text`              | `HxLabel`                | `<span data-hx-label-text="...">` — label text content                            |
| `data-hx-label-opaque`            | `HxLabel`                | `<span data-hx-label-opaque="">` — opaque background when `opaque` prop is true   |
| `data-hx-label-text-indent`       | `HxLabel`                | `<span data-hx-label-text-indent="">` — text indented when `indent` prop is true  |
| `data-hx-label-clickable`         | `HxLabel`                | `<span data-hx-label-clickable="">` — cursor pointer when `clickable` prop is set |
| `data-hx-label-hoverable`         | `HxLabel`                | `<span data-hx-label-hoverable="">` — hover effect when `hoverable` prop is set   |
| `data-hx-label-active`            | `HxLabel`, `HxSelect`    | `<span data-hx-label-active="">` — active/selected state                          |
| `data-hx-label-input-placeholder` | `HxInputBox`, `HxSelect` | `<span data-hx-label-input-placeholder="">` — placeholder text inside input       |

### Badge

| Attribute                     | Component | Usage                                                                                 |
|-------------------------------|-----------|---------------------------------------------------------------------------------------|
| `data-hx-badge-variant`       | `HxBadge` | `<span data-hx-badge-variant="solid">` — variant from `variant` prop                  |
| `data-hx-badge-size`          | `HxBadge` | `<span data-hx-badge-size="sm">` — size from `size` prop                              |
| `data-hx-badge-border-radius` | `HxBadge` | `<span data-hx-badge-border-radius="round">` — border radius from `borderRadius` prop |

### Input

| Attribute             | Component    | Usage                                                  |
|-----------------------|--------------|--------------------------------------------------------|
| `data-hx-input-box`   | `HxInputBox` | `<div data-hx-input-box="">` — input wrapper           |
| `data-hx-input-inbox` | `HxInputBox` | `<input data-hx-input-inbox="">` — inner input element |

### Textarea

| Attribute                           | Component    | Usage                                                                      |
|-------------------------------------|--------------|----------------------------------------------------------------------------|
| `data-hx-textarea-box`              | `HxTextarea` | `<div data-hx-textarea-box="">` — textarea wrapper                         |
| `data-hx-textarea-rows`             | `HxTextarea` | `<textarea data-hx-textarea-rows="3">` — row count from `rows` prop        |
| `data-hx-textarea-max-rows`         | `HxTextarea` | `<textarea data-hx-textarea-max-rows="10">` — max rows from `maxRows` prop |
| `data-hx-textarea-resize`           | `HxTextarea` | `<textarea data-hx-textarea-resize="both">` — resize from `resize` prop    |
| `data-hx-textarea-placeholder`      | `HxTextarea` | `<span data-hx-textarea-placeholder="">` — placeholder overlay             |
| `data-hx-label-textarea-char-limit` | `HxTextarea` | `<span data-hx-label-textarea-char-limit="">` — character limit counter    |

### Checkbox / MCheckbox

| Attribute                      | Component     | Usage                                                                                 |
|--------------------------------|---------------|---------------------------------------------------------------------------------------|
| `data-hx-checkbox-checked`     | `HxCheckbox`  | `<div data-hx-checkbox-checked="">` — checked state                                   |
| `data-hx-checkbox-curtain`     | `HxCheckbox`  | `<div data-hx-checkbox-curtain="">` — curtain animation element                       |
| `data-hx-m-checkbox-direction` | `HxMCheckbox` | `<div data-hx-m-checkbox-direction="dir-x">` — layout direction from `direction` prop |
| `data-hx-m-checkbox-lanes`     | `HxMCheckbox` | `<div data-hx-m-checkbox-lanes="3">` — number of lanes from `lanes` prop              |

### Radio / MRadio

| Attribute                   | Component  | Usage                                                        |
|-----------------------------|------------|--------------------------------------------------------------|
| `data-hx-radio-checked`     | `HxRadio`  | `<div data-hx-radio-checked="">` — checked state             |
| `data-hx-radio-curtain`     | `HxRadio`  | `<div data-hx-radio-curtain="">` — curtain animation element |
| `data-hx-m-radio-direction` | `HxMRadio` | `<div data-hx-m-radio-direction="dir-x">` — layout direction |
| `data-hx-m-radio-lanes`     | `HxMRadio` | `<div data-hx-m-radio-lanes="3">` — number of lanes          |

### Select

| Attribute                | Component  | Usage                                                                                                        |
|--------------------------|------------|--------------------------------------------------------------------------------------------------------------|
| `data-hx-select-icon`    | `HxSelect` | `<button data-hx-select-icon="caret-down">` / `<button data-hx-select-icon="clear">` — caret and clear icons |
| `data-hx-select-options` | `HxSelect` | `<div data-hx-select-options="">` — options container in popup                                               |
| `data-hx-select-option`  | `HxSelect` | `<span data-hx-select-option="">` — individual option items in popup                                         |

### DateTimePicker

| Attribute           | Component          | Usage                                                                                                   |
|---------------------|--------------------|---------------------------------------------------------------------------------------------------------|
| `data-hx-dtp-icon`  | `HxDateTimePicker` | `<button data-hx-dtp-icon="calendar">` / `<button data-hx-dtp-icon="clear">` — calendar and clear icons |
| `data-hx-dtp-panel` | `HxDateTimePicker` | `<div data-hx-dtp-panel="">` — popup panel container                                                    |

### Button

| Attribute                       | Component                                                   | Usage                                                                        |
|---------------------------------|-------------------------------------------------------------|------------------------------------------------------------------------------|
| `data-hx-button-variant`        | `HxButton`                                                  | `<button data-hx-button-variant="outline">` — variant from `variant` prop    |
| `data-hx-button-text-uppercase` | `HxButton`                                                  | `<button data-hx-button-text-uppercase="">` — uppercase text transform       |
| `data-hx-button-input-embed`    | `HxSelect`, `HxDateTimePicker`                              | `<button data-hx-button-input-embed="">` — icon button embedded inside input |
| `data-hx-button-svg-icon`       | `HxActions`, `HxPagination`, `HxSelect`, `HxDateTimePicker` | `<button data-hx-button-svg-icon="">` — SVG-only icon button                 |

### Actions

| Attribute                 | Component   | Usage                                                           |
|---------------------------|-------------|-----------------------------------------------------------------|
| `data-hx-actions-options` | `HxActions` | `<div data-hx-actions-options="">` — options container in popup |

### Upload

| Attribute                          | Component                                          | Usage                                                                   |
|------------------------------------|----------------------------------------------------|-------------------------------------------------------------------------|
| `data-hx-upload-color`             | `HxUpload`, `HxUploadGallery`                      | `<div data-hx-upload-color="primary">` — color theme                    |
| `data-hx-upload-variant`           | `HxUpload`                                         | `<div data-hx-upload-variant="gallery">` — upload variant               |
| `data-hx-upload-trigger`           | `HxUploadButton`, `HxUploadGallery`, `HxUploadDnD` | `<div data-hx-upload-trigger="">` — trigger wrapper                     |
| `data-hx-upload-error-msg`         | `HxUploadError`                                    | `<span data-hx-upload-error-msg="">` — error message                    |
| `data-hx-upload-dnd-desc`          | `HxUploadDnD`                                      | `<span data-hx-upload-dnd-desc="">` — drag-and-drop description text    |
| `data-hx-upload-dnd-bottom-border` | `HxUploadDnD`                                      | `<div data-hx-upload-dnd-bottom-border="">` — bottom border decoration  |
| `data-hx-upload-files`             | `HxUploadButton`, `HxUploadDnD`                    | `<div data-hx-upload-files="">` — file list container                   |
| `data-hx-upload-file`              | `HxUploadItemGallery`, `HxUploadItemList`          | `<div data-hx-upload-file="">` — individual file item                   |
| `data-hx-upload-file-error`        | `HxUploadItemGallery`, `HxUploadItemList`          | `<div data-hx-upload-file-error="">` — file item with error             |
| `data-hx-upload-file-icon`         | `HxUploadItemList`                                 | `<div data-hx-upload-file-icon="">` — file type icon                    |
| `data-hx-upload-file-details`      | `HxUploadItemList`                                 | `<div data-hx-upload-file-details="">` — file details section           |
| `data-hx-upload-file-name`         | `HxUploadItemList`                                 | `<span data-hx-upload-file-name="">` — file name                        |
| `data-hx-upload-file-ext-name`     | `HxUploadItemList`                                 | `<span data-hx-upload-file-ext-name="">` — file extension               |
| `data-hx-upload-file-size`         | `HxUploadItemList`                                 | `<span data-hx-upload-file-size="">` — file size                        |
| `data-hx-upload-file-action`       | `HxUploadItemGallery`, `HxUploadItemList`          | `<button data-hx-upload-file-action="">` — action button (delete, etc.) |
| `data-hx-upload-file-uploading`    | `HxUploadItemGallery`, `HxUploadItemList`          | `<div data-hx-upload-file-uploading="">` — uploading state              |
| `data-hx-upload-file-percentage`   | `HxUploadItemGallery`, `HxUploadItemList`          | `<span data-hx-upload-file-percentage="">` — upload progress percentage |
| `data-hx-upload-file-error-msg`    | `HxUploadItemGallery`, `HxUploadItemList`          | `<span data-hx-upload-file-error-msg="">` — per-file error message      |
| `data-hx-upload-file-thumbnail`    | `HxUploadItemGallery`                              | `<img data-hx-upload-file-thumbnail="">` — thumbnail image              |
| `data-hx-upload-preview-backdrop`  | `HxUploadItemGalleryPreview`                       | `<div data-hx-upload-preview-backdrop="">` — modal backdrop             |
| `data-hx-upload-preview-state`     | `HxUploadItemGalleryPreview`                       | `<div data-hx-upload-preview-state="active">` — preview modal state     |
| `data-hx-upload-preview-content`   | `HxUploadItemGalleryPreview`                       | `<div data-hx-upload-preview-content="">` — preview content container   |
| `data-hx-upload-preview-ratio`     | `HxUploadItemGalleryPreview`                       | `<div data-hx-upload-preview-ratio="16:9">` — preview aspect ratio      |
| `data-hx-upload-preview-rect`      | `HxUploadItemGalleryPreview`                       | `<div data-hx-upload-preview-rect="">` — preview rect bounds            |
| `data-hx-upload-preview-action`    | `HxUploadItemGalleryPreview`                       | `<button data-hx-upload-preview-action="">` — preview action buttons    |

### Separator

| Attribute                     | Component     | Usage                                                             |
|-------------------------------|---------------|-------------------------------------------------------------------|
| `data-hx-separator-direction` | `HxSeparator` | `<div data-hx-separator-direction="dir-x">` — horizontal/vertical |
| `data-hx-separator-size`      | `HxSeparator` | `<div data-hx-separator-size="sm">` — line thickness              |

### Callout

| Attribute                    | Component   | Usage                                                          |
|------------------------------|-------------|----------------------------------------------------------------|
| `data-hx-callout-background` | `HxCallout` | `<div data-hx-callout-background="">` — background area        |
| `data-hx-callout-content`    | `HxCallout` | `<div data-hx-callout-content="">` — content area              |
| `data-hx-callout-color`      | `HxCallout` | `<div data-hx-callout-color="info">` — color from `color` prop |
| `data-hx-callout-icon`       | `HxCallout` | `<div data-hx-callout-icon="">` — icon area                    |

### Flex / Grid

| Attribute                | Component | Usage                                                         |
|--------------------------|-----------|---------------------------------------------------------------|
| `data-hx-flex-direction` | `HxFlex`  | `<div data-hx-flex-direction="dir-x">` — row/column direction |
| `data-hx-flex-wrap`      | `HxFlex`  | `<div data-hx-flex-wrap="">` — wrapping enabled               |
| `data-hx-grid-columns`   | `HxGrid`  | `<div data-hx-grid-columns="12">` — column count              |

### Panel

| Attribute                       | Component                | Usage                                                                   |
|---------------------------------|--------------------------|-------------------------------------------------------------------------|
| `data-hx-panel-collapsible`     | `HxPanel`                | `<div data-hx-panel-collapsible="">` — collapsible panel                |
| `data-hx-panel-collapsed`       | `HxPanel`                | `<div data-hx-panel-collapsed="">` — collapsed state (via setAttribute) |
| `data-hx-panel-header`          | `HxPanelHeader`          | `<div data-hx-panel-header="">` — header container                      |
| `data-hx-panel-title`           | `HxPanelHeader`          | `<span data-hx-panel-title="">` — title text                            |
| `data-hx-panel-collapse-button` | `HxPanelHeader`          | `<button data-hx-panel-collapse-button="">` — collapse toggle           |
| `data-hx-panel-body`            | `HxPanelBody`, `HxPanel` | `<div data-hx-panel-body="">` — body container                          |

### Tabs

| Attribute                              | Component                  | Usage                                                                                   |
|----------------------------------------|----------------------------|-----------------------------------------------------------------------------------------|
| `data-hx-tabs-active-mark`             | `HxTabs`                   | `el.setAttribute('data-hx-tabs-active-mark', '')` — marks active tab indicator position |
| `data-hx-tabs-active-index`            | `HxTabs`                   | `el.setAttribute('data-hx-tabs-active-index', '2')` — active tab index                  |
| `data-hx-tab-active`                   | `HxTabHeader`, `HxTabBody` | `el.setAttribute('data-hx-tab-active', '')` — active tab marker                         |
| `data-hx-tabs-header`                  | `HxTabsHeader`             | `<div data-hx-tabs-header="">` — tab headers container                                  |
| `data-hx-tab-header`                   | `HxTabHeader`              | `<div data-hx-tab-header="">` — individual tab header                                   |
| `data-hx-tabs-body`                    | `HxTabsBody`               | `<div data-hx-tabs-body="">` — tab bodies container                                     |
| `data-hx-tab-body`                     | `HxTabBody`                | `<div data-hx-tab-body="">` — individual tab body                                       |
| `data-hx-tab-mark`                     | `HxTabHeader`, `HxTabBody` | `<div data-hx-tab-mark="0">` — tab index marker                                         |
| `data-hx-tab-index`                    | `HxTabHeader`, `HxTabBody` | `<div data-hx-tab-index="0">` — tab index                                               |
| `data-hx-tabs-header-active-indicator` | `HxTabsHeader`             | `<div data-hx-tabs-header-active-indicator="">` — active tab underline indicator        |
| `data-hx-tabs-header-more-tab`         | `HxTabsHeader`             | `<div data-hx-tabs-header-more-tab="">` — overflow "more" tab                           |

### Pagination

| Attribute                             | Component      | Usage                                                              |
|---------------------------------------|----------------|--------------------------------------------------------------------|
| `data-hx-pagination-total-pages`      | `HxPagination` | `<div data-hx-pagination-total-pages="10">` — total pages          |
| `data-hx-pagination-total-items`      | `HxPagination` | `<div data-hx-pagination-total-items="">` — total items display    |
| `data-hx-pagination-total-items-key1` | `HxPagination` | `<span data-hx-pagination-total-items-key1="">` — "Total" i18n key |
| `data-hx-pagination-total-items-key2` | `HxPagination` | `<span data-hx-pagination-total-items-key2="">` — "Items" i18n key |
| `data-hx-pagination-page-size`        | `HxPagination` | `<div data-hx-pagination-page-size="">` — page size selector       |

### Overlay

| Attribute                   | Component           | Usage                                                                               |
|-----------------------------|---------------------|-------------------------------------------------------------------------------------|
| `data-hx-overlay-backdrop`  | `HxOverlayBackdrop` | `<div data-hx-overlay-backdrop="">` — backdrop element                              |
| `data-hx-overlay-state`     | `HxOverlayBackdrop` | `<div data-hx-overlay-state="active">` — overlay animation state (via setAttribute) |
| `data-hx-toast-dismiss-bar` | `HxToast`           | `<div data-hx-toast-dismiss-bar="">` — auto-dismiss progress bar                    |
| `data-hx-toast-dismiss`     | `HxToast`           | `el.setAttribute('data-hx-toast-dismiss', 'dismissing')` — dismiss animation state  |

### Popup

| Attribute                        | Component          | Usage                                                                                |
|----------------------------------|--------------------|--------------------------------------------------------------------------------------|
| `data-hx-popup-state`            | `HxPopup`          | `<div data-hx-popup-state="active">` — popup lifecycle state (via setAttribute)      |
| `data-hx-popup-avoid-transition` | `HxPopup`          | `el.setAttribute('data-hx-popup-avoid-transition', '')` — skips open/close animation |
| `data-hx-popup-for-select`       | `HxSelect`         | `<div data-hx-popup-for-select="">` — scoped to select popup                         |
| `data-hx-popup-for-actions`      | `HxActions`        | `<div data-hx-popup-for-actions="">` — scoped to actions popup                       |
| `data-hx-popup-for-dtp`          | `HxDateTimePicker` | `<div data-hx-popup-for-dtp="">` — scoped to datetime-picker popup                   |

### Temporary

| Attribute                                 | Component  | Usage                                                                                                                                      |
|-------------------------------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| `data-hx-select-option-temporary-display` | `HxSelect` | `el.setAttribute('data-hx-select-option-temporary-display', 'block')` — saves original display value before hiding an option during filter |

---

## HxExtDataAttributes

Attributes **not set internally** by any component. Allowed in public props so users can set them for customization.

| Attribute                        | Usage                                    |
|----------------------------------|------------------------------------------|
| `data-hx-svg-icon-animation`     | Icon animation control                   |
| `data-hx-button-min-width`       | Custom button minimum width              |
| `data-hx-label-check-msg`        | Validation check message text            |
| `data-hx-label-svg-icon`         | Label icon indicator                     |
| `data-hx-label-input-embed`      | Embed label inside input (prefix/suffix) |
| `data-hx-margin-t`               | Custom top margin                        |
| `data-hx-margin-r`               | Custom right margin                      |
| `data-hx-margin-b`               | Custom bottom margin                     |
| `data-hx-margin-l`               | Custom left margin                       |
| `data-hx-flex-cell-grow`         | Flex cell grow factor                    |
| `data-hx-flex-cell-align-self`   | Flex cell self alignment                 |
| `data-hx-grid-cell-row`          | Grid cell row start                      |
| `data-hx-grid-cell-rows`         | Grid cell row span                       |
| `data-hx-grid-cell-col`          | Grid cell column start                   |
| `data-hx-grid-cell-cols`         | Grid cell column span                    |
| `data-hx-grid-cell-justify-self` | Grid cell self justification             |
| `data-hx-grid-cell-align-self`   | Grid cell self alignment                 |
