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
| `autoRows` | `boolean` | — | Auto-grow height to fit content |
| `rows` | `number` | `5` | Initial visible row count |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'none'` | CSS resize behavior |
| `placeholder` | `ReactNode` | — | Native `<textarea>` placeholder |
| `charLimit` | `number` | — | Max character count; displays counter and blocks excess |
| `emitChangeOnBlur` | `boolean` | `false` | Only emit model changes on blur |
| `emitChangeDelay` | `number` | `150` | Debounce delay (ms) |

## Native DOM Events (on `<textarea>`)

`onChange`, `onInput`, `onBeforeInput`, `onKeyDown`, `onKeyUp`, `onKeyPress`, `onFocus`, `onBlur`, `onClick`, `onMouseDown/Up/Enter/Leave`, `onCompositionStart/End/Update`, `onTouchStart/End`, `onPointerDown/Up`.

Native attributes forwarded: `autoFocus`, `maxLength`, `readOnly`, `spellCheck`, `wrap`.

## Global Config

```ts
import { configHxTextarea } from '@hx/components';
configHxTextarea({ rows: 5, resize: 'none', selectAll: true });
```
