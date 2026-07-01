# Common Concepts

Shared patterns that apply to all Hx components: reactive binding, global configuration, styling convention, and event forwarding.

---

## The $model / $field Pattern

Every form-capable component accepts `$model` (a reactive `HxObject<T>`) and `$field` (a `ModelPath<T> | HxDataPath`) for two-way data binding.

```tsx
const model = reactive({ user: { name: 'John', role: 'admin' } });

// Read from model, write changes back automatically
<HxInput $model={model} $field="user.name" />
```

Values are read via `ERO.getValue(model, field)` and written via `ERO.setValue(model, field, value)`. Changes trigger reactive listeners registered by the component.

### Model Auto-Propagation

The `$model` is automatically propagated to children via `DOMUtils.interposeToChildren()`. You only need to specify `$model` at the top-level container:

```tsx
<HxPanel $model={form} title="Profile">
  <HxInput $field="user.name" />   {/* $model inherited */}
  <HxSelect $field="user.role" options={roles} />  {/* $model inherited */}
</HxPanel>
```

### Reactive Disabled / Readonly

Components supporting `$disabled` or `$readonly` accept a function that receives the model and returns a boolean:

```tsx
<HxButton text="Save" $disabled={(m) => !m.dirty} />
<HxInput $model={form} $field="name" $readonly={(m) => m.locked} />
```

### Reactive Visibility (Tabs)

Tabs support `$visible` for reactive show/hide:

```tsx
{ mark: 'admin', header: 'Admin', body: <AdminTab />, $visible: (m) => m.isAdmin }
```

---

## Global Configuration

Each component group exposes a `configHx*()` function. Defaults are read at render time (not captured in closures), so configuration applies globally and immediately.

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

### Common Model Formats

`configHxCommon()` sets global format patterns for model value display:

```ts
configHxCommon({
  modelDateTimeFormat: '@d/ymd :hns',  // default: year-month-day hour:min:sec
  modelDateFormat: '@d/ymd',           // default: year-month-day
  modelTimeFormat: '@d:hns',           // default: hour:min:sec
});
```

---

## Styling Convention

Components use `data-*` attributes for styling — no CSS-in-JS. All design tokens live in `src/styles/variables.css`.

```html
<button data-hx-button data-hx-color="primary" data-hx-variant="solid">...</button>
```

Values like `HxColor`, `HxSize`, `HxDirection` etc. are string literal unions that map directly to CSS custom properties.

---

## Native DOM Event Forwarding

All components forward native DOM events to the underlying HTML element. Events not consumed internally are passed through. Supported event categories per element type:

| Element | Events |
|---------|--------|
| `<button>` | `onClick`, `onMouseDown/Up/Enter/Leave/Move/Over/Out`, `onKeyDown/Up/Press`, `onFocus`, `onBlur`, `onTouchStart/End/Move`, `onPointerDown/Up/Enter/Leave` |
| `<input>` | All of the above + `onChange`, `onInput`, `onBeforeInput`, `onCompositionStart/End/Update` |
| `<textarea>` | Same as `<input>` |
| `<div>`, `<span>` | `onClick`, `onMouseDown/Up/Enter/Leave/Move/Over/Out`, `onKeyDown/Up`, `onFocus`, `onBlur`, `onScroll`, `onTouchStart/End/Move`, `onPointerDown/Up/Enter/Leave` |
| `<svg>` | All standard SVG pointer/focus events |

---

## Select Options

The options system (`HxSelectOptions`) is shared by `HxSelect`, `HxMCheckbox`, and `HxMRadio`.

### HxSelectOption

```ts
interface HxSelectOption {
  value: unknown;
  label: ReactNode;
  disabled?: boolean;
  [key: string]: unknown;  // extensible
}
```

### HxSelectOptions (union type)

```ts
type HxSelectOptions<T> =
  | HxSelectOption[]                                          // Static array
  | Iterable<HxSelectOption>                                  // Iterable
  | ((search?: string) => Promise<HxSelectOption[]>)          // Async fetch
  | ((search?: string) => Iterable<HxSelectOption>);          // Sync generator
```

Usage with all three consumers:

```tsx
const opts = [
  { value: 'us', label: 'United States' },
  { value: 'cn', label: 'China' },
];

<HxSelect options={opts} />
<HxMCheckbox options={async (s) => fetchOptions(s)} />
<HxMRadio options={opts} />
```
