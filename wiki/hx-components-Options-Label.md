# HxOptionsLabel

Display component that resolves a bound value (single or array) into option labels. Uses the same options pipeline as `HxSelect` (static array or sync/async function options). Renders `<span>`.

```tsx
// Static options, single value -> 'Odd'
<HxOptionsLabel $model={model} $field="value"
                options={[{value: 1, label: 'Odd'}, {value: 2, label: 'Even'}]}/>

// Array values are joined with commas -> 'Design,Marketing'
<HxOptionsLabel $model={model} $field="departments" options={departmentOptions}/>

// Async options show the loading state until resolved
<HxOptionsLabel $model={model} $field="value" options={fetchOptions}/>
```

A matched option renders `option.selectedLabel ?? option.label`. Value matching is loose (`==`), so a numeric model value matches a numeric option value. The matched value is also mirrored on the `data-hx-options-label-value` attribute.

## States (`data-hx-options-label-state`)

| State | Condition | Content |
|-------|-----------|---------|
| `loading` | options not resolved yet | `optionsOnLoadKey` |
| `no-options` | options resolved to an empty array | `noOptionsKey` |
| `no-value` | bound value is null/undefined | empty |
| `option-found` | single value matched, or every array value matched | matched label(s), array joined with `,` |
| `some-option-not-found` | array with partial matches | matched labels only, missing values skipped |
| `option-not-found` | single value unmatched, or array with no match at all | `optionNotFoundKey` (single) / empty (array) |

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `$model` | `HxObject<T>` | — | Reactive model (required) |
| `$field` | `ModelPath<T> \| HxDataPath` | — | Path to the value to display |
| `options` | `HxSelectOptions<T>` | — | Options source: static array, sync or async function |
| `optionsDependsOn` | `HxDataPath \| Array<HxDataPath>` | — | Model paths that trigger an options reload |
| `onOptionsChange` | `'none' \| 'clear' \| ((options) => HxSelectOption \| undefined)` | — | Value adjustment when options change; `'clear'` resets the value when it disappears from the new options |
| `optionsOnLoadKey` | `ReactNode` | `'~HxCommon.SelectOptionsOnLoad'` | Loading state text |
| `noOptionsKey` | `ReactNode` | `'~HxCommon.SelectNoOptions'` | Empty options state text |
| `optionNotFoundKey` | `ReactNode` | `'~HxCommon.SelectOptionNotFound'` | Not-found state text |

## Global Config

```ts
import { configHxOptionsLabel } from '@hx/components';

configHxOptionsLabel({
  optionsOnLoadKey: '~MyApp.Loading',    // default: '~HxCommon.SelectOptionsOnLoad'
  noOptionsKey: '~MyApp.NoOptions',      // default: '~HxCommon.SelectNoOptions'
  optionNotFoundKey: '~MyApp.NotFound',  // default: '~HxCommon.SelectOptionNotFound'
});
```
