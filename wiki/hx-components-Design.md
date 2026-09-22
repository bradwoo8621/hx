# Component Design

This page is about how `@hx/components` is **engineered as code** — the recurring patterns behind every component — and the advantages those patterns buy. It is not about visual design (see [Common Concepts](./hx-components-Common) for styling tokens and the [Data-Attributes](./hx-components-Data-Attributes) reference). Once you see the six or seven ideas below, the ~35 components feel like one system instead of a pile of widgets.

---

## 1. Composable Prop Types — one API, everywhere

Components never redefine the same concept twice. A small set of shared interfaces is composed in `src/types/`:

- `HxStdProps` = `$visible` + change props; `HxEditProps` adds `$disabled`; `HxEditSingleFieldProps` adds `$model`/`$field`.
- `HxCommonProps<ExDAT, T>` bundles the width/height, padding/margin, border, flex-cell, and grid-cell props **plus** a typed `data-hx-*` pass-through index signature. Each component declares which `data-hx-*` attributes it owns in an `Excluded…DataAttrNames` union and passes it as `ExDAT`, so the attributes it writes itself are not part of its public props.
- Sizing uses strict token unions (`HxColor`, `HxSize`, `HxPadding`, `HxBorderRadius`, …) that map 1:1 to design tokens. Raw CSS lengths go through `style`, not through these props.

**Advantage — learn once, use everywhere.** `color`, `variant`, `paddingX`, `border`, `$visible`, `$disabled` mean the same thing on every component. Teams stop re-reading prop tables and start predicting APIs. Overrides and additions land in the typed `data-hx-*` index signature, so components stay open to extension without widening their own prop surface.

## 2. Styling Through Data Attributes — no CSS-in-JS

Components render plain DOM and write `data-hx-*` attributes as their styling/state surface:

```html
<button data-hx-button data-hx-color="danger" data-hx-button-variant="solid" data-hx-disabled="">Delete</button>
```

- The component **type marker** (`data-hx-button`, `data-hx-label`, …) is always on the root element — a stable selector the CSS keys every rule on.
- State (hover, active, focus, disabled, checked, …) is also an attribute, so **CSS reacts to state natively** — no JavaScript class juggling or inline-style diffing.
- The mapping from props to attributes is centralized in a per-component `HxDataPropToAttrValueComputer` (see [Utilities](./hx-components-Utilities)); `DOMUtils.exposePropsToDOM()` runs the computer, **trims off the props it consumed** (`trimOffKeys`) so they never leak onto the DOM, then spreads the rest. Attribute values may be functions of `($model, context)`, and are normalised (`true` → `''`, `false`/`null` → attribute absent).

**Advantage — styling without JS.** There is no CSS-in-JS runtime in the bundle, no style-tag diffing on every state change, and no specificity guessing in application code: consumers target `[data-hx-button][data-hx-color="danger"]` directly. Because state lives in the attribute, the same CSS rule covers both mouse and keyboard focus.

## 3. Slot Variables + Cascade Layer — override without a fight

Every element in the hx trees derives its styling from **slot custom properties** (`--hx-*-this` / `--hx-*-this-default`):

- Shared rules in `src/styles/common/` consume the slots; per-component modules in `src/styles/components/<name>/` provide the slot defaults.
- To override one aspect of a component you set **one slot** (`--hx-button-font-family`, `--hx-bg-color-this-default`, …) instead of restyling internals.

All hx stylesheets are imported into the `hx` cascade layer (`@layer hx`). Unlayered application CSS therefore **always beats hx rules regardless of specificity** — no `!important`, no `:where()` gymnastics (see [Common](./hx-components-Common#cascade-layer)).

**Advantage — consumers win by default.** A one-line unlayered rule flips a whole component's look. It also keeps the library from fighting the host: your markup, your theme, your final say.

## 4. Design Tokens as the Only Scale

All spacing, sizing, color and typography come from per-category token modules in `src/styles/variables/` (see [Common](./hx-components-Common#styling-convention)). Because prop unions map directly to tokens, `paddingX="md"` and `--hx-padding-x-…` are the same language.

**Advantage — a consistent rhythm and a switch to theme.** Re-skinning is a token swap, not a component-by-component crusade, and components can never drift into ad-hoc pixel values.

## 5. Reactive Binding — `$model` / `$field`

Form-capable components bind read/write through the `ERO` reactive system, and `$model` **auto-propagates to children** (`DOMUtils.interposeToChildren()`), so you set it once at the top-level container. `$visible` / `$disabled` / `$readonly` accept predicates of the model for derived UI state, and forwarded event handlers receive `(event, model, context)`.

**Advantage — no prop drilling, no derived-state plumbing.** A large form declares its `$model` once; sub-fields do their own `$field`. Visibility/disablement that depends on data is expressed as a function, not as ad-hoc `useEffect` state syncing.

## 6. Global Configuration Read at Render Time

Each component group exposes a `configHx*()` function. Defaults live at the module level and are **read at render time** (not captured in closures), so configuration applies globally and immediately; an explicit prop always wins.

**Advantage — library-level defaults, app-level overrides, zero migration pain.** You can ship the same component defaults to every consumer, and a consumer can still tune a single instance without touching the config.

## 7. Provider-Scoped Event Bus

Popups, select, datetime-picker, actions and upload communicate across their internal tree via `EventEmitter` instances scoped to a provider (the `EvtHx*` channel names), instead of lifting state to a shared root or forcing prop callbacks through every layer.

**Advantage — decoupled internals, selective re-rendering.** An open popup can push focus/hover/selection events to its child without re-rendering the whole page tree; the parent stays quiet because nothing global changed.

## 8. Safe-to-Embed Resets

The library resets only what it owns: `box-sizing` and `position: relative` apply only inside the `[data-hx-root]` / `[data-hx-portal-root]` subtrees, and the `html`/`body` reset is opt-in via `data-hx-reset-styles` (see [Common](./hx-components-Common#global-reset)).

**Advantage — drop-in without breaking the host page.** Embedding hx components into an existing app can't clobber the host's box model, and the cascade layer keeps hx styles from outranking the app's own.

## 9. Keyboard and Pointer Share One State

Focusable popups drive the grid with a single highlight: real focus lives on the container, cells are visual marks, and mouse hover feeds the same highlight (hover-follow). See [DateTimePicker](./hx-components-DateTimePicker#keyboard-navigation).

**Advantage — accessibility parity almost for free.** The keyboard path and the mouse path cannot diverge, because they are the same state.

---

## Trade-offs, honestly

- **CSS is part of the API.** Theming and overriding require writing CSS against attribute selectors; there is no JS-friendly `sx` prop to fall back to.
- **Attributes in the DOM.** The `data-hx-*` surface is visible in devtools and adds a few bytes per element — the cost of keeping styling in pure CSS.
- **Discipline to keep selectors scoped.** It only works because components agree to write their type marker on the root and to register their owned attributes in the exclusion list; a component that breaks that contract quietly leaks styling quirks.

Taken together, the payoffs are the ones that compound over a library's life: **consistency by construction, theming by tokens, override by plain CSS, binding by a single model, and internals that re-render only what changed.** That is the design of the code.
