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

### Reactive State — `$visible` / `$disabled` / `$readonly`

These props accept three forms:

- `boolean` — the state never changes.
- `(model) => boolean` — a function evaluated at mount and whenever its identity changes (in practice, when the parent re-renders with an inline function). It is **not** re-evaluated when the model changes, so it only suits values that stay static for the lifetime of the parent's render.
- `{ on, handle, default }` — a monitor. `on` is a model path or an array of paths; `handle(event, model, context)` runs whenever one of them changes. `default` (a boolean or `(model) => boolean`) supplies the initial value; when omitted, `$visible` starts `true` and `$disabled` / `$readonly` start `false`.

Use the monitor form for state that must follow model changes:

```tsx
<HxButton
  text="Save"
  $disabled={{on: 'dirty', handle: (_ev, m) => !m.dirty, default: (m) => !m.dirty}}
/>
<HxInput
  $model={form}
  $field="name"
  $readonly={{on: 'locked', handle: (_ev, m) => m.locked, default: (m) => m.locked}}
/>
```

The initial value comes from `default`; `handle` is not executed to derive it. If the model may already satisfy the condition at mount, pass `default` (typically a model predicate).

A monitor's `handle` must be read-only with respect to the model — mutating `$model` inside a monitor handler is not supported.

Tabs accept the same three forms on each tab for `$visible` / `$disabled`:

```tsx
{ mark: 'admin', header: 'Admin', body: <AdminTab />,
  $visible: {on: 'isAdmin', handle: (_ev, m) => m.isAdmin, default: (m) => m.isAdmin} }
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
  configHxTooltip,
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

## Tooltip (Accessory)

Tooltips are an accessory, not a standalone component. Any component that accepts common props can attach one through the shared `tooltip` prop; the hover/focus wiring is handled automatically by `usePropsToDomExpose`. For full control, components use the tooltip context (`useHxTooltip`).

```tsx
<HxButton text="Hover" tooltip="A short hint" />
<HxButton text="Hover" tooltip={{ content: 'Below', position: 'bottom' }} />
```

See [Tooltip](./hx-tooltip) for the 12 positions, context API and `configHxTooltip` defaults.

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

## Temporary Paralysis

A deliberately odd attribute name that locks a control for a short operation:

```tsx
el.setAttribute('data-hx-temporary-paralysis', '');
```

Only `HxSelect` currently honours it. While the attribute is present, the
select input ignores pointer activation, keyboard activation and the clear
button, so the dropdown cannot be opened. It is not a visual `disabled` state —
the control keeps its appearance and focus — and it only guards the entry
points: an already-open popup is outside its reach.

`HxPagination` sets the attribute on both of its selects while a page or
page-size request is in flight, so a select cannot start a second request. Use
it only when a control has to be locked without changing its `$disabled` state;
regular disabling should still use `$disabled`.

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
