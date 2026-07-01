# HxTextarea / HxWithCheckTextarea

Multi-line text input. Renders `<textarea>`.

`HxWithCheckTextarea` adds validation (see [WithCheck](./hx-components-WithCheck)).

```tsx
// Fixed rows
<HxTextarea $model={form} $field="desc" rows={8} placeholder="Enter description" />

// Auto-growing height
<HxTextarea $model={form} $field="notes" autoRows />

// With character limit (shows counter, prevents exceeding)
<HxTextarea $model={form} $field="bio" charLimit={500} />

// Resizable
<HxTextarea $model={form} $field="content" resize="vertical" />

// Deferred update
<HxTextarea $model={form} $field="summary" emitChangeOnBlur />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Model field path |
| `selectAll` | `boolean` | `true` | Select all text on focus |
| `autoRows` | `boolean \| number` | — | Auto-grow height to fit content. When a number is given, it specifies the max rows |
| `rows` | `number` | `5` | Initial visible row count (minimum 2) |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'none'` | CSS resize behavior |
| `placeholder` | `ReactNode` | — | Native `<textarea>` placeholder |
| `charLimit` | `number` | — | Max character count; displays counter and blocks excess |
| `emitChangeOnBlur` | `boolean` | `false` | Only emit model changes on blur |
| `emitChangeDelay` | `number` | `150` | Debounce delay (ms). Negative values are clamped to 0 |

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
