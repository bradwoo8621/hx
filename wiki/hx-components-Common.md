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
  configHxWithPopup,
} from '@hx/components';
```

### Common Model Formats

`configHxCommon()` sets global format patterns for model value display:

```ts
configHxCommon({
  datetimeValueFormat: 'y/m/dTh:n:s',  // default: year-month-day Thour:min:sec
  dateValueFormat: 'y/m/d',            // default: year-month-day
  timeValueFormat: 'h:n:s',            // default: hour:min:sec
});
```

---

## Styling Convention

Components use `data-*` attributes for styling — no CSS-in-JS. All design tokens live in `src/styles/variables/`, split per category and aggregated by `variables/index.css`. Component styles are organized as shared rules in `src/styles/common/` plus per-component modules in `src/styles/components/<name>/`; each module sets the styling slot variables (`--hx-*-this` / `--hx-*-this-default`) that the shared rules consume, so a parent or consumer overrides a single aspect of a component by setting one slot rather than restyling its internals.

```html
<button data-hx-button data-hx-color="primary" data-hx-variant="solid">...</button>
```

Values like `HxColor`, `HxSize`, `HxDirection` etc. are string literal unions that map directly to CSS custom properties.

### Cascade Layer

Every stylesheet is imported into the `hx` cascade layer: `src/styles/index.css` imports each file with `layer(hx)`, and the built `hx-components.css` ships as a single `@layer hx { ... }` block. Unlayered application styles therefore always beat hx styles, regardless of selector specificity — overriding a component rule needs neither `!important` nor a stronger selector.

```css
/* Unlayered rule, wins over any hx rule of the same property */
.my-button {
  text-transform: none;
}
```

Design tokens follow the same rule: declaring a token in unlayered CSS overrides the hx default. Component font tokens (`--hx-button-font-family`, `--hx-input-font-family`, ...) default to `--hx-font-family`, and each `font-family` declaration consumes its token as the whole font stack, so include a generic family (such as `system-ui`) in the token value when overriding it.

### Global Reset

The library only resets what it owns. `box-sizing: border-box` and `div { position: relative }` are scoped to the `[data-hx-root]` and `[data-hx-portal-root]` trees, so the host page keeps its own box model.

Resetting `html` and `body` is driven by the `data-hx-reset-styles` attribute:

| Element | Attribute | Toggled by |
|---------|-----------|------------|
| `<html>` | `data-hx-reset-styles` | `HxContextProvider` prop `resetHtmlStyles` |
| `<body>` | `data-hx-reset-styles` | `HxContextProvider` prop `resetBodyStyles` |

Both default to `true`. Opt out per provider or globally:

```tsx
<HxContextProvider resetHtmlStyles={false} resetBodyStyles={false}>
  <App />
</HxContextProvider>
```

```ts
configHxContext({ resetHtmlStyles: false, resetBodyStyles: false });
```

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
