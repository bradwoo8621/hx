# HxTextarea / HxWithCheckTextarea

Multi-line text input. Renders `<textarea>`.

`HxWithCheckTextarea` adds validation (see [WithCheck](./hx-components-WithCheck)).

```tsx
// Fixed rows
<HxTextarea $model={form} $field="desc" rows={8} placeholder="Enter description" />

// Auto-growing height, capped at 10 rows
<HxTextarea $model={form} $field="notes" autoRows={10} />

// With character counter
<HxTextarea $model={form} $field="bio" charLimit={500} />

// Resizable (dir-x is horizontal, dir-y is vertical)
<HxTextarea $model={form} $field="content" resize="dir-y" />

// Deferred update
<HxTextarea $model={form} $field="summary" emitChangeOnBlur />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `selectAll` | `boolean` | `true` | Select all text on focus |
| `autoRows` | `boolean \| number` | — | Auto-grow height to fit content. `true` grows without a cap, a number caps the height at that many rows |
| `rows` | `number` | `5` | Initial visible row count. Not clamped per instance; the global default is clamped to at least `1` |
| `resize` | `'none' \| 'dir-x' \| 'dir-y' \| 'both'` | `'none'` | User resize behavior; `dir-x` is horizontal, `dir-y` is vertical |
| `placeholder` | `ReactNode` | — | Placeholder overlay rendered inside the box, not the native `placeholder` attribute. Also shown in the disabled and readonly states while the value is empty |
| `charLimit` | `number` | — | Shows a `<count> / <limit>` counter beside the textarea. Display only, the input is not truncated. Hidden when disabled or readonly |
| `$domBox` | HTML attributes | — | Extra attributes on the wrapper `<div>` |
| `emitChangeOnBlur` | `boolean` | `false` | Model is written silently on each change; the change event fires on blur or Enter |
| `emitChangeDelay` | `number` | `150` | When `emitChangeOnBlur` is `false`, delay before the change event is emitted. Negative values are clamped to 0 |

`name` defaults to the model path when omitted.

## Native DOM Events

**Commonly used**: `onFocus`, `onBlur`, `onKeyDown` (e.g., Ctrl+Enter to submit).

**Available but usually unnecessary**: `onChange`, `onInput` — value changes handled by `$model`/`$field` reactive binding.

**Available if needed**: `onBeforeInput`, `onKeyUp`, `onKeyPress`, `onClick`, `onMouseDown`, `onMouseUp`, `onMouseEnter`, `onMouseLeave`, `onCompositionStart`, `onCompositionEnd`, `onCompositionUpdate` (IME events handled internally), `onTouchStart`, `onTouchEnd`, `onPointerDown`, `onPointerUp`.

**Excluded native attributes**: `disabled` (use `$disabled`), `value`, `placeholder` (use component `placeholder` prop), `readOnly` (use `$readonly`), `rows` (use component `rows` prop), `cols`, `wrap`, `children`, `minLength`, `maxLength`, `required`, `color`.

All other standard `<textarea>` attributes (including `autoFocus`, `spellCheck`) are forwarded.

## Global Config

```ts
import { configHxTextarea } from '@hx/components';
configHxTextarea({ rows: 5, resize: 'none', selectAll: true });
```
